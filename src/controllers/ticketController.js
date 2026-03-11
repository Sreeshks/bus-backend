const Ticket = require('../models/Ticket');
const Fare = require('../models/Fare');
const crypto = require('crypto');

// @desc    Issue a ticket (Billing)
// @route   POST /api/tickets
// @access  Private (Conductor/Admin)
const issueTicket = async (req, res) => {
    const { busId, tripId, source, destination, adultCount, childCount } = req.body;

    // 1. Get Fare
    let farePerAdult = 0;

    // Check direct fare
    let fareObj = await Fare.findOne({ source, destination, company: req.user.company });
    if (!fareObj) {
        // Check reverse
        fareObj = await Fare.findOne({ source: destination, destination: source, company: req.user.company });
    }

    if (!fareObj) {
        // Fallback or Error? 
        // For now, require fare to be set.
        res.status(400);
        throw new Error(`Fare not found for ${source} to ${destination}`);
    }

    farePerAdult = fareObj.amount;
    const farePerChild = farePerAdult / 2; // Assuming half ticket for child

    const totalFare = (farePerAdult * adultCount) + (farePerChild * childCount);

    // 2. Generate Ticket Number
    const ticketNumber = 'TKT-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    // 3. Create Ticket
    const ticket = await Ticket.create({
        bus: busId,
        trip: tripId, // Optional if just billing on the fly
        conductor: req.user._id,
        source,
        destination,
        adultCount,
        childCount,
        farePerAdult,
        farePerChild,
        totalAmount: totalFare,
        farePerChild,
        totalAmount: totalFare,
        ticketNumber,
        company: req.user.company
    });

    res.status(201).json(ticket);
};

// @desc    Get tickets issued by conductor
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
    // Show tickets for this company (Admin view all, Conductor view own?? For now admin view all is better for dashboard)
    // The route in Tickets.jsx is generic /tickets.
    // Dashboard Tickets.jsx shows RECENT tickets.
    // If Admin: show all company tickets. If conductor: show own.

    let query = { company: req.user.company };
    if (req.user.role === 'Conductor') {
        query.conductor = req.user._id;
    }

    const tickets = await Ticket.find(query).sort({ createdAt: -1 });
    res.json(tickets);
};

// @desc    Get daily bill for conductor
// @route   GET /api/tickets/daily-bill
// @access  Private (Conductor/Admin)
const getDailyBill = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const match = {
            company: req.user.company,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        };

        if (req.user.role === 'Conductor') {
            match.conductor = req.user._id;
        }

        const stats = await Ticket.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalAmount" },
                    ticketsCount: { $sum: 1 },
                    adultsCount: { $sum: "$adultCount" },
                    childrenCount: { $sum: "$childCount" }
                }
            }
        ]);

        if (stats.length > 0) {
            res.json(stats[0]);
        } else {
            res.json({ totalAmount: 0, ticketsCount: 0, adultsCount: 0, childrenCount: 0 });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    issueTicket,
    getTickets,
    getDailyBill
};
