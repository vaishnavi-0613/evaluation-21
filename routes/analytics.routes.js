const express = require("express");
const fs = require("fs");

const router = express.Router();

// 1️⃣ All Orders with Count
router.get("/allorders", (req, res) => {
  const data = JSON.parse(fs.readFileSync(req.dbPath));
  const ordersList = [];

  data.orders.forEach(order => ordersList.push(order));

  res.json({
    count: ordersList.length,
    orders: ordersList
  });
});

// 2️⃣ Cancelled Orders
router.get("/cancelled-orders", (req, res) => {
  const data = JSON.parse(fs.readFileSync(req.dbPath));
  const cancelled = data.orders.filter(o => o.status === "cancelled");

  res.json({
    count: cancelled.length,
    orders: cancelled
  });
});

// 3️⃣ Shipped Orders
router.get("/shipped", (req, res) => {
  const data = JSON.parse(fs.readFileSync(req.dbPath));
  const shipped = data.orders.filter(o => o.status === "shipped");

  res.json({
    count: shipped.length,
    orders: shipped
  });
});

// 4️⃣ Total Revenue by Product
router.get("/total-revenue/:productId", (req, res) => {
  const productId = Number(req.params.productId);
  const data = JSON.parse(fs.readFileSync(req.dbPath));

  const product = data.products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const totalRevenue = data.orders
    .filter(o => o.productId === productId && o.status !== "cancelled")
    .reduce((sum, o) => sum + o.quantity * product.price, 0);

  res.json({ productId, totalRevenue });
});

// 5️⃣ Overall Revenue
router.get("/alltotalrevenue", (req, res) => {
  const data = JSON.parse(fs.readFileSync(req.dbPath));

  const totalRevenue = data.orders
    .filter(o => o.status !== "cancelled")
    .reduce((sum, o) => {
      const product = data.products.find(p => p.id === o.productId);
      return sum + o.quantity * product.price;
    }, 0);

  res.json({ totalRevenue });
});

module.exports = router;
