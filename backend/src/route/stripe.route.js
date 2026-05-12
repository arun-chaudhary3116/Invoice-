import express from "express";
import Stripe from "stripe";
import { requireAuth } from "../middleware/requireAuth.js";
import User from "../model/user.model.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ─────────────────────────────
// SAFE ENV SETUP
// ─────────────────────────────
const FRONTEND_URL = (
  process.env.FRONTEND_URL || "http://localhost:8080"
).trim();

console.log("[Stripe] FRONTEND_URL:", FRONTEND_URL);

// ─────────────────────────────
// DB HELPERS
// ─────────────────────────────
async function saveStripeAccount(userId, accountId) {
  await User.findByIdAndUpdate(userId, { stripeAccountId: accountId });
}

async function getStripeAccount(userId) {
  const user = await User.findById(userId);
  return user?.stripeAccountId || null;
}

async function clearStripeAccount(userId) {
  await User.findByIdAndUpdate(userId, { stripeAccountId: null });
}

// ─────────────────────────────
// Stripe requires real https:// URLs for business_profile.
// localhost is rejected, so only include them in production.
// ─────────────────────────────
function buildBusinessProfile(user) {
  const isLocalhost =
    FRONTEND_URL.includes("localhost") || FRONTEND_URL.includes("127.0.0.1");

  const profile = {
    name: user.name || "Business",
  };

  if (!isLocalhost) {
    profile.url = `${FRONTEND_URL}/dashboard`;
    profile.support_url = `${FRONTEND_URL}/dashboard/settings`;
  }

  return profile;
}

// ─────────────────────────────
// 1. START CONNECT
// ─────────────────────────────
router.get("/connect/start", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email;

    let accountId = await getStripeAccount(userId);

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: userEmail,
        business_profile: buildBusinessProfile(req.user),
      });

      accountId = account.id;
      await saveStripeAccount(userId, accountId);
      console.log("[Stripe] Created account:", accountId);
    }

    const refresh_url = `${FRONTEND_URL}/dashboard/settings?stripe=refresh_needed`;
    const return_url = `${FRONTEND_URL}/dashboard/settings?stripe=connected`;

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      type: "account_onboarding",
      refresh_url,
      return_url,
    });

    return res.json({ url: accountLink.url });
  } catch (err) {
    console.error("[Stripe] connect/start error:", err.message);
    return res.status(500).json({
      error: err.message || "Failed to start Stripe onboarding",
    });
  }
});

// ─────────────────────────────
// 2. STATUS
// ─────────────────────────────
router.get("/connect/status", requireAuth, async (req, res) => {
  try {
    const accountId = await getStripeAccount(req.user._id);

    if (!accountId) {
      return res.json({ connected: false });
    }

    const account = await stripe.accounts.retrieve(accountId);

    return res.json({
      connected: true,
      accountId: account.id,
      email: account.email || null,
      businessName: account.business_profile?.name || null,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });
  } catch (err) {
    console.error("[Stripe] status error:", err.message);

    if (err.code === "resource_missing") {
      await clearStripeAccount(req.user._id);
    }

    return res.json({ connected: false });
  }
});

// ─────────────────────────────
// 3. DISCONNECT
// ─────────────────────────────
router.delete("/connect", requireAuth, async (req, res) => {
  try {
    const accountId = await getStripeAccount(req.user._id);

    if (accountId) {
      await stripe.accounts.del(accountId);
      await clearStripeAccount(req.user._id);
    }

    res.json({ disconnected: true });
  } catch (err) {
    console.error("[Stripe] disconnect error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────
// 4. PAYMENT INTENT
// ─────────────────────────────
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amountCents, invoiceId, businessUserId } = req.body;

    if (!amountCents || !invoiceId || !businessUserId) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const accountId = await getStripeAccount(businessUserId);

    if (!accountId) {
      return res.status(400).json({ error: "Stripe not connected" });
    }

    const account = await stripe.accounts.retrieve(accountId);

    if (!account.charges_enabled) {
      return res.status(400).json({ error: "Account not ready" });
    }

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: amountCents,
        currency: "gbp",
        metadata: { invoiceId },
        automatic_payment_methods: { enabled: true },
      },
      {
        stripeAccount: accountId,
      },
    );

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("[Stripe] payment intent error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
