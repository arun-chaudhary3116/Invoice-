import mongoose from "mongoose";

const { Schema } = mongoose;

const InvoiceItemSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { _id: true },
);

const InvoiceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        "draft",
        "sent",
        "viewed",
        "paid",
        "partial",
        "overdue",
        "cancelled",
      ],
      default: "draft",
      index: true,
    },
    issueDate: {
      type: Date,
      required: true,
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    items: [InvoiceItemSchema],
    subtotal: {
      type: Number,
      default: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "CAD", "AUD"],
    },
    notes: {
      type: String,
      trim: true,
    },
    terms: {
      type: String,
      trim: true,
    },
    sentAt: {
      type: Date,
    },
    viewedAt: {
      type: Date,
    },
    reminderSentAt: {
      type: Date,
    },
    lastReminderSentAt: {
      type: Date,
    },
    attachments: [
      {
        url: String,
        name: String,
        uploadedAt: Date,
      },
    ],
  },
  { timestamps: true },
);

// Indexes for common queries
InvoiceSchema.index({ userId: 1, status: 1 });
InvoiceSchema.index({ userId: 1, issueDate: -1 });
InvoiceSchema.index({ clientId: 1, userId: 1 });
InvoiceSchema.index({ dueDate: 1 });
InvoiceSchema.index({ createdAt: -1 });

// Virtual for outstanding amount
InvoiceSchema.virtual("outstandingAmount").get(function () {
  return this.total - this.paidAmount;
});

// Virtual for days overdue
InvoiceSchema.virtual("daysOverdue").get(function () {
  if (this.status === "paid" || this.status === "cancelled") return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(this.dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = today - due;
  return diff > 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) : 0;
});

InvoiceSchema.set("toJSON", { virtuals: true });

// Pre-save hook to calculate totals
InvoiceSchema.pre("save", function (next) {
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
    this.taxAmount = (this.subtotal - this.discount) * (this.taxRate / 100);
    this.total = this.subtotal + this.taxAmount - this.discount;
  } else {
    this.subtotal = 0;
    this.taxAmount = 0;
    this.total = 0;
  }
  next();
});

// Method to mark as sent
InvoiceSchema.methods.markAsSent = function () {
  this.status = "sent";
  this.sentAt = new Date();
  return this.save();
};

// Method to mark as paid
InvoiceSchema.methods.markAsPaid = function (amount) {
  this.paidAmount = amount || this.total;
  this.status = this.paidAmount >= this.total ? "paid" : "partial";
  return this.save();
};

const Invoice =
  mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);

export default Invoice;
