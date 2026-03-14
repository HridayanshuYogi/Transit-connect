const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  busName: String,

  from: String,

  to: String,

  date: {
    type: Date,
    default: Date.now
  },

  seatNumber: String,

  seatType: String,

  price: Number,

  status: {
    type: String,
    enum: ["reserved", "booked", "cancelled"],
    default: "reserved",
  },

  reservedUntil: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },

});

module.exports = mongoose.model("Ticket", ticketSchema);