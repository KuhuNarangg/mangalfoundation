import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    memberId: { type: String, required: true, unique: true }, // e.g., MGF-1001
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, sparse: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    designation: { type: String, default: "Volunteer" },
    bloodGroup: { type: String, default: "O+" },
    photoUrl: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    role: { type: String, default: "member" },
    joiningDate: { type: Date, default: Date.now },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    lastLoginIp: { type: String, default: "" },
    lastLoginLocation: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Member || mongoose.model("Member", memberSchema);
