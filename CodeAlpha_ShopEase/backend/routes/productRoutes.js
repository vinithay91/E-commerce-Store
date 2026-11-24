const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { search = "", category = "" } = req.query;
    let sql = "SELECT id, name, description, price, image, category, stock FROM products WHERE stock >= 0";
    const params = [];

    if (search.trim()) {
      sql += " AND (name LIKE ? OR description LIKE ?)";
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }
    if (category.trim() && category !== "All") {
      sql += " AND category = ?";
      params.push(category.trim());
    }
    sql += " ORDER BY id DESC";

    const [products] = await pool.execute(sql, params);
    res.json({ products });
  } catch (error) {
    console.error("Products error:", error);
    res.status(500).json({ message: "Unable to load products." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, description, price, image, category, stock FROM products WHERE id = ?",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: "Product not found." });
    res.json({ product: rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Unable to load product." });
  }
});

module.exports = router;
