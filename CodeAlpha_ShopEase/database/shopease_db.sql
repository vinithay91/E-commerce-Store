CREATE DATABASE IF NOT EXISTS shopease_db;
USE shopease_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image VARCHAR(1000),
  category VARCHAR(100),
  stock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  address TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO products (name, description, price, image, category, stock) VALUES
('Aurora Headphones', 'Wireless over-ear headphones with rich sound and soft cushions.', 2499.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900', 'Electronics', 25),
('Everyday Backpack', 'A lightweight everyday backpack with plenty of storage.', 1599.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900', 'Fashion', 30),
('Minimal Watch', 'A clean, modern watch for everyday style.', 3299.00, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900', 'Accessories', 18),
('Classic Sneakers', 'Comfortable casual sneakers for daily adventures.', 2799.00, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900', 'Fashion', 20),
('Smart Desk Lamp', 'Adjustable LED desk lamp with a warm, focused glow.', 1199.00, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900', 'Home', 15),
('Ceramic Coffee Set', 'A beautiful ceramic mug set for your coffee moments.', 899.00, 'https://images.unsplash.com/photo-1517256673644-36ad11246d21?w=900', 'Home', 40),
('Travel Camera', 'Compact camera for capturing your favorite memories.', 18499.00, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900', 'Electronics', 8),
('Soft Knit Sweater', 'A cozy knit sweater with a relaxed fit.', 1899.00, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900', 'Fashion', 22)
ON DUPLICATE KEY UPDATE name = VALUES(name);
