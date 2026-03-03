<template>
  <div class="teams-view">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">الأفرقة (Teams)</h1>
        <p class="page-subtitle">عرض فرق التسويق وأعضائها.</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل الفرق...</p>
    </div>

    <!-- Teams Grid -->
    <div v-else class="teams-container">
      <div v-for="(members, teamName) in groupedTeams" :key="teamName" class="team-section">
        <h2 class="team-title">
          <span class="team-icon"
            ><svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              width="22"
              height="22"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg
          ></span>
          فريق {{ teamName }}
          <span class="count-badge">{{ members.length }} أعضاء</span>
        </h2>

        <div class="members-grid">
          <div
            v-for="member in members"
            :key="member.id"
            class="member-card"
            @click="openMemberDetails(member)"
          >
            <div class="member-avatar">
              {{ (member.name || 'A').charAt(0).toUpperCase() }}
            </div>
            <div class="member-info">
              <h3 class="member-name">{{ member.name }}</h3>
              <p class="member-role">{{ getRoleName(member.type) }}</p>
            </div>
            <button class="view-btn">عرض</button>
          </div>
        </div>
      </div>

      <div v-if="Object.keys(groupedTeams).length === 0" class="empty-state">
        <p>لا يوجد فرق أو أعضاء للعرض.</p>
      </div>
    </div>

    <!-- Member Details Modal (Dialog) -->
    <Dialog :open="showModal" @update:open="showModal = $event">
      <DialogContent class="teams-member-dialog max-w-[450px] rounded-2xl p-6" dir="rtl">
        <DialogHeader>
          <DialogTitle class="text-[var(--color-navy)]">بيانات العضو</DialogTitle>
        </DialogHeader>

        <div class="profile-header">
          <div class="large-avatar">
            {{ (selectedMember?.name || 'A').charAt(0).toUpperCase() }}
          </div>
          <h3>{{ selectedMember?.name }}</h3>
          <span class="role-badge">{{ getRoleName(selectedMember?.type) }}</span>
        </div>

        <div class="details-list">
          <div class="detail-item">
            <span class="label">البريد الإلكتروني</span>
            <span class="value">{{ selectedMember?.email || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">رقم الهاتف</span>
            <span class="value">{{ selectedMember?.phone || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">الفريق</span>
            <span class="value">{{ selectedMember?.team || 'غير معين' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">المسمى الوظيفي</span>
            <span class="value">{{ selectedMember?.contract_type || '-' }}</span>
          </div>
          <!-- Salary and sensitive info EXCLUDED as per requirements -->
        </div>

        <DialogFooter class="flex-col gap-3 sm:flex-row sm:justify-end">
          <div class="contact-actions flex w-full gap-2 sm:w-auto">
            <a
              v-if="selectedMember?.email"
              :href="'mailto:' + selectedMember.email"
              class="contact-btn email"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="16"
                height="16"
                style="vertical-align: middle; margin-left: 4px"
              >
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                ></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              إرسال بريد
            </a>
            <a
              v-if="selectedMember?.phone"
              :href="'tel:' + selectedMember.phone"
              class="contact-btn phone"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="16"
                height="16"
                style="vertical-align: middle; margin-left: 4px"
              >
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                ></path>
              </svg>
              اتصال
            </a>
          </div>
          <button type="button" class="btn-secondary" @click="closeModal">إغلاق</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import userService from '../services/userService';
import { getRoleLabel } from '../constants/roles';
import logger from '../utils/logger';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default {
  name: 'TeamsView',
  components: {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  },
  setup() {
    const isLoading = ref(true);
    const employees = ref([]);
    const showModal = ref(false);
    const selectedMember = ref(null);

    const fetchEmployees = async () => {
      isLoading.value = true;
      try {
        const data = await userService.getEmployees();
        const normalizedEmployees = Array.isArray(data) ? data : data?.items || [];
        // Relaxed filter: Show all employees to ensure sales teams (and others) are visible.
        // The grouping logic will handle categorizing them.
        employees.value = normalizedEmployees;
      } catch (error) {
        logger.error('Failed to fetch employees:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const groupedTeams = computed(() => {
      const groups = {};
      // Mock distribution if no teams found in data to demonstrate UI
      // (Remove this mock logic if real data has teams)
      const hasTeams = employees.value.some(e => e.team);

      employees.value.forEach((emp, index) => {
        let team = emp.team;
        if (!team && !hasTeams) {
          // FALLBACK MOCK: Distribute into A, B, C for demo
          const mocks = ['A', 'B', 'C'];
          team = mocks[index % 3];
        }
        team = team || 'Unassigned';

        if (!groups[team]) groups[team] = [];
        groups[team].push(emp);
      });

      // Sort keys
      return Object.keys(groups)
        .sort()
        .reduce((acc, key) => {
          acc[key] = groups[key];
          return acc;
        }, {});
    });

    const getRoleName = type => getRoleLabel(type);

    const openMemberDetails = member => {
      selectedMember.value = member;
      showModal.value = true;
    };
    const closeModal = () => {
      showModal.value = false;
      selectedMember.value = null;
    };

    onMounted(fetchEmployees);

    return {
      isLoading,
      groupedTeams,
      getRoleName,
      showModal,
      selectedMember,
      openMemberDetails,
      closeModal,
    };
  },
};
</script>

<style scoped>
.teams-view {
  animation: fadeIn 0.4s ease-out;
  padding-bottom: 50px;
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

.page-header {
  margin-bottom: 30px;
}
.page-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--color-navy);
  margin: 0 0 5px 0;
}
.page-subtitle {
  color: var(--color-dark-gray);
  font-size: 15px;
  margin: 0;
}

.team-section {
  margin-bottom: 40px;
  background: white;
  border-radius: 16px;
  border: 1px solid var(--color-medium-gray);
  padding: 25px;
}

.team-title {
  font-size: 20px;
  color: var(--color-navy);
  margin: 0 0 20px 0;
  border-bottom: 2px solid var(--color-light-gray);
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.team-icon {
  font-size: 24px;
}
.count-badge {
  font-size: 12px;
  background: var(--color-light-gray);
  padding: 4px 10px;
  border-radius: 20px;
  color: var(--color-dark-gray);
  font-weight: normal;
  margin-right: auto;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.member-card {
  background: var(--color-light-gray);
  border: 1px solid var(--color-medium-gray);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}
.member-card:hover {
  transform: translateY(-3px);
  background: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border-color: var(--color-gold);
}

.member-avatar {
  width: 60px;
  height: 60px;
  background: var(--color-medium-gray);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: var(--color-dark-gray);
  margin-bottom: 15px;
  border: 2px solid white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.member-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-navy);
  margin: 0 0 5px 0;
}
.member-role {
  font-size: 12px;
  color: var(--color-dark-gray);
  margin: 0 0 15px 0;
}

.view-btn {
  margin-top: auto;
  width: 100%;
  border: 1px solid var(--color-medium-gray);
  background: white;
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  color: var(--color-charcoal);
}
.view-btn:hover {
  background: var(--color-navy);
  color: white;
  border-color: var(--color-navy);
}

/* Member dialog content (Dialog component) */
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}
.large-avatar {
  width: 80px;
  height: 80px;
  background: var(--color-navy);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 15px;
  border: 4px solid var(--color-light-gray);
}
.profile-header h3 {
  margin: 0 0 5px 0;
  color: var(--color-navy);
}
.role-badge {
  background: var(--color-light-gray);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  color: var(--color-dark-gray);
}

.details-list {
  background: var(--color-light-gray);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
}
.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-medium-gray);
  font-size: 14px;
}
.detail-item:last-child {
  border-bottom: none;
}
.detail-item .label {
  color: var(--color-dark-gray);
}
.detail-item .value {
  font-weight: 600;
  color: var(--color-charcoal);
}

.contact-actions {
  display: flex;
  gap: 10px;
}
.contact-btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  text-decoration: none;
  text-align: center;
  font-weight: 600;
  font-size: 13px;
  transition: transform 0.2s;
}
.contact-btn:hover {
  transform: translateY(-2px);
}
.contact-btn.email {
  background: #dbf4ff;
  color: #0369a1;
}
.contact-btn.phone {
  background: #dcfce7;
  color: #15803d;
}

.btn-secondary {
  width: 100%;
  padding: 12px;
  background: white;
  border: 1px solid var(--color-medium-gray);
  border-radius: 8px;
  color: var(--color-dark-gray);
  cursor: pointer;
  font-weight: 600;
}
.btn-secondary:hover {
  background: var(--color-light-gray);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 50px;
  color: var(--color-dark-gray);
}
.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 15px;
  border-radius: 50%;
  border: 3px solid var(--color-light-gray);
  border-top-color: var(--color-gold);
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Responsive: Tablet Landscape ── */
@media (max-width: 992px) {
  .members-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
  .team-section {
    padding: 20px;
  }
}

/* ── Responsive: Tablet Portrait ── */
@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }
  .page-subtitle {
    font-size: 14px;
  }
  .members-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  .team-section {
    padding: 16px;
    margin-bottom: 24px;
    border-radius: 12px;
  }
  .team-title {
    font-size: 18px;
    flex-wrap: wrap;
  }
  .member-card {
    padding: 16px;
  }
  .member-avatar {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  .teams-member-dialog {
    width: 95%;
    padding: 20px;
  }
}

/* ── Responsive: Mobile ── */
@media (max-width: 576px) {
  .teams-view {
    padding-bottom: 30px;
  }
  .page-header {
    margin-bottom: 20px;
  }
  .page-title {
    font-size: 22px;
  }
  .members-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .member-card {
    flex-direction: row;
    text-align: right;
    padding: 14px;
    gap: 12px;
  }
  .member-avatar {
    width: 44px;
    height: 44px;
    font-size: 18px;
    margin-bottom: 0;
    flex-shrink: 0;
  }
  .member-info {
    flex: 1;
    min-width: 0;
  }
  .member-name {
    font-size: 14px;
  }
  .member-role {
    margin-bottom: 0;
  }
  .view-btn {
    margin-top: 0;
    width: auto;
    min-height: 44px;
    min-width: 44px;
    padding: 10px 16px;
    align-self: center;
  }
  .team-section {
    padding: 14px;
    border-radius: 10px;
    margin-bottom: 16px;
  }
  .team-title {
    font-size: 16px;
    gap: 8px;
  }
  .contact-btn {
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .btn-secondary {
    min-height: 44px;
  }
  .teams-member-dialog {
    width: 100%;
    max-width: 100%;
    border-radius: 12px 12px 0 0;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 90vh;
    overflow-y: auto;
  }
  .loading-state,
  .empty-state {
    padding: 30px 16px;
  }
  .details-list {
    padding: 14px;
  }
  .detail-item {
    font-size: 13px;
    flex-wrap: wrap;
    gap: 4px;
  }
}

/* ── Responsive: Extra Small Mobile ── */
@media (max-width: 320px) {
  .page-title {
    font-size: 20px;
  }
  .page-subtitle {
    font-size: 13px;
  }
  .team-section {
    padding: 10px;
  }
  .member-card {
    padding: 10px;
    gap: 8px;
  }
  .member-avatar {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  .member-name {
    font-size: 13px;
  }
  .member-role {
    font-size: 11px;
  }
  .teams-member-dialog {
    padding: 16px;
  }
  .large-avatar {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }
  .contact-actions {
    flex-direction: column;
  }
}

/* ── Responsive: Large Desktop ── */
@media (min-width: 1200px) {
  .members-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 22px;
  }
}

/* ── Responsive: Full HD ── */
@media (min-width: 1920px) {
  .page-title {
    font-size: 32px;
  }
  .page-subtitle {
    font-size: 17px;
  }
  .team-section {
    padding: 30px;
  }
  .member-card {
    padding: 24px;
  }
  .member-avatar {
    width: 68px;
    height: 68px;
    font-size: 28px;
  }
  .member-name {
    font-size: 17px;
  }
  .teams-member-dialog {
    max-width: 520px;
  }
}

/* ── Responsive: QHD ── */
@media (min-width: 2560px) {
  .page-title {
    font-size: 38px;
  }
  .team-section {
    padding: 36px;
    border-radius: 20px;
  }
  .member-card {
    padding: 28px;
    border-radius: 16px;
  }
  .member-avatar {
    width: 76px;
    height: 76px;
    font-size: 32px;
  }
  .member-name {
    font-size: 18px;
  }
  .view-btn {
    font-size: 14px;
    padding: 10px;
  }
}

/* ── Responsive: 4K ── */
@media (min-width: 3840px) {
  .page-title {
    font-size: 48px;
  }
  .page-subtitle {
    font-size: 20px;
  }
  .team-section {
    padding: 44px;
    border-radius: 24px;
  }
  .member-card {
    padding: 32px;
    border-radius: 20px;
  }
  .member-avatar {
    width: 88px;
    height: 88px;
    font-size: 38px;
  }
  .member-name {
    font-size: 20px;
  }
  .member-role {
    font-size: 15px;
  }
  .view-btn {
    font-size: 16px;
    padding: 12px;
  }
  .teams-member-dialog {
    max-width: 600px;
    padding: 36px;
  }
}
</style>
