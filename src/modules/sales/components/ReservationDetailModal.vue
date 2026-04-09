<template>
  <Teleport to="body">
    <div class="detail-modal-overlay" @click.self="emit('close')">
      <div class="detail-modal">
        <div class="detail-modal-header">
          <h3>تفاصيل الحجز</h3>
          <button type="button" class="detail-modal-close" @click="emit('close')">&times;</button>
        </div>
        <div class="detail-modal-body">
          <div class="detail-section">
            <h4>الوحدة والمشروع</h4>
            <p><strong>وحدة:</strong> {{ item.unit_number || item.unitNumber || '—' }}</p>
            <p><strong>مشروع:</strong> {{ item.project_name || item.projectName || '—' }}</p>
            <p><strong>نوع الحجز:</strong> {{ item.reservation_type === 'negotiation' ? 'تفاوض' : 'حجز مؤكد' }}</p>
            <p>
              <strong>التاريخ:</strong>
              {{ formatDate(item.contract_date || item.created_at || item.date) }}
            </p>
          </div>
          <div class="detail-section">
            <h4>تفاصيل العميل</h4>
            <p><strong>الاسم:</strong> {{ item.client_name || item.clientName || '—' }}</p>
            <p><strong>الجوال:</strong> {{ item.client_mobile || item.clientPhone || '—' }}</p>
            <p><strong>الجنسية:</strong> {{ item.client_nationality || item.clientNationality || '—' }}</p>
          </div>
          <div class="detail-section">
            <h4>التفاصيل المالية</h4>
            <p>
              <strong>العربون:</strong>
              {{ formatCurrency(item.down_payment_amount || item.depositAmount || 0) }} ريال
            </p>
            <p>
              <strong>حالة العربون:</strong>
              {{ item.down_payment_status === 'refundable' ? 'قابل للاسترداد' : 'غير قابل للاسترداد' }}
            </p>
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
  </Teleport>
</template>

<script setup>
import { useFormatters } from '@/composables/useFormatters';

defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close']);

const { formatDate, formatCurrency } = useFormatters();
</script>

<style src="./styles/ReservationDetailModal.css"></style>
