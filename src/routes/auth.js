const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/UserRepository");
const { authMiddleware, JWT_SECRET } = require("../middleware/auth");

// Register a new student
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email format." });
    }

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: "An account with this email already exists." });
    }

    const user = await UserRepository.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "student",
      phone: phone ? phone.trim() : "",
      department: department ? department.trim() : "General"
    });

    const token = jwt.sign({ id: user._id || user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      success: true,
      message: "Registration successful. Welcome to CampusFind!",
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Registration failed." });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please enter both email and password." });
    }

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const userId = user._id || user.id;
    const token = jwt.sign({ id: userId, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Login failed." });
  }
});

// Get Current User Profile
router.get("/me", authMiddleware, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id || req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      department: req.user.department,
      createdAt: req.user.createdAt
    }
  });
});

// Update Profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, phone, department } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (department !== undefined) updates.department = department.trim();

    const updated = await UserRepository.updateProfile(req.user._id || req.user.id, updates);

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to update profile." });
  }
});

module.exports = router;
