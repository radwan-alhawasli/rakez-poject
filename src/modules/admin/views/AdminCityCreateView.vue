<template>
  <div class="mx-auto max-w-3xl p-6" dir="rtl">
    <header class="mb-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-extrabold text-[var(--color-navy)]">إضافة مدينة</h1>
          <p class="mt-1 text-sm text-[var(--color-dark-gray)]">أدخل بيانات المدينة ثم احفظ.</p>
        </div>
        <Button variant="secondary" class="rounded-xl" @click="goBack">رجوع</Button>
      </div>
    </header>

    <div class="rounded-2xl border border-[var(--color-light-gray)] bg-white p-5 shadow-sm">
      <form class="space-y-4" @submit.prevent="submit">
        <div class="space-y-1">
          <Label>الاسم</Label>
          <Input v-model="form.name" placeholder="مثال: وسط الرياض" />
        </div>

        <div class="space-y-1">
          <Label>الرمز (code)</Label>
          <Input v-model="form.code" placeholder="مثال: riy" />
          <p class="text-xs text-[var(--color-dark-gray)]">اختياري</p>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" class="rounded-xl" @click="goBack">إلغاء</Button>
          <Button type="submit" class="rounded-xl" :disabled="saving">
            {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import adminLocationsService from '@/services/adminLocationsService';
import { useToast } from '@/composables/useToast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Input from '@/components/ui/Input.vue';

const router = useRouter();
const toast = useToast();

const saving = ref(false);
const form = reactive({
  name: '',
  code: '',
});

function goBack() {
  router.push({ path: '/admin/locations', query: { tab: 'cities' } });
}

async function submit() {
  const name = String(form.name || '').trim();
  const code = String(form.code || '').trim();

  if (!name) {
    toast.warning('أدخل اسم المدينة');
    return;
  }

  saving.value = true;
  try {
    await adminLocationsService.createAdminCity({ name, code });
    toast.success('تم إنشاء المدينة');
    goBack();
  } catch (e) {
    toast.error(e?.response?.data?.message || e?.message || 'تعذر حفظ المدينة');
  } finally {
    saving.value = false;
  }
}
</script>
