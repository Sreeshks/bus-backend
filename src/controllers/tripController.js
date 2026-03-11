const Trip = require('../models/Trip');

// @desc    Get all trips (with filtering)
// @route   GET /api/trips
// @access  Public
const getTrips = async (req, res) => {
    const { source, destination, date } = req.query;

    let query = {};

    // Multi-tenancy: If Admin/Staff, show only company trips
    if (req.user && req.user.company && (req.user.role === 'Admin' || req.user.role === 'Manager')) {
        query.company = req.user.company;
    }
    // If specific filter params are passed, they are added to query


    if (source) {
        query.source = { $regex: source, $options: 'i' };
    }
    if (destination) {
        query.destination = { $regex: destination, $options: 'i' };
    }
    if (date) {
        // Match trips on that date (ignoring time)
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        query.departureTime = { $gte: start, $lte: end };
    }

    const trips = await Trip.find(query).populate('bus');
    res.json(trips);
};

// @desc    Get trip by ID
// @route   GET /api/trips/:id
// @access  Public
const getTripById = async (req, res) => {
    const trip = await Trip.findById(req.params.id).populate('bus');

    if (trip) {
        res.json(trip);
    } else {
        res.status(404);
        throw new Error('Trip not found');
    }
};

// @desc    Create a trip
// @route   POST /api/trips
// @access  Private/Admin
const createTrip = async (req, res) => {
    const { busId, source, destination, departureTime, arrivalTime, fare, seatsAvailable, stops } = req.body;

    const trip = await Trip.create({
        bus: busId,
        source,
        destination,
        departureTime,
        arrivalTime,
        fare,
        seatsAvailable,
        fare,
        seatsAvailable,
        stops,
        company: req.user.company
    });

    if (trip) {
        res.status(201).json(trip);
    } else {
        res.status(400);
        throw new Error('Invalid trip data');
    }
};

// @desc    Update a trip
// @route   PUT /api/trips/:id
// @access  Private/Admin
const updateTrip = async (req, res) => {
    const trip = await Trip.findById(req.params.id);

    if (trip) {
        // Enforce company ownership
        if (trip.company.toString() !== req.user.company.toString()) {
             res.status(401);
             throw new Error('Not authorized to update this trip');
        }

        trip.bus = req.body.busId || trip.bus;
        trip.source = req.body.source || trip.source;
        trip.destination = req.body.destination || trip.destination;
        trip.departureTime = req.body.departureTime || trip.departureTime;
        trip.arrivalTime = req.body.arrivalTime || trip.arrivalTime;
        trip.fare = req.body.fare || trip.fare;
        trip.seatsAvailable = req.body.seatsAvailable || trip.seatsAvailable;
        trip.stops = req.body.stops || trip.stops;

        const updatedTrip = await trip.save();
        res.json(updatedTrip);
    } else {
        res.status(404);
        throw new Error('Trip not found');
    }
};

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private/Admin
const deleteTrip = async (req, res) => {
    const trip = await Trip.findById(req.params.id);

    if (trip) {
        // Enforce company ownership
        if (trip.company.toString() !== req.user.company.toString()) {
             res.status(401);
             throw new Error('Not authorized to delete this trip');
        }

        await trip.deleteOne();
        res.json({ message: 'Trip removed' });
    } else {
        res.status(404);
        throw new Error('Trip not found');
    }
};

module.exports = {
    getTrips,
    getTripById,
    createTrip,
    updateTrip,
    deleteTrip,
};
