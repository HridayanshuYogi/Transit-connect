const Location = require("../models/Location");
const Bus = require("../models/Bus");


// ============ UPDATE LOCATION (Driver) ============
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        message: "Latitude and Longitude required",
      });
    }

    const bus = await Bus.findOne({
      driver: req.user._id,
    });

    if (!bus) {
      return res.status(400).json({
        message: "No bus assigned to this driver",
      });
    }

    let location = await Location.findOne({
      bus: bus._id,
    });

    if (!location) {
      location = await Location.create({
        bus: bus._id,
        lat,
        lng,
      });
    } else {
      location.lat = lat;
      location.lng = lng;
      await location.save();
    }

    res.json({
      message: "Location updated successfully",
      location,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
