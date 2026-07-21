import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donorName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    pan: {
      type: String,
      default: "",
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: "",
    },
    // Online (Razorpay) vs manually recorded offline donation.
    source: {
      type: String,
      enum: ["online", "manual"],
      default: "online",
    },
    // For manual donations: cash | cheque | bank_transfer | upi | other.
    paymentMethod: {
      type: String,
      default: "",
    },
    // Admin notes for manual/offline donations.
    notes: {
      type: String,
      default: "",
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },
    razorpayOrderId: {
      type: String,
      default: "",
    },
    razorpayPaymentId: {
      type: String,
      default: "",
    },
    razorpaySignature: {
      type: String,
      default: "",
    },
    // Unique receipt number (e.g. MGF/2026/00001), issued when a donation succeeds.
    receiptNumber: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Indexes for the hot query paths (verify lookup, dashboard filters, listings).
donationSchema.index({ razorpayOrderId: 1 });
donationSchema.index({ paymentStatus: 1, createdAt: -1 });
donationSchema.index({ categoryId: 1 });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ email: 1 });
donationSchema.index({ receiptNumber: 1 });

export default mongoose.models.Donation || mongoose.model("Donation", donationSchema);
