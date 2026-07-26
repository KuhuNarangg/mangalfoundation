import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    // We can pull their phone number from their donations later if needed
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    roles: {
      type: [String],
      enum: ["user", "member", "volunteer"],
      default: ["user"],
    },
    password: {
      type: String,
      // Optional because donors (users) won't have a password, only members/volunteers
    },
    // Member specific fields
    memberId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // sparse because regular users won't have a memberId
    },
    designation: {
      type: String,
      trim: true,
      default: "Member",
    },
    bloodGroup: {
      type: String,
      trim: true,
      default: "O+",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    profilePicture: {
      type: String,
      trim: true,
      default: "",
    },
    emergencyContactName: {
      type: String,
      trim: true,
      default: "",
    },
    emergencyContactPhone: {
      type: String,
      trim: true,
      default: "",
    },
    emergencyContactRelation: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ roles: 1 });
userSchema.index({ memberId: 1 });

export default mongoose.models.User || mongoose.model("User", userSchema);
