/**
 * CES Tools Build & Validation Utility
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');
const CALCS_DIR = path.join(ROOT, 'calculators');
const EMBED_DIR = path.join(ROOT, 'embed');

console.log('--- CES Tools Build & Validation ---');

if (!fs.existsSync(CALCS_DIR)) {
  console.error('Calculators directory missing!');
  process.exit(1);
}

const calcs = fs.readdirSync(CALCS_DIR).filter(f => fs.statSync(path.join(CALCS_DIR, f)).isDirectory());

console.log(`Found ${calcs.length} calculator(s): ${calcs.join(', ') || 'none yet'}`);

let allOk = true;
for (const slug of calcs) {
  const dir = path.join(CALCS_DIR, slug);
  const required = ['index.html', 'engine.js', 'ui.js', 'README.md'];
  for (const req of required) {
    if (!fs.existsSync(path.join(dir, req))) {
      console.warn(`[WARN] ${slug}: missing ${req}`);
      allOk = false;
    }
  }

  // Check embed snippet
  const embedFile = path.join(EMBED_DIR, `${slug}.html`);
  if (!fs.existsSync(embedFile)) {
    console.warn(`[WARN] ${slug}: missing embed snippet ${embedFile}`);
    allOk = false;
  }
}

console.log(allOk ? 'All calculators valid.' : 'Some calculator files are pending.');
