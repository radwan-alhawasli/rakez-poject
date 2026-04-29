<template>
  <div class="mx-auto max-w-6xl p-6" dir="rtl">
    <header class="mb-6">
      <h1 class="text-2xl font-extrabold text-[var(--color-navy)]">إضافة ملفات CSV</h1>
      <p class="mt-1 text-sm text-[var(--color-dark-gray)]">
        استيراد دفعات CSV (Bulk Imports) مع Preview و Progress ونتائج مفصلة.
      </p>
      <div class="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        <div class="font-extrabold">تنبيه</div>
        <div class="mt-1">
          الحد الأقصى لحجم الملف: <span class="font-bold">10MB</span> — يسمح فقط بـ <span class="font-bold">.csv</span> و
          <span class="font-bold">.txt</span>.
        </div>
        <div class="mt-1">
          يتم رفع الملف باسم field: <span class="font-bold">file</span> داخل <span class="font-bold">multipart/form-data</span>.
        </div>
      </div>
    </header>

    <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <CitiesDistrictsImportCard />
      <DistrictsImportCard />
      <TeamsImportCard />
      <EmployeesImportCard />
      <ContractsImportCard class="lg:col-span-2" />
      <ContractInfoImportCard />
      <SecondPartyDataImportCard />
    </div>
  </div>
</template>

<script setup>
import CitiesDistrictsImportCard from '@/modules/admin/imports/cards/CitiesDistrictsImportCard.vue';
import DistrictsImportCard from '@/modules/admin/imports/cards/DistrictsImportCard.vue';
import TeamsImportCard from '@/modules/admin/imports/cards/TeamsImportCard.vue';
import EmployeesImportCard from '@/modules/admin/imports/cards/EmployeesImportCard.vue';
import ContractsImportCard from '@/modules/admin/imports/cards/ContractsImportCard.vue';
import ContractInfoImportCard from '@/modules/admin/imports/cards/ContractInfoImportCard.vue';
import SecondPartyDataImportCard from '@/modules/admin/imports/cards/SecondPartyDataImportCard.vue';
</script>
