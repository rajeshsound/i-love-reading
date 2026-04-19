// Run with: node scripts/generate-icons.mjs
// Requires: npm install canvas (optional - only needed to regenerate icons)
// Icons are pre-generated and committed. Run this only if you need to change them.
import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '../public/icons');
mkdirSync(iconsDir, { recursive: true });

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const r = size * 0.1875;

  // Background
  ctx.fillStyle = '#ee7512';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, r);
  ctx.fill();

  // Barcode bars
  const barColor = 'rgba(255,255,255,0.95)';
  const barY = size * 0.26;
  const barH = size * 0.48;
  const bars = [
    { x: 0.21, w: 0.073 }, { x: 0.323, w: 0.042 }, { x: 0.406, w: 0.104 },
    { x: 0.552, w: 0.052 }, { x: 0.646, w: 0.031 }, { x: 0.719, w: 0.073 },
  ];
  bars.forEach(({ x, w }) => {
    ctx.fillStyle = barColor;
    const bx = size * x;
    const bw = size * w;
    ctx.beginPath();
    ctx.roundRect(bx, barY, bw, barH, size * 0.02);
    ctx.fill();
  });

  // Top & bottom lines
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(size * 0.167, size * 0.198, size * 0.667, size * 0.031);
  ctx.fillRect(size * 0.167, size * 0.771, size * 0.667, size * 0.031);

  return canvas.toBuffer('image/png');
}

for (const size of [192, 512]) {
  const buf = drawIcon(size);
  writeFileSync(join(iconsDir, `icon-${size}.png`), buf);
  console.log(`Generated icon-${size}.png`);
}
console.log('Done!');
