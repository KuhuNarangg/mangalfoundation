// Downscale oversized JPGs in public/images IN PLACE (references stay valid).
// Run: node scripts/optimize-photos.mjs
import sharp from "sharp";
import { readdir, stat, writeFile } from "fs/promises";
import path from "path";

const IMG = path.resolve(import.meta.dirname, "../public/images");
const MAX_W = 1920;

const files = await readdir(IMG);
for (const f of files) {
  if (!/\.(jpe?g)$/i.test(f)) continue;
  if (f === "founder.jpg") continue; // already optimized

  const p = path.join(IMG, f);
  const before = (await stat(p)).size;
  const meta = await sharp(p).metadata();
  const needsWork = (meta.width || 0) > MAX_W || before > 500 * 1024;
  if (!needsWork) {
    console.log(`skip ${f} (${Math.round(before / 1024)}KB, ${meta.width}px)`);
    continue;
  }

  // sharp reads the source fully into the pipeline before toBuffer resolves,
  // so it is safe to overwrite the same path afterwards.
  const buf = await sharp(p)
    .resize({ width: Math.min(meta.width || MAX_W, MAX_W), withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer();
  await writeFile(p, buf);

  console.log(
    `${f}: ${(before / 1024 / 1024).toFixed(1)}MB -> ${(buf.length / 1024).toFixed(0)}KB`
  );
}
console.log("PHOTOS_DONE");
