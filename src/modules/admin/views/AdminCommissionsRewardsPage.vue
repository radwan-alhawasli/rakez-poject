<template>
  <div class="cr-page admin-commissions-rewards" dir="rtl">
    <div class="cr-container">
      <header class="cr-hero">
        <div>
          <div class="cr-hero-badge">إعدادات الأدمن</div>
          <h1 class="cr-title">العمولات والمكافآت</h1>
          <p class="cr-subtitle">استعرض المشاريع واضبط قواعد العمولات والمكافآت لكل مشروع.</p>
        </div>
      </header>

      <section class="cr-card">
        <div class="cr-card-head">
          <h2 class="cr-card-title">البحث عن مشروع</h2>
          <p class="cr-card-desc">ابحث باسم المشروع، المدينة، الحي، أو المطور.</p>
        </div>

        <div class="cr-form-grid">
          <label class="field">
            <span class="label">البحث عن مشروع</span>
            <input
              v-model="searchText"
              type="text"
              class="input"
              placeholder="ابحث باسم المشروع، المدينة، الحي، أو المطور..."
            />
          </label>
        </div>
      </section>

      <div v-if="loading" class="muted">جاري التحميل...</div>
      <div v-else-if="error" class="muted danger">تعذر تحميل المشاريع. حاول مرة أخرى.</div>

      <section v-else class="cr-card">
        <div class="cr-card-head">
          <h2 class="cr-card-title">المشاريع</h2>
        </div>

        <div v-if="!filteredProjects.length" class="cr-empty">
          <div class="cr-empty-title">
            {{ projects.length ? 'لا توجد مشاريع تطابق معايير البحث.' : 'لا توجد مشاريع متاحة حالياً.' }}
          </div>
        </div>

        <div v-else>
          <div class="table-wrap desktop-only">
            <table class="data-table">
              <thead>
                <tr>
                  <th>المشروع</th>
                  <th>المدينة / الحي</th>
                  <th>المطور</th>
                  <th>حالة إعداد العمولة</th>
                  <th>مصدر العمولة</th>
                  <th>نسبة العمولة</th>
                  <th>آخر تحديث</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in filteredProjects" :key="p.id">
                  <td class="project-cell">
                    <div class="project-name">
                      {{ p.name || p.project_name || p.title || ('مشروع #' + p.id) }}
                    </div>
                    <div class="muted small">#{{ p.id }}</div>
                  </td>
                  <td>{{ projectLocation(p) }}</td>
                  <td>{{ p.developer_name || p.developer || p.developerName || '—' }}</td>
                  <td>
                    <span class="status-badge" :class="statusBadgeClass(statusByProjectId[p.id]?.status)">
                      {{ statusLabel(statusByProjectId[p.id]?.status) }}
                    </span>
                  </td>
                  <td>{{ statusByProjectId[p.id]?.commission_source_label ?? '—' }}</td>
                  <td>{{ statusByProjectId[p.id]?.commission_percentage_display ?? '—' }}</td>
                  <td>{{ statusByProjectId[p.id]?.updated_at_display ?? '—' }}</td>
                  <td class="actions">
                    <button type="button" class="btn-primary" @click="openProject(p)">إدارة العمولات</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-only cards">
            <div v-for="p in filteredProjects" :key="'card-' + p.id" class="project-card">
              <div class="project-card-top">
                <div>
                  <div class="project-name">
                    {{ p.name || p.project_name || p.title || ('مشروع #' + p.id) }}
                  </div>
                  <div class="muted small">#{{ p.id }}</div>
                </div>
                <span class="status-badge" :class="statusBadgeClass(statusByProjectId[p.id]?.status)">
                  {{ statusLabel(statusByProjectId[p.id]?.status) }}
                </span>
              </div>

              <div class="project-card-grid">
                <div class="kv">
                  <div class="k">المدينة / الحي</div>
                  <div class="v">{{ projectLocation(p) }}</div>
                </div>
                <div class="kv">
                  <div class="k">المطور</div>
                  <div class="v">{{ p.developer_name || p.developer || p.developerName || '—' }}</div>
                </div>
                <div class="kv">
                  <div class="k">مصدر العمولة</div>
                  <div class="v">{{ statusByProjectId[p.id]?.commission_source_label ?? '—' }}</div>
                </div>
                <div class="kv">
                  <div class="k">نسبة العمولة</div>
                  <div class="v">{{ statusByProjectId[p.id]?.commission_percentage_display ?? '—' }}</div>
                </div>
              </div>

              <button type="button" class="btn-primary w-full" @click="openProject(p)">إدارة العمولات</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import marketingService from '@/services/marketingService';
import { listProjectCommissionSettings } from '@/services/commissionsApi';
import { COMMISSION_SOURCE_LABEL } from '@/constants/commissionsRewards';

const router = useRouter();

const loading = ref(false);
const error = ref(false);
const searchText = ref('');
/** @type {import('vue').Ref<any[]>} */
const projects = ref([]);

/** @type {import('vue').Ref<Record<string, any>>} */
const statusByProjectId = ref({});

function normalizeSearch(v) {
  return String(v ?? '')
    .trim()
    .toLowerCase();
}

function projectLocation(p) {
  const city = p.city || p.city_name || p.cityName;
  const district = p.district || p.district_name || p.districtName;
  const location = p.location || [city, district].filter(Boolean).join(' / ');
  return location || '—';
}

const filteredProjects = computed(() => {
  const q = normalizeSearch(searchText.value);
  if (!q) return projects.value;
  return projects.value.filter(p => {
    const hay = [
      p.name,
      p.project_name,
      p.title,
      p.location,
      p.city,
      p.city_name,
      p.district,
      p.district_name,
      p.developer_name,
      p.developer,
      p.contract_number,
      p.id,
    ]
      .map(v => normalizeSearch(v))
      .join(' ');
    return hay.includes(q);
  });
});

function statusLabel(status) {
  if (status === 'active') return 'إعداد نشط';
  if (status === 'inactive') return 'غير نشط';
  if (status === 'none') return 'غير مهيأ';
  if (status === 'loading') return '...';
  return '—';
}

function statusBadgeClass(status) {
  if (status === 'active') return 'ok';
  if (status === 'inactive') return 'muted';
  if (status === 'none') return 'warn';
  if (status === 'loading') return 'muted';
  return 'muted';
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('ar-SA').format(d);
}

async function loadProjects() {
  loading.value = true;
  error.value = false;
  try {
    const res = await marketingService.getProjects({ per_page: 200 });
    projects.value = res?.items ?? [];
  } catch (_) {
    projects.value = [];
    error.value = true;
  } finally {
    loading.value = false;
  }
}

async function preloadStatusesForVisible() {
  const list = filteredProjects.value.slice(0, 30);
  if (!list.length) return;

  for (const p of list) {
    const id = p.id;
    if (!id) continue;
    if (statusByProjectId.value[id]) continue;
    statusByProjectId.value = { ...statusByProjectId.value, [id]: { status: 'loading' } };
  }

  const idsToFetch = list
    .map(p => p.id)
    .filter(id => id && statusByProjectId.value[id]?.status === 'loading');

  const concurrency = Math.min(6, idsToFetch.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= idsToFetch.length) break;
      const projectId = idsToFetch[i];
      try {
        const { items } = await listProjectCommissionSettings({ project_id: projectId, per_page: 100 });
        const list = Array.isArray(items) ? items : [];
        const active = list.find(s => s?.is_active === true || s?.is_active === 1 || s?.is_active === '1') || null;
        const any = list.length ? list[0] : null;
        const chosen = active || any;
        const status = active ? 'active' : list.length ? 'inactive' : 'none';
        const commissionSource = chosen?.commission_source ? String(chosen.commission_source) : '';
        const commissionPercentage = chosen?.commission_percentage ?? null;
        statusByProjectId.value = {
          ...statusByProjectId.value,
          [projectId]: {
            status,
            commission_source: commissionSource || null,
            commission_source_label: COMMISSION_SOURCE_LABEL[commissionSource] ?? '—',
            commission_percentage_display:
              commissionPercentage === null || commissionPercentage === undefined || commissionPercentage === ''
                ? '—'
                : `${commissionPercentage}%`,
            updated_at_display: formatDate(chosen?.updated_at ?? chosen?.created_at),
          },
        };
      } catch (_) {
        statusByProjectId.value = {
          ...statusByProjectId.value,
          [projectId]: { status: 'none' },
        };
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
}

function openProject(p) {
  router.push({ name: 'AdminCommissionRewardsProject', params: { projectId: String(p.id) } });
}

watch(filteredProjects, () => {
  preloadStatusesForVisible();
});

onMounted(async () => {
  if (typeof document !== 'undefined') {
    document.querySelector('.main-content')?.classList.add('no-commissions-bg');
  }
  await loadProjects();
  await preloadStatusesForVisible();
});

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.querySelector('.main-content')?.classList.remove('no-commissions-bg');
  }
});
</script>

<style scoped src="./styles/AdminCommissionsRewardsPage.scoped.css"></style>
