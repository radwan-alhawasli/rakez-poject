<template>
  <div class="detail-modal-overlay" @click.self="$emit('close')">
    <div class="detail-modal">
      <div class="detail-modal-header">
        <h3>تفاصيل الحجز</h3>
        <button type="button" class="detail-modal-close" @click="$emit('close')">&times;</button>
      </div>
      <div class="detail-modal-body">
        <div class="detail-section">
          <h4>الوحدة والمشروع</h4>
          <p><strong>وحدة:</strong> {{ item.unit_number || item.unitNumber || '—' }}</p>
          <p><strong>مشروع:</strong> {{ item.project_name || item.projectName || '—' }}</p>
          <p><strong>نوع الحجز:</strong> {{ item.reservation_type === 'negotiation' ? 'تفاوض' : 'حجز مؤكد' }}</p>
          <p><strong>التاريخ:</strong> {{ formatDate(item.contract_date || item.created_at || item.date) }}</p>
        </div>
        <div class="detail-section">
          <h4>تفاصيل العميل</h4>
          <p><strong>الاسم:</strong> {{ item.client_name || item.clientName || '—' }}</p>
          <p><strong>الجوال:</strong> {{ item.client_mobile || item.clientPhone || '—' }}</p>
          <p><strong>الجنسية:</strong> {{ item.client_nationality || item.clientNationality || '—' }}</p>
        </div>
        <div class="detail-section">
          <h4>التفاصيل المالية</h4>
          <p><strong>العربون:</strong> {{ formatCurrency(item.down_payment_amount || item.depositAmount || 0) }} ريال</p>
          <p><strong>حالة العربون:</strong> {{ item.down_payment_status === 'refundable' ? 'قابل للاسترداد' : 'غير قابل للاسترداد' }}</p>
          <p><strong>طريقة الدفع:</strong> {{ item.payment_method || item.paymentMethod || '—' }}</p>
          <p><strong>آلية الشراء:</strong> {{ item.purchase_mechanism || item.purchaseMethod || '—' }}</p>
        </div>
        <div class="detail-section">
          <h4>المسوق</h4>
          <p><strong>الاسم:</strong> {{ item.marketing_employee_name || item.marketerName || '—' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  item: { type: Object, required: true },
  formatDate: { type: Function, required: true },
  formatCurrency: { type: Function, required: true },
});
defineEmits(['close']);
</script>

<style scoped>
.detail-modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1100; padding: 16px; }
.detail-modal { width: 100%; max-width: 520px; background: #fff; border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.15); display: flex; flex-direction: column; max-height: 85vh; direction: rtl; }
.detail-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid #f1f5f9; }
.detail-modal-header h3 { margin: 0; font-size: 1.1rem; color: #27374d; }
.detail-modal-close { background: none; border: none; font-size: 1.8rem; color: #94a3b8; cursor: pointer; }
.detail-modal-body { padding: 22px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }
.detail-section h4 { margin: 0 0 10px 0; font-size: 0.95rem; color: #27374d; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }
.detail-section p { margin: 6px 0; font-size: 0.9rem; color: #475569; }
.detail-section p strong { color: #1e293b; min-width: 90px; display: inline-block; }
</style>
