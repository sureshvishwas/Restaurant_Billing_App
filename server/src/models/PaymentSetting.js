const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const paymentSettingSchema = new mongoose.Schema(
  {
    bankName: { type: String, default: "" },
    accountName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    branchName: { type: String, default: "" },
    qrImage: { type: String, default: "" },
    editPasswordHash: { type: String, required: true }
  },
  { timestamps: true }
);

paymentSettingSchema.methods.compareEditPassword = function compareEditPassword(password) {
  return bcrypt.compare(password, this.editPasswordHash);
};

paymentSettingSchema.statics.createDefault = async function createDefault() {
  const existing = await this.findOne();
  if (existing) return existing;

  const defaultPassword = process.env.DEFAULT_PAYMENT_EDIT_PASSWORD || "change-me";
  return this.create({
    bankName: "BillFast Bank",
    accountName: "BillFast Restaurant",
    accountNumber: "0000000000",
    branchName: "Main Branch",
    editPasswordHash: await bcrypt.hash(defaultPassword, 12)
  });
};

module.exports = mongoose.model("PaymentSetting", paymentSettingSchema);
