const express = require("express");
const fs = require("fs");

const router = express.Router();

// 1️⃣ Create Order
router.post("/", (req, res) => {
  const { productId, quantity } = req.body;
  const data = JSON.parse(fs.readFileSync(req.dbPath));

  const product = data.products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (product.stock === 0 || quantity > product.stock) {
    return res.status(400).json({ message: "Insufficient stock" });
  }

  const totalAmount = product.price * quantity;

  const newOrder = {
    id: data.orders.length + 1,
    productId,
    quantity,
    totalAmount,
    status: "placed",
    createdAt: new Date().toISOString().split("T")[0]
  };

  product.stock -= quantity;
  data.orders.push(newOrder);

  fs.writeFileSync(req.dbPath, JSON.stringify(data, null, 2));

  res.status(201).json(newOrder);
});

// 2️⃣ Get All Orders
router.get("/", (req, res) => {
  const data = JSON.parse(fs.readFileSync(req.dbPath));
  res.status(200).json(data.orders);
});

// 3️⃣ Cancel Order (Soft Delete)
router.delete("/:orderId", (req, res) => {
  const orderId = Number(req.params.orderId);
  const data = JSON.parse(fs.readFileSync(req.dbPath));

  const order = data.orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.status === "cancelled") {
    return res.status(400).json({ message: "Order already cancelled" });
  }

  const today = new Date().toISOString().split("T")[0];
  if (order.createdAt !== today) {
    return res.status(400).json({ message: "Cancellation not allowed" });
  }

  order.status = "cancelled";

  const product = data.products.find(p => p.id === order.productId);
  product.stock += order.quantity;

  fs.writeFileSync(req.dbPath, JSON.stringify(data, null, 2));

  res.status(200).json({ message: "Order cancelled successfully" });
});

// 4️⃣ Change Order Status
router.patch("/change-status/:orderId", (req, res) => {
  const orderId = Number(req.params.orderId);
  const data = JSON.parse(fs.readFileSync(req.dbPath));

  const order = data.orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.status === "cancelled" || order.status === "delivered") {
    return res.status(400).json({ message: "Status change not allowed" });
  }

  const statusFlow = {
    placed: "shipped",
    shipped: "delivered"
  };

  order.status = statusFlow[order.status];

  fs.writeFileSync(req.dbPath, JSON.stringify(data, null, 2));
  res.status(200).json(order);
});

module.exports = router;
