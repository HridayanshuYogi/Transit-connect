const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  latitude: Number,
  longitude: Number,
});

const busSchema = new mongoose.Schema(
  {
    // Bus Number (used in UI)
    busNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // Optional name
    busName: {
      type: String,
      default: "",
    },

    from: {
      type: String,
      required: true,
      index: true, // 🔥 faster search
    },

    to: {
      type: String,
      required: true,
      index: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Seats system
    totalSeats: {
      type: Number,
      default: 40,
    },

    passengerCount: {
      type: Number,
      default: 0,
    },

    // Driver assigned
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // 📍 Live location tracking
    currentLocation: {
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
      updatedAt: { type: Date, default: Date.now }, // ✅ auto timestamp
    },

    // Speed tracking
    speed: {
      type: Number,
      default: 40,
    },

    // Bus status (controlled values)
    status: {
      type: String,
      enum: ["On Time", "Delayed", "Arriving", "Boarding", "Out of Service"],
      default: "On Time",
    },

    // Stops
    stops: [stopSchema],
  },
  {
    timestamps: true,
  }
);

// 🔥 Virtual field (auto seats left)
busSchema.virtual("availableSeats").get(function () {
  return this.totalSeats - this.passengerCount;
});

// 🔥 Enable virtuals in JSON
busSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Bus", busSchema);