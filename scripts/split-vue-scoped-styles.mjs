/**
 * Extracts <style scoped> from large .vue files, splits CSS at brace-depth 0
 * into chunks <= maxLines, replaces with <style scoped src="..."> tags.
 * Run: node scripts/split-vue-scoped-styles.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'src');

const MAX_LINES = 480;
const MIN_CHUNK = 320;
const MIN_FILE_LINES = 500;

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (name.endsWith('.vue')) acc.push(p);
  }
  return acc;
}

function lineCount(file) {
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).length;
}

function splitCssSmart(css) {
  const lines = css.split(/\r?\n/);
  const chunks = [];
  let buf = [];
  let depth = 0;

  const flush = () => {
    if (buf.length) {
      chunks.push(buf.join('\n'));
      buf = [];
    }
  };

  for (const line of lines) {
    buf.push(line);
    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;
    depth += opens - closes;
    if (depth === 0 && buf.length >= MIN_CHUNK) {
      flush();
    }
  }
  flush();

  if (chunks.length === 0) return [css];

  const merged = [];
  let cur = '';
  for (const c of chunks) {
    const clines = c.split('\n').length;
    const curLines = cur ? cur.split('\n').length : 0;
    if (cur && curLines + clines > MAX_LINES) {
      merged.push(cur);
      cur = c;
    } else {
      cur = cur ? `${cur}\n${c}` : c;
    }
  }
  if (cur) merged.push(cur);

  const final = [];
  for (const m of merged) {
    const L = m.split('\n').length;
    if (L <= MAX_LINES) final.push(m);
    else {
      const subLines = m.split('\n');
      for (let i = 0; i < subLines.length; i += MAX_LINES - 20) {
        final.push(subLines.slice(i, i + MAX_LINES).join('\n'));
      }
    }
  }
  return final;
}

function processVue(vuePath) {
  const total = lineCount(vuePath);
  if (total <= MIN_FILE_LINES) return false;

  const raw = fs.readFileSync(vuePath, 'utf8');
  let scopedMatch = raw.match(/<style\s+scoped>\s*([\s\S]*?)\s*<\/style>/);
  let isScoped = true;
  if (!scopedMatch) {
    scopedMatch = raw.match(/<style>\s*([\s\S]*?)\s*<\/style>/);
    isScoped = false;
  }
  if (!scopedMatch) return false;

  const css = scopedMatch[1].trim();
  if (!css || css.split('\n').length < 80) return false;

  const relDir = path.dirname(path.relative(srcDir, vuePath));
  const base = path.basename(vuePath, '.vue');
  const styleDir = path.join(path.dirname(vuePath), 'styles');
  const prefix = isScoped ? `${base}.scoped` : `${base}.global`;
  fs.mkdirSync(styleDir, { recursive: true });

  const parts = splitCssSmart(css);
  const relImports = [];
  let idx = 1;
  for (const part of parts) {
    const name = `${prefix}.s${idx}.css`;
    const out = path.join(styleDir, name);
    fs.writeFileSync(out, part + '\n', 'utf8');
    const fromVue = './styles/' + name;
    relImports.push(
      isScoped
        ? `<style scoped src="${fromVue}"></style>`
        : `<style src="${fromVue}"></style>`
    );
    idx++;
  }

  const newRaw = raw.replace(
    isScoped
      ? /<style\s+scoped>\s*[\s\S]*?\s*<\/style>/
      : /<style>\s*[\s\S]*?\s*<\/style>/,
    relImports.join('\n')
  );
  fs.writeFileSync(vuePath, newRaw, 'utf8');
  console.log('OK', path.relative(root, vuePath), '->', parts.length, 'css parts, was', total, 'lines');
  return true;
}

const vueFiles = walk(srcDir);
const big = vueFiles.filter((f) => lineCount(f) > MIN_FILE_LINES);
let n = 0;
for (const f of big) {
  if (processVue(f)) n++;
}
console.log('Processed', n, 'vue files with extracted scoped styles (of', big.length, 'over', MIN_FILE_LINES, 'lines)');
