/**
 * =====================================================================
 * CAMPUSFIND — MAIN APPLICATION SERVER (server.js)
 * Academic Full-Stack Web Technology Project · Sai University
 * =====================================================================
 * 
 * HOW TO EXPLAIN THIS FILE IN CLASS:
 * "server.js is the entry point of our entire backend application.
 *  It accomplishes 4 clean responsibilities:
 *  1. Loads security middleware (Helmet, CORS, Rate-Limiting).
 *  2. Serves frontend web pages from the /public folder.
 *  3. Connects the modular REST API routes (/api/auth, /api/items, etc.).
 *  4. Initializes the persistent database and starts the HTTP server on Port 3000."
 */

require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// 1. Database & Seeder
const { initDB } = require("./src/config/db");
const ItemRepository = require("./src/repositories/ItemRepository");
const seedDatabase = require("./src/scripts/seed");

// 2. Modular API Route Handlers
const authRoutes = require("./src/routes/auth");
const itemRoutes = require("./src/routes/items");
const claimRoutes = require("./src/routes/claims");
const notificationRoutes = require("./src/routes/notifications");
const statRoutes = require("./src/routes/stats");

// 3. Initialize Express App
const app = express();
const PORT = process.env.PORT || 3000;

// 4. Security & Safety Middleware
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors());

// Rate Limiter: Protects portal against brute-force attacks (max 300 requests per 15 mins)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: "Too many requests. Please try again later." }
});
app.use("/api", apiLimiter);

// 5. Body Parsing (JSON and URL-Encoded forms)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 6. Serve Frontend Static Assets (HTML, CSS, Client JS, Uploads)
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// 7. Mount REST API Routes
app.use("/api/auth", authRoutes);                  // Login, Register, Profile
app.use("/api/items", itemRoutes);                // Lost & Found CRUD, Duplicate Alerts
app.use("/api/claims", claimRoutes);              // Claims submission & Admin approvals
app.use("/api/notifications", notificationRoutes);// User notifications
app.use("/api/stats", statRoutes);                // Live dashboards & analytics telemetry

// 8. Server Healthcheck
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "CampusFind Lost and Found Portal — Sai University"
  });
});

// 9. Centralized Error Handling
app.use((err, req, res, next) => {
  console.error("[Server Error]", err.message);
  if (err.name === "MulterError") {
    return res.status(400).json({ success: false, message: `File upload error: ${err.message}` });
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An internal server error occurred."
  });
});

// 10. Start Server and Initialize Database (Only when run directly, not when imported by Vercel serverless)
if (require.main === module) {
  async function startServer() {
    try {
      await initDB();

      const itemCount = await ItemRepository.count();
      if (itemCount === 0) {
        console.log("[Setup] Database empty. Seeding initial campus records...");
        await seedDatabase();
      }

      app.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(`🚀 CampusFind is live at: http://localhost:${PORT}`);
        console.log(`🎓 Sai University Web Technology Project`);
        console.log(`=======================================================`);
      });
    } catch (err) {
      console.error("Critical: Failed to start server:", err);
      process.exit(1);
    }
  }

  startServer();
}

module.exports = app;
