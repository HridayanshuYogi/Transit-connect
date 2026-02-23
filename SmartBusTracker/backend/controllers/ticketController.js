const Ticket = require("../models/Ticket");

/* ========== CREATE TICKET ========== */
exports.createTicket = async (req, res) => {
  try {
    const { busName, from, to, date, seatNumber, price } = req.body;

    const ticket = await Ticket.create({
      user: req.user._id,
      busName,
      from,
      to,
      date,
      seatNumber,
      price,
    });

    res.status(201).json({
      message: "Ticket booked successfully 🎫",
      ticket,
    });

  } catch (error) {
    console.log("TICKET ERROR ❌", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ========== GET MY TICKETS ========== */
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};