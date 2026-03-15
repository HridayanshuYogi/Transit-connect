const express = require("express");
const router = express.Router();

const {
  updateLocation,
} = require("../controllers/locationController");

const { protect, authorize } = require("../middleware/authMiddleware");


// Driver → Update Location
router.post("/update", protect, authorize("driver"), updateLocation);


// ========================================
// BUS ETA (ARRIVAL TIME)
// ========================================
router.get("/eta/:busName", async (req, res) => {

  try {

    const Bus = require("../models/Bus");

    const bus = await Bus.findOne({
      busName: req.params.busName
    });

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found"
      });
    }

    const userLatitude = parseFloat(req.query.lat);
    const userLongitude = parseFloat(req.query.lng);

    const busLat = bus.currentLocation.latitude;
    const busLng = bus.currentLocation.longitude;

    const speed = bus.speed || 40;



    // DISTANCE FORMULA
    const distance = Math.sqrt(
      Math.pow(userLatitude - busLat, 2) +
      Math.pow(userLongitude - busLng, 2)
    ) * 111;



    const timeHours = distance / speed;

    const etaMinutes = Math.round(timeHours * 60);



    res.json({
      distance: distance.toFixed(2),
      eta: etaMinutes
    });

  } catch (error) {

    console.log("ETA error:", error);

    res.status(500).json({
      message: "ETA failed"
    });

  }

});

module.exports = router;
