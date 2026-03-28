<template>
  <div class="table-responsive">
    <table class="data-table table-mobile-stacked">
      <thead>
        <tr>
          <th>المستخدم</th>
          <th>الدور</th>
          <th>الفريق</th>
          <th>تاريخ الإنشاء</th>
          <th>الحالة</th>
          <th>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td data-label="المستخدم">
            <div class="user-cell">
              <div class="user-avatar">{{ (user.name || '?').charAt(0).toUpperCase() }}</div>
              <div class="user-details">
                <div class="user-name">{{ user.name || 'مستخدم غير معروف' }}</div>
                <div class="user-email">{{ user.email }}</div>
              </div>
            </div>
          </td>
          <td data-label="الدور">
            <div class="role-badge" :class="getRoleClass(user.type)">
              {{ getRoleLabel(user.type, user.is_manager) }}
            </div>
          </td>
          <td data-label="الفريق">{{ getTeamDisplay(user.team) }}</td>
          <td data-label="تاريخ الإنشاء" class="date-cell">{{ formatDate(user.created_at) }}</td>
          <td data-label="الحالة">
            <span class="status-badge" :class="user.disabled ? 'disabled' : 'active'">
              {{ user.disabled ? 'معطل' : 'نشط' }}
            </span>
          </td>
          <td data-label="الإجراءات">
            <div class="actions">
              <button class="action-btn status" @click="$emit('toggle-status', user)" :title="user.disabled ? 'تفعيل' : 'تعطيل'">
                <svg v-if="!user.disabled" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                  <line x1="12" y1="2" x2="12" y2="12"></line>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
              <button class="action-btn edit" @click="$emit('edit', user)" title="تعديل">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button v-if="useHrApi" class="action-btn assign" @click="$emit('assign', user)" title="تعيين لفريق">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </button>
              <button class="action-btn delete" @click="$emit('delete', user)" title="حذف">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { getRoleLabel, getRoleClass } from '@/constants/roles';
import { useFormatters } from '@/composables/useFormatters';

const props = defineProps({
  users: Array,
  useHrApi: Boolean,
});

const { formatDateISO: formatDate } = useFormatters();

const getTeamDisplay = team => {
  if (team == null) return '-';
  if (typeof team === 'object' && team.name) return team.name;
  return typeof team === 'string' ? team : '-';
};

defineEmits(['toggle-status', 'edit', 'assign', 'delete']);
</script>
