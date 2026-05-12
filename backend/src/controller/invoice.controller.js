import ActivityLog from "../model/activity-log.model.js";
import Client from "../model/client.model.js";
import Invoice from "../model/invoice.model.js";
import Payment from "../model/payment.model.js";

// Utility function to generate invoice number
const generateInvoiceNumber = async (userId) => {
  const today = new Date();
  const year = today.getFullYear();
  const count = await Invoice.countDocuments({
    userId,
    createdAt: {
      $gte: new Date(year, 0, 1),
      $lt: new Date(year + 1, 0, 1),
    },
  });
  return `INV-${year}-${String(count + 1).padStart(4, "0")}`;
};

// ────────────────────────────────────────
// CREATE INVOICE
// ────────────────────────────────────────
export const createInvoice = async (req, res) => {
  try {
    const {
      clientId,
      issueDate,
      dueDate,
      items,
      taxRate = 0,
      discount = 0,
      notes,
      terms,
      currency = "USD",
    } = req.body;

    if (!clientId || !issueDate || !dueDate || !items || items.length === 0) {
      return res
        .status(400)
        .json({ ok: false, message: "Missing required fields" });
    }

    // Verify client exists
    const client = await Client.findOne({
      _id: clientId,
      userId: req.user._id,
    });

    if (!client) {
      return res.status(404).json({ ok: false, message: "Client not found" });
    }

    // Calculate items with amounts
    const processedItems = items.map((item) => ({
      ...item,
      amount: item.quantity * item.price,
    }));

    // Calculate totals
    const subtotal = processedItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount - discount;

    const invoiceNumber = await generateInvoiceNumber(req.user._id);

    const invoice = new Invoice({
      userId: req.user._id,
      clientId,
      invoiceNumber,
      issueDate: new Date(issueDate),
      dueDate: new Date(dueDate),
      items: processedItems,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      total,
      notes,
      terms,
      currency,
      status: "draft",
    });

    await invoice.save();

    // Update client totals
    await Client.findByIdAndUpdate(clientId, {
      lastInvoiceDate: new Date(),
      $inc: { totalInvoiced: invoice.total },
    });

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      action: "invoice_created",
      entityType: "invoice",
      entityId: invoice._id,
      entityName: invoice.invoiceNumber,
      description: `Created invoice: ${invoice.invoiceNumber}`,
    });

    res.status(201).json({ ok: true, data: invoice });
  } catch (error) {
    console.error("Create invoice error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

// ────────────────────────────────────────
// GET ALL INVOICES
// ────────────────────────────────────────
export const getInvoices = async (req, res) => {
  try {
    const {
      status,
      clientId,
      skip = 0,
      limit = 50,
      startDate,
      endDate,
    } = req.query;

    const filter = { userId: req.user._id };

    if (status && status !== "all") {
      filter.status = status;
    }

    if (clientId) {
      filter.clientId = clientId;
    }

    if (startDate || endDate) {
      filter.issueDate = {};
      if (startDate) filter.issueDate.$gte = new Date(startDate);
      if (endDate)
        filter.issueDate.$lte = new Date(
          new Date(endDate).getTime() + 86400000,
        );
    }

    const invoices = await Invoice.find(filter)
      .populate("clientId", "name email company")
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Invoice.countDocuments(filter);

    res.json({
      ok: true,
      data: invoices,
      pagination: { skip: parseInt(skip), limit: parseInt(limit), total },
    });
  } catch (error) {
    console.error("Get invoices error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

// ────────────────────────────────────────
// GET SINGLE INVOICE
// ────────────────────────────────────────
export const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findOne({
      _id: id,
      userId: req.user._id,
    }).populate("clientId");

    if (!invoice) {
      return res.status(404).json({ ok: false, message: "Invoice not found" });
    }

    // Get payments for this invoice
    const payments = await Payment.find({
      invoiceId: id,
      userId: req.user._id,
    });

    res.json({
      ok: true,
      data: {
        ...invoice.toObject(),
        payments,
      },
    });
  } catch (error) {
    console.error("Get invoice error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

// ────────────────────────────────────────
// UPDATE INVOICE
// ────────────────────────────────────────
export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating certain fields
    delete updates.invoiceNumber;
    delete updates.userId;

    // If items are updated, recalculate amounts
    if (updates.items) {
      updates.items = updates.items.map((item) => ({
        ...item,
        amount: item.quantity * item.price,
      }));

      // Recalculate subtotal, tax, and total
      const subtotal = updates.items.reduce(
        (sum, item) => sum + item.amount,
        0,
      );
      const taxRate = updates.taxRate ?? 0;
      const discount = updates.discount ?? 0;
      const taxAmount = (subtotal * taxRate) / 100;
      const total = subtotal + taxAmount - discount;

      updates.subtotal = subtotal;
      updates.taxAmount = taxAmount;
      updates.total = total;
    } else if (
      updates.taxRate !== undefined ||
      updates.discount !== undefined
    ) {
      // If only tax rate or discount changed, fetch current invoice to recalculate
      const currentInvoice = await Invoice.findOne({
        _id: id,
        userId: req.user._id,
      });
      if (currentInvoice) {
        const subtotal = currentInvoice.subtotal;
        const taxRate = updates.taxRate ?? currentInvoice.taxRate;
        const discount = updates.discount ?? currentInvoice.discount;
        const taxAmount = (subtotal * taxRate) / 100;
        const total = subtotal + taxAmount - discount;

        updates.taxAmount = taxAmount;
        updates.total = total;
      }
    }

    const invoice = await Invoice.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updates,
      { new: true, runValidators: true },
    );

    if (!invoice) {
      return res.status(404).json({ ok: false, message: "Invoice not found" });
    }

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      action: "invoice_updated",
      entityType: "invoice",
      entityId: invoice._id,
      entityName: invoice.invoiceNumber,
      description: `Updated invoice: ${invoice.invoiceNumber}`,
      changes: updates,
    });

    res.json({ ok: true, data: invoice });
  } catch (error) {
    console.error("Update invoice error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

// ────────────────────────────────────────
// SEND INVOICE
// ────────────────────────────────────────
export const sendInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { status: "sent", sentAt: new Date() },
      { new: true },
    );

    if (!invoice) {
      return res.status(404).json({ ok: false, message: "Invoice not found" });
    }

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      action: "invoice_sent",
      entityType: "invoice",
      entityId: invoice._id,
      entityName: invoice.invoiceNumber,
      description: `Sent invoice: ${invoice.invoiceNumber}`,
    });

    res.json({
      ok: true,
      message: "Invoice sent successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("Send invoice error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

// ────────────────────────────────────────
// DELETE INVOICE
// ────────────────────────────────────────
export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({ ok: false, message: "Invoice not found" });
    }

    // Check if invoice has payments
    const paymentCount = await Payment.countDocuments({ invoiceId: id });
    if (paymentCount > 0) {
      return res.status(400).json({
        ok: false,
        message: `Cannot delete invoice with ${paymentCount} payment(s)`,
      });
    }

    await Invoice.findByIdAndDelete(id);

    // Update client totals
    await Client.findByIdAndUpdate(invoice.clientId, {
      $inc: { totalInvoiced: -invoice.total },
    });

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      action: "invoice_deleted",
      entityType: "invoice",
      entityId: id,
      entityName: invoice.invoiceNumber,
      description: `Deleted invoice: ${invoice.invoiceNumber}`,
    });

    res.json({ ok: true, message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Delete invoice error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

// ────────────────────────────────────────
// GET INVOICE STATS
// ────────────────────────────────────────
export const getInvoiceStats = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user._id });

    const stats = {
      total: invoices.length,
      draft: invoices.filter((i) => i.status === "draft").length,
      sent: invoices.filter((i) => i.status === "sent").length,
      paid: invoices.filter((i) => i.status === "paid").length,
      overdue: invoices.filter((i) => i.status === "overdue").length,
      partial: invoices.filter((i) => i.status === "partial").length,
      totalAmount: invoices.reduce((sum, i) => sum + i.total, 0),
      paidAmount: invoices.reduce((sum, i) => sum + i.paidAmount, 0),
      pendingAmount: invoices.reduce(
        (sum, i) => sum + (i.total - i.paidAmount),
        0,
      ),
    };

    res.json({ ok: true, data: stats });
  } catch (error) {
    console.error("Get invoice stats error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
};
