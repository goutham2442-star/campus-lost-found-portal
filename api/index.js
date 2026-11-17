// Vercel Serverless Function Entry Point for Express
require("dotenv").config();
const app = require("../server");
const { initDB } = require("../src/config/db");
const ItemRepository = require("../src/repositories/ItemRepository");
const seedDatabase = require("../src/scripts/seed");

let initialized = false;

module.exports = async (req, res) => {
  if (!initialized) {
    try {
      await initDB();
      const count = await ItemRepository.count();
      if (count === 0) {
        await seedDatabase();
      }
      initialized = true;
    } catch (err) {
      console.error("[Vercel Startup Error]", err);
    }
  }
  return app(req, res);
};
