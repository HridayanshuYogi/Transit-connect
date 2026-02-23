const User = require("../models/User");
const Ticket = require("../models/Ticket"); // ✅ ADD THIS
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* ================= REGISTER ================= */
exports.registerUser = async (req, res) => {
  try {
    const { fullName, phone, email, password, gender, dob } = req.body;

    if (!fullName || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter all required fields",
      });
    }

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "Phone already registered",
      });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      phone,
      email,
      gender,
      dob,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully ✅",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        gender: user.gender,
        dob: user.dob,
      },
    });

  } catch (error) {
    console.log("REGISTER ERROR ❌", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


/* ================= LOGIN ================= */
exports.loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter phone and password",
      });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful ✅",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        gender: user.gender,
        dob: user.dob,
      },
    });

  } catch (error) {
    console.log("LOGIN ERROR ❌", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


/* ================= UPDATE PROFILE ================= */
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.fullName = req.body.fullName ?? user.fullName;
    user.email = req.body.email ?? user.email;
    user.gender = req.body.gender ?? user.gender;
    user.dob = req.body.dob ?? user.dob;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully ✅",
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        email: updatedUser.email,
        gender: updatedUser.gender,
        dob: updatedUser.dob,
      },
    });

  } catch (error) {
    console.log("UPDATE ERROR ❌", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


/* ================= DELETE TICKET ================= */
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.json({
      success: true,
      message: "Ticket cancelled successfully",
    });

  } catch (error) {
    console.log("DELETE ERROR ❌", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};