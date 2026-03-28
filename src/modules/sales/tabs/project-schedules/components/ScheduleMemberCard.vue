<template>
  <div class="schedule-member-card">
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
          :disabled="disabled"
          @change="$emit('toggle', member)"
        />
        <span class="toggle-slider"></span>
      </label>
    </div>
    <div class="member-schedule-info">
      <span class="schedule-day">{{ dayName }}</span>
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
            :disabled="disabled"
            @input="$emit('update-time', member, 'start_time', $event.target.value)"
          />
        </label>
        <label class="time-field">
          <span>إلى</span>
          <input
            type="time"
            :value="member.end_time || '17:00'"
            :disabled="disabled"
            @input="$emit('update-time', member, 'end_time', $event.target.value)"
          />
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  member: { type: Object, required: true },
  dayName: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  getAvatarColor: { type: Function, required: true },
});
defineEmits(['toggle', 'update-time']);
</script>

<style scoped>
.schedule-member-card {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(39, 55, 77, 0.1);
  border-radius: 12px;
  padding: 14px 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.schedule-member-card:hover { border-color: rgba(181, 169, 154, 0.45); box-shadow: 0 4px 16px rgba(39, 55, 77, 0.06); }
.member-row { display: flex; align-items: center; justify-content: space-between; }
.member-identity { display: flex; align-items: center; gap: 12px; }
.member-avatar-circle {
  width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 700; font-size: 16px; flex-shrink: 0; box-shadow: 0 2px 8px rgba(39, 55, 77, 0.2); border: 2px solid rgba(255, 255, 255, 0.35);
}
.member-name-label { font-size: 15px; font-weight: 600; color: #333; }
.toggle-switch { position: relative; display: inline-block; width: 48px; height: 26px; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; cursor: pointer; inset: 0; background: #cbd5e1; border-radius: 26px; transition: background 0.3s; }
.toggle-slider::before { content: ''; position: absolute; width: 20px; height: 20px; border-radius: 50%; background: #fff; top: 3px; right: 3px; transition: transform 0.3s; }
.toggle-switch input:checked + .toggle-slider { background: linear-gradient(135deg, #34a853 0%, #2d8f47 100%); }
.toggle-switch input:checked + .toggle-slider::before { transform: translateX(-22px); }
.member-schedule-info { display: flex; align-items: center; gap: 12px; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(39, 55, 77, 0.08); }
.member-time-row { margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(39, 55, 77, 0.08); }
.time-label { display: block; font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 8px; }
.time-inputs { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.time-field { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; }
.time-field input { padding: 6px 10px; border: 1px solid #e2e8f0; border-radius: 8px; }
.schedule-status.present { color: #0d7a52; font-weight: 600; }
.schedule-status.absent { color: rgba(39, 55, 77, 0.45); font-weight: 600; }
</style>
