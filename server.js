require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { initDB } = require("./src/config/db");
const ItemRepository = require("./src/repositories/ItemRepository");
const seedDatabase = require("./src/scripts/seed");

// Route handlers
const authRoutes = require("./src/routes/auth");
const itemRoutes = require("./src/routes/items");
const claimRoutes = require("./src/routes/claims");
const notificationRoutes = require("./src/routes/notifications");
const statRoutes = require("./src/routes/stats");

const app = express();
const PORT = process.env.PORT || 3000;

// Security and CORS
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors());

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: "Too many requests, please try again later." }
});
app.use("/api", limiter);

// Request parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/stats", statRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", service: "CampusFind - Sai University" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  if (err.name === "MulterError") {
    return res.status(400).json({ success: false, message: err.message });
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

// Start server
if (require.main === module) {
  async function start() {
    try {
      await initDB();
      const count = await ItemRepository.count();
      if (count === 0) {
        console.log("Seeding initial items...");
        await seedDatabase();
      }
      app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
      });
    } catch (err) {
      console.error("Failed to start server:", err);
    }
  }
  start();
}

module.exports = app;
