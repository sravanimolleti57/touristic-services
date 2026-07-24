const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Database Connection
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// Load Environment Variables
dotenv.config();

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home Route
app.get("/", (req, res) => {
  res.send("Tourism Backend Running...");
});

// ==========================
// API Routes
// ==========================

// Authentication Routes
app.use("/api/auth", authRoutes);

// Review & Sentiment Analysis Routes
app.use("/api/reviews", reviewRoutes);

// ==========================
// Handle Invalid Routes
// ==========================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// ==========================
// Start Server
// ==========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});