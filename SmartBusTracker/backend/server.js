const express = require("express");
const app = express();

const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

// ROUTES
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const busRoutes = require("./routes/busRoutes");
const locationRoutes = require("./routes/locationRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const adminRoutes = require("./routes/adminRoutes");

const Ticket = require("./models/Ticket");

// =======================================================
// 🔥 ENV CONFIG
// =======================================================
process.env.DOTENV_CONFIG_SILENT = "true";
dotenv.config();

// =======================================================
// 🔥 DATABASE
// =======================================================
connectDB();

// =======================================================
// 🔥 MIDDLEWARE
// =======================================================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

// Debug Logger
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// =======================================================
// 🔥 ROUTES
// =======================================================
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/tickets", ticketRoutes);

// =======================================================
// 🔥 TEST ROUTES
// =======================================================
app.post("/test", (req, res) => {
  console.log("✅ TEST ROUTE HIT:", req.body);
  res.json({ message: "POST working", body: req.body });
});

app.get("/", (req, res) => {
  res.send("🚍 SmartBusTracker Backend Running");
});

// =======================================================
// 🔥 CREATE HTTP SERVER
// =======================================================
const server = http.createServer(app);

// =======================================================
// 🔥 SOCKET.IO SETUP
// =======================================================
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("seatBooked", (data) => {
    console.log("🎟️ Seat booked:", data);
    io.emit("seatUpdated", data);
  });

  socket.on("busLocationUpdate", (data) => {
    io.emit("busLocationUpdated", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// =======================================================
// 🔥 AUTO CLEANUP EXPIRED RESERVED SEATS
// =======================================================
setInterval(async () => {
  try {
    if (!Ticket) return;

    const result = await Ticket.deleteMany({
      status: "reserved",
      reservedUntil: { $lt: new Date() },
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned ${result.deletedCount} expired reservations`);
    }
  } catch (error) {
    console.log("⚠️ Cleanup error:", error.message);
  }
}, 60000);

// =======================================================
// 🔥 GLOBAL ERROR HANDLER
// =======================================================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({
    message: "Server Error",
    error: err.message,
  });
});

// =======================================================
// 🔥 START SERVER (FIXED)
// =======================================================
const PORT = process.env.PORT || 5002;

// ✅ IMPORTANT: allow mobile access
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});