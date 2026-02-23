const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const busRoutes = require("./routes/busRoutes");
const locationRoutes = require("./routes/locationRoutes");
const ticketRoutes = require("./routes/ticketRoutes");

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Debug Logger
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

// Routes
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

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});