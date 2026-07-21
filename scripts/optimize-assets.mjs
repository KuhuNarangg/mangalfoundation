// One-off asset optimizer. Run with: node scripts/optimize-assets.mjs
// Regenerates web-sized logo/founder assets + favicons from the large sources.
import sharp from "sharp";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const IMG = path.join(ROOT, "public/images");
const APP = path.join(ROOT, "src/app");

async function run() {
  const logoSrc = path.join(ROOT, "assets/logo-master.png");
  const meta = await sharp(logoSrc).metadata();
  console.log(
    `LOGO src: ${meta.width}x${meta.height} ${meta.format} hasAlpha=${meta.hasAlpha}`
  );

  // Web-sized logo variants (preserve transparency).
  await sharp(logoSrc)
    .resize({ width: 512, withoutEnlargement: true })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(path.join(IMG, "logo.png"));
  await sharp(logoSrc)
    .resize({ width: 1024, withoutEnlargement: true })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(path.join(IMG, "logo-lg.png"));

  // Favicon + apple icon (square, "contain" so nothing is cropped).
  await sharp(logoSrc)
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(APP, "icon.png"));
  await sharp(logoSrc)
    .resize(180, 180, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(APP, "apple-icon.png"));

  // Founder photo — optimize the 440 KB source.
  const founderSrc = path.join(IMG, "adityavikramsingh.jpeg");
  const fmeta = await sharp(founderSrc).metadata();
  console.log(`FOUNDER src: ${fmeta.width}x${fmeta.height} ${fmeta.format}`);
  await sharp(founderSrc)
    .resize({ width: 1000, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(IMG, "founder.jpg"));

  console.log("ASSETS_DONE");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
