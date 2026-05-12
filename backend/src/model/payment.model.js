import mongoose from "mongoose";

const { Schema } = mongoose;

const PaymentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: [
        "cash",
        "check",
        "bank_transfer",
        "credit_card",
        "paypal",
        "other",
      ],
      required: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "completed",
      index: true,
    },
    paymentDate: {
      type: Date,
      required: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    receiptUrl: {
      type: String,
    },
    transactionId: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

// Indexes
PaymentSchema.index({ userId: 1, paymentDate: -1 });
PaymentSchema.index({ invoiceId: 1 });
PaymentSchema.index({ clientId: 1, userId: 1 });
PaymentSchema.index({ status: 1, paymentDate: -1 });

PaymentSchema.methods.publicProfile = function () {
  return {
    id: this._id,
    amount: this.amount,
    paymentMethod: this.paymentMethod,
    paymentDate: this.paymentDate,
    status: this.status,
    reference: this.reference,
  };
};

const Payment =
  mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

export default Payment;
