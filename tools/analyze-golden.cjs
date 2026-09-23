const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function hex(p) {
  return '#' + [p.r, p.g, p.b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

const golden = PNG.sync.read(fs.readFileSync(path.join(__dirname, '../tests/e2e/golden/0-8855-chats.png')));
const actualP = process.argv[2];
const actual = PNG.sync.read(fs.readFileSync(actualP));

console.log('golden:', golden.width, 'x', golden.height);
console.log('actual:', actual.width, 'x', actual.height);

function sample(img, label, x, y) {
  const i = (y * img.width + x) * 4;
  console.log(`${label} @(${x},${y}) golden=${hex({ r: golden.data[i], g: golden.data[i+1], b: golden.data[i+2] })}  actual=${hex({ r: actual.data[i], g: actual.data[i+1], b: actual.data[i+2] })}`);
}

sample(golden, 'bg mid-list          ', 20, 300);
sample(golden, 'bg top under status  ', 20, 60);
sample(golden, 'nav bar center       ', 187, 44);
sample(golden, 'tab bar bg           ', 10, 780);
sample(golden, 'row separator area   ', 20, 90);
sample(golden, 'avatar-1 center      ', 36, 90);
sample(golden, 'avatar-2 center      ', 36, 158);
sample(golden, 'name-1 text area     ', 130, 88);
sample(golden, 'preview-1 text area  ', 130, 108);
sample(golden, 'time-1 area          ', 330, 88);
sample(golden, 'fab area             ', 340, 740);
sample(golden, 'status time area     ', 40, 22);
sample(golden, 'home-indicator       ', 187, 795);