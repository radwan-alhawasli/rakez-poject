<template>
  <div class="my-requests">
    <!-- Header -->
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">طلباتي الحصرية</h1>
        <p class="welcome-subtitle">
          تتبع حالة طلبات المشاريع الحصرية التي قدمتها وأكمل العقود المعتمدة.
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
              <div class="status-badge" :class="request.status.toLowerCase()">
                {{
                  request.status.toLowerCase() === 'approved'
                    ? 'موافق عليه'
                    : request.status.toLowerCase() === 'rejected'
                    ? 'مرفوض'
                    : 'معلق'
                }}
              </div>
            </td>
            <td data-label="الإجراء" class="text-center">
              <button
                class="complete-btn"
                @click="completeContract(request.id)"
                :disabled="request.status.toLowerCase() !== 'approved'"
              >
                استكمال العقد
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onActivated } from 'vue';
import { useRouter } from 'vue-router';
import contractService from '@/services/contractService';
import logger from '@/utils/logger';

export default {
  name: 'MyRequestsView',
  setup() {
    const router = useRouter();
    const requests = ref([]);
    const isLoading = ref(true);

    // Check if contract is completed (has been filled with data)
    const isContractCompleted = item => {
      // Check if contract has completion data
      // We check for fields that are ONLY present after the "Complete Contract" form is submitted.
      // These fields are not part of the initial Exclusive Project Request.

      const hasDate = item.gregorian_date && item.gregorian_date !== '';
      const hasHijri = item.hijri_date && item.hijri_date !== '';
      const hasDuration =
        item.agreement_duration_days != null &&
        item.agreement_duration_days !== '' &&
        item.agreement_duration_days != 0;
      const hasCommission = item.commission_percent != null && item.commission_percent !== '';

      // If ANY of these specific completion fields are present, the contract is considered completed.
      // We avoid checking second_party_name alone as it might be pre-filled from developer info.
      return hasDate || hasHijri || hasDuration || hasCommission;
    };

    const fetchRequests = async () => {
      isLoading.value = true;
      try {
        const { items } = await contractService.getContracts({ page: 1, per_page: 500 });
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
              // Fetch full details to check completion
              try {
                const fullDetails = await contractService.getContractById(item.id);
                if (isContractCompleted(fullDetails)) {
                  return null; // Filter out completed
                }
                return { ...item, status: 'Approved' }; // Keep non-completed
              } catch (e) {
                logger.error(`Failed to fetch details for ${item.id}`, e);
                return item; // Keep if check fails, better safe than hidden
              }
            }

            return item;
          })
        );

        // Filter out nulls (completed contracts)
        const validRequests = processedRequests.filter(r => r !== null);

        // Map API fields if they differ
        requests.value = validRequests.map(item => ({
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

    // Fetch on mount
    onMounted(fetchRequests);

    // Re-fetch when component is activated (returning to this route)
    onActivated(fetchRequests);

    const completeContract = id => {
      router.push(`/contract-form/${id}`);
    };

    return {
      requests,
      isLoading,
      completeContract,
    };
  },
};
</script>

<style scoped>
.my-requests {
  animation: fadeIn 0.4s ease-out;
  direction: rtl;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


.data-table-container {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--color-medium-gray);
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.table-header-info {
  padding: 24px 30px;
  border-bottom: 1px solid var(--color-light-gray);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-navy);
  margin: 0;
}

.table-count {
  color: var(--color-dark-gray);
  font-size: 14px;
  margin: 0;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
}

.custom-table th {
  text-align: right;
  padding: 16px 30px;
  color: var(--color-dark-gray);
  font-weight: 500;
  font-size: 14px;
  background: var(--color-off-white);
}

.custom-table td {
  padding: 16px 30px;
  border-bottom: 1px solid var(--color-light-gray);
  color: var(--color-charcoal);
  font-size: 15px;
}

.project-name {
  font-weight: 700;
  color: var(--color-navy);
}

.date-text {
  font-family: monospace;
  color: var(--color-dark-gray);
}

.status-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  min-width: 90px;
  border: 1px solid transparent;
}

.status-badge.pending {
  background: #fefce8;
  color: #5c3d1a;
  border: 1px solid #d4a84b;
}
.status-badge.approved {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #86efac;
}
.status-badge.rejected {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecdd3;
}

.complete-btn {
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 10px rgba(161, 139, 92, 0.2);
}

.complete-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(161, 139, 92, 0.3);
  filter: brightness(1.1);
}

.complete-btn:disabled {
  background: var(--color-light-gray);
  color: var(--color-dark-gray);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.text-center {
  text-align: center;
}
.padding-30 {
  padding: 30px !important;
}

.spinner-gold {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(161, 139, 92, 0.1);
  border-top-color: var(--color-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

.loading-text {
  margin-top: 10px;
  color: var(--color-gold);
  font-weight: 500;
}

.no-data-text {
  color: var(--color-dark-gray);
  font-size: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive: Tablet Landscape */
@media (max-width: 992px) {
  .custom-table th,
  .custom-table td {
    padding: 14px 20px;
  }
}

/* Responsive: Tablet Portrait */
@media (max-width: 768px) {
  .table-header-info {
    flex-direction: column;
    gap: 8px;
    padding: 16px 20px;
    align-items: flex-start;
  }
  .data-table-container {
    border-radius: 12px;
  }
  .custom-table th,
  .custom-table td {
    padding: 12px 16px;
    font-size: 13px;
  }
  .complete-btn {
    padding: 10px 16px;
    font-size: 13px;
    min-height: 44px;
  }
}

/* Responsive: Mobile */
@media (max-width: 576px) {
  .table-header-info {
    padding: 12px 16px;
  }
  .table-title {
    font-size: 16px;
  }
  .data-table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .custom-table {
    min-width: 500px;
  }
  .custom-table th,
  .custom-table td {
    padding: 10px 12px;
    font-size: 12px;
  }
  .status-badge {
    min-width: 70px;
    padding: 5px 10px;
    font-size: 11px;
  }
  .complete-btn {
    padding: 10px 12px;
    font-size: 12px;
    min-height: 44px;
  }
}

/* Responsive: Extra Small Mobile */
@media (max-width: 320px) {
  .custom-table {
    min-width: 420px;
  }
  .custom-table th,
  .custom-table td {
    padding: 8px 10px;
    font-size: 11px;
  }
  .table-header-info {
    padding: 10px 12px;
  }
  .table-title {
    font-size: 15px;
  }
  .complete-btn {
    padding: 8px 10px;
    font-size: 11px;
  }
}

/* Responsive: Large Desktop */
@media (min-width: 1920px) {
  .data-table-container {
    border-radius: 20px;
  }
  .table-header-info {
    padding: 30px 40px;
  }
  .table-title {
    font-size: 24px;
  }
  .custom-table th,
  .custom-table td {
    padding: 20px 40px;
    font-size: 16px;
  }
  .complete-btn {
    padding: 12px 28px;
    font-size: 15px;
  }
  .status-badge {
    font-size: 14px;
    padding: 8px 20px;
    min-width: 110px;
  }
}

/* Responsive: Ultra-wide */
@media (min-width: 2560px) {
  .custom-table th,
  .custom-table td {
    padding: 24px 48px;
    font-size: 18px;
  }
  .complete-btn {
    padding: 14px 32px;
    font-size: 16px;
  }
}
</style>
