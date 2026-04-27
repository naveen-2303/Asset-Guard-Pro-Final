const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();

// --- Middleware ---
// Optimized CORS to ensure Vercel can always talk to Render
app.use(cors({
    origin: "*", // Allows all origins - safest for college projects
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "x-auth-token"]
}));

app.use(express.json());

// --- Static Files ---
// Ensures images can be viewed via the URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));

// --- Database Connection ---
const MONGO_URI = process.env.MONGO_URI;

// Better connection logic to handle Render's startup
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => {
        console.log('❌ MongoDB Connection Error:', err);
        process.exit(1); // Stop the server if DB fails
    });

// Root Route (Good for checking if backend is alive)
app.get('/', (req, res) => {
    res.send("Warranty Asset System Backend is Live!");
});

// --- Server Startup ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});