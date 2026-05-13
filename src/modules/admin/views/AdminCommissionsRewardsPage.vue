<template>
  <div class="cr-page admin-commissions-rewards" dir="rtl">
    <div class="cr-container">
      <header class="cr-hero">
        <div>
          <div class="cr-hero-badge">إعدادات الأدمن</div>
          <h1 class="cr-title">العمولات والنسب</h1>
          <p class="cr-subtitle">اختر مشروعاً لفتح شاشة مكافآت المشاريع وإدارة إعدادات المكافآت المرتبطة به.</p>
        </div>
      </header>

      <section class="cr-card">
        <div class="cr-card-head">
          <h2 class="cr-card-title">البحث عن مشروع</h2>
          <p class="cr-card-desc">ابحث باسم المشروع، المدينة، الحي، المطور أو رقم العقد.</p>
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

      <div v-if="loading" class="muted">جاري تحميل المشاريع...</div>
      <div v-else-if="error" class="muted danger">تعذر تحميل المشاريع. حاول مرة أخرى.</div>

      <section v-else class="cr-card">
        <div class="cr-card-head">
          <h2 class="cr-card-title">المشاريع</h2>
          <p class="cr-card-desc">افتح المشروع المطلوب لإدارة تبويبات العمولات والمكافآت الخاصة به.</p>
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
                  <th>حالة إعداد المكافأة</th>
                  <th>مصدر المكافأة</th>
                  <th>طريقة الحساب</th>
                  <th>آخر تحديث</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="project in filteredProjects" :key="project.id">
                  <td class="project-cell">
                    <div class="project-name">
                      {{ project.name || project.project_name || project.title || (`مشروع #${project.id}`) }}
                    </div>
                    <div class="muted small">#{{ project.contract_number || project.id }}</div>
                  </td>
                  <td>{{ projectLocation(project) }}</td>
                  <td>{{ project.developer_name || project.developer || project.developerName || '—' }}</td>
                  <td>
                    <span class="status-badge" :class="statusBadgeClass(statusByProjectId[project.id]?.status)">
                      {{ statusLabel(statusByProjectId[project.id]?.status) }}
                    </span>
                  </td>
                  <td>{{ statusByProjectId[project.id]?.source_label ?? '—' }}</td>
                  <td>{{ statusByProjectId[project.id]?.calculation_mode_label ?? '—' }}</td>
                  <td>{{ statusByProjectId[project.id]?.updated_at_display ?? '—' }}</td>
                  <td class="actions">
                    <button type="button" class="btn-primary" @click="openProject(project)">إدارة العمولات والمكافآت</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-only cards">
            <div v-for="project in filteredProjects" :key="`card-${project.id}`" class="project-card">
              <div class="project-card-top">
                <div>
                  <div class="project-name">
                    {{ project.name || project.project_name || project.title || (`مشروع #${project.id}`) }}
                  </div>
                  <div class="muted small">#{{ project.contract_number || project.id }}</div>
                </div>
                <span class="status-badge" :class="statusBadgeClass(statusByProjectId[project.id]?.status)">
                  {{ statusLabel(statusByProjectId[project.id]?.status) }}
                </span>
              </div>

              <div class="project-card-grid">
                <div class="kv">
                  <div class="k">المدينة / الحي</div>
                  <div class="v">{{ projectLocation(project) }}</div>
                </div>
                <div class="kv">
                  <div class="k">المطور</div>
                  <div class="v">{{ project.developer_name || project.developer || project.developerName || '—' }}</div>
                </div>
                <div class="kv">
                  <div class="k">مصدر المكافأة</div>
                  <div class="v">{{ statusByProjectId[project.id]?.source_label ?? '—' }}</div>
                </div>
                <div class="kv">
                  <div class="k">طريقة الحساب</div>
                  <div class="v">{{ statusByProjectId[project.id]?.calculation_mode_label ?? '—' }}</div>
                </div>
              </div>

              <button type="button" class="btn-primary w-full" @click="openProject(project)">إدارة العمولات والمكافآت</button>
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
import projectRewardService from '@/services/projectRewardService';

const router = useRouter();
const loading = ref(false);
const error = ref(false);
const searchText = ref('');
const projects = ref([]);
const statusByProjectId = ref({});

function normalizeSearch(value) {
  return String(value ?? '').trim().toLowerCase();
}

function projectLocation(project) {
  const city = project.city || project.city_name || project.cityName;
  const district = project.district || project.district_name || project.districtName;
  const location = project.location || [city, district].filter(Boolean).join(' / ');
  return location || '—';
}

const filteredProjects = computed(() => {
  const query = normalizeSearch(searchText.value);
  if (!query) return projects.value;

  return projects.value.filter(project => {
    const haystack = [
      project.name,
      project.project_name,
      project.title,
      project.contract_number,
      project.location,
      project.city,
      project.city_name,
      project.district,
      project.district_name,
      project.developer_name,
      project.developer,
      project.id,
    ]
      .map(normalizeSearch)
      .join(' ');

    return haystack.includes(query);
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
  return 'muted';
}

function calculationModeLabel(value) {
  if (value === 'manual_amount') return 'قيمة مكافأة يدوية';
  if (value === 'percentage_of_sale') return 'نسبة من قيمة البيع';
  return '—';
}

function sourceLabel(value) {
  if (value === 'company') return 'من الشركة';
  if (value === 'developer') return 'من المالك / المطور';
  return '—';
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('ar-SA').format(date);
}

async function loadProjects() {
  loading.value = true;
  error.value = false;

  try {
    const response = await marketingService.getProjects({ per_page: 200 });
    projects.value = response?.items ?? [];
  } catch (_) {
    error.value = true;
    projects.value = [];
  } finally {
    loading.value = false;
  }
}

async function preloadStatusesForVisible() {
  const visibleItems = filteredProjects.value.slice(0, 30);
  if (!visibleItems.length) return;

  for (const project of visibleItems) {
    if (!project?.id || statusByProjectId.value[project.id]) continue;
    statusByProjectId.value = {
      ...statusByProjectId.value,
      [project.id]: { status: 'loading' },
    };
  }

  const idsToFetch = visibleItems
    .map(project => project.id)
    .filter(id => id && statusByProjectId.value[id]?.status === 'loading');

  const concurrency = Math.min(6, idsToFetch.length);
  let cursor = 0;

  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= idsToFetch.length) break;

      const contractId = idsToFetch[index];
      try {
        const { items } = await projectRewardService.listSettings({ contract_id: contractId, per_page: 100 });
        const list = Array.isArray(items) ? items : [];
        const active = list.find(setting => setting?.is_active === true || setting?.is_active === 1 || setting?.is_active === '1') || null;
        const chosen = active || list[0] || null;

        statusByProjectId.value = {
          ...statusByProjectId.value,
          [contractId]: {
            status: active ? 'active' : list.length ? 'inactive' : 'none',
            source_label: sourceLabel(chosen?.source),
            calculation_mode_label: calculationModeLabel(chosen?.calculation_mode),
            updated_at_display: formatDate(chosen?.updated_at || chosen?.created_at),
          },
        };
      } catch (_) {
        statusByProjectId.value = {
          ...statusByProjectId.value,
          [contractId]: {
            status: 'none',
            source_label: '—',
            calculation_mode_label: '—',
            updated_at_display: '—',
          },
        };
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
}

function openProject(project) {
  router.push({
    name: 'AdminCommissionRewardsProject',
    params: { projectId: project.id },
  });
}

let statusTimer = null;

watch(
  filteredProjects,
  () => {
    if (statusTimer) clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      preloadStatusesForVisible();
    }, 150);
  },
  { immediate: true }
);

onMounted(async () => {
  await loadProjects();
  await preloadStatusesForVisible();
});

onUnmounted(() => {
  if (statusTimer) clearTimeout(statusTimer);
});
</script>

<style scoped src="./styles/AdminCommissionsRewardsPage.scoped.css"></style>
