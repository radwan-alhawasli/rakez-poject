<template>
  <div class="teams-view">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">الأفرقة (Teams)</h1>
        <p class="welcome-subtitle">عرض فرق التسويق وأعضائها.</p>
      </div>
    </div>

    <!-- Loading State -->
    <CardSkeleton v-if="isLoading" :count="4" />

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchEmployees">إعادة المحاولة</button>
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
    <Dialog v-if="showModal" :open="showModal" @update:open="showModal = $event">
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
import { CardSkeleton } from '@/components/ui/skeleton';
import userService from '@/services/userService';
import { getRoleLabel } from '@/constants/roles';
import logger from '@/utils/logger';
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
    CardSkeleton,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  },
  setup() {
    const isLoading = ref(true);
    const error = ref(null);
    const employees = ref([]);
    const showModal = ref(false);
    const selectedMember = ref(null);

    const fetchEmployees = async () => {
      isLoading.value = true;
      error.value = null;
      try {
        const data = await userService.getEmployees();
        const normalizedEmployees = Array.isArray(data) ? data : data?.items || [];
        employees.value = normalizedEmployees;
      } catch (err) {
        logger.error('Failed to fetch employees:', err);
        error.value = 'حدث خطأ في تحميل بيانات الفرق';
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
      error,
      groupedTeams,
      getRoleName,
      showModal,
      selectedMember,
      openMemberDetails,
      closeModal,
      fetchEmployees,
    };
  },
};
</script>

<style scoped src="./styles/TeamsView.scoped.s1.css"></style>
<style scoped src="./styles/TeamsView.scoped.s2.css"></style>
