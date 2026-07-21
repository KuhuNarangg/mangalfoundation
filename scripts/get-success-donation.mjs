import mongoose from "mongoose";
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
const d = await mongoose.connection.db
  .collection("donations")
  .findOne({ paymentStatus: "success" });
console.log("SUCCESS_ID:", d ? d._id.toString() : "none");
await mongoose.disconnect();
