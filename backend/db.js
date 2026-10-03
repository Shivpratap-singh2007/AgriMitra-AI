const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { DatabaseSync } = require("node:sqlite");

const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "agrimitra.db");
let db = null;

function hashPassword(password, salt = null) {
  const currentSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, currentSalt, 64).toString("hex");
  return `${currentSalt}:${hash}`;
}

function verifyPasswordHash(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, originalHash] = storedHash.split(":");
  const testHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(originalHash, "hex"), Buffer.from(testHash, "hex"));
}

function getDatabase() {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    initTables();
  }
  return db;
}

function initTables() {
  if (!db) return;

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT DEFAULT 'farmer',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sensor_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT DEFAULT 'AGRIMITRA_DEMO',
      temperature REAL NOT NULL,
      humidity REAL NOT NULL,
      soil_moisture REAL NOT NULL,
      pump INTEGER DEFAULT 0,
      fan INTEGER DEFAULT 0,
      mode TEXT DEFAULT 'local',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT,
      message TEXT NOT NULL,
      reply TEXT NOT NULL,
      language TEXT DEFAULT 'Hindi',
      location TEXT DEFAULT 'Kangra',
      crop TEXT DEFAULT 'Wheat',
      mode TEXT DEFAULT 'local',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS crop_scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT,
      crop TEXT NOT NULL,
      health TEXT NOT NULL,
      confidence REAL NOT NULL,
      disease TEXT NOT NULL,
      mode TEXT DEFAULT 'local',
      created_at TEXT NOT NULL
    );
  `);
}

function registerLocalUser({ email, password, fullName, role = "farmer" }) {
  const database = getDatabase();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail || !password) {
    throw new Error("Email and password are required.");
  }

  const existing = database.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail);
  if (existing) {
    throw new Error("An account with this email already exists in local database.");
  }

  const passwordHash = hashPassword(password);
  const now = new Date().toISOString();

  const insert = database.prepare(`
    INSERT INTO users (email, password_hash, full_name, role, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = insert.run(normalizedEmail, passwordHash, fullName || "Farmer", role, now);

  return {
    id: result.lastInsertRowid,
    email: normalizedEmail,
    fullName: fullName || "Farmer",
    role,
    createdAt: now,
  };
}

function loginLocalUser({ email, password }) {
  const database = getDatabase();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail || !password) {
    throw new Error("Email and password are required.");
  }

  const user = database.prepare("SELECT * FROM users WHERE email = ?").get(normalizedEmail);
  if (!user) {
    throw new Error("User not found in local database.");
  }

  const isValid = verifyPasswordHash(password, user.password_hash);
  if (!isValid) {
    throw new Error("Incorrect password.");
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    createdAt: user.created_at,
  };
}

function logSensorTelemetry(data = {}) {
  try {
    const database = getDatabase();
    const insert = database.prepare(`
      INSERT INTO sensor_logs (device_id, temperature, humidity, soil_moisture, pump, fan, mode, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const now = new Date().toISOString();
    insert.run(
      data.deviceId || "AGRIMITRA_DEMO",
      Number(data.temperature || 0),
      Number(data.humidity || 0),
      Number(data.soilMoisture || 0),
      data.pump ? 1 : 0,
      data.fan ? 1 : 0,
      data.mode || "local",
      now
    );
    return true;
  } catch (error) {
    console.error("Failed to log sensor data:", error.message);
    return false;
  }
}

function getRecentSensorHistory(limit = 15) {
  try {
    const database = getDatabase();
    return database.prepare(`
      SELECT * FROM sensor_logs ORDER BY id DESC LIMIT ?
    `).all(limit);
  } catch (error) {
    return [];
  }
}

function logChatInteraction(data = {}) {
  try {
    const database = getDatabase();
    const insert = database.prepare(`
      INSERT INTO chat_history (user_email, message, reply, language, location, crop, mode, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const now = new Date().toISOString();
    insert.run(
      data.userEmail || "anonymous",
      data.message || "",
      data.reply || "",
      data.language || "Hindi",
      data.location || "Kangra",
      data.crop || "Wheat",
      data.mode || "local",
      now
    );
    return true;
  } catch (error) {
    return false;
  }
}

function logCropAnalysis(data = {}) {
  try {
    const database = getDatabase();
    const insert = database.prepare(`
      INSERT INTO crop_scans (user_email, crop, health, confidence, disease, mode, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const now = new Date().toISOString();
    insert.run(
      data.userEmail || "anonymous",
      data.crop || "Unknown",
      data.health || "Unknown",
      Number(data.confidence || 0),
      data.disease || "None detected",
      data.mode || "local",
      now
    );
    return true;
  } catch (error) {
    return false;
  }
}

function getDatabaseStats() {
  try {
    const database = getDatabase();
    const userCount = database.prepare("SELECT COUNT(*) as count FROM users").get()?.count || 0;
    const sensorCount = database.prepare("SELECT COUNT(*) as count FROM sensor_logs").get()?.count || 0;
    const chatCount = database.prepare("SELECT COUNT(*) as count FROM chat_history").get()?.count || 0;
    const scanCount = database.prepare("SELECT COUNT(*) as count FROM crop_scans").get()?.count || 0;

    let sizeBytes = 0;
    if (fs.existsSync(DB_PATH)) {
      sizeBytes = fs.statSync(DB_PATH).size;
    }

    return {
      type: "SQLite (Native Built-in)",
      path: DB_PATH,
      sizeBytes,
      counts: {
        users: userCount,
        sensorLogs: sensorCount,
        chats: chatCount,
        cropScans: scanCount,
      },
    };
  } catch (error) {
    return {
      type: "SQLite",
      error: error.message,
    };
  }
}

// Auto-initialize on import
getDatabase();

module.exports = {
  getDatabase,
  registerLocalUser,
  loginLocalUser,
  logSensorTelemetry,
  getRecentSensorHistory,
  logChatInteraction,
  logCropAnalysis,
  getDatabaseStats,
};
