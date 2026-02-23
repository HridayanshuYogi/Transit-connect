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
});

module.exports = router;