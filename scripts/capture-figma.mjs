// Capture automation for Figma rows 8-21 (design-map goldens + geometry).
//
// The Figma starter-plan quota (HTTP 429, ~38h from ~2026-09-26) blocks /v1/files and
// /v1/images. This script makes the post-reset capture a single command:
//
//   node scripts/capture-figma.mjs           # data + inventory summary + golden manifest
//   node scripts/capture-figma.mjs --only 0:10659
//   node scripts/capture-figma.mjs --manifest  # print the figma_download images batch only
//
// It shells out to `figma-developer-mcp fetch` (Figma REST data endpoint), using the
// same OAuth credentials available on this machine.
import { execSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE_KEY = 'PcGX72lSWkYIk3pL5V8PS3';
const DEPTH = 6;

// nodeId -> { name, specDir, golden }  (design-map rows 8-21)
const ROWS = [
  { nodeId: '0:8820', name: 'starred-messages', specDir: '008-starred-messages', golden: '0-8820-starred-messages.png' },
  { nodeId: '0:9072', name: 'add-modal', specDir: '009-new-chat-modal', golden: '0-9072-add-modal.png' },
  { nodeId: '0:10087', name: 'chat-actions', specDir: '010-chat-actions-modal', golden: '0-10087-chat-actions.png' },
  { nodeId: '0:9778', name: 'settings-modal', specDir: '011-settings-modal', golden: '0-9778-settings-modal.png' },
  { nodeId: '0:9155', name: 'camera', specDir: '012-camera', golden: '0-9155-camera.png' },
  { nodeId: '0:9198', name: 'settings', specDir: '013-settings', golden: '0-9198-settings.png' },
  { nodeId: '0:9371', name: 'account', specDir: '014-account', golden: '0-9371-account.png' },
  { nodeId: '0:9486', name: 'contact-info', specDir: '015-contact-info', golden: '0-9486-contact-info.png' },
  { nodeId: '0:9973', name: 'chats-settings', specDir: '016-chats-settings', golden: '0-9973-chats-settings.png' },
  { nodeId: '0:10758', name: 'notifications', specDir: '017-notifications', golden: '0-10758-notifications.png' },
  { nodeId: '0:10894', name: 'data-storage', specDir: '018-data-storage', golden: '0-10894-data-storage.png' },
  { nodeId: '0:10334', name: 'edit-contact', specDir: '019-edit-contact', golden: '0-10334-edit-contact.png' },
  { nodeId: '0:10659', name: 'edit-profile', specDir: '020-edit-profile', golden: '0-10659-profile.png' },
  { nodeId: '0:11030', name: 'auth', specDir: '021-auth', golden: '0-11030-auth.png' },
];

const flag = (name) => {
  const i = process.argv.indexOf(name);
  return i >= 0;
};

const only = (() => {
  const i = process.argv.indexOf('--only');
  return i >= 0 ? process.argv[i + 1] : null;
})();

const rows = ROWS.filter((r) => !only || r.nodeId === only);
if (only && rows.length === 0) {
  console.error(`Unknown --only '${only}'. Valid: ${ROWS.map((r) => r.nodeId).join(', ')}`);
  process.exit(1);
}

const manifest = rows.map((r) => ({ nodeId: r.nodeId, fileName: r.golden }));

if (flag('--manifest')) {
  console.log(JSON.stringify({ fileKey: FILE_KEY, nodes: manifest }, null, 2));
  process.exit(0);
}

function fetchRow(row) {
  const out = join(ROOT, 'specs', row.specDir, 'capture', `${row.nodeId.replace(':', '-')}.json`);
  mkdirSync(dirname(out), { recursive: true });
  console.log(`[data] ${row.nodeId} ${row.name} -> ${out}`);
  try {
    const stdout = execSync('npx -y figma-developer-mcp fetch --file-key ' + FILE_KEY + ' --node-id ' + row.nodeId + ' --depth ' + DEPTH + ' --format json', {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
    });
    writeFileSync(out, stdout);
    return out;
  } catch (e) {
    const stderr = String(e.stderr || '');
    const match = stderr.match(/Retry after \d+/);
    if (/429|rate limit/i.test(stderr)) {
      console.error(`[blocked] ${row.nodeId}: ${match ? match[0] + ' (~38h from last 429)' : 'rate limited'}`);
    } else {
      console.error(`[failed] ${row.nodeId}: ${stderr.slice(0, 300) || e.message}`);
    }
    return null;
  }
}

function extractInventory(jsonPath) {
  const raw = JSON.parse(readFileSafe(jsonPath));
  const texts = [];
  const frames = [];
  const walk = (n) => {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) return n.forEach(walk);
    if (n.type === 'TEXT' && typeof n.characters === 'string') {
      texts.push({ x: n.x, y: n.y, text: n.characters });
    } else if (n.type === 'FRAME' && n.name) {
      frames.push({ x: n.x, y: n.y, w: n.width, h: n.height, name: n.name });
    }
    (n.children || []).forEach(walk);
    if (n.nodes && typeof n.nodes === 'object') Object.values(n.nodes).forEach(walk);
  };
  walk(raw);
  return { texts, frames };
}

function readFileSafe(p) {
  try {
    return readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

const failures = [];
const ok = [];
for (const row of rows) {
  const out = fetchRow(row);
  if (!out) {
    failures.push(row.nodeId);
    continue;
  }
  ok.push(row.nodeId);
  const inv = extractInventory(out);
  const summary = join(dirname(out), `${row.nodeId.replace(':', '-')}.txt`);
  writeFileSync(
    summary,
    [
      `# ${row.name} (${row.nodeId}) - captured ${new Date().toISOString()}`,
      '',
      '## Frames',
      ...inv.frames.sort((a, b) => a.y - b.y || a.x - b.x).map((f) => `- ${f.name} @ ${Math.round(f.x)},${Math.round(f.y)} ${Math.round(f.w)}x${Math.round(f.h)}`),
      '',
      '## Texts (y-ordered)',
      ...inv.texts.sort((a, b) => a.y - b.y || a.x - b.x).map((t) => `- #${Math.round(t.y)} [@${Math.round(t.x)}] ${JSON.stringify(t.text)}`),
      '',
    ].join('\n'),
  );
  console.log(`[inventory] ${summary} (${inv.texts.length} texts)`);
}

console.log('\n--- Summary ---');
console.log('captured:', ok.length ? ok.join(', ') : '(none)');
console.log('blocked:', failures.length ? failures.join(', ') : '(none)');

if (ok.length) {
  console.log('\n--- Golden batch (run figma_download_figma_images after quota resets) ---');
  console.log(JSON.stringify({ fileKey: FILE_KEY, nodes: manifest.filter((m) => ok.includes(m.nodeId)) }, null, 2));
} else {
  console.log('\nAll rows blocked by Figma 429. Re-run this script after the quota reset (~09-28 02:00 UTC).');
}