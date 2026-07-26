import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // Only one active OTP session per email at a time
      trim: true,
      lowercase: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0, // Max 5 allowed
    },
    lastRequested: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

otpSchema.index({ email: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto delete when expiresAt is reached

export default mongoose.models.OTP || mongoose.model("OTP", otpSchema);
