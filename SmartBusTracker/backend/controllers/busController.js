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


// ============ UPDATE BUS LOCATION ============
exports.updateLocation = async (req, res) => {
  try {
    const { busId, latitude, longitude, speed, passengerCount, status } = req.body;

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

    if (speed !== undefined) {
      bus.speed = speed;
    }

    if (passengerCount !== undefined) {
      bus.passengerCount = passengerCount;
    }

    if (status) {
      bus.status = status;
    }

    await bus.save();

    res.json({
      message: "Location updated ✅",
      bus,
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

// ============ GET ETA FOR ALL STOPS ============
exports.getStopETAs = async (req, res) => {
  try {
    const { busId } = req.params;

    const bus = await Bus.findById(busId);

    if (!bus || !bus.currentLocation) {
      return res.status(404).json({
        message: "Bus location not available",
      });
    }

    const { latitude, longitude } = bus.currentLocation;

    const results = bus.stops.map((stop) => {
      const distance = getDistance(
        latitude,
        longitude,
        stop.latitude,
        stop.longitude
      );

      const etaMinutes = Math.round((distance / 40) * 60);

      let status = "Upcoming";

      if (distance < 0.2) status = "Arriving";
      if (distance < 0.05) status = "Arrived";

      return {
        stopName: stop.name,
        distance: distance.toFixed(2) + " km",
        eta: etaMinutes + " minutes",
        status,
      };
    });

    res.json(results);

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};


// ============ GET LIVE LOCATION ============
exports.getLiveLocation = async (req, res) => {
  try {
    const { busId } = req.params;

    const bus = await Bus.findById(busId);

    if (!bus || !bus.currentLocation) {
      return res.status(404).json({
        message: "Live location not available",
      });
    }

    res.json({
      busId: bus._id,
      location: bus.currentLocation,
      status: bus.status || "On Time",
      speed: bus.speed || 0,
      passengerCount: bus.passengerCount || 0,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};


// ============ GET ALL LIVE BUSES ============
exports.getLiveBuses = async (req, res) => {
  try {
    const buses = await Bus.find()
      .populate("driver", "name phone role");

    const liveData = buses.map((bus) => ({
      busId: bus._id,
      busNumber: bus.busNumber,
      routeFrom: bus.routeFrom,
      routeTo: bus.routeTo,
      location: bus.currentLocation || null,
      status: bus.status || "On Time",
      speed: bus.speed || 0,
      passengerCount: bus.passengerCount || 0,
      driver: bus.driver,
    }));

    res.json(liveData);

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};


// ============ UPDATE BUS STATUS ============
exports.updateBusStatus = async (req, res) => {
  try {
    const { busId, status } = req.body;

    if (!busId || !status) {
      return res.status(400).json({
        message: "Bus ID and status required",
      });
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({
        message: "Bus not found",
      });
    }

    bus.status = status;
    await bus.save();

    res.json({
      message: "Bus status updated successfully",
      status: bus.status,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};


// ============ UPDATE PASSENGER LOAD ============
exports.updatePassengerLoad = async (req, res) => {
  try {
    const { busId, passengerCount } = req.body;

    if (!busId || passengerCount === undefined) {
      return res.status(400).json({
        message: "Bus ID and passenger count required",
      });
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({
        message: "Bus not found",
      });
    }

    bus.passengerCount = passengerCount;
    await bus.save();

    res.json({
      message: "Passenger load updated successfully",
      passengerCount: bus.passengerCount,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};
