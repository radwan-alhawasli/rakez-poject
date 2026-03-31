/**
 * Fail on dangerous DOM / HTML sinks outside approved locations.
 * Keep in sync with docs/SECURITY_EXECUTION.md.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const srcRoot = path.join(projectRoot, 'src');
const safeHtmlPath = path.normalize(path.join(srcRoot, 'utils', 'safeHtml.js'));

function walk(dir, exts, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, exts, out);
    else if (exts.some(e => name.endsWith(e))) out.push(full);
  }
  return out;
}

const MARKED_PARSE = /\bmarked\s*\.\s*parse\s*\(/;
const DOMPURIFY_SANITIZE = /\bDOMPurify\s*\.\s*sanitize\s*\(/;
const DOMPURIFY_IMPORT = /from\s+['"]dompurify['"]|require\s*\(\s*['"]dompurify['"]\s*\)/;
const INSERT_ADJACENT = /\binsertAdjacentHTML\s*\(/;
const DOCUMENT_WRITE = /\bdocument\s*\.\s*write\s*\(/;
/** Any .innerHTML access in .vue (read or write) outside chart helpers is forbidden. */
const INNER_HTML = /\.innerHTML\b/;

const failures = [];

for (const file of walk(srcRoot, ['.js', '.ts', '.vue'])) {
  const normFile = path.normalize(file);
  const rel = path.relative(projectRoot, file);
  const text = fs.readFileSync(file, 'utf8');

  if (normFile !== safeHtmlPath) {
    if (MARKED_PARSE.test(text)) {
      failures.push(`${rel}: marked.parse is only allowed in src/utils/safeHtml.js`);
    }
    if (DOMPURIFY_SANITIZE.test(text)) {
      failures.push(`${rel}: DOMPurify.sanitize is only allowed in src/utils/safeHtml.js`);
    }
    if (DOMPURIFY_IMPORT.test(text)) {
      failures.push(`${rel}: importing dompurify is only allowed from src/utils/safeHtml.js`);
    }
  }

  if (INSERT_ADJACENT.test(text)) {
    failures.push(`${rel}: insertAdjacentHTML is not allowed under src`);
  }
  if (DOCUMENT_WRITE.test(text)) {
    failures.push(`${rel}: document.write is not allowed under src`);
  }

  if (file.endsWith('.vue') && INNER_HTML.test(text)) {
    const relPosix = rel.split(path.sep).join('/');
    const allowedChart = relPosix.startsWith('src/components/ui/chart/');
    if (!allowedChart) {
      failures.push(
        `${rel}: .innerHTML in .vue is only allowed under src/components/ui/chart/ (see SECURITY_EXECUTION.md)`
      );
    }
  }
}

if (failures.length) {
  console.error('Dangerous DOM / HTML sink check failed:\n');
  failures.forEach(f => console.error(f));
  process.exit(1);
}
console.log('dangerous-dom check OK');
