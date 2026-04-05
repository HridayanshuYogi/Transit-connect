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

    // 1. Check if user is present in request (Middleware check)
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    // 2. CHECK IF SEAT ALREADY BOOKED
    // We use a flexible date check or just busName + seatNumber
    const existingSeat = await Ticket.findOne({
      busName,
      seatNumber,
      status: "confirmed",
    });

    if (existingSeat) {
      return res.status(400).json({ message: "Seat already booked" });
    }

    // 3. Create Ticket 
    // FIX: Using req.user.id (check if your middleware uses .id or ._id)
    const ticket = await Ticket.create({
      user: req.user.id || req.user._id, 
      busName,
      from,
      to,
      date: date || Date.now(),
      seatNumber,
      seatType: seatType || "Standard",
      price,
      status: "confirmed",
    });

    res.status(201).json(ticket);

  } catch (error) {
    console.log("CREATE ERROR:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/* ========== GET MY TICKETS ========== */
exports.getMyTickets = async (req, res) => {
  try {
    // FIX: Ensure the query matches the ID format stored in the 'user' field
    const userId = req.user.id || req.user._id;
    
    console.log("Fetching tickets for user:", userId);

    const tickets = await Ticket.find({
      user: userId,
    }).sort({ createdAt: -1 });

    res.json(tickets);

  } catch (error) {
    console.log("GET ERROR:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// ... keep modify and cancel logic similar to above regarding the user ID