import mongoose from "mongoose";

// Atomic sequence counters (e.g. per-year receipt numbering).
const counterSchema = new mongoose.Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

export default mongoose.models.Counter || mongoose.model("Counter", counterSchema);
