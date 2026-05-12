import stripe from "../config/stripe.js";
import Invoice from "../model/invoice.model.js";
import Payment from "../model/payment.model.js";
import User from "../model/user.model.js";

const FRONTEND_URL = (
  process.env.FRONTEND_URL || "http://localhost:8080"
).trim();

// -----------------------------
// CREATE CHECKOUT SESSION (public — no auth required)
// -----------------------------
export const createCheckout = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    if (!invoiceId) {
      return res.status(400).json({ message: "invoiceId is required" });
    }

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // ✅ VERIFY business user has connected Stripe
    const businessUser = await User.findById(invoice.userId);
    if (!businessUser || !businessUser.stripeAccountId) {
      return res.status(400).json({
        message:
          "This business user has not connected their Stripe account. Online payments are not available yet.",
      });
    }

    const amount = invoice.total - invoice.paidAmount;

    if (amount <= 0) {
      return res.status(400).json({ message: "Invoice already paid" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: (invoice.currency || "usd").toLowerCase(),
            product_data: {
              name: `Invoice ${invoice.invoiceNumber}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoiceId: invoice._id.toString(),
        // req.user may not exist for guest checkout
        userId:
          req.user?._id?.toString() || invoice.userId?.toString() || "guest",
      },
      success_url: `${FRONTEND_URL}/pay/${invoiceId}?success=true`,
      cancel_url: `${FRONTEND_URL}/pay/${invoiceId}?cancelled=true`,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe Checkout Error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// -----------------------------
// STRIPE WEBHOOK
// -----------------------------
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log("Payment Success:", session.id);

    await Payment.create({
      userId:
        session.metadata.userId === "guest" ? null : session.metadata.userId,
      invoiceId: session.metadata.invoiceId,
      amount: session.amount_total / 100,
      paymentMethod: "credit_card",
      status: "completed",
      paymentDate: new Date(),
      transactionId: session.payment_intent,
    });

    await Invoice.findByIdAndUpdate(session.metadata.invoiceId, {
      status: "paid",
      paidAmount: session.amount_total / 100,
    });
  }

  res.json({ received: true });
};

// -----------------------------
// CRUD
// -----------------------------
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate("invoiceId", "invoiceNumber total currency")
      .sort({ createdAt: -1 });
    res.json({ ok: true, data: payments });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

export const createPayment = async (req, res) => {
  try {
    const payment = await Payment.create({ ...req.body, userId: req.user._id });
    res.json({ ok: true, data: payment });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

export const getPaymentStats = async (req, res) => {
  try {
    const total = await Payment.countDocuments({ userId: req.user._id });
    res.json({ ok: true, data: { total } });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

export const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!payment)
      return res.status(404).json({ ok: false, message: "Not found" });
    res.json({ ok: true, data: payment });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true },
    );
    res.json({ ok: true, data: payment });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

export const deletePayment = async (req, res) => {
  try {
    await Payment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    res.json({ ok: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};
