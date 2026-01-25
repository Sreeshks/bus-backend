const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');

// @desc    Get daily collection report
// @route   GET /api/reports/daily
// @access  Private (Admin/Manager)
const getDailyReport = async (req, res) => {
    const { date } = req.query;
    const searchDate = date ? new Date(date) : new Date();

    // Set time to start and end of day
    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Online Bookings
    const bookings = await Booking.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        paymentStatus: 'Completed' // Assuming we track this, currently default is Pending, let's include all non-failed/refunded
    });

    // 2. Conductor Tickets
    const tickets = await Ticket.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const onlineTotal = bookings.reduce((acc, item) => acc + item.totalAmount, 0);
    const offlineTotal = tickets.reduce((acc, item) => acc + item.totalAmount, 0);
    const grandTotal = onlineTotal + offlineTotal;

    res.json({
        date: searchDate.toDateString(),
        onlineDetails: {
            count: bookings.length,
            total: onlineTotal
        },
        offlineDetails: {
            count: tickets.length,
            total: offlineTotal
        },
        grandTotal,
        bookings,
        tickets
    });
};

// @desc    Get dashboard stats
// @route   GET /api/reports/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
    const totalBookings = await Booking.countDocuments();
    const totalTickets = await Ticket.countDocuments();
    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name');
    const recentTickets = await Ticket.find().sort({ createdAt: -1 }).limit(5).populate('conductor', 'name');

    res.json({
        totalBookings,
        totalTickets,
        recentBookings,
        recentTickets
    });
};

module.exports = {
    getDailyReport,
    getDashboardStats
};
