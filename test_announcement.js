const mongoose = require("mongoose");
const Notification = require("./src/models/Notification").default;

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const notif = await Notification.create({
      title: "Test",
      message: "Test message",
      type: "announcement",
      isGlobal: true,
      createdBy: new mongoose.Types.ObjectId()
    });
    console.log("Success:", notif);
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
run();
