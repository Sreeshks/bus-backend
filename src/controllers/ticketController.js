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
    let fareObj = await Fare.findOne({ source, destination });
    if (!fareObj) {
        // Check reverse
        fareObj = await Fare.findOne({ source: destination, destination: source });
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
        ticketNumber
    });

    res.status(201).json(ticket);
};

// @desc    Get tickets issued by conductor
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
    const tickets = await Ticket.find({ conductor: req.user._id }).sort({ createdAt: -1 });
    res.json(tickets);
};

module.exports = {
    issueTicket,
    getTickets
};
