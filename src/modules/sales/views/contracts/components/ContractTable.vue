<template>
  <div class="table-container">
    <div class="table-responsive">
      <table class="custom-table table-mobile-stacked">
        <thead>
          <tr>
            <th>النوع</th>
            <th>رقم العقد/الطلب</th>
            <th>المطور</th>
            <th>نسبة السعي</th>
            <th>تاريخ الإنشاء</th>
            <th>الحالة</th>
            <th>الإجراء</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contract in contracts" :key="contract.id">
            <td data-label="النوع">
              <span class="badge-type">{{ contract.type }}</span>
            </td>
            <td class="font-bold" data-label="رقم العقد/الطلب">{{ contract.number }}</td>
            <td class="dev-name" data-label="المطور">{{ contract.developer }}</td>
            <td data-label="نسبة السعي">{{ contract.commissionLabel }}</td>
            <td class="dir-ltr" data-label="تاريخ الإنشاء">{{ contract.createdDate }}</td>
            <td data-label="الحالة">
              <span :class="['status-badge-custom', contract.status.toLowerCase()]">
                {{ contract.status }}
              </span>
            </td>
            <td data-label="الإجراء">
              <button class="view-link" @click="$emit('view', contract)">عرض</button>
              <button v-if="contract.status === 'Pending'" type="button" class="edit-link" @click="$emit('edit', contract)">تعديل</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({ contracts: { type: Array, required: true } });
defineEmits(['view', 'edit']);
</script>

<style scoped>
.table-container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); }
.custom-table { width: 100%; border-collapse: collapse; }
.custom-table th { text-align: right; padding: 20px; color: #94a3b8; font-weight: 500; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
.custom-table td { padding: 24px 20px; vertical-align: middle; color: #334155; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
.badge-type { background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 20px; font-size: 12px; color: #475569; font-weight: 600; }
.font-bold { font-weight: 700; color: #1e293b; }
.dev-name { font-weight: 600; }
.dir-ltr { direction: ltr; text-align: right; display: inline-block; width: 100%; }
.status-badge-custom { padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 700; min-width: 100px; text-align: center; display: inline-block; }
.status-badge-custom.approved { background: #f0fdf4; color: #166534; border: 1px solid #86efac; }
.status-badge-custom.pending { background: #fefce8; color: #5c3d1a; border: 1px solid #d4a84b; }
.status-badge-custom.refused { background: #fee2e2; color: #b91c1c; border: 1px solid #fecdd3; }
.view-link { background: none; border: none; color: #1e293b; font-weight: 700; cursor: pointer; }
.edit-link { background: none; border: none; color: #b1a28f; font-weight: 700; cursor: pointer; margin-right: 12px; }
</style>
