const Order = require("../models/Order");

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const { tableNumber, customerName, customerMobile, items, paymentMethod, subtotal, tax, total } = req.body;

    if (!items?.length) {
      return res.status(400).json({ message: "Order must include at least one item" });
    }

    const order = await Order.create({
      tableNumber,
      customerName,
      customerMobile,
      items,
      paymentMethod,
      subtotal,
      tax,
      total,
      user: req.user._id
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

const clearOrders = async (req, res, next) => {
  try {
    await Order.deleteMany({ user: req.user._id });
    res.json({ message: "Order history cleared" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOrders, createOrder, clearOrders };
