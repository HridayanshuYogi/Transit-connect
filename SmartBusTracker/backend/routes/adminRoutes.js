const express = require("express");
const router = express.Router();

const Bus = require("../models/Bus");
const User = require("../models/User");
const Ticket = require("../models/Ticket");


// ======================================
// GET ALL BUSES
// ======================================
router.get("/buses", async (req, res) => {
  try {
    const buses = await Bus.find();
    res.json(buses);
  } catch (error) {
    console.log("Fetch buses error:", error);
    res.status(500).json({ message: "Failed to fetch buses" });
  }
});


// ======================================
// ADD BUS
// ======================================
router.post("/add-bus", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { busNo, busName, from, to, price } = req.body;

    // ✅ validation
    if (!busNo || !from || !to || !price) {
      return res.status(400).json({
        message: "busNo, from, to, price are required",
      });
    }

    // ✅ prevent duplicate busNo
    const existingBus = await Bus.findOne({ busNo });
    if (existingBus) {
      return res.status(400).json({
        message: "Bus with this number already exists",
      });
    }

    const newBus = new Bus({
      busNo,
      busName,
      from,
      to,
      price,
    });

    await newBus.save();

    res.json({
      message: "Bus added successfully",
      bus: newBus,
    });

  } catch (error) {
    console.log("Add bus error:", error);
    res.status(500).json({ message: error.message });
  }
});


// ======================================
// DELETE BUS
// ======================================
router.delete("/delete-bus/:id", async (req, res) => {
  try {
    const deletedBus = await Bus.findByIdAndDelete(req.params.id);

    if (!deletedBus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.json({ message: "Bus deleted successfully" });

  } catch (error) {
    console.log("Delete bus error:", error);
    res.status(500).json({ message: "Delete failed" });
  }
});


// ======================================
// ADMIN STATS (FIXED DUPLICATE)
// ======================================
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBuses = await Bus.countDocuments();
    const totalTickets = await Ticket.countDocuments();

    const tickets = await Ticket.find();

    let revenue = 0;
    tickets.forEach((ticket) => {
      revenue += ticket.price || 0;
    });

    res.json({
      totalUsers,
      totalBuses,
      totalTickets,
      revenue,
    });

  } catch (error) {
    console.log("Stats error:", error);
    res.status(500).json({ message: "Stats fetch failed" });
  }
});


// ======================================
// LIVE BUS MONITORING (CLEANED)
// ======================================
router.get("/live-buses", async (req, res) => {
  try {
    const buses = await Bus.find();
    res.json(buses);
  } catch (error) {
    console.log("Live bus error:", error);
    res.status(500).json({ message: "Failed to fetch live buses" });
  }
});


module.exports = router;