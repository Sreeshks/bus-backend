const PayMode = require('../models/PayMode');
const asyncHandler = require('express-async-handler');

// @desc    Get all pay modes
// @route   GET /api/master/pay-modes
// @access  Private
const getPayModes = asyncHandler(async (req, res) => {
    const payModes = await PayMode.find({ company: req.user.company, isActive: true }).sort({ sortOrder: 1 });
    res.json(payModes);
});

// @desc    Add a new pay mode
// @route   POST /api/master/pay-modes
// @access  Private/Admin
const addPayMode = asyncHandler(async (req, res) => {
    const { name, icon, color, sortOrder } = req.body;

    const payMode = await PayMode.create({
        name,
        icon,
        color,
        sortOrder,
        company: req.user.company
    });

    res.status(201).json(payMode);
});

// @desc    Update a pay mode
// @route   PUT /api/master/pay-modes/:id
// @access  Private/Admin
const updatePayMode = asyncHandler(async (req, res) => {
    const payMode = await PayMode.findById(req.params.id);

    if (payMode) {
        payMode.name = req.body.name || payMode.name;
        payMode.icon = req.body.icon || payMode.icon;
        payMode.color = req.body.color || payMode.color;
        payMode.sortOrder = req.body.sortOrder !== undefined ? req.body.sortOrder : payMode.sortOrder;
        payMode.isActive = req.body.isActive !== undefined ? req.body.isActive : payMode.isActive;

        const updatedPayMode = await payMode.save();
        res.json(updatedPayMode);
    } else {
        res.status(404);
        throw new Error('Pay Mode not found');
    }
});

// @desc    Delete a pay mode
// @route   DELETE /api/master/pay-modes/:id
// @access  Private/Admin
const deletePayMode = asyncHandler(async (req, res) => {
    const payMode = await PayMode.findById(req.params.id);

    if (payMode) {
        await payMode.deleteOne();
        res.json({ message: 'Pay Mode removed' });
    } else {
        res.status(404);
        throw new Error('Pay Mode not found');
    }
});

module.exports = {
    getPayModes,
    addPayMode,
    updatePayMode,
    deletePayMode
};
