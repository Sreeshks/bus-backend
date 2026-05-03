const Location = require('../models/Location');
const Fare = require('../models/Fare');

// --- Locations ---

// @desc    Add a new location/town
// @route   POST /api/locations
// @access  Private/Admin
const addLocation = async (req, res) => {
    const { name, code } = req.body;

    const locationExists = await Location.findOne({ name, company: req.user.company });
    if (locationExists) {
        res.status(400);
        throw new Error('Location already exists');
    }

    const location = await Location.create({ name, code, company: req.user.company });
    res.status(201).json(location);
};

// @desc    Get all locations
// @route   GET /api/locations
// @access  Public
const getLocations = async (req, res) => {
    // If authenticated (Dashboard or Conductor App)
    if (req.user && req.user.company) {
        const locations = await Location.find({ company: req.user.company });
        res.json(locations);
    } else {
        // Public/Generic access... for now return empty or handle differently
        // Given requirement "admin 2 empty", we likely only want to show company specific
        res.json([]);
    }
};

// @desc    Update a location
// @route   PUT /api/master/locations/:id
// @access  Private/Admin
const updateLocation = async (req, res) => {
    const { name, code } = req.body;
    const location = await Location.findById(req.params.id);

    if (location) {
        location.name = name || location.name;
        location.code = code || location.code;
        const updatedLocation = await location.save();
        res.json(updatedLocation);
    } else {
        res.status(404);
        throw new Error('Location not found');
    }
};

// --- Fares ---

// @desc    Set fare between two locations
// @route   POST /api/fares
// @access  Private/Admin
const addFare = async (req, res) => {
    const { source, destination, amount } = req.body;

    // Check if fare exists for this pair
    const fareExists = await Fare.findOne({ source, destination, company: req.user.company });

    if (fareExists) {
        fareExists.amount = amount;
        const updatedFare = await fareExists.save();
        res.json(updatedFare);
    } else {
        const fare = await Fare.create({ source, destination, amount, company: req.user.company });
        res.status(201).json(fare);
    }
};

// @desc    Get fare
// @route   GET /api/fares
// @access  Public
const getFareQuery = async (req, res) => {
    const { source, destination } = req.query;

    if (!source || !destination) {
        // Return all fares if no query (maybe paginated in future)
        const query = req.user && req.user.company ? { company: req.user.company } : {};
        const fares = await Fare.find(query);
        return res.json(fares);
    }

    const query = { source, destination };
    if (req.user && req.user.company) query.company = req.user.company;

    const fare = await Fare.findOne(query);

    if (fare) {
        res.json(fare);
    } else {
        // Try reverse direction if simple A-B is missing (Assuming symmetric pricing)
        // Or return 404
        const reverseFare = await Fare.findOne({ source: destination, destination: source });
        if (reverseFare) {
            res.json(reverseFare);
        } else {
            res.status(404);
            throw new Error('Fare not defined for this route');
        }
    }
};

// @desc    Delete a location
// @route   DELETE /api/master/locations/:id
// @access  Private/Admin
const deleteLocation = async (req, res) => {
    const location = await Location.findById(req.params.id);
    if (location) {
        await location.deleteOne();
        res.json({ message: 'Location deleted successfully' });
    } else {
        res.status(404);
        throw new Error('Location not found');
    }
};

// @desc    Delete a fare
// @route   DELETE /api/master/fares/:id
// @access  Private/Admin
const deleteFare = async (req, res) => {
    const fare = await Fare.findById(req.params.id);
    if (fare) {
        await fare.deleteOne();
        res.json({ message: 'Fare deleted successfully' });
    } else {
        res.status(404);
        throw new Error('Fare not found');
    }
};

module.exports = {
    addLocation,
    getLocations,
    addFare,
    getFareQuery,
    updateLocation,
    deleteLocation,
    deleteFare
};
