const Stripe = require("stripe");

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is missing from environment variables");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const toCents = (value) => Math.max(Math.round(Number(value || 0) * 100), 50);

const createCheckoutSession = async (req, res, next) => {
  try {
    const { tableNumber, items, total } = req.body;

    if (!items?.length) {
      return res.status(400).json({ message: "At least one bill item is required" });
    }

    const stripe = getStripe();
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: process.env.STRIPE_CURRENCY || "usd",
            product_data: {
              name: `BillFast Table ${tableNumber} bill`
            },
            unit_amount: toCents(total)
          },
          quantity: 1
        }
      ],
      metadata: {
        userId: String(req.user._id),
        tableNumber: String(tableNumber)
      },
      success_url: `${clientUrl}/?stripe_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/?stripe_cancelled=true`
    });

    res.json({ url: session.url, id: session.id });
  } catch (error) {
    next(error);
  }
};

const getCheckoutSession = async (req, res, next) => {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(req.params.id);

    res.json({
      id: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCheckoutSession, getCheckoutSession };
