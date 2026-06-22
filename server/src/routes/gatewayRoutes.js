const express = require("express");
const { protect } = require("../middleware/auth");
const { createCheckoutSession, getCheckoutSession } = require("../controllers/gatewayController");

const router = express.Router();

router.use(protect);
router.post("/stripe/checkout-session", createCheckoutSession);
router.get("/stripe/checkout-session/:id", getCheckoutSession);

module.exports = router;
