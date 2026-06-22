const express = require("express");
const { body } = require("express-validator");
const { createMenuItem, deleteMenuItem, getMenuItems, updateMenuItem } = require("../controllers/menuController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

const validators = [
  body("name").trim().notEmpty().withMessage("Item name is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("taxRate").optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage("Tax rate must be a positive number"),
  body("category").trim().notEmpty().withMessage("Category is required")
];

router.use(protect);
router.get("/", getMenuItems);
router.post("/", upload.single("image"), validators, createMenuItem);
router.put("/:id", upload.single("image"), validators, updateMenuItem);
router.delete("/:id", deleteMenuItem);

module.exports = router;
