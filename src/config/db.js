/**
 * Database abstraction layer supporting:
 * 1. Live MongoDB (Local mongod or MongoDB Atlas via MONGODB_URI)
 * 2. Automatic persistent file-backed document database
 *
 * Fully compatible with Vercel Serverless (/tmp directory writable) and local dev.
 */
const mongoose = require("mongoose");
const Datastore = require("nedb-promises");
const path = require("path");
const fs = require("fs");
const { getStorageDir } = require("./storage");

const dataDir = getStorageDir("data");

let dbMode = "file"; // "mongo" or "file"

// NeDB persistent file stores
const fileStores = {
  users: Datastore.create({ filename: path.join(dataDir, "users.db"), autoload: true }),
  items: Datastore.create({ filename: path.join(dataDir, "items.db"), autoload: true }),
  claims: Datastore.create({ filename: path.join(dataDir, "claims.db"), autoload: true }),
  notifications: Datastore.create({ filename: path.join(dataDir, "notifications.db"), autoload: true })
};

let dbInitialized = false;

async function initDB() {
  if (dbInitialized) return;

  const uri = process.env.MONGODB_URI;
  if (uri && !uri.includes("127.0.0.1:27017") && !uri.includes("localhost:27017")) {
    try {
      console.log(`[Database] Attempting connection to MongoDB Atlas...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
      dbMode = "mongo";
      dbInitialized = true;
      console.log("[Database] Connected successfully to MongoDB / Atlas!");
      return;
    } catch (err) {
      console.warn(`[Database] MongoDB connection failed (${err.message}). Using persistent file-backed document engine.`);
    }
  } else {
    // Check if local mongo is responding
    try {
      await mongoose.connect("mongodb://127.0.0.1:27017/campusfind", { serverSelectionTimeoutMS: 1500 });
      dbMode = "mongo";
      dbInitialized = true;
      console.log("[Database] Connected successfully to local MongoDB!");
      return;
    } catch (_) {
      // expected if mongod is not installed locally
    }
  }

  dbMode = "file";
  dbInitialized = true;
  console.log(`[Database] Running in Persistent File-backed Document DB mode (Storage folder: ${dataDir})`);
}

function getMode() {
  return dbMode;
}

module.exports = { initDB, getMode, fileStores, mongoose };
