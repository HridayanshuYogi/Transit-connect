const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    busName: {
      type: String,
      required: true,
    },
    from: String,
    to: String,
    date: String,
    seatNumber: String,
    price: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);