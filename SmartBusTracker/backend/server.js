const express = require("express");
const app = express();

const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const busRoutes = require("./routes/busRoutes");
const locationRoutes = require("./routes/locationRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const adminRoutes = require("./routes/adminRoutes");
const Ticket = require("./models/Ticket");

const http = require("http");
const { Server } = require("socket.io");

process.env.DOTENV_CONFIG_SILENT = 'true';
dotenv.config();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/admin", adminRoutes);

// Debug Logger
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

// =======================================================
// 🔥 CREATE HTTP SERVER FIRST
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

// Make io accessible in routes/controllers if needed
app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔌 Client connected");

  socket.on("seatBooked", (data) => {
    io.emit("seatUpdated", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected");
  });
});

// =======================================================
// 🔥 ROUTES
// =======================================================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/tickets", ticketRoutes);

// Test Route
app.post("/test", (req, res) => {
  console.log("TEST ROUTE HIT ✅", req.body);
  res.json({ message: "POST working", body: req.body });
});

app.get("/", (req, res) => {
  res.send("SmartBusTracker Backend Running 🚍");
});

// =======================================================
// 🔥 AUTO CLEANUP EXPIRED RESERVED SEATS
// (Only works if your schema contains these fields)
// =======================================================
setInterval(async () => {
  try {
    const result = await Ticket.deleteMany({
      status: "reserved",
      reservedUntil: { $lt: new Date() },
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned ${result.deletedCount} expired reservations`);
    }
  } catch (error) {
    console.log("Cleanup error:", error.message);
  }
}, 60000);
// =======================================================

const PORT = process.env.PORT || 5002;

// IMPORTANT: use server.listen (not app.listen)
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});