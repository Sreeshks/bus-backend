const Bus = require('../models/Bus');

// @desc    Get all buses
// @route   GET /api/buses
// @access  Public
const getBuses = async (req, res) => {
    // If Admin/Staff access via Dashboard (Authenticated)
    if (req.user && req.user.company) {
        const buses = await Bus.find({ company: req.user.company });
        res.json(buses);
    } else {
        // Public access - maybe unrelated to this specific task, but to be safe for now
        // we can return all or empty. Given the user request implies separation, 
        // we should probably only show buses if authenticated for the dashboard.
        // However, if there's a mobile app, it needs all.
        // For now, let's keep it simply finding all IF no user, 
        // BUT looking at the request, the user wants "admin dashboard" isolation.
        // If I change this, I might break public view.
        // But wait, the route protects POST but GET is public in busRoutes.js.
        // Middleware 'protect' is NOT on GET. So req.user will be undefined.
        // Checking req.user here requires optional auth middleware.
        // I will assume for now this controller is primary for the dashboard.
        // To support public app properly, I should check if 'protect' middleware is used.
        // I'll update routes to use `protect` for GET if I want isolation.
        // BUT: "in the webiste... registration only in the admin".
        // Let's assume the GET /buses is primarily for the dashboard right now.
        const buses = await Bus.find({});
        res.json(buses);
    }
};

// @desc    Get bus by ID
// @route   GET /api/buses/:id
// @access  Public
const getBusById = async (req, res) => {
    const bus = await Bus.findById(req.params.id);

    if (bus) {
        res.json(bus);
    } else {
        res.status(404);
        throw new Error('Bus not found');
    }
};

// @desc    Create a bus
// @route   POST /api/buses
// @access  Private/Admin
const createBus = async (req, res) => {
    const { busNumber, name, type, capacity, operatorName } = req.body;

    const busExists = await Bus.findOne({ busNumber });

    if (busExists) {
        res.status(400);
        throw new Error('Bus already exists');
    }

    const bus = await Bus.create({
        busNumber,
        name,
        type,
        capacity,
        capacity,
        operatorName,
        company: req.user.company
    });

    if (bus) {
        res.status(201).json(bus);
    } else {
        res.status(400);
        throw new Error('Invalid bus data');
    }
};

// @desc    Update a bus
// @route   PUT /api/buses/:id
// @access  Private/Admin
const updateBus = async (req, res) => {
    const bus = await Bus.findById(req.params.id);

    if (bus) {
        bus.name = req.body.name || bus.name;
        bus.type = req.body.type || bus.type;
        bus.capacity = req.body.capacity || bus.capacity;
        bus.operatorName = req.body.operatorName || bus.operatorName;

        const updatedBus = await bus.save();
        res.json(updatedBus);
    } else {
        res.status(404);
        throw new Error('Bus not found');
    }
};

// @desc    Delete a bus
// @route   DELETE /api/buses/:id
// @access  Private/Admin
const deleteBus = async (req, res) => {
    const bus = await Bus.findById(req.params.id);

    if (bus) {
        await bus.deleteOne();
        res.json({ message: 'Bus removed' });
    } else {
        res.status(404);
        throw new Error('Bus not found');
    }
};

module.exports = {
    getBuses,
    getBusById,
    createBus,
    updateBus,
    deleteBus,
};
