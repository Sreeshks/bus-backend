const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const Trip = require('../models/Trip');

// @desc    Get dashboard stats
// @route   GET /api/reports/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const companyId = req.user.company;

        // 1. Total Bookings
        const totalBookings = await Booking.countDocuments({ company: companyId });

        // 2. Total Revenue
        const revenueAgg = await Booking.aggregate([
            { $match: { company: companyId, paymentStatus: { $ne: 'Failed' } } }, // Exclude failed
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        // 3. Total Buses
        const totalBuses = await Bus.countDocuments({ company: companyId });

        // 4. Recent Bookings (Limit 5)
        const recentBookings = await Booking.find({ company: companyId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('passengerName totalAmount createdAt paymentStatus');

        // 5. Total Trips (Active)
        const totalTrips = await Trip.countDocuments({ company: companyId });

        res.json({
            totalBookings,
            totalTickets: totalBookings, // Assuming 1 ticket per booking for now
            totalRevenue,
            totalBuses,
            totalTrips,
            recentBookings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };
