<template>
  <div class="task-list-widget">
    <p v-if="!items.length" class="task-list-widget__empty">{{ emptyMessage }}</p>
    <ul v-else class="task-list-widget__list">
      <li v-for="(it, i) in items" :key="it.id ?? i" class="task-list-widget__item">
        <span class="task-list-widget__status" :data-status="normalizeStatus(it.status)" />
        <div class="task-list-widget__main">
          <span class="task-list-widget__title">{{ it.title || it.name || '—' }}</span>
          <span v-if="it.due || it.due_at" class="task-list-widget__due">الاستحقاق: {{ formatDue(it) }}</span>
        </div>
        <span v-if="it.status" class="task-list-widget__badge">{{ it.status }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  emptyMessage: { type: String, default: 'لا توجد مهام' },
});

function normalizeStatus(s) {
  const t = String(s || '').toLowerCase();
  if (t.includes('done') || t.includes('complete') || t.includes('منجز')) return 'done';
  if (t.includes('progress') || t.includes('قيد')) return 'progress';
  return 'pending';
}

function formatDue(it) {
  const d = it.due_at || it.due;
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('ar-SA', { dateStyle: 'short' });
  } catch {
    return String(d);
  }
}
</script>

<style scoped>
.task-list-widget__empty {
  margin: 0;
  padding: 16px;
  text-align: center;
  font-size: 0.9rem;
  color: rgba(226, 232, 240, 0.65);
}

.task-list-widget__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.task-list-widget__item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(177, 162, 143, 0.12);
}

.task-list-widget__item:last-child {
  border-bottom: none;
}

.task-list-widget__status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
  background: rgba(148, 163, 184, 0.6);
}

.task-list-widget__status[data-status='done'] {
  background: var(--color-success, #16a34a);
}

.task-list-widget__status[data-status='progress'] {
  background: var(--color-warning, #f59e0b);
}

.task-list-widget__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
}

.task-list-widget__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(248, 250, 252, 0.95);
  line-height: 1.35;
}

.task-list-widget__due {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.95);
}

.task-list-widget__badge {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(39, 55, 77, 0.85);
  color: rgba(226, 232, 240, 0.9);
  white-space: nowrap;
}
</style>
