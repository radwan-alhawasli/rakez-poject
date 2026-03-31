/**
 * Fail if any .vue file uses v-html in <template> without an allowlisted sanitizer
 * in the v-html attribute expression (including multiline attributes).
 * Keep in sync with docs/SECURITY.md and docs/SECURITY_EXECUTION.md.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.join(__dirname, '..', 'src');

/** Expression must reference one of these (substring match on normalized expression). */
const ALLOW = /sanitizeNavIconSvg|safeToastIcon|safeChatHtml/;

/**
 * @param {string} source
 * @returns {{ inner: string, startLine: number }[]} startLine = 1-based file line of first line inside template
 */
function extractTemplateBlocks(source) {
  const blocks = [];
  let pos = 0;
  while (pos < source.length) {
    const openStart = source.indexOf('<template', pos);
    if (openStart === -1) break;
    const openEnd = source.indexOf('>', openStart);
    if (openEnd === -1) break;
    const innerStart = openEnd + 1;
    const closeIdx = source.indexOf('</template>', innerStart);
    if (closeIdx === -1) break;
    const inner = source.slice(innerStart, closeIdx);
    const startLine = source.slice(0, innerStart).split(/\r?\n/).length;
    blocks.push({ inner, startLine });
    pos = closeIdx + '</template>'.length;
  }
  return blocks;
}

/**
 * @param {string} inner - template inner HTML
 * @param {number} templateStartLine - 1-based line number of first character of inner in file
 * @returns {{ fileLine: number, snippet: string }[]}
 */
function findUnsafeVHtml(inner, templateStartLine) {
  const bad = [];
  let searchFrom = 0;
  while (searchFrom < inner.length) {
    const idx = inner.indexOf('v-html', searchFrom);
    if (idx === -1) break;
    const before = idx > 0 ? inner[idx - 1] : '';
    if (/[A-Za-z0-9_-]/.test(before)) {
      searchFrom = idx + 6;
      continue;
    }
    let j = idx + 6;
    while (j < inner.length && /\s/.test(inner[j])) j++;
    if (inner[j] !== '=') {
      searchFrom = idx + 6;
      continue;
    }
    j++;
    while (j < inner.length && /\s/.test(inner[j])) j++;
    const q = inner[j];
    if (q !== '"' && q !== "'") {
      const lineInTpl = inner.slice(0, idx).split(/\r?\n/).length;
      bad.push({
        fileLine: templateStartLine + lineInTpl - 1,
        snippet: inner.slice(idx, idx + 60).replace(/\s+/g, ' '),
      });
      searchFrom = idx + 6;
      continue;
    }
    j++;
    let exp = '';
    while (j < inner.length) {
      const c = inner[j];
      if (c === '\\' && q === '"') {
        exp += c + (inner[j + 1] ?? '');
        j += 2;
        continue;
      }
      if (c === q) break;
      exp += c;
      j++;
    }
    const normalized = exp.replace(/\s+/g, ' ').trim();
    if (!ALLOW.test(normalized)) {
      const lineInTpl = inner.slice(0, idx).split(/\r?\n/).length;
      bad.push({
        fileLine: templateStartLine + lineInTpl - 1,
        snippet: normalized.slice(0, 120) || '(empty)',
      });
    }
    searchFrom = idx + 6;
  }
  return bad;
}

function walkVue(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walkVue(full, out);
    else if (name.endsWith('.vue')) out.push(full);
  }
  return out;
}

const failures = [];
const projectRoot = path.join(__dirname, '..');

for (const file of walkVue(srcRoot)) {
  const text = fs.readFileSync(file, 'utf8');
  const blocks = extractTemplateBlocks(text);
  for (const { inner, startLine } of blocks) {
    for (const { fileLine, snippet } of findUnsafeVHtml(inner, startLine)) {
      failures.push(`${path.relative(projectRoot, file)}:${fileLine}: v-html expression not allowlisted: ${snippet}`);
    }
  }
}

if (failures.length) {
  console.error(
    'v-html outside allowlist (use sanitizeNavIconSvg, safeToastIcon, or safeChatHtml in the attribute; update docs + scripts if adding a new safe path):\n'
  );
  failures.forEach(f => console.error(f));
  process.exit(1);
}
console.log('v-html allowlist OK');
