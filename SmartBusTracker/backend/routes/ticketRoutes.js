const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");

// =====================================
// RESERVE SEAT
// =====================================
router.post("/reserve-seat", async (req, res) => {
  try {
    const { busName, seatNumber, from, to } = req.body;

    if (!busName || !seatNumber || !from || !to) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const existingSeat = await Ticket.findOne({
      busName,
      seatNumber,
      status: { $in: ["reserved", "booked"] },
      reservedUntil: { $gt: new Date() },
    });

    if (existingSeat) {
      return res.status(400).json({
        message: "Seat already reserved",
      });
    }

    const ticket = new Ticket({
      busName,
      seatNumber,
      from,
      to,
      status: "reserved",
      reservedUntil: new Date(Date.now() + 5 * 60 * 1000),
    });

    await ticket.save();

    // 🔥 SOCKET EVENT
    const io = req.app.get("io");
    io.emit("seatUpdated", {
      busName,
      seatNumber,
      status: "reserved",
    });

    res.json({
      message: "Seat reserved",
    });

  } catch (error) {
    console.log("RESERVE ERROR:", error);

    res.status(500).json({
      message: "Reservation failed",
    });
  }
});

// =====================================
// CONFIRM SEAT
// =====================================
router.post("/confirm-seat", async (req, res) => {
  try {
    const { seatNumber, busName } = req.body;

    const ticket = await Ticket.findOne({
      seatNumber,
      busName,
      status: "reserved",
    });

    if (!ticket) {
      return res.status(400).json({
        message: "Seat not reserved",
      });
    }

    ticket.status = "booked";
    ticket.reservedUntil = null;

    await ticket.save();

    // 🔥 SOCKET EVENT
    const io = req.app.get("io");

    io.emit("seatUpdated", {
      busName,
      seatNumber,
      status: "booked",
    });

    res.json({
      message: "Seat confirmed",
    });

  } catch (error) {
    console.log("CONFIRM ERROR:", error);

    res.status(500).json({
      message: "Confirm failed",
    });
  }
});
// =====================================
// CREATE TICKET (BOOK)
// =====================================
router.post("/", async (req, res) => {
  try {
    const {
      busName,
      from,
      to,
      seatNumber,
      seatType,
      price,
      date
    } = req.body;

    if (!busName || !seatNumber) {
      return res.status(400).json({
        message: "Missing booking fields"
      });
    }

    const ticket = await Ticket.create({
      busName,
      from,
      to,
      seatNumber,
      seatType,
      price,
      date,
      status: "booked"
    });

    res.status(201).json({
      message: "Ticket booked successfully",
      ticket
    });

  } catch (error) {
    console.log("BOOK ERROR:", error);
    res.status(500).json({
      message: "Booking failed"
    });
  }
});
// =====================================
// GET ALL TICKETS
// =====================================
router.get("/", async (req, res) => {
  try {

    const tickets = await Ticket.find().sort({ createdAt: -1 });

    res.json(tickets);

  } catch (error) {

    console.log("GET TICKETS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch tickets"
    });

  }
});
// =====================================
// CANCEL TICKET
// =====================================
router.delete("/:id", async (req, res) => {
  try {

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    // mark ticket cancelled
    ticket.status = "cancelled";

    await ticket.save();

    res.json({
      message: "Ticket cancelled successfully",
    });

  } catch (error) {

    console.log("CANCEL ERROR:", error);

    res.status(500).json({
      message: "Cancel failed",
    });

  }
});
// =====================================
// MODIFY TICKET (CHANGE SEAT)
// =====================================
router.put("/:id", async (req, res) => {
  try {

    const { seatNumber } = req.body;

    if (!seatNumber) {
      return res.status(400).json({
        message: "Seat number required",
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    // Check if seat already booked
    const seatExists = await Ticket.findOne({
      busName: ticket.busName,
      seatNumber,
      status: "booked",
      _id: { $ne: ticket._id }
    });

    if (seatExists) {
      return res.status(400).json({
        message: "Seat already booked",
      });
    }

    ticket.seatNumber = seatNumber;

    await ticket.save();

    res.json({
      message: "Seat updated successfully",
      ticket,
    });

  } catch (error) {

    console.log("MODIFY ERROR:", error);

    res.status(500).json({
      message: "Modify failed",
    });

  }
});
// =====================================
// CREATE TICKET (BOOK)
// =====================================
router.post("/", async (req, res) => {
  try {

    const {
      busName,
      from,
      to,
      seatNumber,
      seatType,
      price,
      date
    } = req.body;

    if (!busName || !seatNumber) {
      return res.status(400).json({
        message: "Missing booking fields"
      });
    }

    // 🔴 CHECK IF SEAT ALREADY BOOKED
    const existingSeat = await Ticket.findOne({
      busName,
      seatNumber,
      status: "booked"
    });

    if (existingSeat) {
      return res.status(400).json({
        message: "Seat already booked"
      });
    }

    const ticket = await Ticket.create({
      busName,
      from,
      to,
      seatNumber,
      seatType,
      price,
      date,
      status: "booked"
    });

    res.status(201).json({
      message: "Ticket booked successfully",
      ticket
    });

  } catch (error) {

    console.log("BOOK ERROR:", error);

    res.status(500).json({
      message: "Booking failed"
    });

  }
});


// =====================================
// UPDATE LOCATION
// =====================================
router.post("/update", async (req, res) => {

  const { busName, latitude, longitude, speed } = req.body;

  const bus = await Bus.findOne({ busName });

  if (!bus) {
    return res.status(404).json({ message: "Bus not found" });
  }

  bus.currentLocation = {
    latitude,
    longitude
  };

  bus.speed = speed;

  await bus.save();

  res.json({ message: "Location updated" });

});

module.exports = router;