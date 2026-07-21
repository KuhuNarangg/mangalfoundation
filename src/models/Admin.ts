import mongoose from "mongoose";

export const ADMIN_ROLES = ["super_admin", "admin", "editor"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    role: {
      type: String,
      enum: ADMIN_ROLES,
      default: "admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Brute-force protection
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastLoginIp: {
      type: String,
      default: "",
    },
    lastLoginLocation: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Admin || mongoose.model("Admin", adminSchema);
