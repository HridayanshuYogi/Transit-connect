const express = require("express");
const router = express.Router();

const {
  addBus,
  getAllBuses,
  assignDriver,
  updateLocation,
  getETA,
  getStopETAs,
  getLiveLocation,
  getLiveBuses,
  updateBusStatus,
  updatePassengerLoad
} = require("../controllers/busController");

const { protect, authorize } = require("../middleware/authMiddleware");


// Admin → Add Bus
router.post("/", protect, authorize("admin"), addBus);


// Admin → Assign Driver
router.put("/assign-driver", protect, authorize("admin"), assignDriver);


// Public → Get Buses
router.get("/", getAllBuses);
// Passenger → Get ETA
router.get("/eta", getETA);

// Driver → Update Location
router.post(
  "/location",
  protect,
  authorize("driver"),
  updateLocation
);

router.put("/live/:id", updateLocation);
router.get("/live", getLiveBuses);
router.get("/stops/:busId", getStopETAs);



module.exports = router;
