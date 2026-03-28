<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content assign-modal">
      <div class="modal-header">
        <h3>تعيين موظف لفريق</h3>
        <button type="button" class="close-btn" @click="$emit('close')">&times;</button>
      </div>
      <div class="modal-body">
        <p v-if="user" class="assign-user-name">
          {{ user.name || user.email }}
        </p>
        <div class="form-group">
          <label>الفريق</label>
          <Select v-model="localTeamId">
            <option value="">اختر الفريق...</option>
            <option v-for="t in teams" :key="t.id" :value="t.id">
              {{ t.name }}
            </option>
          </Select>
        </div>
      </div>
      <div class="modal-footer">
        <Button type="button" variant="secondary" @click="$emit('close')">إلغاء</Button>
        <Button
          type="button"
          :disabled="!localTeamId || isAssigning"
          :loading="isAssigning"
          @click="$emit('submit', localTeamId)"
        >
          تعيين
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import Button from '@/components/ui/Button.vue';
import Select from '@/components/ui/Select.vue';

const props = defineProps({
  user: Object,
  teams: Array,
  isAssigning: Boolean,
});

const localTeamId = ref('');

defineEmits(['close', 'submit']);
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-content { background: white; border-radius: 12px; width: 100%; max-width: 420px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #e2e8f0; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b; }
.modal-body { padding: 20px; }
.assign-user-name { font-weight: 700; color: #27374d; margin-bottom: 15px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 14px; font-weight: 600; color: #64748b; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 15px 20px; border-top: 1px solid #e2e8f0; }
</style>
