import ActivityLog from "../model/activity-log.model.js";
import Client from "../model/client.model.js";
import Invoice from "../model/invoice.model.js";

// ────────────────────────────────────────
// CREATE CLIENT
// ────────────────────────────────────────
export const createClient = async (req, res) => {
  try {
    const { name, email, company, phone, address, taxId, website, notes } =
      req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ ok: false, message: "Name and email are required" });
    }

    const existingClient = await Client.findOne({
      email,
      userId: req.user._id,
    });
    if (existingClient) {
      return res
        .status(400)
        .json({ ok: false, message: "Client with this email already exists" });
    }

    const client = new Client({
      userId: req.user._id,
      name,
      email,
      company,
      phone,
      address,
      taxId,
      website,
      notes,
    });

    await client.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      action: "client_created",
      entityType: "client",
      entityId: client._id,
      entityName: client.name,
      description: `Created client: ${client.name}`,
    });

    res.status(201).json({
      ok: true,
      data: client,
    });
  } catch (error) {
    console.error("Create client error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

// ────────────────────────────────────────
// GET ALL CLIENTS
// ────────────────────────────────────────
export const getClients = async (req, res) => {
  try {
    const { isActive = "true", skip = 0, limit = 50 } = req.query;

    const filter = { userId: req.user._id };
    if (isActive !== "all") {
      filter.isActive = isActive === "true";
    }

    const clients = await Client.find(filter)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Client.countDocuments(filter);

    res.json({
      ok: true,
      data: clients,
      pagination: { skip: parseInt(skip), limit: parseInt(limit), total },
    });
  } catch (error) {
    console.error("Get clients error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

// ────────────────────────────────────────
// GET SINGLE CLIENT
// ────────────────────────────────────────
export const getClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!client) {
      return res.status(404).json({ ok: false, message: "Client not found" });
    }

    // Get client invoices summary
    const invoices = await Invoice.find({ clientId: id, userId: req.user._id });
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

    res.json({
      ok: true,
      data: {
        ...client.toObject(),
        invoices: invoices.length,
        totalInvoiced,
        totalPaid,
        outstanding: totalInvoiced - totalPaid,
      },
    });
  } catch (error) {
    console.error("Get client error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

// ────────────────────────────────────────
// UPDATE CLIENT
// ────────────────────────────────────────
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const client = await Client.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updates,
      { new: true, runValidators: true },
    );

    if (!client) {
      return res.status(404).json({ ok: false, message: "Client not found" });
    }

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      action: "client_updated",
      entityType: "client",
      entityId: client._id,
      entityName: client.name,
      description: `Updated client: ${client.name}`,
      changes: updates,
    });

    res.json({ ok: true, data: client });
  } catch (error) {
    console.error("Update client error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

// ────────────────────────────────────────
// DELETE CLIENT
// ────────────────────────────────────────
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!client) {
      return res.status(404).json({ ok: false, message: "Client not found" });
    }

    // Check if client has invoices
    const invoiceCount = await Invoice.countDocuments({ clientId: id });
    if (invoiceCount > 0) {
      return res.status(400).json({
        ok: false,
        message: `Cannot delete client with ${invoiceCount} invoice(s)`,
      });
    }

    await Client.findByIdAndDelete(id);

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      action: "client_deleted",
      entityType: "client",
      entityId: id,
      entityName: client.name,
      description: `Deleted client: ${client.name}`,
    });

    res.json({ ok: true, message: "Client deleted successfully" });
  } catch (error) {
    console.error("Delete client error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
};
