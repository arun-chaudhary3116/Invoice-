import mongoose from "mongoose";

const { Schema } = mongoose;

const ActivityLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        "invoice_created",
        "invoice_updated",
        "invoice_sent",
        "invoice_viewed",
        "invoice_paid",
        "invoice_reminded",
        "invoice_cancelled",
        "payment_recorded",
        "client_created",
        "client_updated",
        "client_deleted",
        "invoice_deleted",
      ],
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ["invoice", "payment", "client", "user"],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    entityName: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    changes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  { timestamps: true },
);

// Indexes for common queries
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });
ActivityLogSchema.index({ entityType: 1, entityId: 1 });
ActivityLogSchema.index({ createdAt: -1 });

// TTL index - auto-delete logs older than 1 year
ActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

const ActivityLog =
  mongoose.models.ActivityLog ||
  mongoose.model("ActivityLog", ActivityLogSchema);

export default ActivityLog;
