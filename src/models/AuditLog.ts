import mongoose from "mongoose";

/**
 * Immutable record of a security-relevant admin action
 * (login, logout, create/update/delete, settings change, etc.).
 */
const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    actorUsername: {
      type: String,
      default: "system",
    },
    // Dot-namespaced action, e.g. "auth.login", "category.update".
    action: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failure"],
      default: "success",
    },
    targetType: {
      type: String,
      default: "",
    },
    targetId: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ip: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });

export default mongoose.models.AuditLog ||
  mongoose.model("AuditLog", auditLogSchema);
