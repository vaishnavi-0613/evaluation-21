const express = require("express");
const fs = require("fs");
const path = require("path");

const productsRoutes = require("./routes/products.routes");
const ordersRoutes = require("./routes/orders.routes");
const analyticsRoutes = require("./routes/analytics.routes");

const app = express();
app.use(express.json());

const DB_PATH = path.join(__dirname, "db.json");

// Make DB path available in req
app.use((req, res, next) => {
  req.dbPath = DB_PATH;
  next();
});

app.use("/products", productsRoutes);
app.use("/orders", ordersRoutes);
app.use("/analytics", analyticsRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
