const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function rgb(v) {
  return (v[0] * 299 + v[1] * 587 + v[2] * 114) / 1000;
}

function cellColor(data, w, h, x0, x1, y0, y1) {
  let r = 0, g = 0, b = 0, n = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * w + x) * 4;
      r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
    }
  }
  r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
  const lum = Math.round(rgb([r, g, b]));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()} L${round10(lum)}`;
}

function round10(v) { return Math.round(v / 10) * 10; }

function dump(img, label, cols, rows) {
  const cw = Math.floor(img.width / cols);
  const ch = Math.floor(img.height / rows);
  console.log(`\n=== ${label} (${img.width}x${img.height}, cell ${cw}x${ch}) ===`);
  const grid = [];
  for (let ry = 0; ry < rows; ry++) {
    const row = [];
    for (let cx = 0; cx < cols; cx++) {
      row.push(cellColor(img.data, img.width, img.height, cx * cw, (cx + 1) * cw, ry * ch, (ry + 1) * ch));
    }
    grid.push(row.join('  '));
  }
  console.log(grid.join('\n'));
}

const golden = PNG.sync.read(fs.readFileSync(path.join(__dirname, '../tests/e2e/golden/0-8855-chats.png')));
const actual = PNG.sync.read(fs.readFileSync(process.argv[2]));

dump(golden, 'GOLDEN', 8, 18);
dump(actual, 'ACTUAL', 8, 18);