const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/UserRepository");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretcampusfindjwtkey_sai_university_2026_academic";

const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Authorization token required. Please sign in." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await UserRepository.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: "User account no longer exists." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired authorization token." });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access forbidden. Administrator privileges required." });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await UserRepository.findById(decoded.id);
    }
  } catch (_) {
    // optional
  }
  next();
};

module.exports = { authMiddleware, adminOnly, optionalAuth, JWT_SECRET };
