const crypto = require("crypto");
require("dotenv").config({ path: ".env.local" });

const secret = process.env.CLOUDINARY_API_SECRET;
const folder = "mangal/categories/gallery";
const timestamp = Math.round(Date.now() / 1000);
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;

const params = { folder, timestamp };
const toSign = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join("&");
const signature = crypto.createHash("sha1").update(toSign + secret).digest("hex");

const fs = require("fs");
const path = require("path");
// create a dummy image
const filePath = path.join(__dirname, "dummy.png");
fs.writeFileSync(filePath, Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"));

async function upload() {
  const fd = new FormData();
  const fileData = new Blob([fs.readFileSync(filePath)], { type: "image/png" });
  fd.append("file", fileData, "dummy.png");
  fd.append("api_key", apiKey);
  fd.append("timestamp", String(timestamp));
  fd.append("signature", signature);
  fd.append("folder", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: fd
  });
  const json = await res.json();
  console.log(json);
}

upload();
