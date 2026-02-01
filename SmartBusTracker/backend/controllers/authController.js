const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User
exports.registerUser = async (req, res) => {
  try {
    console.log("REGISTER API HIT ✅", req.body);

    const { name, phone, password, role } = req.body;

    // Validation
    if (!name || !phone || !password) {
      return res.status(400).json({
        message: "Please enter all fields",
      });
    }

    // Check user
    const userExists = await User.findOne({ phone });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    const user = await User.create({
      name,
      phone,
      password: hashedPassword,
      role: role || "passenger",
    });

    // JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    console.log("REGISTER ERROR ❌", error.message);

    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// ================= LOGIN =================
exports.loginUser = async (req, res) => {
  try {
    console.log("LOGIN API HIT ✅", req.body);

    const { phone, password } = req.body;

    // Validation
    if (!phone || !password) {
      return res.status(400).json({
        message: "Please enter phone and password",
      });
    }

    // Find user
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    console.log("LOGIN ERROR ❌", error.message);

    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};
