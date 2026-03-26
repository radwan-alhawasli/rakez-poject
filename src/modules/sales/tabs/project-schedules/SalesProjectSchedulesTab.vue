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
   PROJECT SCHEDULES — هوية راكز (كحلي / ذهبي / زجاجي)
   ============================ */
.project-schedules-tab {
  direction: rtl;
  --rakez-schedule-navy: var(--color-navy, #27374d);
  --rakez-schedule-navy-deep: #1a2d3d;
  --rakez-schedule-gold: var(--color-gold, #b5a99a);
  --rakez-schedule-glass: rgba(255, 255, 255, 0.62);
  --rakez-schedule-glass-border: rgba(255, 255, 255, 0.55);
}

/* قائمة المشاريع — بطاقات زجاجية + شريط عنوان */
.schedule-list-hero {
  background: linear-gradient(
    125deg,
    var(--rakez-schedule-navy-deep) 0%,
    var(--rakez-schedule-navy) 48%,
    #1e3a52 100%
  );
  color: var(--rakez-schedule-gold);
  border-radius: 16px;
  padding: 22px 24px 24px;
  margin-bottom: 8px;
  border: 1px solid rgba(181, 169, 154, 0.28);
  box-shadow: 0 14px 42px rgba(39, 55, 77, 0.28);
  position: relative;
  overflow: hidden;
}

.schedule-list-hero::after {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: linear-gradient(180deg, var(--rakez-schedule-gold), rgba(181, 169, 154, 0.35));
  border-radius: 4px 0 0 4px;
}

.schedule-list-hero .welcome-title {
  color: var(--rakez-schedule-gold);
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.schedule-list-hero .welcome-subtitle {
  color: color-mix(in srgb, var(--rakez-schedule-gold) 82%, #ffffff);
  margin: 8px 0 0 0;
}

.loading-state,
.empty-state {
  margin-top: 20px;
  padding: 36px 24px;
  text-align: center;
  border-radius: 16px;
  background: var(--rakez-schedule-glass);
  backdrop-filter: blur(12px);
  border: 1px solid var(--rakez-schedule-glass-border);
  box-shadow: 0 8px 28px rgba(39, 55, 77, 0.07);
}

.loading-state p,
.empty-state p {
  margin: 12px 0 0 0;
  color: rgba(39, 55, 77, 0.65);
  font-size: 0.95rem;
}

.loading-state .spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border: 3px solid rgba(39, 55, 77, 0.12);
  border-top-color: var(--rakez-schedule-navy);
  border-radius: 50%;
  animation: rakez-schedule-spin 0.85s linear infinite;
}

@keyframes rakez-schedule-spin {
  to {
    transform: rotate(360deg);
  }
}

.schedule-projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
  margin-top: 20px;
}

.schedule-project-card {
  background: var(--rakez-schedule-glass);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--rakez-schedule-glass-border);
  border-radius: 16px;
  padding: 24px 22px;
  cursor: pointer;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  box-shadow: 0 4px 24px rgba(39, 55, 77, 0.08);
}

.schedule-project-card:hover {
  border-color: rgba(181, 169, 154, 0.65);
  box-shadow: 0 12px 36px rgba(39, 55, 77, 0.14), 0 0 0 1px rgba(181, 169, 154, 0.2);
  transform: translateY(-3px);
}

.project-card-title {
  font-size: clamp(16px, 1.2vw, 20px);
  font-weight: 700;
  color: var(--rakez-schedule-navy);
  margin: 0 0 8px 0;
}

.project-card-activity {
  font-size: 13px;
  color: var(--color-dark-gray, #52606d);
  margin: 0 0 4px 0;
}

.project-card-team {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: rgba(39, 55, 77, 0.55);
  margin: 0;
}

/* تفاصيل المشروع — رأس كحلي */
.rakez-schedule-hero.schedule-detail-header .header-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.rakez-schedule-hero {
  background: linear-gradient(
    125deg,
    var(--rakez-schedule-navy-deep) 0%,
    var(--rakez-schedule-navy) 42%,
    #1c3550 100%
  );
  color: var(--rakez-schedule-gold);
  border-radius: 16px;
  padding: 22px 24px 26px;
  margin: 0 0 18px 0;
  border: 1px solid rgba(181, 169, 154, 0.3);
  box-shadow: 0 16px 48px rgba(39, 55, 77, 0.32);
  position: relative;
  overflow: hidden;
}

.rakez-schedule-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 60% at 100% 0%, rgba(181, 169, 154, 0.12), transparent 55%);
  pointer-events: none;
}

.rakez-schedule-hero .welcome-title {
  color: var(--rakez-schedule-gold);
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.rakez-schedule-hero .welcome-subtitle {
  color: color-mix(in srgb, var(--rakez-schedule-gold) 82%, #ffffff);
  margin: 0;
  max-width: 52ch;
  line-height: 1.55;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(181, 169, 154, 0.12);
  border: 1px solid color-mix(in srgb, var(--rakez-schedule-gold) 55%, transparent);
  border-radius: 10px;
  padding: 9px 18px;
  font-size: 14px;
  font-weight: 600;
  color: var(--rakez-schedule-gold);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.2s, color 0.2s;
  width: fit-content;
  margin-bottom: 6px;
}

.btn-back:hover {
  background: rgba(181, 169, 154, 0.22);
  border-color: color-mix(in srgb, var(--rakez-schedule-gold) 75%, transparent);
}

.btn-back svg {
  flex-shrink: 0;
  opacity: 0.95;
  stroke: currentColor;
}

/* شريط التاريخ — زجاجي */
.rakez-glass-bar.schedule-date-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 18px;
  background: var(--rakez-schedule-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--rakez-schedule-glass-border);
  border-radius: 14px;
  margin-top: 4px;
  box-shadow: 0 6px 28px rgba(39, 55, 77, 0.07);
}

.schedule-date-display {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 20px;
}

.schedule-date-display .update-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(39, 55, 77, 0.55);
  letter-spacing: 0.02em;
}

.schedule-date-display .update-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--rakez-schedule-navy);
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
  padding: 9px 12px;
  border-radius: 10px;
  border: 1px solid rgba(39, 55, 77, 0.12);
  background: rgba(255, 255, 255, 0.85);
}

.schedule-date-input:focus {
  outline: none;
  border-color: rgba(181, 169, 154, 0.85);
  box-shadow: 0 0 0 3px rgba(181, 169, 154, 0.2);
}

/* Detail Layout */
.schedule-detail-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 22px;
  margin-top: 18px;
  align-items: start;
}

/* ألواح زجاجية للعمودين */
.rakez-glass-panel {
  background: var(--rakez-schedule-glass);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--rakez-schedule-glass-border);
  border-radius: 16px;
  padding: 20px 20px 22px;
  box-shadow: 0 8px 32px rgba(39, 55, 77, 0.09);
}

.rakez-glass-panel .section-label {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.rakez-glass-panel .section-label::before {
  content: '';
  width: 4px;
  height: 1.1em;
  border-radius: 4px;
  background: linear-gradient(180deg, var(--rakez-schedule-gold), rgba(181, 169, 154, 0.4));
  flex-shrink: 0;
}

.section-label {
  font-size: 16px;
  font-weight: 700;
  color: var(--rakez-schedule-navy);
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(39, 55, 77, 0.08);
}

/* Members List */
.schedule-members-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.schedule-member-card {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(39, 55, 77, 0.1);
  border-radius: 12px;
  padding: 14px 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.schedule-member-card:hover {
  border-color: rgba(181, 169, 154, 0.45);
  box-shadow: 0 4px 16px rgba(39, 55, 77, 0.06);
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
  box-shadow: 0 2px 8px rgba(39, 55, 77, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.35);
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
  background: linear-gradient(135deg, #34a853 0%, #2d8f47 100%);
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.25);
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
  border-top: 1px solid rgba(39, 55, 77, 0.08);
}

.member-time-row {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(39, 55, 77, 0.08);
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
  border-color: rgba(181, 169, 154, 0.95);
  box-shadow: 0 0 0 2px rgba(181, 169, 154, 0.18);
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
  color: #0d7a52;
}

.schedule-status.absent {
  color: rgba(39, 55, 77, 0.45);
}

/* Emergency Contact — الخلفية من rakez-glass-panel */
.emergency-contact-section {
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
  border: 1px solid rgba(39, 55, 77, 0.12);
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.88);
}

.emergency-form .form-input:focus {
  outline: none;
  border-color: rgba(181, 169, 154, 0.9);
  box-shadow: 0 0 0 3px rgba(181, 169, 154, 0.18);
}

/* Save Bar — زر كحلي مع إطار ذهبي (هوية راكز) */
.schedule-save-bar {
  margin-top: 24px;
  display: flex;
  justify-content: flex-start;
}

.btn-save-schedules {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(180deg, #324d66 0%, var(--rakez-schedule-navy) 55%, var(--rakez-schedule-navy-deep) 100%);
  color: #fff;
  border: 1px solid rgba(181, 169, 154, 0.45);
  border-radius: 12px;
  padding: 13px 30px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  box-shadow:
    0 4px 18px rgba(39, 55, 77, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.btn-save-schedules:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: rgba(181, 169, 154, 0.75);
  box-shadow:
    0 10px 28px rgba(39, 55, 77, 0.4),
    0 0 0 1px rgba(181, 169, 154, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.btn-save-schedules:disabled,
.btn-save-schedules--saving {
  opacity: 1;
  cursor: wait;
  background: linear-gradient(180deg, #5c6b7a 0%, #4a5568 100%) !important;
  color: rgba(255, 255, 255, 0.92) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  box-shadow: 0 2px 10px rgba(39, 55, 77, 0.2);
  transform: none;
}

.btn-save-schedules--saving:hover {
  transform: none;
  box-shadow: 0 2px 10px rgba(39, 55, 77, 0.2);
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
    z-index: 5;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.92) 18%, rgba(255, 255, 255, 0.96) 100%);
    backdrop-filter: blur(8px);
    padding: 16px 0 20px;
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