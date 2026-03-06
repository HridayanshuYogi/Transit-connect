const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  updateProfile,   // ✅ IMPORTANT
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

/* ================= REGISTER ================= */
router.post("/register", registerUser);

/* ================= LOGIN ================= */
router.post("/login", loginUser);

/* ================= UPDATE PROFILE ================= */
router.put("/profile", protect, updateProfile);

/* ================= GET PROFILE ================= */
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Access granted ✅",
    user: req.user,
  });

app.post("/reserve-seat", async (req, res) => {
  const { busName, seatNumber } = req.body;

  const expireTime = new Date(Date.now() + 5 * 60 * 1000);

  const ticket = await Ticket.create({
    busName,
    seatNumber,
    status: "reserved",
    reservedUntil: expireTime,
  });

  res.json(ticket);
});
router.get("/verify/:id", async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    return res.json({ valid: false });
  }

  res.json({ valid: true });
});

});

module.exports = router;