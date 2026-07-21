import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name."],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email address."],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address.",
      ],
    },
    message: {
      type: String,
      required: [true, "Please provide a message."],
      maxlength: [2000, "Message cannot be more than 2000 characters"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

ContactSchema.index({ createdAt: -1 });

// Prevent mongoose from compiling the model multiple times in development
export default mongoose.models.Contact || mongoose.model("Contact", ContactSchema);
