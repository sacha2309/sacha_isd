const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { Language } = require('@google/genai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'A_VERY_STRONG_AND_RANDOM_SECRET_KEY';

// ---------------- Middleware ----------------
app.use(cors({
  origin: [
    "https://regal-klepon-7f98fb.netlify.app",
    "http://localhost:3000"
  ],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ---------------- Database ----------------
const dbPool = mysql.createPool({
     uri: process.env.DATABASE_URL || 'mysql://root:WSMhcURZBPTuzOkFoSJRGgTCIEAJOWAA@turntable.proxy.rlwy.net:52396/railway',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
    // host: process.env.DB_HOST || 'localhost',
    // user: process.env.DB_USER || 'root',
    // password: process.env.DB_PASSWORD || 'sacha123',
    // database: process.env.DB_NAME || 'pdf_db',
    // port: process.env.DB_PORT || 3306, // make sure you read DB_PORT
    // waitForConnections: true,
    // connectionLimit: 10,
    // queueLimit: 0
});

dbPool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ MySQL Connection Failed:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to MySQL Database');
    connection.release();
});

// ---------------- JWT Middleware ----------------
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Missing token" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = user;
        next();
    });
};

// ---------------- Routes ----------------
let authRoutes, aiRoutes;

try {
    authRoutes = require('./routes/auth')(dbPool, JWT_SECRET);
} catch (err) {
    console.error("❌ Could not load auth routes:", err.message);
    authRoutes = express.Router();
}

try {
    aiRoutes = require('./routes/ai');
} catch (err) {
    console.error("❌ Could not load AI routes:", err.message);
    aiRoutes = express.Router();
}

app.use("/api/auth", authRoutes);
app.use("/api/ai", authenticateToken, aiRoutes);

// ---------------- Public PDFs ----------------
const publicPdfsPath = path.join(__dirname, "public_pdfs");
if (!fs.existsSync(publicPdfsPath)) fs.mkdirSync(publicPdfsPath);

app.use('/pdfs', express.static(publicPdfsPath));
const publicTtsPath = path.join(__dirname, "public_tts");
if (!fs.existsSync(publicTtsPath)) fs.mkdirSync(publicTtsPath); // Ensure folder exists
app.use('/public_tts', express.static(publicTtsPath));

// ---------------- List PDFs ----------------
app.get("/api/pdfs", (req, res) => {
    res.json([
        { id: 1, title: "The associated press ", filename: "AP.pdf", language: "english" , date: "2025-12-12", country: "USA"},
        { id: 2, title: "Haaretz ", filename: "Haaretz.pdf",language: "english" , date: "2025-12-10", country: "israel" },
        { id: 3, title: " el mundo", filename: "el mundo.pdf", language: "spanish" , date: "2025-12-26", country: "Spain" },
        { id: 4, title: " le parisien", filename: "le parisien.pdf", language: "french" , date: "2025-12-09", country: "France" },
        { id: 4, title: "جريدة الاخبار", filename: "الاخبار.pdf", language: "arabic" , date: "2025-10-06", country: "Lebanon" }
    ]);
});
// ---------------- Test ----------------
app.get("/api/test", (req, res) => res.json({ message: "Server is running!" }));

// ---------------- Start ----------------
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
