// const mongoose = require("mongoose");

// const ticketSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     busName: String,
//     from: String,
//     to: String,
//     date: String,
//     seatNumber: String,
//     seatType: String,
//     price: Number,
//     status: {
//       type: String,
//       enum: ["reserved", "booked", "cancelled"],
//       default: "booked",
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Ticket", ticketSchema);

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
    seatType: String,
    price: Number,
    status: {
      type: String,
      default: "confirmed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);