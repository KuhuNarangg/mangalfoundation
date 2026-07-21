import mongoose from "mongoose";

/**
 * One document per fixed time-window bucket. A TTL index lets MongoDB
 * evict expired buckets automatically, so the collection self-cleans.
 */
const rateLimitSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// TTL index — Mongo removes the doc once expiresAt has passed.
rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.RateLimit ||
  mongoose.model("RateLimit", rateLimitSchema);
