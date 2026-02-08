const express = require("express");
const router = express.Router();

const {
  addBus,
  getAllBuses,
  assignDriver,
} = require("../controllers/busController");

const { protect, authorize } = require("../middleware/authMiddleware");


// Admin → Add Bus
router.post("/", protect, authorize("admin"), addBus);


// Admin → Assign Driver
router.put("/assign-driver", protect, authorize("admin"), assignDriver);


// Public → Get Buses
router.get("/", getAllBuses);


module.exports = router;
