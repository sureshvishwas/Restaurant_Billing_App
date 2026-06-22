const crypto = require("crypto");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const { signJwt, createResetToken } = require("../utils/tokens");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email
});

const sendAuth = (res, user) => {
  res.json({
    user: sanitizeUser(user),
    token: signJwt(user._id)
  });
};

const signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const user = await User.create({ name, email, password });
    sendAuth(res, user);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    sendAuth(res, user);
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "If the email exists, a reset token was generated" });
    }

    const { token, hash } = createResetToken();
    user.resetPasswordToken = hash;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    // In production, send this token by email. It is returned here for local development.
    res.json({
      message: "Password reset token generated",
      resetToken: token
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const tokenHash = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Reset token is invalid or expired" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendAuth(res, user);
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, me, forgotPassword, resetPassword };
