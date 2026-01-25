const Booking = require('../models/Booking');
const Trip = require('../models/Trip');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
    const { tripId, passengerName, seatNumber, paymentMethod, totalAmount } = req.body;

    const trip = await Trip.findById(tripId);

    if (!trip) {
        res.status(404);
        throw new Error('Trip not found');
    }

    if (trip.seatsAvailable <= 0) {
        res.status(400);
        throw new Error('No seats available');
    }

    // Check if seat is already taken (This logic needs a more robust seat map, but simple check for now)
    const seatTaken = await Booking.findOne({ trip: tripId, seatNumber });
    if (seatTaken) {
        res.status(400);
        throw new Error(`Seat ${seatNumber} is already taken`);
    }

    const booking = await Booking.create({
        user: req.user._id,
        trip: tripId,
        passengerName,
        seatNumber,
        paymentMethod,
        totalAmount,
    });

    if (booking) {
        // Decrease seats available
        trip.seatsAvailable = trip.seatsAvailable - 1;
        await trip.save();

        res.status(201).json(booking);
    } else {
        res.status(400);
        throw new Error('Invalid booking data');
    }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate('user', 'name email').populate('trip');

    if (booking) {
        // Ensure user is owner or admin
        if (booking.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            res.status(401);
            throw new Error('Not authorized to view this booking');
        }
        res.json(booking);
    } else {
        res.status(404);
        throw new Error('Booking not found');
    }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id }).populate('trip');
    res.json(bookings);
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    // Ensure user ownership or admin
    if (booking.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        res.status(401);
        throw new Error('Not authorized to cancel this booking');
    }

    if (booking.paymentStatus === 'Refunded') {
        res.status(400);
        throw new Error('Booking already cancelled');
    }

    booking.paymentStatus = 'Refunded';
    await booking.save();

    // Restore seat availability
    const trip = await Trip.findById(booking.trip);
    if (trip) {
        trip.seatsAvailable += 1;
        await trip.save();
    }

    res.json({ message: 'Booking cancelled', booking });
};

module.exports = {
    createBooking,
    getBookingById,
    getMyBookings,
    cancelBooking,
};
