<template>
  <div class="mx-auto max-w-3xl p-6" dir="rtl">
    <header class="mb-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-extrabold text-[var(--color-navy)]">إضافة حي</h1>
          <p class="mt-1 text-sm text-[var(--color-dark-gray)]">اختر المدينة ثم أدخل اسم الحي.</p>
        </div>
        <Button variant="secondary" class="rounded-xl" @click="goBack">رجوع</Button>
      </div>
    </header>

    <div class="rounded-2xl border border-[var(--color-light-gray)] bg-white p-5 shadow-sm">
      <div v-if="loadingCities" class="py-10 text-center text-sm text-[var(--color-dark-gray)]">جاري تحميل المدن...</div>

      <form v-else class="space-y-4" @submit.prevent="submit">
        <div class="space-y-1">
          <Label>المدينة</Label>
          <UiSelect v-model="form.city_id">
            <option value="" disabled>اختر مدينة</option>
            <option v-for="c in cities" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
          </UiSelect>
        </div>

        <div class="space-y-1">
          <Label>اسم الحي</Label>
          <Input v-model="form.name" placeholder="مثال: الياسمين" />
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
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import adminLocationsService from '@/services/adminLocationsService';
import { useToast } from '@/composables/useToast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Input from '@/components/ui/Input.vue';
import UiSelect from '@/components/ui/Select.vue';

const router = useRouter();
const toast = useToast();

const saving = ref(false);
const loadingCities = ref(false);
const cities = ref([]);

const form = reactive({
  city_id: '',
  name: '',
});

function goBack() {
  router.push({ path: '/admin/locations', query: { tab: 'districts' } });
}

onMounted(async () => {
  loadingCities.value = true;
  try {
    const { items } = await adminLocationsService.listAdminCities({
      per_page: 100,
      page: 1,
      sort: 'name',
      direction: 'asc',
    });
    cities.value = Array.isArray(items) ? items : [];
  } catch (e) {
    toast.error(e?.response?.data?.message || e?.message || 'تعذر تحميل المدن');
  } finally {
    loadingCities.value = false;
  }
});

async function submit() {
  const name = String(form.name || '').trim();
  const city_id = Number(form.city_id);
  if (!name || !city_id) {
    toast.warning('اختر المدينة وأدخل اسم الحي');
    return;
  }

  saving.value = true;
  try {
    await adminLocationsService.createAdminDistrict({ name, city_id });
    toast.success('تم إنشاء الحي');
    goBack();
  } catch (e) {
    toast.error(e?.response?.data?.message || e?.message || 'تعذر حفظ الحي');
  } finally {
    saving.value = false;
  }
}
</script>
