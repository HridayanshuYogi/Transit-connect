const mongoose = require("mongoose");

const busSchema = new mongoose.Schema(
{
  busName: {
    type: String,
    required: true,
  },

  from: {
    type: String,
    required: true,
  },

  to: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  // Assigned driver
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  // Live bus location
  currentLocation: {
    latitude: Number,
    longitude: Number,
    updatedAt: Date,
  },

  // Bus speed
  speed: {
    type: Number,
    default: 40,
  },

  // Passenger load
  passengerCount: {
    type: Number,
    default: 0,
  },

  // Bus status
  status: {
    type: String,
    default: "On Time",
  },

  // Bus stops
  stops: [
    {
      name: String,
      latitude: Number,
      longitude: Number,
    },
  ],
},
{
  timestamps: true,
}
);

module.exports = mongoose.model("Bus", busSchema);