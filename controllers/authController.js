
const connectDB = require('../config/database');
const User = require('../models/User');
const generateToken = require('../utils/genrateToken');
const { registerSchema } = require('../validations/authValidation');

exports.register = async (req, res) => {
    // Validate input with Joi
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { id, name, email, phone, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });
        const idExists = await User.findOne({ id });

        if (idExists) {
            return res.status(409).json({ message: 'User already exists with this ID' });
        }
        if (userExists) {
            return res.status(409).json({ message: 'User already exists with this email' });
        }

        // if role is of admin then password can not be empty
        if (role === 'admin' && !password) {
            return res.status(400).json({ message: 'Password is required for admin role' });
        }

        const user = new User({
            id,
            name,
            email,
            phone,
            password,
            role,
        });

        await user.save();

        return res.status(201).json({
            message: `User registered successfully`,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error while registering user' });
    }
};


exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // create a user with email and password
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // cehck if user has a role of 'admin'
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
      
        res.status(200).json({
            success: true,
            message: "Successfully logged in.",
            token: generateToken(user._id),
            user: { id: user._id, email: user.email }
        });
    } catch (err) {
        next(err);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { email, newPassword } = req.body;
        const admin = await user.findOne({ email });
        if (!admin) return res.status(404).json({ message: 'Admin not found' });

        admin.password = newPassword;
        await admin.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
        next(err);
    }
};

