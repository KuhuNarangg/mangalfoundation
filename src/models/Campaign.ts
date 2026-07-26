import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
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
    linkUrl: {
      type: String,
      trim: true,
    },
    linkText: {
      type: String,
      trim: true,
    },
    audience: {
      type: String,
      enum: ["all_users", "past_donors", "all_subscribers"],
      required: true,
    },
    recipientsCount: {
      type: Number,
      default: 0,
    },
    sentBy: {
      type: String, // username of admin
      required: true,
    }
  },
  { timestamps: true }
);

export default mongoose.models.Campaign || mongoose.model("Campaign", campaignSchema);
