const express = require("express");
const router = express.Router();

const Bus = require("../models/Bus");


// GET ALL BUSES
router.get("/buses", async (req, res) => {
  try {

    const buses = await Bus.find();

    res.json(buses);

  } catch (error) {

    console.log("Fetch buses error:", error);

    res.status(500).json({
      message: "Failed to fetch buses"
    });

  }
});


// ADD BUS
router.post("/add-bus", async (req, res) => {
  try {

    const { busName, from, to, price } = req.body;

    const newBus = new Bus({
      busName,
      from,
      to,
      price
    });

    await newBus.save();

    res.json({
      message: "Bus added successfully",
      bus: newBus
    });

  } catch (error) {

    console.log("Add bus error:", error);

    res.status(500).json({
      message: "Bus creation failed"
    });

  }
});


// DELETE BUS
router.delete("/delete-bus/:id", async (req, res) => {
  try {

    await Bus.findByIdAndDelete(req.params.id);

    res.json({
      message: "Bus deleted"
    });

  } catch (error) {

    console.log("Delete bus error:", error);

    res.status(500).json({
      message: "Delete failed"
    });

  }
});

// GET ADMIN STATS
router.get("/stats", async (req, res) => {
  try {

    const User = require("../models/User");
    const Bus = require("../models/Bus");
    const Ticket = require("../models/Ticket");

    const totalUsers = await User.countDocuments();
    const totalBuses = await Bus.countDocuments();
    const totalTickets = await Ticket.countDocuments();

    const tickets = await Ticket.find();

    let revenue = 0;

    tickets.forEach((t) => {
      revenue += t.price || 0;
    });

    res.json({
      totalUsers,
      totalBuses,
      totalTickets,
      revenue
    });

  } catch (error) {

    console.log("Admin stats error:", error);

    res.status(500).json({
      message: "Stats fetch failed"
    });

  }
});
// GET ADMIN STATS
router.get("/stats", async (req, res) => {
  try {

    const User = require("../models/User");
    const Bus = require("../models/Bus");
    const Ticket = require("../models/Ticket");

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
      revenue
    });

  } catch (error) {

    console.log("Stats error:", error);

    res.status(500).json({
      message: "Stats fetch failed"
    });

  }
});
// ======================================
// LIVE BUS MONITORING
// ======================================
router.get("/live-buses", async (req, res) => {
  try {

    const Bus = require("../models/Bus");

    const buses = await Bus.find();

    res.json(buses);

  } catch (error) {

    console.log("Live bus error:", error);

    res.status(500).json({
      message: "Failed to fetch live buses"
    });

  }
});

module.exports = router;