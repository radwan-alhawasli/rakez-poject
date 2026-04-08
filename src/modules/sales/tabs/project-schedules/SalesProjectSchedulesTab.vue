<template>
  <div class="project-schedules-tab">
    <!-- List View (route = project-schedules list only — detail URL uses detail layout after sync) -->
    <template v-if="showScheduleProjectList">
      <div class="welcome-header schedule-list-hero">
        <div class="header-content">
          <h1 class="welcome-title">إدارة دوام المشاريع</h1>
          <p class="welcome-subtitle">
            اضغط على مشروع لعرض المسؤولين وتعيين جداول الدوام الخاصة بهم
          </p>
        </div>
      </div>

      <div v-if="isLoadingScheduleProjects" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل المشاريع...</p>
      </div>

      <div v-else-if="scheduleProjectsLoadError" class="empty-state error-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>{{ scheduleProjectsLoadError }}</p>
        <button type="button" class="btn-retry" @click="loadScheduleProjects()">إعادة المحاولة</button>
      </div>

      <div v-else-if="scheduleProjects.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <p>لا توجد مشاريع معينة لفريقك حالياً.</p>
      </div>

      <div v-else class="schedule-projects-grid">
        <div
          v-for="project in scheduleProjects"
          :key="project.id"
          class="schedule-project-card"
          @click="openProjectSchedule(project)"
        >
          <h3 class="project-card-title">
            {{ project.project_name || project.name || project.contract_name }}
          </h3>
          <p class="project-card-activity">{{ project.activity_type || 'أنشطة المشروع' }}</p>
          <p class="project-card-team">فريق المبيعات</p>
        </div>
      </div>
    </template>

    <!-- Detail View (project selected) -->
    <template v-else>
      <div class="welcome-header schedule-detail-header rakez-schedule-hero">
        <div class="header-content">
          <button type="button" class="btn-back" @click="backToList">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            رجوع
          </button>
          <h1 class="welcome-title">
            إدارة مشروع دوام:
            {{ selectedScheduleProject?.project_name || selectedScheduleProject?.name || '…' }}
          </h1>
          <p class="welcome-subtitle">
            قم بتعيين جداول الدوام للمسؤولين في هذا المشروع وجهة اتصال الطوارئ
          </p>
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

        <div
          ref="scheduleDetailRef"
          class="schedule-detail-layout"
          :class="{ 'schedule-form--saving': isSavingSchedules }"
        >
          <!-- Right: Team Members Schedules -->
          <div class="schedule-members-section rakez-glass-panel">
            <h3 class="section-label">جداول المسوقين</h3>
            <div class="schedule-members-list">
              <div
                v-for="member in scheduleMembers"
                :key="member.id"
                class="schedule-member-card"
              >
                <div class="member-row">
                  <div class="member-identity">
                    <div
                      class="member-avatar-circle"
                      :style="{ background: getAvatarColor(member.id) }"
                    >
                      {{ (member.name || '?').charAt(0) }}
                    </div>
                    <span class="member-name-label">{{ member.name }}</span>
                  </div>
                  <label class="toggle-switch">
                    <input
                      type="checkbox"
                      :checked="member.is_present"
                      :disabled="isSavingSchedules"
                      @change="toggleScheduleMember(member)"
                    />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="member-schedule-info">
                  <span class="schedule-day">{{ scheduleDisplayDayName }}</span>
                  <span class="schedule-status" :class="member.is_present ? 'present' : 'absent'">
                    {{ member.is_present ? 'متواجد اليوم' : 'غير متواجد اليوم' }}
                  </span>
                </div>
                <div class="member-time-row">
                  <span class="time-label">الدوام</span>
                  <div class="time-inputs">
                    <label class="time-field">
                      <span>من</span>
                      <input
                        type="time"
                        :value="member.start_time || '08:00'"
                        :disabled="isSavingSchedules"
                        @input="updateMemberScheduleTime(member, 'start_time', $event.target.value)"
                      />
                    </label>
                    <label class="time-field">
                      <span>إلى</span>
                      <input
                        type="time"
                        :value="member.end_time || '17:00'"
                        :disabled="isSavingSchedules"
                        @input="updateMemberScheduleTime(member, 'end_time', $event.target.value)"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Left: Emergency Contact -->
          <div class="emergency-contact-section rakez-glass-panel">
            <h3 class="section-label">جهة اتصال الطوارئ</h3>
            <div class="emergency-form">
              <div class="form-group">
                <label>الاسم</label>
                <input
                  :value="emergencyContact.name"
                  type="text"
                  class="form-input"
                  :disabled="isSavingSchedules"
                  placeholder="مثال: خالد الأحمد"
                  @input="emergencyContact.name = $event.target.value"
                />
              </div>
              <div class="form-group">
                <label>رقم الجوال</label>
                <input
                  :value="emergencyContact.phone"
                  type="tel"
                  class="form-input"
                  :disabled="isSavingSchedules"
                  placeholder="05.."
                  dir="ltr"
                  @input="emergencyContact.phone = $event.target.value"
                />
              </div>
              <div class="form-group">
                <label>الدور</label>
                <select
                  :value="emergencyContact.role"
                  class="form-input"
                  :disabled="isSavingSchedules"
                  @change="emergencyContact.role = $event.target.value"
                >
                  <option value="أخرى">أخرى</option>
                  <option value="مدير المشروع">مدير المشروع</option>
                  <option value="مشرف الموقع">مشرف الموقع</option>
                  <option value="حارس الأمن">حارس الأمن</option>
                  <option value="المالك">المالك</option>
                </select>
              </div>
            </div>
          </div>
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
            <svg
              v-else
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
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

const {
  showScheduleProjectList,
  selectedScheduleProject, scheduleProjects, isLoadingScheduleProjects,
  scheduleProjectsLoadError,
  isLoadingScheduleDetail, scheduleMembers, scheduleDisplayDate,
  scheduleDisplayTime, scheduleViewDate, scheduleDisplayDayName,
  isSavingSchedules, emergencyContact, scheduleDetailRef, getAvatarColor,
  loadScheduleProjects, openProjectSchedule, backToList,
  loadScheduleForSelectedDate, toggleScheduleMember,
  updateMemberScheduleTime, saveAllSchedules,
} = useSalesSchedules();

loadScheduleProjects();
</script>

<style scoped src="./styles/SalesProjectSchedulesTab.scoped.s1.css"></style>
<style scoped src="./styles/SalesProjectSchedulesTab.scoped.s2.css"></style>