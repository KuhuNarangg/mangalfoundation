import mongoose from "mongoose";
import { VOLUNTEER_STATUSES } from "@/lib/volunteer-constants";

const volunteerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    city: { type: String, default: "", trim: true },
    age: { type: Number, default: null },
    occupation: { type: String, default: "" },
    organization: { type: String, default: "" },
    interestedAreas: { type: [String], default: [] },
    availability: { type: String, default: "" },
    motivation: { type: String, default: "" },
    previousExperience: { type: String, default: "" },
    status: { type: String, enum: VOLUNTEER_STATUSES, default: "Pending" },
    adminNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

volunteerSchema.index({ createdAt: -1 });
volunteerSchema.index({ status: 1, createdAt: -1 });
volunteerSchema.index({ email: 1 });

export default mongoose.models.Volunteer ||
  mongoose.model("Volunteer", volunteerSchema);
