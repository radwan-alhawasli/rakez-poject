<template>
  <div class="project-schedules-tab">
    <!-- List View (no project selected) -->
    <template v-if="!selectedScheduleProject">
      <div class="welcome-header">
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

      <div v-else-if="scheduleProjects.length === 0" class="empty-state">
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
      <div class="welcome-header schedule-detail-header">
        <div class="header-content">
          <button class="btn-back" @click="backToList">
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
            {{ selectedScheduleProject.project_name || selectedScheduleProject.name }}
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
        <div class="schedule-date-bar">
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
          class="schedule-detail-layout"
          :class="{ 'schedule-form--saving': isSavingSchedules }"
        >
          <!-- Right: Team Members Schedules -->
          <div class="schedule-members-section">
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
          <div class="emergency-contact-section">
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
/* ============================
   PROJECT SCHEDULES TAB
   ============================ */
.project-schedules-tab {
  direction: rtl;
}

.schedule-projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.schedule-project-card {
  background: var(--color-white);
  border: 1px solid var(--color-medium-gray);
  border-radius: 16px;
  padding: 28px 24px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.schedule-project-card:hover {
  border-color: var(--color-gold);
  box-shadow: 0 6px 20px rgba(177, 162, 143, 0.18);
  transform: translateY(-2px);
}

.project-card-title {
  font-size: clamp(16px, 1.2vw, 20px);
  font-weight: 700;
  color: var(--color-charcoal);
  margin: 0 0 8px 0;
}

.project-card-activity {
  font-size: 13px;
  color: var(--color-dark-gray);
  margin: 0 0 4px 0;
}

.project-card-team {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

/* Detail Header */
.schedule-detail-header .header-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid var(--color-medium-gray);
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  width: fit-content;
  margin-bottom: 8px;
}

.btn-back:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* Schedule date bar — 100% match with date */
.schedule-date-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  background: var(--color-light-gray);
  border: 1px solid var(--color-medium-gray);
  border-radius: 12px;
  margin-top: 16px;
}

.schedule-date-display {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 20px;
}

.schedule-date-display .update-label {
  font-size: 13px;
  color: #64748b;
}

.schedule-date-display .update-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-navy);
}

.schedule-date-picker-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.schedule-date-picker-wrap label {
  font-size: 14px;
  color: var(--color-dark-gray);
  white-space: nowrap;
}

.schedule-date-input {
  width: auto;
  min-width: 160px;
  padding: 8px 12px;
}

/* Detail Layout */
.schedule-detail-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 28px;
  margin-top: 20px;
}

.section-label {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-navy);
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-medium-gray);
}

/* Members List */
.schedule-members-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-member-card {
  background: var(--color-white);
  border: 1px solid var(--color-medium-gray);
  border-radius: 12px;
  padding: 16px 20px;
  transition: border-color 0.2s;
}

.schedule-member-card:hover {
  border-color: #cbd5e1;
}

.member-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.member-identity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}

.member-name-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-charcoal);
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #cbd5e1;
  border-radius: 26px;
  transition: background 0.3s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-white);
  top: 3px;
  right: 3px;
  transition: transform 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.toggle-switch input:checked + .toggle-slider {
  background: #2ecc71;
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(-22px);
}

.member-schedule-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.member-time-row {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.member-time-row .time-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-dark-gray);
  margin-bottom: 8px;
}

.member-time-row .time-inputs {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.member-time-row .time-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-charcoal);
}

.member-time-row .time-field span {
  font-weight: 500;
  min-width: 24px;
}

.member-time-row .time-field input {
  padding: 6px 10px;
  border: 1px solid var(--color-medium-gray);
  border-radius: 8px;
  font-size: 14px;
  min-width: 100px;
}

.member-time-row .time-field input:focus {
  outline: none;
  border-color: var(--color-primary, #2563eb);
}

.schedule-day {
  font-size: 13px;
  color: var(--color-dark-gray);
  font-weight: 500;
}

.schedule-status {
  font-size: 13px;
  font-weight: 600;
}

.schedule-status.present {
  color: #059669;
}

.schedule-status.absent {
  color: #94a3b8;
}

/* Emergency Contact */
.emergency-contact-section {
  background: var(--color-white);
  border: 1px solid var(--color-medium-gray);
  border-radius: 16px;
  padding: 24px;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.emergency-form .form-group {
  margin-bottom: 18px;
}

.emergency-form .form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.emergency-form .form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: var(--radius-sm);
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.emergency-form .form-input:focus {
  outline: none;
  border-color: var(--color-gold);
}

/* Save Bar */
.schedule-save-bar {
  margin-top: 28px;
  display: flex;
  justify-content: flex-start;
}

.btn-save-schedules {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark));
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 28px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(177, 162, 143, 0.3);
}

.btn-save-schedules:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(177, 162, 143, 0.4);
}

.btn-save-schedules:disabled,
.btn-save-schedules--saving {
  opacity: 1;
  cursor: wait;
  background: linear-gradient(135deg, #94a3b8, #64748b) !important;
  color: #fff !important;
  box-shadow: 0 2px 8px rgba(100, 116, 139, 0.3);
  transform: none;
}

.btn-save-schedules--saving:hover {
  transform: none;
  box-shadow: 0 2px 8px rgba(100, 116, 139, 0.3);
}

.btn-save-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: btn-save-spin 0.7s linear infinite;
}

@keyframes btn-save-spin {
  to {
    transform: rotate(360deg);
  }
}

.schedule-form--saving .schedule-member-card,
.schedule-form--saving .emergency-contact-section {
  opacity: 0.75;
  pointer-events: none;
}

.schedule-form--saving .schedule-member-card input:disabled,
.schedule-form--saving .emergency-contact-section input:disabled,
.schedule-form--saving .emergency-contact-section select:disabled {
  cursor: not-allowed;
  background: var(--color-light-gray);
}

.btn-save-schedules svg {
  width: 18px;
  height: 18px;
}

/* ============================
   PROJECT SCHEDULES RESPONSIVE
   ============================ */
@media (max-width: 992px) {
  .schedule-detail-layout {
    grid-template-columns: 1fr;
  }
  .emergency-contact-section {
    position: static;
  }
}

@media (max-width: 768px) {
  .schedule-projects-grid {
    grid-template-columns: 1fr;
  }
  .schedule-project-card {
    padding: 20px 18px;
  }
  .schedule-detail-layout {
    gap: 20px;
  }
}

@media (max-width: 576px) {
  .member-row {
    flex-wrap: wrap;
    gap: 12px;
  }
  .schedule-save-bar {
    position: sticky;
    bottom: 0;
    background: var(--color-light-gray);
    padding: 16px 0;
    margin-top: 16px;
  }
  .btn-save-schedules {
    width: 100%;
    justify-content: center;
  }
  .btn-back {
    padding: 6px 12px;
    font-size: 13px;
  }
}

@media (min-width: 1920px) {
  .schedule-projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 24px;
  }
  .schedule-detail-layout {
    grid-template-columns: 1fr 400px;
    gap: 36px;
  }
  .schedule-member-card {
    padding: 20px 24px;
  }
}

@media (min-width: 2560px) {
  .schedule-projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(440px, 1fr));
    gap: 28px;
  }
  .schedule-detail-layout {
    grid-template-columns: 1fr 480px;
    gap: 40px;
  }
  .project-card-title {
    font-size: 22px;
  }
  .member-avatar-circle {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }
}

@media (min-width: 3840px) {
  .schedule-projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(520px, 1fr));
    gap: 36px;
  }
  .schedule-detail-layout {
    grid-template-columns: 1fr 560px;
    gap: 48px;
  }
  .project-card-title {
    font-size: 26px;
  }
  .section-label {
    font-size: 20px;
  }
  .member-avatar-circle {
    width: 56px;
    height: 56px;
    font-size: 22px;
  }
  .btn-save-schedules {
    padding: 16px 36px;
    font-size: 18px;
  }
}
</style>