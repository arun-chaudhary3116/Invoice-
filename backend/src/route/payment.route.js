import express from "express";
import * as paymentController from "../controller/payment.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// ────────────────────────────────────────
// PUBLIC ROUTES — no auth required
// ────────────────────────────────────────

// Stripe webhook must be public
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.stripeWebhook,
);

// Checkout must be public — client paying has no account
router.post("/checkout", paymentController.createCheckout);

// ────────────────────────────────────────
// PROTECTED ROUTES
// ────────────────────────────────────────

router.use(requireAuth);

router.get("/", paymentController.getPayments);
router.post("/", paymentController.createPayment);
router.get("/stats/summary", paymentController.getPaymentStats);
router.get("/:id", paymentController.getPayment);
router.patch("/:id", paymentController.updatePayment);
router.delete("/:id", paymentController.deletePayment);

export default router;
