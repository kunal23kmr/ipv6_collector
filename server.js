require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000; // Read PORT from .env
const MONGO_URI = process.env.MONGO_URI; // Read MongoDB URI from .env

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve Static HTML
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Connection
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Schema & Model
const ipSchema = new mongoose.Schema({
    address: { type: String, unique: true },
    timestamp: {
        type: String,
        default: () => new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    }
});

const IP = mongoose.model("IP", ipSchema);

// ✅ Store IPv6 Address (Avoid Duplicates)
app.post("/collect-ip", async (req, res) => {
    const { ip } = req.body;
    if (!ip) {
        return res.status(400).json({ success: false, message: "Invalid IP" });
    }

    try {
        const existingIP = await IP.findOne({ address: ip });
        if (!existingIP) {
            await IP.create({ address: ip });
        }
        res.json({ success: true, ip });
    } catch (error) {
        console.error("Error inserting IP:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// API to Get Collected IPs
app.get("/get-ips", async (req, res) => {
    const ips = await IP.find();
    res.json(ips);
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
