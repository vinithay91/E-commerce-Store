const express = require("express");
const pool = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  const { items, address } = req.body;
  if (!Array.isArray(items) || items.length === 0 || !address || !address.trim()) {
    return res.status(400).json({ message: "Your cart and delivery address are required." });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    let total = 0;
    const verifiedItems = [];

    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);
      if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Invalid cart item.");
      }

      const [rows] = await connection.execute(
        "SELECT id, name, price, stock FROM products WHERE id = ? FOR UPDATE",
        [productId]
      );
      if (!rows.length) throw new Error("A product in your cart no longer exists.");
      const product = rows[0];
      if (product.stock < quantity) throw new Error(`${product.name} does not have enough stock.`);
      total += Number(product.price) * quantity;
      verifiedItems.push({ productId, quantity, price: Number(product.price) });
    }

    const [orderResult] = await connection.execute(
      "INSERT INTO orders (user_id, total_amount, address) VALUES (?, ?, ?)",
      [req.session.user.id, total.toFixed(2), address.trim()]
    );

    for (const item of verifiedItems) {
      await connection.execute(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderResult.insertId, item.productId, item.quantity, item.price.toFixed(2)]
      );
      await connection.execute(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [item.quantity, item.productId]
      );
    }

    await connection.commit();
    res.status(201).json({ message: "Order placed successfully.", orderId: orderResult.insertId, total });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ message: error.message || "Unable to place order." });
  } finally {
    connection.release();
  }
});

router.get("/my-orders", requireAuth, async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `SELECT o.id, o.total_amount, o.address, o.status, o.created_at,
              JSON_ARRAYAGG(JSON_OBJECT('productName', p.name, 'quantity', oi.quantity, 'price', oi.price)) AS items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON p.id = oi.product_id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.session.user.id]
    );
    res.json({ orders });
  } catch (error) {
    console.error("Order history error:", error);
    res.status(500).json({ message: "Unable to load your orders." });
  }
});

module.exports = router;
