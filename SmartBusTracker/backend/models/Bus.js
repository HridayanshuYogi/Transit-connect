const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
  busName: String,
  from: String,
  to: String,
  price: Number,

  currentLocation: {
    latitude: Number,
    longitude: Number,
  },

  speed: {
    type: Number,
    default: 40,
  },

  status: {
    type: String,
    default: "On Time",
  },

  stops: [
  {
    name: String,
    latitude: Number,
    longitude: Number,
  }
],
});

module.exports = mongoose.model("Bus", busSchema);