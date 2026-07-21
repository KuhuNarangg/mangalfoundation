import mongoose from "mongoose";

// A single document holds the editable website content overrides.
const siteContentSchema = new mongoose.Schema(
  {
    _id: { type: String, default: "singleton" },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false }
);

export default mongoose.models.SiteContent ||
  mongoose.model("SiteContent", siteContentSchema);
