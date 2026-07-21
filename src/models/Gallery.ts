import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, default: "", trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "", trim: true },
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    resourceType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    width: { type: Number },
    height: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

gallerySchema.index({ createdAt: -1 });
gallerySchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.models.Gallery || mongoose.model("Gallery", gallerySchema);
