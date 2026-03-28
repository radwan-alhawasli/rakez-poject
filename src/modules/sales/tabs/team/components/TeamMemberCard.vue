<template>
  <div class="member-card">
    <div class="member-avatar">{{ (member.name || '?').charAt(0) }}</div>
    <div class="member-info">
      <h4>{{ member.name }}</h4>
      <p class="member-role">{{ member.role || 'عضو فريق' }}</p>
      <div class="member-stats">
        <span class="member-stat"><strong>{{ member.total_sales ?? 0 }}</strong> مبيعة</span>
        <span class="member-stat">{{ formatCurrency(member.total_value ?? 0) }}</span>
      </div>

      <div v-if="canManage" class="member-rating-section">
        <div class="member-rating">
          <span class="rating-label">التقييم</span>
          <div class="star-rating">
            <button v-for="star in 5" :key="star" type="button" class="star-btn" :class="{ filled: star <= (member.rating || 0), saving: isSaving }" :disabled="isSaving" @click="$emit('rate', star)">
              <svg viewBox="0 0 24 24" :fill="star <= (member.rating || 0) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
          </div>
        </div>

        <div class="member-comment-section">
          <template v-if="isEditingComment">
            <textarea
              :value="commentDraft ?? ''"
              class="comment-textarea"
              placeholder="اكتب تعليقك..."
              @input="$emit('update:commentDraft', $event.target.value)"
            />
            <div class="comment-actions">
              <button
                type="button"
                class="btn-comment-save"
                :disabled="isSaving"
                @click="$emit('save-comment', commentDraft ?? '')"
              >
                {{ isSaving ? 'جاري...' : 'حفظ' }}
              </button>
              <button type="button" class="btn-comment-cancel" @click="$emit('cancel-comment')">إلغاء</button>
            </div>
          </template>
          <template v-else>
            <p v-if="member.comment" class="member-comment-text">{{ member.comment }}</p>
            <button type="button" class="btn-add-comment" @click="$emit('edit-comment')">{{ member.comment ? 'تعديل التعليق' : 'إضافة تعليق' }}</button>
          </template>
        </div>
      </div>

      <div class="member-actions" v-if="canManage">
        <button type="button" class="btn-remove-member" :disabled="isRemoving" @click="$emit('remove')">إقالة</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  member: Object, canManage: Boolean, isSaving: Boolean,
  isRemoving: Boolean, isEditingComment: Boolean,
  commentDraft: String, formatCurrency: Function
});
defineEmits(['rate', 'edit-comment', 'save-comment', 'cancel-comment', 'remove', 'update:commentDraft']);
</script>

<style scoped>
.member-card { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 26px 22px; background: rgba(255,255,255,0.94); border: 1px solid rgba(39,55,77,0.14); border-radius: 16px; min-width: 0; }
.member-avatar { width: 64px; height: 64px; border-radius: 50%; background: #27374d; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 16px; border: 3px solid #fff; }
.member-info { width: 100%; }
.member-role { color: #64748b; font-size: 0.875rem; margin-bottom: 14px; }
.member-stats { display: flex; justify-content: center; gap: 12px; padding: 10px; background: #f8fafc; border-radius: 12px; font-size: 0.8rem; }
.member-rating-section { margin-top: 14px; padding-top: 14px; border-top: 1px solid #eee; text-align: right; }
.star-rating { display: flex; justify-content: center; gap: 4px; }
.star-btn { width: 36px; height: 36px; border: none; background: #f8fafc; color: #cbd5e1; cursor: pointer; border-radius: 8px; }
.star-btn.filled { color: #f59e0b; }
.comment-textarea { width: 100%; margin-top: 10px; padding: 10px; border-radius: 10px; border: 1px solid #ddd; }
.btn-comment-save { background: #27374d; color: #fff; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; }
.btn-remove-member { color: #b91c1c; background: rgba(185,28,28,0.08); border: 1px solid rgba(185,28,28,0.2); border-radius: 8px; padding: 6px 12px; cursor: pointer; width: 100%; margin-top: 10px; }
</style>
