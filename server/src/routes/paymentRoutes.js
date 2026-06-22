const express = require("express");
const { protect } = require("../middleware/auth");
const { getPaymentSetting, updatePaymentSetting } = require("../controllers/paymentController");
const upload = require("../middleware/upload");

const router = express.Router();

router.use(protect);
router.get("/", getPaymentSetting);
router.put("/", upload.single("qrImage"), updatePaymentSetting);

module.exports = router;
