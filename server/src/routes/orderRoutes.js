const express = require("express");
const { protect } = require("../middleware/auth");
const { clearOrders, createOrder, getOrders } = require("../controllers/orderController");

const router = express.Router();

router.use(protect);
router.get("/", getOrders);
router.post("/", createOrder);
router.delete("/", clearOrders);

module.exports = router;
