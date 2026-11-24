const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must contain at least 6 characters." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [existing] = await pool.execute("SELECT id FROM users WHERE email = ?", [normalizedEmail]);
    if (existing.length) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name.trim(), normalizedEmail, hashedPassword]
    );

    req.session.user = { id: result.insertId, name: name.trim(), email: normalizedEmail };
    res.status(201).json({ message: "Account created successfully.", user: req.session.user });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Unable to create account right now." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const [rows] = await pool.execute(
      "SELECT id, name, email, password FROM users WHERE email = ?",
      [email.trim().toLowerCase()]
    );
    if (!rows.length) return res.status(401).json({ message: "Incorrect email or password." });

    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) return res.status(401).json({ message: "Incorrect email or password." });

    req.session.user = { id: user.id, name: user.name, email: user.email };
    res.json({ message: "Login successful.", user: req.session.user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Unable to log in right now." });
  }
});

router.get("/me", (req, res) => {
  res.json({ user: req.session.user || null });
});

router.post("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) return res.status(500).json({ message: "Could not log out." });
    res.clearCookie("shopease.sid");
    res.json({ message: "You have been logged out." });
  });
});

module.exports = router;
