const Ticket = require("../models/Ticket");

/* ========== CREATE TICKET ========== */
exports.createTicket = async (req, res) => {
  try {
    const {
      busName,
      from,
      to,
      date,
      seatNumber,
      seatType,
      price,
    } = req.body;

    // 🔥 CHECK IF SEAT ALREADY BOOKED
    const existingSeat = await Ticket.findOne({
      busName,
      date,
      seatNumber,
      status: "confirmed",
    });

    if (existingSeat) {
      return res
        .status(400)
        .json({ message: "Seat already booked" });
    }

    const ticket = await Ticket.create({
      user: req.user._id,
      busName,
      from,
      to,
      date,
      seatNumber,
      seatType,
      price,
      status: "confirmed",
    });

    res.status(201).json(ticket);

  } catch (error) {
    console.log("CREATE ERROR:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};


/* ========== GET MY TICKETS ========== */
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(tickets);

  } catch (error) {
    console.log("GET ERROR:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};


/* ========== MODIFY TICKET ========== */
exports.modifyTicket = async (req, res) => {
  try {
    const { seatNumber } = req.body;

    const ticket = await Ticket.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.status === "cancelled") {
      return res
        .status(400)
        .json({ message: "Ticket already cancelled" });
    }

    // 🔥 CHECK IF NEW SEAT ALREADY TAKEN
    const seatExists = await Ticket.findOne({
      busName: ticket.busName,
      date: ticket.date,
      seatNumber,
      status: "confirmed",
      _id: { $ne: ticket._id },
    });

    if (seatExists) {
      return res
        .status(400)
        .json({ message: "Seat already booked" });
    }

    ticket.seatNumber = seatNumber;
    await ticket.save();

    res.json({
      message: "Seat updated successfully",
      ticket,
    });

  } catch (error) {
    console.log("MODIFY ERROR:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};


/* ========== CANCEL TICKET ========== */
exports.cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.status === "cancelled") {
      return res
        .status(400)
        .json({ message: "Already cancelled" });
    }

    ticket.status = "cancelled";
    await ticket.save();

    res.json({ message: "Ticket cancelled successfully" });

  } catch (error) {
    console.log("CANCEL ERROR:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};