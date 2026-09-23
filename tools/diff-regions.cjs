const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const golden = PNG.sync.read(fs.readFileSync(path.join(__dirname, '../tests/e2e/golden/0-8855-chats.png')));
const actual = PNG.sync.read(fs.readFileSync(process.argv[2]));

if (golden.width !== actual.width || golden.height !== actual.height) {
  console.log('SIZE MISMATCH', golden.width, golden.height, actual.width, actual.height);
  process.exit(1);
}

const W = golden.width;
const H = golden.height;
const total = W * H;

const THRESH = 20; // channel delta for "different"

function isDiff(x, y) {
  const i = (y * W + x) * 4;
  const nd = () => {
    let max = 0;
    for (let c = 0; c < 3; c++) max = Math.max(max, Math.abs(golden.data[i + c] - actual.data[i + c]));
    return max;
  };
  return nd() > THRESH;
}

function ratioIn(x0, y0, x1, y1, diffOnly) {
  let d = 0, n = 0;
  for (let y = Math.max(0, y0); y < Math.min(H, y1); y++) {
    for (let x = Math.max(0, x0); x < Math.min(W, x1); x++) {
      n++;
      if (isDiff(x, y)) d++;
    }
  }
  return { pct: ((d / n) * 100).toFixed(1), px: d, regionPx: n };
}

// Full
const full = ratioIn(0, 0, W, H);
console.log(`FULL 375x812: ${full.pct}% (${full.px}/${full.regionPx})`);

// Avatars: 9 discs at x~16..64, each row band of 68px starting y=101 (first row content)
const AVATAR_X0 = 10, AVATAR_X1 = 70;
const ROW_START = 96, ROW_STEP = 68, ROWS = 9;
let avarPx = 0;
for (let r = 0; r < ROWS; r++) {
  const y0 = ROW_START + r * ROW_STEP;
  const band = ratioIn(AVATAR_X0, y0, AVATAR_X1, y0 + ROW_STEP);
  avarPx += band.px;
}
console.log(`Avatar column bands total diff px: ${avarPx} (of ${ROWS * (AVATAR_X1 - AVATAR_X0) * ROW_STEP})`);

// Diff excluding the avatar column bands
let d = 0, n = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const inAvatar = x >= AVATAR_X0 && x < AVATAR_X1 && y >= ROW_START && y < ROW_START + ROWS * ROW_STEP;
    if (inAvatar) continue;
    n++;
    if (isDiff(x, y)) d++;
  }
}
console.log(`Excluding avatars: ${((d / n) * 100).toFixed(1)}% changed (${d}/${n})`);

// Horizontal band breakdown (full width, 44px rows) to locate remaining diffs
console.log('\nBand diffs (44px bands):');
for (let y0 = 0; y0 < H; y0 += 44) {
  const b = ratioIn(0, y0, W, y0 + 44);
  console.log(`y ${y0}-${y0 + 44}: ${b.pct}% (${b.px}px)`);
}