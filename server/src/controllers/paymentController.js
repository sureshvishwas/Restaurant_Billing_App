const bcrypt = require("bcryptjs");
const PaymentSetting = require("../models/PaymentSetting");

const publicSetting = (setting) => ({
  id: setting._id,
  bankName: setting.bankName,
  accountName: setting.accountName,
  accountNumber: setting.accountNumber,
  branchName: setting.branchName,
  qrImage: setting.qrImage
});

const getPaymentSetting = async (req, res, next) => {
  try {
    const setting = await PaymentSetting.createDefault();
    res.json(publicSetting(setting));
  } catch (error) {
    next(error);
  }
};

const updatePaymentSetting = async (req, res, next) => {
  try {
    const setting = await PaymentSetting.createDefault();
    const allowed = await setting.compareEditPassword(req.body.editPassword || "");

    if (!allowed) {
      return res.status(403).json({ message: "Incorrect payment settings password" });
    }

    setting.bankName = req.body.bankName ?? setting.bankName;
    setting.accountName = req.body.accountName ?? setting.accountName;
    setting.accountNumber = req.body.accountNumber ?? setting.accountNumber;
    setting.branchName = req.body.branchName ?? setting.branchName;

    if (req.file) {
      setting.qrImage = `/uploads/${req.file.filename}`;
    }

    if (req.body.newEditPassword) {
      setting.editPasswordHash = await bcrypt.hash(req.body.newEditPassword, 12);
    }

    await setting.save();
    res.json(publicSetting(setting));
  } catch (error) {
    next(error);
  }
};

module.exports = { getPaymentSetting, updatePaymentSetting };
