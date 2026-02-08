const express = require("express");
const router = express.Router();

const {
  updateLocation,
} = require("../controllers/locationController");

const { protect, authorize } = require("../middleware/authMiddleware");


// Driver → Update Location
router.post("/update", protect, authorize("driver"), updateLocation);


module.exports = router;
