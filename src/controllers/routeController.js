const Route = require('../models/Route');
const Fare = require('../models/Fare');

// @desc    Create a new route
// @route   POST /api/master/routes
// @access  Private/Admin
const createRoute = async (req, res) => {
    const { source, destination, stops, baseFare, totalDistance, estimatedDuration, name } = req.body;

    const route = await Route.create({
        name: name || `${source} → ${destination}`,
        source,
        destination,
        stops: stops || [],
        baseFare,
        totalDistance: totalDistance || 0,
        estimatedDuration: estimatedDuration || 0,
        company: req.user.company,
    });

    if (route) {
        res.status(201).json(route);
    } else {
        res.status(400);
        throw new Error('Invalid route data');
    }
};

// @desc    Get all routes
// @route   GET /api/master/routes
// @access  Private
const getRoutes = async (req, res) => {
    const query = req.user && req.user.company ? { company: req.user.company } : {};
    const routes = await Route.find(query).sort({ createdAt: -1 });
    res.json(routes);
};

// @desc    Get single route
// @route   GET /api/master/routes/:id
// @access  Private
const getRoute = async (req, res) => {
    const route = await Route.findById(req.params.id);
    if (route) {
        res.json(route);
    } else {
        res.status(404);
        throw new Error('Route not found');
    }
};

// @desc    Update route
// @route   PUT /api/master/routes/:id
// @access  Private/Admin
const updateRoute = async (req, res) => {
    const route = await Route.findById(req.params.id);

    if (route) {
        const { source, destination, stops, baseFare, totalDistance, estimatedDuration, name, status } = req.body;

        route.name = name || route.name;
        route.source = source || route.source;
        route.destination = destination || route.destination;
        route.stops = stops !== undefined ? stops : route.stops;
        route.baseFare = baseFare !== undefined ? baseFare : route.baseFare;
        route.totalDistance = totalDistance !== undefined ? totalDistance : route.totalDistance;
        route.estimatedDuration = estimatedDuration !== undefined ? estimatedDuration : route.estimatedDuration;
        if (status) route.status = status;

        const updatedRoute = await route.save();
        res.json(updatedRoute);
    } else {
        res.status(404);
        throw new Error('Route not found');
    }
};

// @desc    Delete route
// @route   DELETE /api/master/routes/:id
// @access  Private/Admin
const deleteRoute = async (req, res) => {
    const route = await Route.findById(req.params.id);

    if (route) {
        await route.deleteOne();
        res.json({ message: 'Route deleted successfully' });
    } else {
        res.status(404);
        throw new Error('Route not found');
    }
};

// @desc    Auto-calculate stop fares based on existing fare data
// @route   POST /api/master/routes/calculate-fares
// @access  Private
const calculateStopFares = async (req, res) => {
    const { source, destination, stops } = req.body;
    const company = req.user.company;

    const allPoints = [source, ...stops.map(s => s.location), destination];
    const results = [];

    for (let i = 0; i < allPoints.length; i++) {
        const from = allPoints[0];
        const to = allPoints[i];

        if (from === to) {
            results.push({ location: to, fare: 0 });
            continue;
        }

        let fare = await Fare.findOne({ source: from, destination: to, company });
        if (!fare) {
            fare = await Fare.findOne({ source: to, destination: from, company });
        }

        results.push({
            location: to,
            fare: fare ? fare.amount : null,
        });
    }

    res.json(results);
};

module.exports = { 
    createRoute,
    getRoutes,
    getRoute,
    updateRoute,
    deleteRoute,
    calculateStopFares,
};
