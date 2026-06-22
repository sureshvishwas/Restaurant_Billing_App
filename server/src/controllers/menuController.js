const { validationResult } = require("express-validator");
const MenuItem = require("../models/MenuItem");

const imagePath = (req) => (req.file ? `/uploads/${req.file.filename}` : undefined);

const getMenuItems = async (req, res, next) => {
  try {
    const items = await MenuItem.find().sort({ category: 1, name: 1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

const createMenuItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const item = await MenuItem.create({
      name: req.body.name,
      price: Number(req.body.price),
      taxRate: Number(req.body.taxRate || 0),
      category: req.body.category,
      image: imagePath(req) || req.body.image || ""
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

const updateMenuItem = async (req, res, next) => {
  try {
    const payload = {
      name: req.body.name,
      price: Number(req.body.price),
      taxRate: Number(req.body.taxRate || 0),
      category: req.body.category
    };

    const uploaded = imagePath(req);
    if (uploaded) payload.image = uploaded;
    if (!uploaded && req.body.image !== undefined) payload.image = req.body.image;

    const item = await MenuItem.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });

    if (!item) return res.status(404).json({ message: "Menu item not found" });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    res.json({ message: "Menu item deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem };
