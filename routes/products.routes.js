const express = require("express");
const fs = require("fs");

const router = express.Router();

// Add product (helper for testing)
router.post("/", (req, res) => {
  const { name, price, stock } = req.body;

  const data = JSON.parse(fs.readFileSync(req.dbPath));
  const newProduct = {
    id: data.products.length + 1,
    name,
    price,
    stock
  };

  data.products.push(newProduct);
  fs.writeFileSync(req.dbPath, JSON.stringify(data, null, 2));

  res.status(201).json(newProduct);
});

module.exports = router;
