const { SignJWT } = require("jose");
const crypto = require("crypto");
require("dotenv").config({ path: ".env.local" });

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "mangal_guruji_super_secret_key_2024_secure");

async function run() {
  const token = await new SignJWT({ id: "669911223344556677889900", username: "admin", role: "super_admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  console.log("Token:", token);

  const res = await fetch("http://localhost:3008/api/admin/upload/sign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `admin_token=${token}`
    },
    body: JSON.stringify({ folder: "mangal/categories/gallery" })
  });

  const text = await res.text();
  console.log("Response:", res.status, text);
}
run();
