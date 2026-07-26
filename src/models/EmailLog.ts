import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: ["Acceptance", "Rejection", "Campaign", "Other"],
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Sent", "Failed"],
      default: "Sent",
    },
    error: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

emailLogSchema.index({ createdAt: -1 });
emailLogSchema.index({ type: 1, createdAt: -1 });
emailLogSchema.index({ recipient: 1 });

export default mongoose.models.EmailLog || mongoose.model("EmailLog", emailLogSchema);
