const connectDB = require("../config/database");
const User = require("../models/User");
const generateToken = require("../utils/genrateToken");
const { registerSchema } = require("../validations/authValidation");

exports.register = async (req, res) => {
  // Validate input with Joi
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: 400, success: false, message: error.details[0].message });
  }

  const { id, name, email, phone, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    const idExists = await User.findOne({ id });

    if (idExists) {
      return res.status(409).json({
        status: 409,
        success: false,
        message: "User already exists with this ID",
      });
    }
    if (userExists) {
      return res.status(409).json({
        status: 409,
        success: false,
        message: "User already exists with this email",
      });
    }

    // if role is of admin then password can not be empty
    if (role === "admin" && !password) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Password is required for admin role",
      });
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
      success: true,
      status: 201,
      message: `User registered successfully`,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Server error",
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // create a user with email and password
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        status: 401,
        success: false,
        message: "Invalid email or password",
      });
    }
    // cehck if user has a role of 'admin'
    if (user.role !== "admin") {
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "Successfully logged in.",
      data: {
        token: generateToken(user._id),
        user: { id: user._id, email: user.email },
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Server error",
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    const admin = await user.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.password = newPassword;
    await admin.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    next(err);
  }
};
