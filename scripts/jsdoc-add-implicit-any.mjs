/**
 * Adds missing `@param {any} name` to JSDoc above functions flagged by TS7006 (checkJs).
 * Run from repo root: node scripts/jsdoc-add-implicit-any.mjs
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const root = process.cwd();

function runTypecheck() {
  try {
    execSync('npm run typecheck', { cwd: root, encoding: 'utf8', stdio: 'pipe' });
    return '';
  } catch (e) {
    return String((e.stdout || '') + (e.stderr || ''));
  }
}

function parseTs7006(output) {
  const re =
    /^(src[\\/][^\s(]+)\((\d+),\d+\): error TS7006: Parameter '(\w+)' implicitly has an 'any' type\./gm;
  /** @type {Map<string, Map<number, Set<string>>>} */
  const byFile = new Map();
  let m;
  while ((m = re.exec(output)) !== null) {
    let [, file, lineStr, param] = m;
    file = file.replace(/\\/g, '/');
    const line = Number(lineStr, 10);
    if (!byFile.has(file)) byFile.set(file, new Map());
    const byLine = byFile.get(file);
    if (!byLine.has(line)) byLine.set(line, new Set());
    byLine.get(line).add(param);
  }
  return byFile;
}

/**
 * @param {string[]} lines
 * @param {number} fnIdx 0-based index of line containing the parameter
 */
function findJSDocBlock(lines, fnIdx) {
  let i = fnIdx - 1;
  while (i >= 0 && lines[i].trim() === '') i -= 1;
  if (i < 0) return null;
  if (!lines[i].trim().endsWith('*/')) return null;
  const end = i;
  i -= 1;
  while (i >= 0) {
    const t = lines[i].trim();
    if (t.startsWith('/**')) return { start: i, end };
    if (!t.startsWith('*')) return null;
    i -= 1;
  }
  return null;
}

/**
 * @param {string[]} lines
 * @param {{ start: number, end: number }} block
 */
function existingParamNames(lines, block) {
  const names = new Set();
  for (let k = block.start; k <= block.end; k++) {
    const mm = lines[k].match(/@param\s+\{[^}]*\}\s+(\w+)/);
    if (mm) names.add(mm[1]);
    const mm2 = lines[k].match(/@param\s+(\w+)\s*$/);
    if (mm2) names.add(mm2[1]);
  }
  return names;
}

/**
 * @param {string[]} lines
 * @param {number} fnIdx
 * @param {string[]} params
 */
function ensureJsDoc(lines, fnIdx, params) {
  const block = findJSDocBlock(lines, fnIdx);
  const unique = [...new Set(params)];
  if (block) {
    const have = existingParamNames(lines, block);
    const toAdd = unique.filter(p => !have.has(p));
    if (toAdd.length === 0) return false;
    const indent = (lines[block.end].match(/^(\s*)\*/) || ['', '  '])[1];
    const newLines = toAdd.map(p => `${indent} * @param {any} ${p}`);
    lines.splice(block.end, 0, ...newLines);
    return true;
  }
  const indentMatch = lines[fnIdx].match(/^(\s*)/);
  const indent = indentMatch ? indentMatch[1] : '  ';
  const newBlock = [
    `${indent}/**`,
    ...unique.map(p => `${indent} * @param {any} ${p}`),
    `${indent} */`,
  ];
  lines.splice(fnIdx, 0, ...newBlock);
  return true;
}

function processFile(relPath, lineMap) {
  const abs = path.join(root, relPath);
  if (!fs.existsSync(abs)) return false;
  const raw = fs.readFileSync(abs, 'utf8');
  const lines = raw.split(/\r?\n/);
  const entries = [...lineMap.entries()].sort((a, b) => b[0] - a[0]);
  let changed = false;
  for (const [lineNum, paramSet] of entries) {
    const fnIdx = lineNum - 1;
    if (fnIdx < 0 || fnIdx >= lines.length) continue;
    if (ensureJsDoc(lines, fnIdx, [...paramSet])) changed = true;
  }
  if (changed) {
    fs.writeFileSync(abs, lines.join('\n'), 'utf8');
  }
  return changed;
}

let totalPasses = 0;
let out = runTypecheck();
let map = parseTs7006(out);
let count = [...map.values()].reduce((a, m) => a + [...m.values()].reduce((b, s) => b + s.size, 0), 0);
console.log(`TS7006 count (approx): ${count}`);
let prevCount = count + 1;

while (count > 0 && totalPasses < 25 && count < prevCount) {
  prevCount = count;
  totalPasses += 1;
  for (const [file, lineMap] of map) {
    processFile(file, lineMap);
  }
  out = runTypecheck();
  map = parseTs7006(out);
  count = [...map.values()].reduce((a, m) => a + [...m.values()].reduce((b, s) => b + s.size, 0), 0);
  console.log(`pass ${totalPasses}, remaining TS7006 (approx): ${count}`);
}
if (count > 0) {
  console.log(`Stopped with ${count} TS7006 remaining (arrow/callback params need manual @type).`);
}

process.exit(0);
