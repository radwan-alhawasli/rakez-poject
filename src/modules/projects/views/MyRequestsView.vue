<template>
  <div class="my-requests">
    <!-- Header -->
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">طلباتي الحصرية</h1>
        <p class="welcome-subtitle">
          <template v-if="showsAllTeamRequests">
            عرض جميع طلبات المشاريع الحصرية (صلاحية مدير أو مشرف).
          </template>
          <template v-else>
            تتبع حالة طلبات المشاريع الحصرية التي قدمتها وأكمل العقود المعتمدة.
          </template>
        </p>
      </div>
    </div>

    <!-- Requests Table -->
    <div class="data-table-container">
      <div class="table-header-info">
        <h3 class="table-title">قائمة الطلبات</h3>
        <p class="table-count" v-if="!isLoading">تم العثور على {{ requests.length }} طلب.</p>
      </div>

      <div class="table-responsive">
      <table class="custom-table table-mobile-stacked">
        <thead>
          <tr>
            <th>اسم المشروع</th>
            <th>تاريخ الطلب</th>
            <th>الحالة</th>
            <th class="text-center">الإجراء</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td data-label="" colspan="4" class="text-center padding-30">
              <span class="spinner-gold"></span>
              <p class="loading-text">جاري تحميل الطلبات...</p>
            </td>
          </tr>
          <tr v-else-if="requests.length === 0">
            <td data-label="" colspan="4" class="text-center padding-30">
              <p class="no-data-text">لا يوجد طلبات حالياً.</p>
            </td>
          </tr>
          <tr v-else v-for="request in requests" :key="request.id">
            <td data-label="اسم المشروع">
              <span class="project-name">{{ request.project_name }}</span>
            </td>
            <td data-label="تاريخ الطلب">
              <span class="date-text">{{ request.date }}</span>
            </td>
            <td data-label="الحالة">
              <div class="status-badge" :class="statusClass(request.status)">
                {{ statusLabel(request.status) }}
              </div>
            </td>
            <td data-label="الإجراء" class="text-center actions-cell">
              <button
                v-if="request.status !== 'completed'"
                class="complete-btn"
                @click="completeContract(request.id)"
                :disabled="!canCompleteContract(request.status)"
              >
                استكمال العقد
              </button>
              <button
                v-if="request.status === 'completed'"
                class="edit-btn"
                @click="openEditModal(request)"
              >
                تعديل
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <!-- مودال تعديل بيانات استكمال العقد -->
    <EditContractInfoModal
      v-if="showEditModal"
      :key="String(editingContractId)"
      :contract-id="editingContractId"
      :initial-data="editingContractData"
      @close="closeEditModal"
      @saved="onEditSaved"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onActivated, watch } from 'vue';
import EditContractInfoModal from '@/components/EditContractInfoModal.vue';
import { useRouter, useRoute } from 'vue-router';
import contractService from '@/services/contractService';
import authService from '@/services/authService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { userSeesAllMyRequests } from '@/utils/myRequestsScope';

export default {
  name: 'MyRequestsView',
  components: { EditContractInfoModal },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const requests = ref([]);
    const isLoading = ref(true);
    const showEditModal = ref(false);
    const editingContractId = ref(null);
    const editingContractData = ref(null);

    const showsAllTeamRequests = computed(() => userSeesAllMyRequests(authService.getCurrentUser()));

    /**
     * استكمال العقد يختلف عن اعتماد الطلب: المعتمد قد لا يكون قد أكمل نموذج الاستكمال بعد.
     * لا نستخدم commission_percent كدليل على الاكتمال لأنه يُرسل مع طلب المشروع الحصري الأولي.
     * نعتمد فقط status === 'completed' من الـ API (قائمة أو تفاصيل).
     */
    const fetchRequests = async () => {
      isLoading.value = true;
      try {
        const me = authService.getCurrentUser();
        const params = { page: 1, per_page: 500 };
        if (!userSeesAllMyRequests(me) && me?.id != null && String(me.id).trim() !== '') {
          params.user_id = me.id;
        }
        const { items } = await contractService.getContracts(params);
        const data = items ?? [];

        // 1. Filter out rejected contracts initially if needed, or keep all
        // The user only sees their requests.

        // 2. Process contracts
        const processedRequests = await Promise.all(
          data.map(async item => {
            const status = (item.status || 'Pending').toLowerCase();

            // If approved, we need to check if it's completed
            // But 'item' from list might be incomplete.
            // We'll check if we need to fetch details.
            // Ideally, the list API should return enough info.
            // If not, we fetch detail.

            if (status === 'approved') {
              try {
                const fullDetails = await contractService.getContractById(item.id);
                const detailStatus = (fullDetails.status || '')
                  .toString()
                  .toLowerCase();
                if (detailStatus === 'completed') {
                  return { ...item, ...fullDetails, status: 'completed' };
                }
                return { ...item, ...fullDetails, status: item.status };
              } catch (e) {
                logger.error(`Failed to fetch details for ${item.id}`, e);
                return item;
              }
            }
            /** عقود مكتملة من القائمة فقط — نجلب GET /contracts/show لملء مودال التعديل وباقي الحقول */
            if (status === 'completed') {
              try {
                const fullDetails = await contractService.getContractById(item.id);
                if (fullDetails && typeof fullDetails === 'object') {
                  return { ...item, ...fullDetails, status: 'completed' };
                }
              } catch (e) {
                logger.error(`Failed to fetch details for completed ${item.id}`, e);
              }
              return item;
            }
            // Preserve API status: pending, rejected, etc.
            return item;
          })
        );

        const validRequests = processedRequests.filter(r => r !== null);

        requests.value = validRequests.map(item => ({
          ...item,
          id: item.id,
          project_name: item.project_name || 'بدون اسم',
          date: item.created_at ? item.created_at.split('T')[0] : 'غير متوفر',
          status: item.status || 'Pending',
        }));
      } catch (error) {
        logger.error('Failed to fetch requests', error);
      } finally {
        isLoading.value = false;
      }
    };

    /** بعد «حفظ واعتماد العقد» من نموذج الاستكمال: عرض الرسائل هنا وإزالة query. */
    watch(
      () => route.query.contract_saved,
      (v) => {
        if (v !== '1') return;
        toast.success('تم حفظ واعتماد العقد بنجاح');
        toast.info('يمكنك الآن تحميل نسخة PDF من العقد عند الحاجة.');
        const rest = { ...route.query };
        delete rest.contract_saved;
        router.replace({ name: 'MyRequests', query: rest });
      },
      { immediate: true },
    );

    // Fetch on mount
    onMounted(fetchRequests);

    // Re-fetch when component is activated (returning to this route)
    onActivated(fetchRequests);

    const completeContract = (id) => {
      if (id == null || id === '') {
        logger.warn('completeContract: missing contract id');
        return;
      }
      router.push({ name: 'ContractForm', params: { id: String(id) } });
    };

    /** Display label from API status (GET /contracts/index → status). */
    const statusLabel = (status) => {
      const s = (status || '').toString().toLowerCase();
      if (s === 'approved') return 'معتمد';
      if (s === 'rejected' || s === 'refused') return 'مرفوض';
      if (s === 'completed') return 'مكتمل';
      return 'معلق';
    };

    /** CSS class for status badge (pending, approved, rejected, completed). */
    const statusClass = (status) => {
      const s = (status || '').toString().toLowerCase();
      if (s === 'approved' || s === 'completed' || s === 'rejected' || s === 'refused') return s;
      return 'pending';
    };

    /** Only approved (and not completed) contracts can use "استكمال العقد". */
    const canCompleteContract = (status) => {
      const s = (status || '').toString().toLowerCase();
      return s === 'approved';
    };

    function openEditModal(request) {
      if (!request?.id) return;
      editingContractId.value = request.id;
      editingContractData.value = request;
      showEditModal.value = true;
    }

    function closeEditModal() {
      showEditModal.value = false;
      editingContractId.value = null;
      editingContractData.value = null;
    }

    function onEditSaved() {
      closeEditModal();
      fetchRequests();
    }

    return {
      requests,
      isLoading,
      showsAllTeamRequests,
      showEditModal,
      editingContractId,
      editingContractData,
      completeContract,
      statusLabel,
      statusClass,
      canCompleteContract,
      openEditModal,
      closeEditModal,
      onEditSaved,
    };
  },
};
</script>

<style scoped src="./styles/MyRequestsView.scoped.s1.css"></style>
