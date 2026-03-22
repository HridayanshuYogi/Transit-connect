const express = require("express");
const router = express.Router();

const {
  addBus,
  getAllBuses,
  getBusById,
  assignDriver,
  updateLocation,
  getETA,
  getStopETAs,
  getLiveBuses,
  updateBusStatus,
  updatePassengerLoad,
} = require("../controllers/busController");

const { protect, authorize } = require("../middleware/authMiddleware");


// ================= ADMIN ROUTES =================

// ➕ Add Bus
router.post("/", protect, authorize("admin"), addBus);

// 👨‍✈️ Assign Driver
router.put("/:id/assign-driver", protect, authorize("admin"), assignDriver);

// 🔄 Update Bus Status
router.put("/:id/status", protect, authorize("admin"), updateBusStatus);


// ================= DRIVER ROUTES =================

// 📍 Update Live Location
router.put("/:id/location", protect, authorize("driver"), updateLocation);

// 👥 Update Passenger Count
router.put("/:id/passengers", protect, authorize("driver"), updatePassengerLoad);


// ================= PUBLIC ROUTES =================

// 📋 Get All Buses
router.get("/", getAllBuses);

// 🔍 Get Single Bus
router.get("/:id", getBusById);

// 📍 Get Live Buses
router.get("/live/all", getLiveBuses);

// ⏱️ Get ETA of Bus
router.get("/:id/eta", getETA);

// 🛑 Get Stop-wise ETA
router.get("/:id/stops", getStopETAs);


module.exports = router;