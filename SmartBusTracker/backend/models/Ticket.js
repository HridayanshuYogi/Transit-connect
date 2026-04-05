const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  // Changed to 'user' to match standard practices
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Make this true if every ticket MUST belong to a user
  },
  busName: { type: String, required: true },
  from: { type: String }, 
  to: { type: String },
  date: {
    type: Date,
    default: Date.now,
  },
  seatNumber: { type: String, required: true },
  price: { type: Number, required: true },
  
  // Matches your frontend 'paymentStatus' or status logic
  status: {
    type: String,
    enum: ["reserved", "booked", "cancelled", "Paid"], // Added "Paid" to match your frontend
    default: "booked",
  },
  
  method: { type: String }, // Added to store 'UPI' or 'Card' from your frontend

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Ticket", ticketSchema);