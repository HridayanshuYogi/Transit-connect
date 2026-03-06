const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  createTicket,
  getMyTickets,
  modifyTicket,
  cancelTicket,
} = require("../controllers/ticketController");

router.post("/", protect, createTicket);
router.get("/", protect, getMyTickets);
router.put("/:id", protect, modifyTicket);
router.delete("/:id", protect, cancelTicket);

module.exports = router;