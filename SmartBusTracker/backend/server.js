const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Debug: Log every request
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});
app.post("/test", (req, res) => {
  console.log("TEST ROUTE HIT ✅", req.body);
  res.json({ message: "POST working", body: req.body });
});

// Routes
app.use("/api/auth", authRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("SmartBusTracker Backend Running 🚍");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
