<template>
  <div class="project-schedules-tab">
    <!-- List View -->
    <template v-if="showScheduleProjectList">
      <div class="welcome-header schedule-list-hero">
        <div class="header-content">
          <h1 class="welcome-title">إدارة دوام المشاريع</h1>
          <p class="welcome-subtitle">اضغط على مشروع لعرض المسؤولين وتعيين جداول الدوام الخاصة بهم</p>
        </div>
      </div>

      <div v-if="isLoadingScheduleProjects" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل المشاريع...</p>
      </div>

      <div v-else-if="scheduleProjects.length === 0" class="empty-state">
        <p>لا توجد مشاريع معينة لفريقك حالياً.</p>
      </div>

      <div v-else class="schedule-projects-grid">
        <ScheduleProjectCard
          v-for="project in scheduleProjects"
          :key="project.id"
          :project="project"
          @click="openProjectSchedule(project)"
        />
      </div>
    </template>

    <!-- Detail View -->
    <template v-else>
      <div class="welcome-header schedule-detail-header rakez-schedule-hero">
        <div class="header-content">
          <button type="button" class="btn-back" @click="backToList">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            رجوع
          </button>
          <h1 class="welcome-title">
            إدارة مشروع دوام: {{ selectedScheduleProject?.project_name || selectedScheduleProject?.name || '…' }}
          </h1>
          <p class="welcome-subtitle">قم بتعيين جداول الدوام للمسؤولين في هذا المشروع وجهة اتصال الطوارئ</p>
        </div>
      </div>

      <div v-if="isLoadingScheduleDetail" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل بيانات الجداول...</p>
      </div>

      <template v-else>
        <div class="schedule-date-bar rakez-glass-bar">
          <div class="schedule-date-display">
            <span class="update-label">تاريخ التحديث:</span>
            <span class="update-value">{{ scheduleDisplayDate }}</span>
            <span class="update-label">توقيت التحديث:</span>
            <span class="update-value">{{ scheduleDisplayTime }}</span>
          </div>
          <div class="schedule-date-picker-wrap">
            <label for="schedule-view-date">عرض دوام تاريخ:</label>
            <input
              id="schedule-view-date"
              :value="scheduleViewDate"
              type="date"
              class="form-input schedule-date-input"
              @change="scheduleViewDate = $event.target.value; loadScheduleForSelectedDate()"
            />
          </div>
        </div>

        <div class="schedule-detail-layout" :class="{ 'schedule-form--saving': isSavingSchedules }">
          <!-- Right: Team Members Schedules -->
          <div class="schedule-members-section rakez-glass-panel">
            <h3 class="section-label">جداول المسوقين</h3>
            <div class="schedule-members-list">
              <ScheduleMemberCard
                v-for="member in scheduleMembers"
                :key="member.id"
                :member="member"
                :day-name="scheduleDisplayDayName"
                :disabled="isSavingSchedules"
                :get-avatar-color="getAvatarColor"
                @toggle="toggleScheduleMember"
                @update-time="updateMemberScheduleTime"
              />
            </div>
          </div>

          <!-- Left: Emergency Contact -->
          <ScheduleEmergencyForm
            v-model="emergencyContact"
            :disabled="isSavingSchedules"
          />
        </div>

        <!-- Save Button -->
        <div class="schedule-save-bar">
          <button
            type="button"
            class="btn-save-schedules"
            :class="{ 'btn-save-schedules--saving': isSavingSchedules }"
            :disabled="isSavingSchedules"
            @click="saveAllSchedules"
          >
            <span v-if="isSavingSchedules" class="btn-save-spinner" aria-hidden="true"></span>
            <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            {{ isSavingSchedules ? 'جاري الحفظ والإرسال...' : 'حفظ وإرسال للفريق' }}
          </button>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { useSalesSchedules } from '@/composables/sales/useSalesSchedules';
import ScheduleProjectCard from './components/ScheduleProjectCard.vue';
import ScheduleMemberCard from './components/ScheduleMemberCard.vue';
import ScheduleEmergencyForm from './components/ScheduleEmergencyForm.vue';

const {
  showScheduleProjectList,
  selectedScheduleProject, scheduleProjects, isLoadingScheduleProjects,
  isLoadingScheduleDetail, scheduleMembers, scheduleDisplayDate,
  scheduleDisplayTime, scheduleViewDate, scheduleDisplayDayName,
  isSavingSchedules, emergencyContact, getAvatarColor,
  loadScheduleProjects, openProjectSchedule, backToList,
  loadScheduleForSelectedDate, toggleScheduleMember,
  updateMemberScheduleTime, saveAllSchedules,
} = useSalesSchedules();

loadScheduleProjects();
</script>

<style scoped>
.project-schedules-tab {
  direction: rtl;
  --rakez-schedule-navy: var(--color-navy, #27374d);
  --rakez-schedule-navy-deep: #1a2d3d;
  --rakez-schedule-gold: var(--color-gold, #b5a99a);
  --rakez-schedule-glass: rgba(255, 255, 255, 0.62);
  --rakez-schedule-glass-border: rgba(255, 255, 255, 0.55);
}

.schedule-list-hero, .rakez-schedule-hero {
  background: linear-gradient(125deg, var(--rakez-schedule-navy-deep) 0%, var(--rakez-schedule-navy) 48%, #1e3a52 100%);
  color: var(--rakez-schedule-gold); border-radius: 16px; padding: 22px 24px 24px; margin-bottom: 18px;
  border: 1px solid rgba(181, 169, 154, 0.28); box-shadow: 0 14px 42px rgba(39, 55, 77, 0.28);
}
.welcome-title { color: var(--rakez-schedule-gold); margin: 0; }
.welcome-subtitle { color: rgba(255, 255, 255, 0.8); margin: 8px 0 0; }

.loading-state, .empty-state {
  margin-top: 20px; padding: 36px 24px; text-align: center; border-radius: 16px;
  background: var(--rakez-schedule-glass); border: 1px solid var(--rakez-schedule-glass-border);
}
.spinner { width: 40px; height: 40px; margin: 0 auto; border: 3px solid rgba(39, 55, 77, 0.12); border-top-color: var(--rakez-schedule-navy); border-radius: 50%; animation: spin 0.85s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.schedule-projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px; margin-top: 20px; }

.btn-back { display: inline-flex; align-items: center; gap: 8px; background: rgba(181, 169, 154, 0.12); border: 1px solid #b5a99a; border-radius: 10px; padding: 9px 18px; color: var(--rakez-schedule-gold); cursor: pointer; }

.rakez-glass-bar {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px;
  padding: 14px 18px; background: var(--rakez-schedule-glass); border: 1px solid var(--rakez-schedule-glass-border); border-radius: 14px;
}
.update-label { font-size: 12px; color: rgba(39, 55, 77, 0.55); }
.update-value { font-size: 14px; font-weight: 700; color: var(--rakez-schedule-navy); }
.form-input { padding: 9px 12px; border-radius: 10px; border: 1px solid rgba(39, 55, 77, 0.12); }

.schedule-detail-layout { display: grid; grid-template-columns: 1fr 340px; gap: 22px; margin-top: 18px; }
.rakez-glass-panel { background: var(--rakez-schedule-glass); border-radius: 16px; padding: 20px; border: 1px solid var(--rakez-schedule-glass-border); }
.section-label { font-size: 16px; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; gap: 10px; }
.section-label::before { content: ''; width: 4px; height: 1.1em; background: var(--rakez-schedule-gold); border-radius: 4px; }

.btn-save-schedules {
  display: inline-flex; align-items: center; gap: 10px; background: var(--rakez-schedule-navy); color: #fff;
  border: 1px solid #b5a99a; border-radius: 12px; padding: 13px 30px; font-weight: 700; cursor: pointer;
}

@media (max-width: 900px) { .schedule-detail-layout { grid-template-columns: 1fr; } }
</style>