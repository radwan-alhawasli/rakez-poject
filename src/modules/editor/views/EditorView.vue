<template>
  <div class="editor-view">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">قسم المحرر</h1>
        <p class="welcome-subtitle">إدارة العقود والتصوير والمونتاج واللوحات للمشاريع.</p>
      </div>
    </div>

    <nav class="editor-tabs" aria-label="أقسام المحرر">
      <router-link
        v-for="tab in editorTabs"
        :key="tab.id"
        :to="{ name: tab.name }"
        class="editor-tab"
        :class="{ active: activeTab === tab.id }"
      >
        {{ tab.label }}
      </router-link>
    </nav>

    <div class="tab-content custom-scrollbar">
      <EditorContractsSection
        v-if="activeTab === 'contracts'"
        :contracts="contracts"
        :is-loading="isLoading"
        :selected-contract-id="selectedContractId"
      />

      <EditorSecondPartySection
        v-else-if="activeTab === 'second-party'"
        :selected-contract-id="selectedContractId"
        :second-party-data="secondPartyData"
        :is-loading="isLoadingSecondParty"
      />

      <EditorUnitsSection
        v-else-if="activeTab === 'units'"
        :selected-contract-id="selectedContractId"
        :contract-units="contractUnits"
        :is-loading="isLoadingUnits"
      />

      <!-- 4. Developers -->
      <div v-else-if="activeTab === 'developers'" class="management-view">
        <div class="section-header-compact">
          <div>
            <h2 class="section-title">المطورون</h2>
            <p class="section-subtitle">قائمة المطورين وتفاصيلهم.</p>
          </div>
        </div>
        <div class="metrics-table-container table-responsive">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>رقم المطور</th>
                <th>الاسم</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dev in developers" :key="dev.developer_number || dev.id">
                <td>{{ dev.developer_number || dev.id }}</td>
                <td>{{ dev.name || dev.developer_name || '—' }}</td>
                <td>
                  <router-link :to="{ name: 'EditorDeveloperDetail', params: { developerNumber: String(dev.developer_number || dev.id) } }" class="btn-action edit">
                    عرض
                  </router-link>
                </td>
              </tr>
              <tr v-if="developers.length === 0 && !isLoadingDevs">
                <td colspan="3" style="text-align: center; padding: 40px; color: var(--color-dark-gray)">
                  لا يوجد مطورون
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 5. Montage -->
      <div v-else-if="activeTab === 'montage'" class="management-view">
        <div class="section-header-compact">
          <div>
            <h2 class="section-title">قسم المونتاج</h2>
            <p class="section-subtitle">عرض وإدارة بيانات المونتاج.</p>
          </div>
        </div>
        <div v-if="!selectedContractId" class="empty-state">
          <p>اختر عقداً من العقود لإدارة بيانات المونتاج.</p>
        </div>
        <div v-else-if="isLoadingMontage" class="empty-state">
          <p>جاري التحميل...</p>
        </div>
        <div v-else-if="montageData && Object.keys(montageData).length > 0" class="metrics-table-container table-responsive">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>الحقل</th>
                <th>القيمة</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(value, key) in montageData" :key="key">
                <td>{{ key }}</td>
                <td>{{ value !== null && value !== undefined ? value : '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-state">
          <p>لا توجد بيانات مونتاج لهذا العقد.</p>
        </div>
      </div>

      <EditorPhotographySection
        v-else-if="activeTab === 'photography'"
        :selected-contract-id="selectedContractId"
        :photography-data="photographyData"
        :is-loading="isLoadingPhotography"
      />

      <EditorBoardsSection
        v-else-if="activeTab === 'boards'"
        :selected-contract-id="selectedContractId"
        :boards-data="boardsData"
        :is-loading="isLoadingBoards"
      />

      <!-- 8. Media -->
      <div v-else-if="activeTab === 'media'" class="management-view">
        <div class="section-header-compact">
          <div>
            <h2 class="section-title">الموافقة على الصور</h2>
            <p class="section-subtitle">مراجعة واعتماد الصور المرفوعة.</p>
          </div>
        </div>
        <div class="empty-state">
          <p>استخدم الموافقة على الصور من القائمة الرئيسية.</p>
        </div>
      </div>
    </div>

    <!-- Modal: تفاصيل العقد -->
    <EditorContractDetailSection
      v-if="showContractModal"
      :contract-id="selectedContractId"
      :selected-contract="selectedContract"
      :contract-detail-rows="contractDetailRows"
      :is-loading="isLoadingContractDetail"
      @close="closeContractModal"
    />

    <!-- Modal: تفاصيل المطور -->
    <div v-if="showDeveloperModal" class="editor-modal-overlay" @click.self="closeDeveloperModal">
      <div class="editor-modal" role="dialog" aria-labelledby="developer-modal-title">
        <div class="editor-modal-header">
          <h2 id="developer-modal-title" class="editor-modal-title">تفاصيل المطور</h2>
          <button type="button" class="editor-modal-close" @click="closeDeveloperModal" aria-label="إغلاق">&times;</button>
        </div>
        <div class="editor-modal-body">
          <div v-if="selectedDeveloper && developerDetailRows.length > 0" class="metrics-table-container table-responsive">
            <table class="metrics-table">
              <thead>
                <tr>
                  <th>الحقل</th>
                  <th>القيمة</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in developerDetailRows" :key="row.key">
                  <td class="detail-key-cell">{{ row.label }}</td>
                  <td class="detail-value-cell">
                    <template v-if="row.type === 'scalar'">{{ row.value }}</template>
                    <template v-else-if="row.type === 'array'">
                      <div v-if="!row.data || row.data.length === 0">—</div>
                      <div v-else class="nested-array">
                        <table class="metrics-table nested-table">
                          <thead>
                            <tr>
                              <th v-for="col in row.columns" :key="col">{{ formatDetailKey(col) }}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(item, idx) in row.data" :key="idx">
                              <td v-for="col in row.columns" :key="col">{{ formatNestedValue(item[col], col) }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </template>
                    <template v-else-if="row.type === 'object'">
                      <div v-if="!row.data || Object.keys(row.data).length === 0">—</div>
                      <table v-else class="metrics-table nested-table">
                        <tbody>
                          <tr v-for="(v, k) in row.data" :key="k">
                            <td class="nested-key">{{ formatDetailKey(k) }}</td>
                            <td>{{ formatNestedValue(v, k) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import editorService from '@/services/editorService';
import logger from '@/utils/logger';
import EditorContractsSection from '@/modules/editor/components/EditorContractsSection.vue';
import EditorContractDetailSection from '@/modules/editor/components/EditorContractDetailSection.vue';
import EditorSecondPartySection from '@/modules/editor/components/EditorSecondPartySection.vue';
import EditorUnitsSection from '@/modules/editor/components/EditorUnitsSection.vue';
import EditorPhotographySection from '@/modules/editor/components/EditorPhotographySection.vue';
import EditorBoardsSection from '@/modules/editor/components/EditorBoardsSection.vue';

const EDITOR_TABS = [
  { id: 'contracts', name: 'EditorContracts', label: 'عقود' },
  { id: 'second-party', name: 'EditorSecondParty', label: 'الطرف الثاني' },
  { id: 'units', name: 'EditorUnits', label: 'الوحدات' },
  { id: 'developers', name: 'EditorDevelopers', label: 'المطورون' },
  { id: 'montage', name: 'EditorMontage', label: 'المونتاج' },
  { id: 'photography', name: 'EditorPhotography', label: 'التصوير' },
  { id: 'boards', name: 'EditorBoards', label: 'اللوحات' },
  { id: 'media', name: 'EditorMedia', label: 'الإعلام' },
];

export default {
  name: 'EditorView',
  components: {
    EditorContractsSection,
    EditorContractDetailSection,
    EditorSecondPartySection,
    EditorUnitsSection,
    EditorPhotographySection,
    EditorBoardsSection,
  },
  setup() {
    const route = useRoute();

    const isLoading = ref(false);
    const isLoadingDevs = ref(false);
    const isLoadingContractDetail = ref(false);
    const isLoadingSecondParty = ref(false);
    const isLoadingUnits = ref(false);
    const isLoadingMontage = ref(false);
    const isLoadingPhotography = ref(false);
    const isLoadingBoards = ref(false);

    const activeTab = computed(() => {
      const name = route.name;
      if (name === 'EditorContractDetail') return 'contracts';
      if (name === 'EditorDeveloperDetail') return 'developers';
      const t = EDITOR_TABS.find(tab => tab.name === name);
      return t ? t.id : 'contracts';
    });

    const editorTabs = EDITOR_TABS;
    const contracts = ref([]);
    const developers = ref([]);
    const selectedContractId = ref(null);
    const selectedContract = ref({});
    const selectedDeveloper = ref({});
    const secondPartyData = ref({});
    const contractUnits = ref([]);
    const montageData = ref({});
    const photographyData = ref({});
    const boardsData = ref({});

    const loadContracts = async () => {
      isLoading.value = true;
      try {
        const data = await editorService.getContracts();
        contracts.value = Array.isArray(data) ? data : [];
      } catch (error) {
        logger.error('Error loading editor contracts:', error);
        contracts.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const loadDevelopers = async () => {
      isLoadingDevs.value = true;
      try {
        const data = await editorService.getDevelopers();
        developers.value = Array.isArray(data) ? data : [];
      } catch (error) {
        logger.error('Error loading editor developers:', error);
        developers.value = [];
      } finally {
        isLoadingDevs.value = false;
      }
    };

    const loadSecondParty = async () => {
      if (!selectedContractId.value) return;
      isLoadingSecondParty.value = true;
      try {
        secondPartyData.value = await editorService.getSecondPartyData(selectedContractId.value);
      } catch (error) {
        logger.error('Error loading second party data:', error);
        secondPartyData.value = {};
      } finally {
        isLoadingSecondParty.value = false;
      }
    };

    const loadUnits = async () => {
      if (!selectedContractId.value) return;
      isLoadingUnits.value = true;
      try {
        const data = await editorService.getContractUnits(selectedContractId.value);
        contractUnits.value = Array.isArray(data) ? data : [];
      } catch (error) {
        logger.error('Error loading contract units:', error);
        contractUnits.value = [];
      } finally {
        isLoadingUnits.value = false;
      }
    };

    const loadMontage = async () => {
      if (!selectedContractId.value) return;
      isLoadingMontage.value = true;
      try {
        montageData.value = await editorService.getMontage(selectedContractId.value);
      } catch (error) {
        logger.error('Error loading montage data:', error);
        montageData.value = {};
      } finally {
        isLoadingMontage.value = false;
      }
    };

    const loadPhotography = async () => {
      if (!selectedContractId.value) return;
      isLoadingPhotography.value = true;
      try {
        photographyData.value = await editorService.getPhotography(selectedContractId.value);
      } catch (error) {
        logger.error('Error loading photography data:', error);
        photographyData.value = {};
      } finally {
        isLoadingPhotography.value = false;
      }
    };

    const loadBoards = async () => {
      if (!selectedContractId.value) return;
      isLoadingBoards.value = true;
      try {
        boardsData.value = await editorService.getBoards(selectedContractId.value);
      } catch (error) {
        logger.error('Error loading boards data:', error);
        boardsData.value = {};
      } finally {
        isLoadingBoards.value = false;
      }
    };

    const showContractModal = ref(false);
    const showDeveloperModal = ref(false);

    function normalizeContractPayload(raw) {
      if (!raw || typeof raw !== 'object') return {};
      if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) return raw.data;
      if (raw.contract && typeof raw.contract === 'object') return raw.contract;
      return raw;
    }

    const CONTRACT_FIELD_LABELS = {
      id: 'رقم العقد',
      contract_id: 'رقم العقد',
      contract_name: 'اسم العقد',
      project_name: 'اسم المشروع',
      project_id: 'رقم المشروع',
      status: 'الحالة',
      type: 'النوع',
      developer_id: 'رقم المطور',
      developer_name: 'اسم المطور',
      developer_number: 'رقم المطور',
      location: 'الموقع',
      city: 'المدينة',
      district: 'الحي',
      address: 'العنوان',
      area: 'المساحة',
      area_m2: 'المساحة (م²)',
      floor: 'الدور',
      price: 'السعر',
      total_price: 'السعر الإجمالي',
      unit_number: 'رقم الوحدة',
      unit_type: 'نوع الوحدة',
      unit_id: 'رقم الوحدة',
      units: 'الوحدات',
      notes: 'ملاحظات',
      description: 'الوصف',
      team_id: 'رقم الفريق',
      team_name: 'اسم الفريق',
      assigned_team: 'الفريق المعين',
      start_date: 'تاريخ البدء',
      end_date: 'تاريخ الانتهاء',
      expiry_date: 'تاريخ الانتهاء',
      contract_date: 'تاريخ العقد',
      created_at: 'تاريخ الإنشاء',
      updated_at: 'تاريخ التحديث',
      deleted_at: 'تاريخ الحذف',
      created_by: 'أنشئ بواسطة',
      updated_by: 'حُدِّث بواسطة',
      approved_by: 'اعتمد بواسطة',
      approved_at: 'تاريخ الاعتماد',
      second_party: 'الطرف الثاني',
      second_party_name: 'اسم الطرف الثاني',
      second_party_email: 'بريد الطرف الثاني',
      second_party_phone: 'هاتف الطرف الثاني',
      photography_status: 'حالة التصوير',
      boards_status: 'حالة اللوحات',
      montage_status: 'حالة المونتاج',
      rejection_reason: 'سبب الرفض',
      is_approved: 'معتمد',
      is_active: 'نشط',
    };

    const CONTRACT_STATUS_LABELS = {
      active: 'نشط',
      Active: 'نشط',
      pending: 'قيد الانتظار',
      Pending: 'قيد الانتظار',
      approved: 'معتمد',
      Approved: 'معتمد',
      rejected: 'مرفوض',
      Rejected: 'مرفوض',
      cancelled: 'ملغى',
      Cancelled: 'ملغى',
      completed: 'مكتمل',
      Completed: 'مكتمل',
      draft: 'مسودة',
      Draft: 'مسودة',
      in_progress: 'قيد التنفيذ',
      'In Progress': 'قيد التنفيذ',
      expired: 'منتهي',
      Expired: 'منتهي',
      suspended: 'موقوف',
      Suspended: 'موقوف',
    };

    const DEVELOPER_FIELD_LABELS = {
      id: 'المعرف',
      developer_number: 'رقم المطور',
      name: 'الاسم',
      developer_name: 'اسم المطور',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      mobile: 'رقم الجوال',
      address: 'العنوان',
      city: 'المدينة',
      country: 'الدولة',
      website: 'الموقع الإلكتروني',
      description: 'الوصف',
      notes: 'ملاحظات',
      status: 'الحالة',
      is_active: 'نشط',
      contracts_count: 'عدد العقود',
      created_at: 'تاريخ الإنشاء',
      updated_at: 'تاريخ التحديث',
    };

    function formatDisplayDate(val) {
      if (val === null || val === undefined) return '—';
      const s = String(val).trim();
      if (!s) return '—';
      const date = new Date(s);
      if (Number.isNaN(date.getTime())) return s;
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    function formatDetailValueForRow(value) {
      if (value === null || value === undefined) return '—';
      if (typeof value === 'boolean') return value ? 'نعم' : 'لا';
      if (Array.isArray(value)) return value.length ? `${value.length} عنصر` : '—';
      if (typeof value === 'object') return '—';
      const str = String(value);
      if (CONTRACT_STATUS_LABELS[str]) return CONTRACT_STATUS_LABELS[str];
      const date = new Date(str);
      if (str.length >= 10 && !Number.isNaN(date.getTime())) return formatDisplayDate(str);
      return str;
    }

    function formatNestedValue(value) {
      if (value === null || value === undefined) return '—';
      if (typeof value === 'boolean') return value ? 'نعم' : 'لا';
      if (Array.isArray(value)) return value.length ? `${value.length} عنصر` : '—';
      if (typeof value === 'object') return JSON.stringify(value, null, 2);
      const str = String(value);
      if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
        const date = new Date(str);
        if (!Number.isNaN(date.getTime())) return formatDisplayDate(str);
      }
      return str;
    }

    function getAllKeysFromItems(items) {
      if (!Array.isArray(items) || items.length === 0) return [];
      const set = new Set();
      items.forEach(item => {
        if (item && typeof item === 'object') Object.keys(item).forEach(k => set.add(k));
      });
      return Array.from(set);
    }

    const contractDetailRows = computed(() => {
      const c = selectedContract.value;
      if (!c || typeof c !== 'object') return [];
      if (Array.isArray(c)) {
        return [{
          key: 'units',
          label: 'الوحدات',
          type: 'array',
          data: c,
          columns: getAllKeysFromItems(c),
        }];
      }
      return Object.entries(c).map(([key, val]) => {
        const label = CONTRACT_FIELD_LABELS[key] || key;
        if (val === null || val === undefined || typeof val !== 'object') {
          return { key, label, type: 'scalar', value: formatDetailValueForRow(val) };
        }
        if (Array.isArray(val)) {
          return {
            key,
            label,
            type: 'array',
            data: val,
            columns: getAllKeysFromItems(val),
          };
        }
        return { key, label, type: 'object', data: val };
      });
    });

    const developerDetailRows = computed(() => {
      const d = selectedDeveloper.value;
      if (!d || typeof d !== 'object') return [];
      return Object.entries(d).map(([key, val]) => {
        const label = DEVELOPER_FIELD_LABELS[key] || key;
        if (val === null || val === undefined || typeof val !== 'object') {
          return { key, label, type: 'scalar', value: formatDetailValueForRow(val) };
        }
        if (Array.isArray(val)) {
          return {
            key,
            label,
            type: 'array',
            data: val,
            columns: getAllKeysFromItems(val),
          };
        }
        return { key, label, type: 'object', data: val };
      });
    });

    function formatDetailKey(key) {
      return CONTRACT_FIELD_LABELS[key] || DEVELOPER_FIELD_LABELS[key] || key;
    }

    function translateStatus(val) {
      return CONTRACT_STATUS_LABELS[val] || val || 'قيد المعالجة';
    }

    function formatDetailValue(value) {
      return formatDetailValueForRow(value);
    }

    const viewContract = async (contract) => {
      const id = contract?.id;
      if (id == null) return;
      selectedContractId.value = id;
      selectedContract.value = {};
      showContractModal.value = true;
      isLoadingContractDetail.value = true;
      try {
        const raw = await editorService.getContractById(id);
        selectedContract.value = normalizeContractPayload(raw);
      } catch (error) {
        logger.error('Error loading contract detail:', error);
      } finally {
        isLoadingContractDetail.value = false;
      }
    };

    const closeContractModal = () => {
      showContractModal.value = false;
      selectedContractId.value = null;
      selectedContract.value = {};
    };

    const closeDeveloperModal = () => {
      showDeveloperModal.value = false;
      selectedDeveloper.value = {};
    };

    const viewDeveloper = async (dev) => {
      selectedDeveloper.value = {};
      showDeveloperModal.value = true;
      try {
        selectedDeveloper.value = await editorService.getDeveloperByNumber(dev.developer_number || dev.id);
      } catch (error) {
        logger.error('Error loading developer detail:', error);
      }
    };

    watch(
      activeTab,
      newTab => {
        if (newTab === 'contracts') loadContracts();
        if (newTab === 'developers') loadDevelopers();
        if (newTab === 'second-party') loadSecondParty();
        if (newTab === 'units') loadUnits();
        if (newTab === 'montage') loadMontage();
        if (newTab === 'photography') loadPhotography();
        if (newTab === 'boards') loadBoards();
      },
      { immediate: true }
    );

    watch(selectedContractId, () => {
      const tab = activeTab.value;
      if (tab === 'second-party') loadSecondParty();
      if (tab === 'units') loadUnits();
      if (tab === 'montage') loadMontage();
      if (tab === 'photography') loadPhotography();
      if (tab === 'boards') loadBoards();
    });

    return {
      activeTab,
      editorTabs,
      isLoading,
      isLoadingDevs,
      isLoadingContractDetail,
      isLoadingSecondParty,
      isLoadingUnits,
      isLoadingMontage,
      isLoadingPhotography,
      isLoadingBoards,
      contracts,
      developers,
      selectedContractId,
      selectedContract,
      selectedDeveloper,
      secondPartyData,
      contractUnits,
      montageData,
      photographyData,
      boardsData,
      showContractModal,
      showDeveloperModal,
      contractDetailRows,
      developerDetailRows,
      formatDisplayDate,
      formatDetailKey,
      formatDetailValue,
      formatNestedValue,
      translateStatus,
      viewContract,
      viewDeveloper,
      closeContractModal,
      closeDeveloperModal,
    };
  },
};
</script>

<style scoped>
.editor-view {
  padding: 24px;
  width: 100%;
  max-width: none;
  box-sizing: border-box;
}

.editor-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-medium-gray);
}
.editor-tab {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-dark-gray);
  text-decoration: none;
  background: var(--color-light-gray);
  transition: background 0.15s, color 0.15s;
}
.editor-tab:hover {
  background: var(--color-medium-gray);
  color: var(--color-navy);
}
.editor-tab.active {
  background: var(--color-navy);
  color: white;
}

.section-header-compact {
  margin-bottom: 20px;
}
.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-navy);
  margin: 0 0 4px 0;
}
.section-subtitle {
  font-size: 14px;
  color: var(--color-dark-gray);
  margin: 0;
}
.metrics-table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 12px;
  border: 1px solid var(--color-medium-gray);
}
.metrics-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
}
.metrics-table th {
  text-align: right;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-dark-gray);
  background: var(--color-light-gray);
  border-bottom: 1px solid var(--color-medium-gray);
  white-space: nowrap;
}
.metrics-table td {
  padding: 12px 16px;
  font-size: 14px;
  border-bottom: 1px solid var(--color-light-gray);
  color: var(--color-charcoal);
}
.metrics-table tr:last-child td {
  border-bottom: none;
}
.status-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}
.status-tag.good {
  background: #ecfdf5;
  color: #059669;
}
.btn-action {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.btn-action.edit {
  background: var(--color-light-gray);
  color: var(--color-navy);
}
.btn-action.edit:hover {
  background: var(--color-medium-gray);
}
.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--color-dark-gray);
  background: white;
  border: 1px solid var(--color-medium-gray);
  border-radius: 12px;
}

/* Developer modal */
.editor-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}
.editor-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 560px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}
.editor-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-medium-gray);
}
.editor-modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-navy);
}
.editor-modal-close {
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: var(--color-dark-gray);
  cursor: pointer;
  padding: 0 4px;
}
.editor-modal-close:hover {
  color: var(--color-navy);
}
.editor-modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}
.editor-modal-loading {
  text-align: center;
  padding: 32px;
  color: var(--color-dark-gray);
}
.editor-modal-body .metrics-table-container {
  border: none;
  border-radius: 0;
}
.editor-modal-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--color-medium-gray);
}
.editor-modal-section-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-navy);
}

.detail-key-cell {
  vertical-align: top;
  white-space: nowrap;
  width: 1%;
}
.detail-value-cell {
  min-width: 0;
}
.nested-array,
.nested-table {
  margin-top: 8px;
}
.nested-table {
  font-size: 13px;
  border: 1px solid var(--color-medium-gray);
  border-radius: 8px;
  overflow: hidden;
}
.nested-table .nested-key {
  font-weight: 600;
  color: var(--color-dark-gray);
}
.detail-value-cell pre {
  margin: 0;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
}

/* Responsive: tablet landscape */
@media (max-width: 992px) {
  .editor-view {
    padding: 20px;
  }
  .page-title {
    font-size: 24px;
  }
}

/* Responsive: tablet portrait */
@media (max-width: 768px) {
  .editor-view {
    padding: 16px;
  }
  .page-header {
    margin-bottom: 20px;
  }
  .page-title {
    font-size: 22px;
  }
  .page-subtitle {
    font-size: 14px;
  }
  .metrics-table-container {
    margin-inline: -16px;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
  .metrics-table th,
  .metrics-table td {
    padding: 10px 12px;
    font-size: 13px;
  }
}

/* Responsive: mobile */
@media (max-width: 576px) {
  .editor-view {
    padding: 12px;
  }
  .page-title {
    font-size: 20px;
  }
  .page-subtitle {
    font-size: 13px;
  }
  .section-title {
    font-size: 17px;
  }
  .metrics-table th,
  .metrics-table td {
    padding: 10px;
    font-size: 12px;
  }
  .btn-action {
    padding: 8px 12px;
    min-height: 44px;
    font-size: 12px;
  }
  .empty-state {
    padding: 32px 12px;
  }
}

/* Responsive: extra small mobile */
@media (max-width: 320px) {
  .editor-view {
    padding: 8px;
    overflow-x: hidden;
  }
  .page-title {
    font-size: 18px;
  }
  .section-title {
    font-size: 15px;
  }
  .metrics-table th,
  .metrics-table td {
    padding: 8px 6px;
    font-size: 11px;
  }
  .status-tag {
    font-size: 10px;
    padding: 2px 6px;
  }
}

/* Responsive: large desktop */
@media (min-width: 1200px) {
  .editor-view {
    padding: 28px;
  }
  .page-title {
    font-size: 30px;
  }
  .metrics-table th,
  .metrics-table td {
    padding: 14px 20px;
  }
}

/* Responsive: full HD */
@media (min-width: 1920px) {
  .editor-view {
    padding: 32px;
  }
  .page-title {
    font-size: 32px;
  }
  .page-subtitle {
    font-size: 16px;
  }
  .section-title {
    font-size: 22px;
  }
  .metrics-table th {
    padding: 14px 24px;
    font-size: 14px;
  }
  .metrics-table td {
    padding: 14px 24px;
    font-size: 15px;
  }
  .btn-action {
    padding: 8px 18px;
    font-size: 14px;
  }
  .empty-state {
    padding: 56px 28px;
    font-size: 16px;
  }
}

/* Responsive: 2K ultra-wide */
@media (min-width: 2560px) {
  .editor-view {
    padding: 40px;
  }
  .page-title {
    font-size: 36px;
  }
  .page-subtitle {
    font-size: 18px;
  }
  .section-title {
    font-size: 24px;
  }
  .section-subtitle {
    font-size: 16px;
  }
  .metrics-table-container {
    border-radius: 16px;
  }
  .metrics-table th {
    padding: 16px 28px;
    font-size: 15px;
  }
  .metrics-table td {
    padding: 16px 28px;
    font-size: 16px;
  }
  .btn-action {
    padding: 10px 22px;
    font-size: 15px;
  }
  .status-tag {
    font-size: 14px;
    padding: 4px 14px;
  }
}

/* Responsive: 4K */
@media (min-width: 3840px) {
  .editor-view {
    padding: 48px;
  }
  .page-title {
    font-size: 42px;
  }
  .page-subtitle {
    font-size: 20px;
  }
  .section-title {
    font-size: 28px;
  }
  .section-subtitle {
    font-size: 18px;
  }
  .metrics-table-container {
    border-radius: 20px;
  }
  .metrics-table th {
    padding: 20px 32px;
    font-size: 17px;
  }
  .metrics-table td {
    padding: 20px 32px;
    font-size: 18px;
  }
  .btn-action {
    padding: 12px 26px;
    font-size: 17px;
    border-radius: 12px;
  }
  .status-tag {
    font-size: 16px;
    padding: 4px 16px;
    border-radius: 14px;
  }
  .empty-state {
    padding: 64px 32px;
    font-size: 18px;
    border-radius: 16px;
  }
  .page-header {
    margin-bottom: 40px;
  }
}
</style>
