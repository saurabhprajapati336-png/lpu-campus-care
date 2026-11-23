
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./db");

const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");

const app = express();

// CORS Configuration
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}));

// Middleware
app.use(express.json());

// Home Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        project: "LPU Campus Care",
        message: "Backend is running successfully!"
    });
});

// API Test Route
app.get("/api/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "LPU Campus Care API is working!"
    });
});

// Authentication Routes
app.use("/api/auth", authRoutes);

// Complaint Routes
app.use("/api/complaints", complaintRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API Route Not Found"
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err);

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
});

// Server Configuration
const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log("================================");
            console.log("       LPU CAMPUS CARE");
            console.log("================================");
            console.log(`Server running on port ${PORT}`);
            console.log("Authentication API Loaded!");
            console.log("Complaint API Loaded!");
            console.log("Backend Started Successfully!");
        });

    } catch (error) {
        console.error("Server Startup Failed:", error.message);
        process.exit(1);
    }
};

startServer();
