<template>
  <div class="developer-project-units-view">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">وحدات المشروع</h1>
        <p class="welcome-subtitle">
          {{ projectName ? `الوحدات المباعة — ${projectName}` : 'الوحدات المباعة للمشروع' }}
        </p>
      </div>
      <button class="back-btn" @click="goBack">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {{ developerName ? `العودة لـ ${developerName}` : 'العودة للمطور' }}
      </button>
    </div>

    <div v-if="!projectId && !isLoadingUnits && !isLoadingClaimFiles" class="empty-state">
      <p>لم يتم تحديد المشروع. افتح الصفحة من تفاصيل المطور.</p>
      <router-link :to="developerDetailRoute" class="link-back">العودة لتفاصيل المطور</router-link>
    </div>

    <template v-else>
      <div class="toolbar">
        <div class="mode-toggle" role="tablist" aria-label="حالات ملفات المطالبة">
          <button
            type="button"
            class="mode-btn"
            :class="{ active: activeTab === 'claimed' }"
            @click="activeTab = 'claimed'"
          >
            الوحدات المطالب بها
          </button>
          <button
            type="button"
            class="mode-btn"
            :class="{ active: activeTab === 'unclaimed' }"
            @click="activeTab = 'unclaimed'"
          >
            الوحدات غير المطالب بها
          </button>
        </div>

        <div class="selection-summary" v-if="activeTab === 'unclaimed' && selectedIds.length > 0">
          <span class="badge">{{ selectedIds.length }}</span>
          وحدة محددة
        </div>

        <button
          v-if="activeTab === 'unclaimed'"
          type="button"
          class="btn-primary create-btn"
          :disabled="!canSubmit || isSubmitting"
          @click="handleSubmit"
        >
          <span v-if="!isSubmitting">إنشاء ملف مطالبة ({{ selectedIds.length }})</span>
          <span v-else>جاري الإنشاء...</span>
        </button>
      </div>

      <div class="form-group" v-if="activeTab === 'unclaimed' && selectedIds.length >= 1">
        <label class="form-label">ملاحظات (اختياري)</label>
        <textarea
          v-model="notes"
          class="form-textarea"
          placeholder="ملاحظات إضافية..."
          rows="2"
          maxlength="1000"
        ></textarea>
      </div>

      <section class="units-section">
        <h2 class="section-title">{{ activeTab === 'claimed' ? 'الوحدات المطالب بها' : 'الوحدات غير المطالب بها' }}</h2>

        <div v-if="isLoadingUnits || isLoadingClaimFiles" class="loading-state">
          <span class="spinner"></span>
          <p v-if="isLoadingUnits">جاري تحميل الوحدات...</p>
          <p v-else>جاري تحميل ملفات المطالبة...</p>
        </div>

        <div v-else-if="activeTab === 'unclaimed' && filteredUnclaimedUnits.length === 0" class="empty-state">
          <p>{{ searchTerm ? 'لا توجد نتائج مطابقة' : 'لا توجد وحدات غير مطالب بها لهذا المشروع.' }}</p>
        </div>

        <div v-else-if="activeTab === 'claimed' && claimFilesForProject.length === 0" class="empty-state">
          <p>لا توجد ملفات مطالبة حالياً لهذا المشروع.</p>
        </div>

        <div v-else class="table-wrapper table-responsive">
          <div class="search-box-mini">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="بحث برقم الحجز أو الوحدة..."
              class="search-input-mini"
            />
          </div>

          <table v-if="activeTab === 'unclaimed'" class="metrics-table">
            <thead>
              <tr>
                <th class="th-checkbox">
                  <input
                    type="checkbox"
                    :checked="allVisibleSelected"
                    :indeterminate="someVisibleSelected && !allVisibleSelected"
                    @change="toggleSelectAll"
                  />
                </th>
                <th>رقم الحجز</th>
                <th>الوحدة</th>
                <th>مبلغ المطالبة</th>
                <th>تحميل</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in filteredUnclaimedUnits"
                :key="row.reservation_id"
                :class="{ 'row-selected': isSelected(row) }"
                @click="toggleCandidate(row)"
              >
                <td class="td-checkbox">
                  <input
                    type="checkbox"
                    :checked="isSelected(row)"
                    @click.stop
                    @change="toggleCandidate(row)"
                  />
                </td>
                <td>{{ row.reservation_id || row.booking_id || row.id }}</td>
                <td>{{ row.unit_number || row.unit_name || '—' }}</td>
                <td>{{ formatCurrency(row.claim_amount || row.amount || 0) }}</td>
                <td>
                  <button
                    type="button"
                    class="btn-download-mini"
                    :disabled="isDownloading === row.reservation_id"
                    @click.stop="openDownload(row)"
                  >
                    {{ isDownloading === row.reservation_id ? 'جاري...' : 'تحميل' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <table v-else class="metrics-table">
            <thead>
              <tr>
                <th>رقم الملف</th>
                <th>الوحدات</th>
                <th>الحالة</th>
                <th>تم استلام العمولة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="claim in claimFilesForProject" :key="claim.id">
                <td>#{{ claim.id }}</td>
                <td>{{ formatClaimUnits(claim) }}</td>
                <td>
                  <span class="status-tag" :class="claim.status === 'completed' ? 'good' : ''">
                    {{ claim.status === 'completed' ? 'مكتمل' : 'قيد الانتظار' }}
                  </span>
                </td>
                <td>
                  <label class="claim-received-label">
                    <input
                      type="checkbox"
                      :checked="claim.status === 'completed'"
                      :disabled="claim.status === 'completed' || updatingClaimId === claim.id"
                      @change="markCommissionReceived(claim)"
                    />
                    <span>{{ updatingClaimId === claim.id ? 'جاري التحديث...' : 'تم استلام العمولة' }}</span>
                  </label>
                </td>
                <td>
                  <button
                    type="button"
                    class="btn-download-mini"
                    :disabled="sendingClaimId === claim.id"
                    @click="sendClaimFileToDeveloper(claim.id)"
                  >
                    {{ sendingClaimId === claim.id ? 'جاري الإرسال...' : 'إرسال ملف المطالبة للمطور' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import accountingService from '@/services/accountingService';
import contractService from '@/services/contractService';
import { normalizeDeveloper } from '@/utils/developerMapper';
import { useFormatters } from '@/composables/useFormatters';
import { toast } from '@/composables/useToast';
import { showApiError } from '@/utils/errorHandler';
import logger from '@/utils/logger';

export default {
  name: 'DeveloperProjectUnitsView',
  setup() {
    const router = useRouter();
    const route = useRoute();

    const developer = ref(null);
    const project = ref(null);
    const projectName = ref('');
    const developerName = ref('');

    const soldUnits = ref([]);
    const claimFiles = ref([]);

    const isLoadingUnits = ref(false);
    const isLoadingClaimFiles = ref(false);
    const updatingClaimId = ref(null);
    const sendingClaimId = ref(null);

    const isDownloading = ref(null);
    const selectedIds = ref([]);
    const notes = ref('');
    const searchTerm = ref('');
    const isSubmitting = ref(false);
    const activeTab = ref('unclaimed');

    const { formatCurrency } = useFormatters();

    const projectId = computed(() => route.params.projectId || '');
    const developerId = computed(() => route.params.id || '');

    const developerDetailRoute = computed(() =>
      developerId.value ? { name: 'DeveloperDetail', params: { id: developerId.value } } : { name: 'Developers' }
    );

    const soldUnitsForProject = computed(() => {
      const pid = String(projectId.value || '').trim();
      const list = Array.isArray(soldUnits.value) ? soldUnits.value : [];
      if (!pid) return list;
      return list.filter(u => {
        const unitPid = u.contract_id ?? u.project_id;
        if (unitPid == null || unitPid === '') return true;
        return String(unitPid) === pid;
      });
    });

    const reservationIdToUnit = computed(() => {
      const map = new Map();
      soldUnitsForProject.value.forEach(u => {
        map.set(String(u.reservation_id), u);
      });
      return map;
    });

    const unclaimedUnits = computed(() =>
      soldUnitsForProject.value.filter(u => !u.has_claim_file && !u.claim_file_id)
    );

    const claimFilesForProject = computed(() => {
      const pid = String(projectId.value || '').trim();
      const soldIds = new Set(soldUnitsForProject.value.map(u => String(u.reservation_id)));
      const list = Array.isArray(claimFiles.value) ? claimFiles.value : [];

      return list.filter(claim => {
        if (pid && claim?.contract_id != null && claim.contract_id !== '') {
          return String(claim.contract_id) === pid;
        }
        const ids = Array.isArray(claim?.reservation_ids) ? claim.reservation_ids : [];
        return ids.some(id => soldIds.has(String(id)));
      });
    });

    const filteredUnclaimedUnits = computed(() => {
      const list = unclaimedUnits.value;
      const q = searchTerm.value.trim().toLowerCase();
      if (!q) return list;
      return list.filter(u => {
        const unit = String(u.unit_number || u.unit_name || '').toLowerCase();
        const reservation = String(u.reservation_id || '');
        return unit.includes(q) || reservation.includes(q);
      });
    });

    const selectableUnits = computed(() => filteredUnclaimedUnits.value);

    const allVisibleSelected = computed(() => {
      if (selectableUnits.value.length === 0) return false;
      return selectableUnits.value.every(u => selectedIds.value.includes(u.reservation_id));
    });

    const someVisibleSelected = computed(() =>
      selectableUnits.value.some(u => selectedIds.value.includes(u.reservation_id))
    );

    const canSubmit = computed(() => selectedIds.value.length > 0);

    function isSelected(unit) {
      return selectedIds.value.includes(unit.reservation_id);
    }

    function toggleCandidate(unit) {
      const id = unit.reservation_id;
      const idx = selectedIds.value.indexOf(id);
      if (idx >= 0) selectedIds.value.splice(idx, 1);
      else selectedIds.value.push(id);
    }

    function toggleSelectAll() {
      if (allVisibleSelected.value) {
        const visibleIds = new Set(selectableUnits.value.map(u => u.reservation_id));
        selectedIds.value = selectedIds.value.filter(id => !visibleIds.has(id));
      } else {
        const current = new Set(selectedIds.value);
        selectableUnits.value.forEach(u => current.add(u.reservation_id));
        selectedIds.value = [...current];
      }
    }

    async function loadSoldUnits() {
      isLoadingUnits.value = true;
      try {
        const pid = projectId.value;
        const params = {};
        if (pid) params.contract_id = pid;
        const units = await accountingService.getClaimFileSoldUnits(params);
        soldUnits.value = Array.isArray(units) ? units : [];
      } catch (error) {
        logger.error('Error loading sold units', error);
        soldUnits.value = [];
        showApiError(error, 'حدث خطأ أثناء تحميل الوحدات المباعة');
      } finally {
        isLoadingUnits.value = false;
      }
    }

    async function loadClaimFiles() {
      isLoadingClaimFiles.value = true;
      try {
        const pid = projectId.value;
        const params = {};
        if (pid) {
          params.contract_id = pid;
          params.project_id = pid;
        }
        const res = await accountingService.getClaimFiles(params);
        claimFiles.value = Array.isArray(res?.items) ? res.items : [];
      } catch (error) {
        logger.error('Error loading claim files', error);
        claimFiles.value = [];
        showApiError(error, 'حدث خطأ أثناء تحميل ملفات المطالبة');
      } finally {
        isLoadingClaimFiles.value = false;
      }
    }

    async function refreshAll() {
      await Promise.all([loadSoldUnits(), loadClaimFiles()]);
    }

    async function openDownload(row) {
      const rid = row.reservation_id;
      if (!rid) return;
      isDownloading.value = rid;
      try {
        await accountingService.openClaimFileDownload(rid);
      } catch (error) {
        showApiError(error, 'فشل تحميل ملف المطالبة');
      } finally {
        isDownloading.value = null;
      }
    }

    async function handleSubmit() {
      if (!canSubmit.value) return;
      isSubmitting.value = true;
      try {
        const result = await accountingService.createCombinedClaimFile({
          booking_ids: [...selectedIds.value],
          claim_type: 'commission',
          notes: notes.value.trim() || undefined,
          contract_id: projectId.value || undefined,
        });

        const fileId = result?.id ?? '';
        toast.success(fileId ? `تم إنشاء ملف المطالبة رقم ${fileId}` : 'تم إنشاء ملف المطالبة بنجاح');
        selectedIds.value = [];
        notes.value = '';
        activeTab.value = 'claimed';
        await refreshAll();
      } catch (error) {
        logger.error('Error creating claim file', error);
        showApiError(error, 'حدث خطأ أثناء إنشاء ملف المطالبة');
      } finally {
        isSubmitting.value = false;
      }
    }

    async function markCommissionReceived(claim) {
      if (!claim?.id || claim.status === 'completed') return;
      updatingClaimId.value = claim.id;
      try {
        await accountingService.updateClaimFileStatus(claim.id, 'completed');
        toast.success('تم تحديث حالة ملف المطالبة بنجاح');
        await loadClaimFiles();
      } catch (error) {
        logger.error('Error updating claim file status', error);
        showApiError(error, 'حدث خطأ أثناء تحديث حالة ملف المطالبة');
      } finally {
        updatingClaimId.value = null;
      }
    }

    async function sendClaimFileToDeveloper(claimFileId) {
      if (!claimFileId) return;
      sendingClaimId.value = claimFileId;
      try {
        await accountingService.generateClaimFilePdf(claimFileId);
        toast.success('تم إرسال ملف المطالبة للمطور بنجاح');
      } catch (error) {
        logger.error('Error sending claim file to developer', error);
        showApiError(error, 'حدث خطأ أثناء إرسال ملف المطالبة للمطور');
      } finally {
        sendingClaimId.value = null;
      }
    }

    function formatClaimUnits(claim) {
      const ids = Array.isArray(claim?.reservation_ids) ? claim.reservation_ids : [];
      if (!ids.length) return '—';
      return ids
        .map(id => {
          const row = reservationIdToUnit.value.get(String(id));
          return row?.unit_number || `حجز ${id}`;
        })
        .join('، ');
    }

    const goBack = () => {
      if (developerId.value) {
        router.push({ name: 'DeveloperDetail', params: { id: developerId.value } });
      } else {
        router.push({ name: 'Developers' });
      }
    };

    function initFromState() {
      const state = window.history.state;
      if (state?.developer) {
        developer.value = state.developer;
        developerName.value = state.developer?.name || '';
      }
      if (state?.project) {
        project.value = state.project;
        projectName.value =
          state.project?.project_name || state.project?.name || state.project?.title || 'المشروع';
      }
    }

    async function loadDeveloperAndProject() {
      const devId = developerId.value;
      const projId = projectId.value;
      if (!devId || !projId) return;
      try {
        let raw;
        if (devId.includes('@')) {
          const emailRes = await contractService.getDeveloperContractsByEmail(devId);
          if (emailRes?.developer) {
            raw = emailRes.developer;
          } else if (Array.isArray(emailRes) && emailRes.length > 0 && emailRes[0].developer) {
            raw = emailRes[0].developer;
          } else {
            raw = await contractService.getDeveloperDetail(devId);
          }
        } else {
          raw = await contractService.getDeveloperDetail(devId);
        }

        if (raw && typeof raw === 'object') {
          developer.value = normalizeDeveloper(raw);
          developerName.value = developer.value?.name || '';
          const list = Array.isArray(raw.projects) ? raw.projects : [];
          const found =
            list.find(p => String(p.contract_id ?? p.id) === String(projId)) ||
            list.find(p => String(p.id) === String(projId));
          if (found) {
            project.value = found;
            projectName.value = found.project_name || found.name || found.title || 'المشروع';
          } else {
            projectName.value = 'المشروع';
          }
        }
      } catch (e) {
        logger.error('Failed to load developer/project for units view', e);
        if (!projectName.value) projectName.value = 'مشروع رقم ' + projId;
      }
    }

    onMounted(async () => {
      initFromState();
      if (!project.value && developerId.value && projectId.value) {
        await loadDeveloperAndProject();
      }
      if (project.value && !projectName.value) {
        projectName.value =
          project.value?.project_name || project.value?.name || project.value?.title || 'المشروع';
      }
      await refreshAll();
    });

    watch(
      () => [route.params.projectId, route.params.id],
      ([newPid]) => {
        initFromState();
        if (newPid) {
          if (!projectName.value) loadDeveloperAndProject();
          refreshAll();
        }
      },
      { immediate: false }
    );

    return {
      developerName,
      projectName,
      developerDetailRoute,
      projectId,
      activeTab,
      selectedIds,
      notes,
      searchTerm,
      isSubmitting,
      isLoadingUnits,
      isLoadingClaimFiles,
      isDownloading,
      updatingClaimId,
      sendingClaimId,
      filteredUnclaimedUnits,
      claimFilesForProject,
      allVisibleSelected,
      someVisibleSelected,
      canSubmit,
      formatCurrency,
      isSelected,
      toggleCandidate,
      toggleSelectAll,
      openDownload,
      handleSubmit,
      markCommissionReceived,
      sendClaimFileToDeveloper,
      formatClaimUnits,
      goBack,
    };
  },
};
</script>

<style scoped src="./styles/DeveloperProjectUnitsView.scoped.s1.css"></style>
