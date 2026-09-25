/**
 * Portraitify icon pipeline.
 * Rasterizes scripts/icon-source.svg into every asset the PWA needs:
 *  - public/icons/icon-{72,96,128,144,152,192,384,512}x{...}.png
 *  - public/apple-touch-icon.png (180x180)
 *  - public/favicon-16x16.png, public/favicon-32x32.png
 *  - public/favicon.ico (multi-size 16/32/48, PNG payloads)
 *  - src/app/favicon.ico + src/app/apple-icon.png + src/app/icon.png (Next file conventions)
 *  - public/og-image.png (1200x630 social card)
 *
 * Run: node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const SRC = path.join(root, "scripts/icon-source.svg");
const ICONS_DIR = path.join(root, "public/icons");
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

const svg = await readFile(SRC);

await mkdir(ICONS_DIR, { recursive: true });

async function pngAt(size) {
  // Oversample the vector source for crisp results at small sizes.
  return sharp(svg, { density: 384 })
    .resize(size, size, { fit: "contain", background: "#000000" })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// ---- PWA icons -----------------------------------------------------------
for (const size of SIZES) {
  const out = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
  await writeFile(out, await pngAt(size));
  console.log("wrote", path.relative(root, out));
}

// ---- Favicons -------------------------------------------------------------
await writeFile(path.join(root, "public/favicon-16x16.png"), await pngAt(16));
await writeFile(path.join(root, "public/favicon-32x32.png"), await pngAt(32));
await writeFile(path.join(root, "public/apple-touch-icon.png"), await pngAt(180));
console.log("wrote public/favicon-16x16.png, public/favicon-32x32.png, public/apple-touch-icon.png");

// Multi-size ICO hand-assembled (PNG payloads are valid inside ICO).
async function buildIco(entries) {
  const count = entries.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  let offset = 6 + 16 * count;
  const dirs = [];
  for (const { size, buf } of entries) {
    const dir = Buffer.alloc(16);
    dir.writeUInt8(size >= 256 ? 0 : size, 0);
    dir.writeUInt8(size >= 256 ? 0 : size, 1);
    dir.writeUInt8(0, 2);
    dir.writeUInt8(0, 3);
    dir.writeUInt16LE(1, 4);
    dir.writeUInt16LE(32, 6);
    dir.writeUInt32LE(buf.length, 8);
    dir.writeUInt32LE(offset, 12);
    offset += buf.length;
    dirs.push(dir);
  }
  return Buffer.concat([header, ...dirs, ...entries.map((e) => e.buf)]);
}

const icoSizes = [16, 32, 48];
const icoEntries = [];
for (const s of icoSizes) icoEntries.push({ size: s, buf: await pngAt(s) });
await writeFile(path.join(root, "public/favicon.ico"), await buildIco(icoEntries));
console.log("wrote public/favicon.ico (16/32/48)");

// Next.js App Router file conventions (auto-emitted <link> tags).
await mkdir(path.join(root, "src/app"), { recursive: true });
await copyFile(path.join(root, "public/favicon.ico"), path.join(root, "src/app/favicon.ico"));
await copyFile(path.join(root, "public/apple-touch-icon.png"), path.join(root, "src/app/apple-icon.png"));
await copyFile(path.join(root, "public/favicon-32x32.png"), path.join(root, "src/app/icon.png"));
console.log("copied src/app/favicon.ico, src/app/apple-icon.png, src/app/icon.png");

// ---- OG image (1200x630) ---------------------------------------------------
const ogLogo = await sharp(svg, { density: 512 }).resize(228, 228).png().toBuffer();
const wordmark = Buffer.from(
  `<svg width="1200" height="220" viewBox="0 0 1200 220" xmlns="http://www.w3.org/2000/svg">
     <text x="600" y="72" font-family="Helvetica, Arial, 'DejaVu Sans', sans-serif" font-size="66" font-weight="700" letter-spacing="-2.5" fill="#0A0A0A" text-anchor="middle">Portraitify</text>
     <text x="600" y="132" font-family="'DejaVu Sans Mono', Menlo, monospace" font-size="17" letter-spacing="7" fill="#737373" text-anchor="middle">ALGORITHMIC PROFILE ART</text>
     <line x1="560" y1="168" x2="640" y2="168" stroke="#0A0A0A" stroke-width="2"/>
   </svg>`
);
await sharp({
  create: { width: 1200, height: 630, channels: 3, background: "#FAFAFA" },
})
  .composite([
    { input: ogLogo, left: Math.round((1200 - 228) / 2), top: 132 },
    { input: wordmark, left: 0, top: 384 },
  ])
  .png({ compressionLevel: 9 })
  .toFile(path.join(root, "public/og-image.png"));
console.log("wrote public/og-image.png (1200x630)");

console.log("done.");
