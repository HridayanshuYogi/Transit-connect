const Bus = require("../models/Bus");
const User = require("../models/User");
const { getDistance } = require("../utils/distance");

// ================= ADD BUS =================
exports.addBus = async (req, res) => {
  try {
    const { busNumber, routeFrom, routeTo } = req.body;

    if (!busNumber || !routeFrom || !routeTo) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const busExists = await Bus.findOne({ busNumber });

    if (busExists) {
      return res.status(400).json({
        message: "Bus already exists",
      });
    }

    const bus = await Bus.create({
      busNumber,
      routeFrom,
      routeTo,
    });

    res.status(201).json({
      message: "Bus added successfully",
      bus,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ================= GET ALL BUSES =================
exports.getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find()
      .populate("driver", "name phone role");

    res.json(buses);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ================= ASSIGN DRIVER =================
exports.assignDriver = async (req, res) => {
  try {
    const { busId, driverId } = req.body;

    if (!busId || !driverId) {
      return res.status(400).json({
        message: "Bus ID and Driver ID required",
      });
    }

    const bus = await Bus.findById(busId);

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found",
      });
    }

    const driver = await User.findById(driverId);

    if (!driver || driver.role !== "driver") {
      return res.status(400).json({
        message: "Invalid driver",
      });
    }

    bus.driver = driverId;
    await bus.save();

    res.json({
      message: "Driver assigned successfully",
      bus,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// ============ UPDATE BUS LOCATION (Driver) ============
exports.updateLocation = async (req, res) => {
  try {
    const { busId, latitude, longitude } = req.body;

    if (!busId || !latitude || !longitude) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    const bus = await Bus.findById(busId);

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found",
      });
    }

    bus.currentLocation = {
      latitude,
      longitude,
      updatedAt: new Date(),
    };

    await bus.save();

    res.json({
      message: "Location updated ✅",
      location: bus.currentLocation,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};
// ============ GET ETA ============
exports.getETA = async (req, res) => {
  try {
    const { busId, destLat, destLng } = req.query;

    if (!busId || !destLat || !destLng) {
      return res.status(400).json({
        message: "Missing parameters",
      });
    }

    const bus = await Bus.findById(busId);

    if (!bus || !bus.currentLocation) {
      return res.status(404).json({
        message: "Bus location not available",
      });
    }

    const { latitude, longitude } = bus.currentLocation;

    const distance = getDistance(
      latitude,
      longitude,
      Number(destLat),
      Number(destLng)
    );

    // Assume avg speed = 40 km/h
    const etaHours = distance / 40;
    const etaMinutes = Math.round(etaHours * 60);

    res.json({
      distance: distance.toFixed(2) + " km",
      eta: etaMinutes + " minutes",
    });

  } catch (error) {
    console.log("ETA ERROR ", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};