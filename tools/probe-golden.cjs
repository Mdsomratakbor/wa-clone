const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const golden = PNG.sync.read(fs.readFileSync(path.join(__dirname, '../tests/e2e/golden/0-8855-chats.png')));

function px(img, x, y) {
  const i = (y * img.width + x) * 4;
  return '#' + [img.data[i], img.data[i + 1], img.data[i + 2]]
    .map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

console.log('GOLDEN probes (row band y=160, second chat "Andrew Parker"):');
for (let x = 0; x < 375; x += 8) {
  console.log(`y=160 x=${String(x).padStart(3)}: ${px(golden, x, 160)}`);
}
console.log('\nat y=150 and y=170 (row avatars + time):');
for (const y of [150, 170, 190, 210]) {
  console.log(`y=${y}: img(20)${px(golden, 20, y)} txt(240)${px(golden, 240, y)} timeR(300)${px(golden, 300, y)} timeR(350)${px(golden, 350, y)}`);
}
console.log('\nstatus bar y=22, nav y=60, tab y=790:');
for (const [y, label] of [[22, 'status'], [45, 'nav-top'], [66, 'nav-mid'], [790, 'tab'], [800, 'home-ind']]) {
  let line = `${label} y=${y}: `;
  for (const x of [10, 60, 187, 300, 360]) line += `x${x}=${px(golden, x, y)} `;
  console.log(line);
}