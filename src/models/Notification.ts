import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["announcement", "alert", "reminder"],
      default: "announcement",
    },
    recipients: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User", // Empty array implies "all users" or specific broadcast
    },
    targetRoles: {
      type: [String], // e.g., ["member", "volunteer"], empty if for specific recipients
      default: [],
    },
    isGlobal: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
