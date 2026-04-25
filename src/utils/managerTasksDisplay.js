/**
 * Helpers for manager task lists: completion detection, monthly grouping, labels.
 */

/**
 * @param {unknown} status
 * @returns {string}
 */
export function normalizeTaskStatusKey(status) {
  return String(status ?? '')
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, '_');
}

/**
 * @param {unknown} status
 * @returns {boolean}
 */
export function isTaskDoneStatus(status) {
  const n = normalizeTaskStatusKey(status);
  if (!n) return false;
  if (n === 'completed' || n === 'done' || n === 'closed' || n === 'finished' || n === 'complete') return true;
  return n.includes('مكتمل') || n.includes('منجز');
}

/**
 * Month bucket YYYY-MM for grouping (due date preferred).
 * @param {any} task
 * @returns {string}
 */
export function taskMonthKey(task) {
  const raw = task.due_at || task.created_at || task.updated_at || task.completed_at;
  if (!raw) return 'unknown';
  const d = new Date(/** @type {any} */ (raw));
  if (Number.isNaN(d.getTime())) return 'unknown';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * @param {any[]} tasks
 * @returns {Array<[string, any[]]>}
 */
export function groupTasksByMonth(tasks) {
  const map = new Map();
  for (const t of tasks) {
    const key = taskMonthKey(t);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(t);
  }
  let entries = [...map.entries()];
  entries.sort((a, b) => {
    if (a[0] === 'unknown') return 1;
    if (b[0] === 'unknown') return -1;
    return b[0].localeCompare(a[0]);
  });
  for (const [, arr] of entries) {
    arr.sort((/** @type {any} */ a, /** @type {any} */ b) => {
      const da = new Date(a.due_at || a.created_at || 0).getTime();
      const db = new Date(b.due_at || b.created_at || 0).getTime();
      return db - da;
    });
  }
  return entries;
}

/**
 * @param {unknown} total
 * @param {unknown} done
 * @returns {number} 0–100
 */
export function completionPercent(total, done) {
  const t = Number(total);
  const d = Number(done);
  if (!Number.isFinite(t) || t <= 0) return 0;
  if (!Number.isFinite(d) || d <= 0) return 0;
  return Math.min(100, Math.round((d / t) * 100));
}

/**
 * @param {unknown} status
 * @returns {'pending' | 'in_progress' | 'done' | 'other'}
 */
export function taskStatusBucket(status) {
  if (isTaskDoneStatus(status)) return 'done';
  const n = normalizeTaskStatusKey(status);
  if (n === 'pending' || n === 'open' || n === 'new' || n === 'waiting') return 'pending';
  if (n === 'in_progress' || n === 'inprogress' || n === 'processing' || n === 'active') return 'in_progress';
  if (!n) return 'other';
  return 'other';
}

/**
 * أعداد ونسب لكل حالة (لعرضها لكل موظف أو للقائمة).
 * @param {any[]} tasks
 */
export function buildTaskStatusBreakdown(tasks) {
  const list = Array.isArray(tasks) ? tasks : [];
  const total = list.length;
  let pending = 0;
  let inProgress = 0;
  let done = 0;
  let other = 0;
  for (const t of list) {
    const b = taskStatusBucket(t?.status);
    if (b === 'done') done++;
    else if (b === 'pending') pending++;
    else if (b === 'in_progress') inProgress++;
    else other++;
  }
  /** @param {number} n */
  const pct = n => (total ? Math.min(100, Math.round((n / total) * 100)) : 0);
  return {
    total,
    pending,
    inProgress,
    done,
    other,
    pendingPct: pct(pending),
    inProgressPct: pct(inProgress),
    donePct: pct(done),
    otherPct: pct(other),
  };
}
