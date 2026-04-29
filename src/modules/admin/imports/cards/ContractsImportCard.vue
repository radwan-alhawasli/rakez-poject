<template>
  <ImportCard
    title="Import Contracts"
    description="استيراد العقود (عملية حساسة)."
    :required-columns="[
      'developer_name',
      'developer_number',
      'city_id',
      'district_id',
      'project_name',
      'developer_requiment',
      'unit_type',
      'unit_count',
      'unit_price',
    ]"
    :optional-columns="[
      'side',
      'contract_type',
      'project_image_url',
      'notes',
      'commission_percent',
      'commission_from',
    ]"
    template-filename="contracts_template.csv"
    :confirm="true"
    confirm-title="تأكيد استيراد العقود"
    confirm-message="هذه عملية حساسة وقد تؤثر على بيانات العقود. هل أنت متأكد من المتابعة؟"
    @upload="handleUpload"
  >
    <template #pre>
      <div class="rounded-2xl border border-[var(--color-light-gray)] bg-slate-50 p-4 text-xs text-[var(--color-dark-gray)]">
        <div class="font-extrabold text-[var(--color-navy)]">مساعدة</div>
        <div class="mt-1">
          تأكد من صحة <span class="font-bold">city_id</span> و <span class="font-bold">district_id</span>. يمكنك مراجعتها من تبويبة
          <span class="font-bold">إضافة مدن و أحياء</span>.
        </div>
        <div class="mt-2 font-bold text-amber-800">ملاحظة: الحقل developer_requiment يجب كتابته كما هو في الـ API.</div>
      </div>
    </template>
  </ImportCard>
</template>

<script setup>
import ImportCard from '@/modules/admin/imports/components/ImportCard.vue';
import adminCsvImportsService from '@/services/adminCsvImportsService';

function handleUpload({ file, onProgress, resolve, reject }) {
  adminCsvImportsService
    .importContracts(file, onProgress)
    .then(resolve)
    .catch(reject);
}
</script>
