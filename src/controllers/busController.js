const Bus = require('../models/Bus');

// @desc    Get all buses
// @route   GET /api/buses
// @access  Public
const getBuses = async (req, res) => {
    const buses = await Bus.find({});
    res.json(buses);
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
        operatorName
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
