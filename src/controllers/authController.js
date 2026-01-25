const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            role: user.role,
            permissions: user.permissions,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
};

// @desc    Register a new user (Self-registration, defaults to Employee)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Default registration is always basic user unless manually changed in DB
    const user = await User.create({
        name,
        email,
        password,
        role: 'Employee',
        permissions: []
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
};

// @desc    Create a new user (Admin function)
// @route   POST /api/auth/users
// @access  Private/Admin
const createUser = async (req, res) => {
    const { name, email, password, role, permissions } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        permissions,
        isAdmin: role === 'Admin' // Sync legacy field
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: user.permissions
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    const users = await User.find({});
    res.json(users);
};

// @desc    Update user rights/permissions
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
const updateUserRights = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        user.permissions = req.body.permissions || user.permissions;
        user.isAdmin = user.role === 'Admin'; // Sync legacy field

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            permissions: updatedUser.permissions
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

module.exports = { authUser, registerUser, createUser, getUsers, updateUserRights };
