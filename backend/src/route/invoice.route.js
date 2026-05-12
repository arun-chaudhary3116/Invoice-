import express from "express";
import * as invoiceController from "../controller/invoice.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import Invoice from "../model/invoice.model.js";

const router = express.Router();

// ────────────────────────────────────────
// PUBLIC ROUTES — must be before router.use(requireAuth)
// ────────────────────────────────────────

router.get("/:id/public", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      "clientId",
      "name email company",
    );
    if (!invoice) {
      return res.status(404).json({ ok: false, message: "Invoice not found" });
    }
    res.json({
      ok: true,
      data: {
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        currency: invoice.currency,
        items: invoice.items,
        subtotal: invoice.subtotal,
        taxRate: invoice.taxRate,
        taxAmount: invoice.taxAmount,
        discount: invoice.discount,
        total: invoice.total,
        paidAmount: invoice.paidAmount,
        notes: invoice.notes,
        clientId: invoice.clientId,
      },
    });
  } catch (e) {
    console.error("Public invoice error:", e.message);
    res.status(500).json({ ok: false, message: e.message });
  }
});

// ────────────────────────────────────────
// PROTECTED ROUTES
// ────────────────────────────────────────

router.use(requireAuth);

router.get("/", invoiceController.getInvoices);
router.post("/", invoiceController.createInvoice);
router.get("/stats/summary", invoiceController.getInvoiceStats);
router.get("/:id", invoiceController.getInvoice);
router.patch("/:id", invoiceController.updateInvoice);
router.post("/:id/send", invoiceController.sendInvoice);
router.delete("/:id", invoiceController.deleteInvoice);

export default router;
