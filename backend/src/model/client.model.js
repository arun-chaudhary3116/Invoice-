import mongoose from "mongoose";

const { Schema } = mongoose;

const ClientSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    taxId: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    totalInvoiced: {
      type: Number,
      default: 0,
    },
    totalPaid: {
      type: Number,
      default: 0,
    },
    lastInvoiceDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Indexes for common queries
ClientSchema.index({ userId: 1, isActive: 1 });
ClientSchema.index({ email: 1, userId: 1 }, { unique: true });
ClientSchema.index({ createdAt: -1 });

// Virtual for outstanding amount
ClientSchema.virtual("outstandingAmount").get(function () {
  return this.totalInvoiced - this.totalPaid;
});

// Ensure virtuals are included in JSON
ClientSchema.set("toJSON", { virtuals: true });

ClientSchema.methods.publicProfile = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    company: this.company,
    phone: this.phone,
    address: this.address,
    website: this.website,
    totalInvoiced: this.totalInvoiced,
    totalPaid: this.totalPaid,
    outstandingAmount: this.outstandingAmount,
  };
};

const Client = mongoose.models.Client || mongoose.model("Client", ClientSchema);

export default Client;
