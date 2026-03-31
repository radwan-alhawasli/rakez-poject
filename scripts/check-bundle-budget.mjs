/**
 * After `npm run build`, compares gzip sizes of dist/assets/*.js against scripts/performance-budgets.json.
 * Exits 1 if any file exceeds its budget (CI gate).
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const assetsDir = path.join(root, 'dist', 'assets');
const configPath = path.join(__dirname, 'performance-budgets.json');

function main() {
  if (!fs.existsSync(assetsDir)) {
    console.error('check-bundle-budget: dist/assets not found. Run npm run build first.');
    process.exit(1);
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const { chunks = [], defaultMaxGzipBytes = 512000 } = config;

  const failures = [];
  const files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js') && !f.endsWith('.gz'));

  for (const name of files) {
    const full = path.join(assetsDir, name);
    const raw = fs.readFileSync(full);
    const gzipBytes = zlib.gzipSync(raw).length;
    const rule = chunks.find(c => name.includes(c.match));
    const limit = rule ? rule.maxGzipBytes : defaultMaxGzipBytes;
    if (gzipBytes > limit) {
      failures.push({ name, gzipBytes, limit, rule: rule?.match ?? '(default)' });
    }
  }

  if (failures.length) {
    console.error('Bundle budget exceeded:');
    for (const f of failures) {
      console.error(
        `  ${f.name}: gzip ${f.gzipBytes} B > ${f.limit} B (${f.rule})`
      );
    }
    process.exit(1);
  }
  console.log(`check-bundle-budget: OK (${files.length} JS assets)`);
}

main();
