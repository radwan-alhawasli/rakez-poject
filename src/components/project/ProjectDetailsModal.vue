<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content large">
      <h3>تفاصيل المشروع: {{ project?.name }}</h3>

      <div class="details-grid">
        <div class="detail-box">
          <span class="label">رقم المعلن</span>
          <span class="value">{{ project?.advertiser_number || 'غير متوفر' }}</span>
          <span
            class="status-mini"
            :class="getStatusClass(project?.advertiser_number ? 'available' : 'notfound')"
          >
            {{ project?.advertiser_number ? 'Available' : 'Not Found' }}
          </span>
        </div>

        <div class="detail-box">
          <span class="label">متوسط سعر الوحدة</span>
          <span class="value highlight">{{
            project?.avgPrice ? formatCurrency(project.avgPrice) : 'غير محسوب'
          }}</span>
          <span
            class="status-mini"
            :class="getStatusClass(project?.avgPrice ? 'available' : 'pending')"
          >
            {{ project?.avgPrice ? 'Available' : 'Pending' }}
          </span>
        </div>

        <div class="detail-box clickable" @click="$emit('go-to-units', project)">
          <span class="label">عرض سعر الوحدات</span>
          <span class="value link">انقر للعرض ↗</span>
          <span
            class="status-mini"
            :class="getStatusClass(project?.units?.length ? 'available' : 'notfound')"
          >
            {{ project?.units?.length ? 'Available' : 'Not Found' }}
          </span>
        </div>

        <div class="detail-box">
          <span class="label">تفاصيل المشروع</span>
          <span class="value">{{ project?.description ? 'مكتمل' : 'ناقص' }}</span>
          <span
            class="status-mini"
            :class="getStatusClass(project?.description ? 'available' : 'pending')"
          >
            {{ project?.description ? 'Available' : 'Pending' }}
          </span>
        </div>

        <div class="detail-box">
          <span class="label">المطور</span>
          <span class="value">{{ project?.developer_name || 'غير متوفر' }}</span>
          <span
            class="status-mini"
            :class="getStatusClass(project?.developer_name ? 'available' : 'notfound')"
          >
            {{ project?.developer_name ? 'Available' : 'Not Found' }}
          </span>
        </div>

        <div class="detail-box">
          <span class="label">نوع المشروع</span>
          <span class="value">{{ project?.project_type_label || 'غير محدد' }}</span>
          <span class="status-mini" :class="getStatusClass('available')">Available</span>
        </div>
      </div>

      <button class="close-modal-btn" @click="$emit('close')">إغلاق</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: { type: Boolean, required: true },
  project: { type: Object, default: null },
  formatCurrency: { type: Function, required: true },
  getStatusClass: { type: Function, required: true },
});

defineEmits(['close', 'go-to-units']);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-content.large {
  max-width: 700px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin: 20px 0;
}
.detail-box {
  background: #f8fafc;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.detail-box .label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 5px;
}
.detail-box .value {
  font-weight: 700;
  color: #1e293b;
  font-size: 14px;
}
.value.highlight {
  color: #b1a28f;
  font-size: 16px;
}

.status-mini {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-top: 5px;
}
.status-mini.ok {
  background: #dcfce7;
  color: #166534;
}
.status-mini.missing {
  background: #fee2e2;
  color: #991b1b;
}
.status-mini.pending,
.status-mini.available,
.status-mini.notfound {
  background: #fef3c7;
  color: #92400e;
}

.table-wrapper {
  overflow-x: auto;
  margin-top: 15px;
}
.units-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.units-table th,
.units-table td {
  padding: 10px;
  border-bottom: 1px solid #f1f5f9;
  text-align: right;
}
.units-table th {
  color: #64748b;
  font-weight: 600;
  background: #f8fafc;
}

.close-modal-btn {
  margin-top: 20px;
  width: 100%;
  padding: 10px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 1200px) {
  .details-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .modal-content.large {
    max-width: 90%;
  }
}

@media (max-width: 768px) {
  .modal-content {
    padding: 24px;
    border-radius: 14px;
  }
  .details-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

@media (max-width: 576px) {
  .modal-content {
    width: 95%;
    padding: 20px;
    max-height: 85vh;
  }
  .modal-content h3 {
    font-size: 18px;
  }
  .detail-box {
    padding: 12px;
  }
  .close-modal-btn {
    min-height: 44px;
  }
}

@media (max-width: 320px) {
  .modal-content {
    padding: 16px;
  }
}

@media (min-width: 1920px) {
  .modal-content {
    padding: 40px;
  }
}
</style>
