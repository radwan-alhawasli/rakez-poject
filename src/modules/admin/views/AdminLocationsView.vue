<template>
  <div class="mx-auto max-w-6xl p-6" dir="rtl">
    <header class="mb-6">
      <h1 class="text-2xl font-extrabold text-[var(--color-navy)]">المدن والأحياء</h1>
      <p class="mt-1 text-sm text-[var(--color-dark-gray)]">
        لوحة إدارة المدن ورموزها والأحياء المرتبطة بكل مدينة (حساب المدير فقط).
      </p>
    </header>

    <!-- Tabs -->
    <div class="mb-5 flex flex-wrap gap-2">
      <button
        type="button"
        class="rounded-xl border px-4 py-2 text-sm font-bold transition"
        :class="
          activeTab === 'cities'
            ? 'border-[var(--color-gold)] bg-[color-mix(in_srgb,var(--color-gold)_10%,white)] text-[var(--color-navy)]'
            : 'border-[var(--color-medium-gray)] bg-white text-[var(--color-dark-gray)] hover:border-[var(--color-gold)]'
        "
        @click="setTab('cities')"
      >
        المدن
      </button>
      <button
        type="button"
        class="rounded-xl border px-4 py-2 text-sm font-bold transition"
        :class="
          activeTab === 'districts'
            ? 'border-[var(--color-gold)] bg-[color-mix(in_srgb,var(--color-gold)_10%,white)] text-[var(--color-navy)]'
            : 'border-[var(--color-medium-gray)] bg-white text-[var(--color-dark-gray)] hover:border-[var(--color-gold)]'
        "
        @click="setTab('districts')"
      >
        الأحياء
      </button>
    </div>

    <AdminCitiesPanel
      v-if="activeTab === 'cities'"
      :items="cities"
      :total="citiesTotal"
      :loading="citiesLoading"
      :error="citiesError"
      :filters="citiesFiltersLocal"
      :page="citiesPage"
      :per-page="citiesPerPage"
      @set-filter="({ key, value }) => (citiesFiltersLocal[key] = value)"
      @create="goCreateCity"
      @view="c => openCityModal('view', c)"
      @edit="c => openCityModal('edit', c)"
      @delete="askDeleteCity"
      @reset="resetCitiesFilters"
      @page="p => updateCitiesQuery({ page: p })"
      @per-page="pp => updateCitiesQuery({ per_page: pp, page: 1 })"
    />

    <AdminDistrictsPanel
      v-else
      :items="districts"
      :total="districtsTotal"
      :loading="districtsLoading"
      :error="districtsError"
      :filters="districtsFiltersLocal"
      :page="districtsPage"
      :per-page="districtsPerPage"
      :cities-lookup="citiesLookup"
      @set-filter="({ key, value }) => (districtsFiltersLocal[key] = value)"
      @create="goCreateDistrict"
      @view="d => openDistrictModal('view', d)"
      @edit="d => openDistrictModal('edit', d)"
      @delete="askDeleteDistrict"
      @reset="resetDistrictsFilters"
      @page="p => updateDistrictsQuery({ page: p })"
      @per-page="pp => updateDistrictsQuery({ per_page: pp, page: 1 })"
    />

    <!-- City modal -->
    <Dialog v-model:open="cityModal.open">
      <DialogContent class="max-w-lg rounded-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle class="text-[var(--color-navy)]">
            {{ cityModal.modeTitle }}
          </DialogTitle>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="submitCity">
          <div class="space-y-1">
            <Label>الاسم</Label>
            <Input v-model="cityModal.form.name" :disabled="cityModal.isView" placeholder="مثال: وسط الرياض" />
          </div>
          <div class="space-y-1">
            <Label>الرمز (code)</Label>
            <Input v-model="cityModal.form.code" :disabled="cityModal.isView" placeholder="مثال: riy" />
          </div>

          <DialogFooter class="gap-2">
            <Button type="button" variant="secondary" class="rounded-xl" @click="cityModal.open = false">إغلاق</Button>
            <Button v-if="!cityModal.isView" type="submit" class="rounded-xl" :disabled="cityModal.saving">
              {{ cityModal.saving ? 'جاري الحفظ...' : 'حفظ' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- District modal -->
    <Dialog v-model:open="districtModal.open">
      <DialogContent class="max-w-lg rounded-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle class="text-[var(--color-navy)]">
            {{ districtModal.modeTitle }}
          </DialogTitle>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="submitDistrict">
          <div class="space-y-1">
            <Label>المدينة</Label>
            <UiSelect v-model="districtModal.form.city_id" :disabled="districtModal.isView">
              <option value="" disabled>اختر مدينة</option>
              <option v-for="c in citiesLookup" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
            </UiSelect>
          </div>
          <div class="space-y-1">
            <Label>اسم الحي</Label>
            <Input v-model="districtModal.form.name" :disabled="districtModal.isView" placeholder="مثال: الياسمين" />
          </div>

          <DialogFooter class="gap-2">
            <Button type="button" variant="secondary" class="rounded-xl" @click="districtModal.open = false">إغلاق</Button>
            <Button v-if="!districtModal.isView" type="submit" class="rounded-xl" :disabled="districtModal.saving">
              {{ districtModal.saving ? 'جاري الحفظ...' : 'حفظ' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Delete confirm -->
    <ConfirmModal
      v-if="deleteConfirm.open"
      v-model:open="deleteConfirm.open"
      :type="deleteConfirm.type"
      :title="deleteConfirm.title"
      :message="deleteConfirm.message"
      :is-loading="deleteConfirm.loading"
      confirm-text="حذف"
      cancel-text="إلغاء"
      @confirm="performDelete"
      @cancel="deleteConfirm.open = false"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import adminLocationsService from '@/services/adminLocationsService';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { useToast } from '@/composables/useToast';

import AdminCitiesPanel from '@/modules/admin/components/AdminCitiesPanel.vue';
import AdminDistrictsPanel from '@/modules/admin/components/AdminDistrictsPanel.vue';

import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input.vue';
import { Label } from '@/components/ui/label';
import UiSelect from '@/components/ui/Select.vue';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const route = useRoute();
const router = useRouter();
const toast = useToast();

function asString(v) {
  return v == null ? '' : String(v);
}

function toInt(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function cleanQuery(query) {
  const out = { ...query };
  for (const [k, v] of Object.entries(out)) {
    if (v === undefined || v === null) delete out[k];
    else if (typeof v === 'string' && v.trim() === '') delete out[k];
  }
  return out;
}

const activeTab = computed(() => (route.query.tab === 'districts' ? 'districts' : 'cities'));

function setTab(tab) {
  const next = cleanQuery({ ...route.query, tab, page: 1 });
  router.replace({ query: next });
}

function goCreateCity() {
  router.push('/admin/locations/cities/new');
}

function goCreateDistrict() {
  router.push('/admin/locations/districts/new');
}

// -------------------- Cities state --------------------
const cities = ref([]);
const citiesTotal = ref(0);
const citiesLoading = ref(false);
const citiesError = ref('');

const citiesLookup = ref([]);

const citiesPage = computed(() => toInt(route.query.page, 1));
const citiesPerPage = computed(() => toInt(route.query.per_page, 25));

const citiesFiltersLocal = reactive({
  q: asString(route.query.q),
  has_districts: asString(route.query.has_districts),
  created_from: asString(route.query.created_from),
  created_to: asString(route.query.created_to),
  sort: asString(route.query.sort || 'created_at'),
  direction: asString(route.query.direction || 'desc'),
  per_page: asString(route.query.per_page || '25'),
});

function updateCitiesQuery(patch) {
  const next = cleanQuery({
    ...route.query,
    tab: 'cities',
    ...patch,
  });
  router.replace({ query: next });
}

function resetCitiesFilters() {
  router.replace({
    query: cleanQuery({
      tab: 'cities',
      page: 1,
      per_page: 25,
      sort: 'created_at',
      direction: 'desc',
    }),
  });
}

let citiesQTimer = 0;
watch(
  () => citiesFiltersLocal.q,
  () => {
    window.clearTimeout(citiesQTimer);
    citiesQTimer = window.setTimeout(() => {
      updateCitiesQuery({ q: citiesFiltersLocal.q, page: 1 });
    }, 350);
  }
);
watch(
  () => [citiesFiltersLocal.has_districts, citiesFiltersLocal.created_from, citiesFiltersLocal.created_to, citiesFiltersLocal.sort, citiesFiltersLocal.direction, citiesFiltersLocal.per_page],
  () => {
    updateCitiesQuery({
      has_districts: citiesFiltersLocal.has_districts,
      created_from: citiesFiltersLocal.created_from,
      created_to: citiesFiltersLocal.created_to,
      sort: citiesFiltersLocal.sort,
      direction: citiesFiltersLocal.direction,
      per_page: Number(citiesFiltersLocal.per_page) || 25,
      page: 1,
    });
  }
);

async function fetchCities() {
  citiesLoading.value = true;
  citiesError.value = '';
  try {
    const { items, total } = await adminLocationsService.listAdminCities({
      q: route.query.q,
      has_districts: route.query.has_districts,
      created_from: route.query.created_from,
      created_to: route.query.created_to,
      sort: route.query.sort,
      direction: route.query.direction,
      per_page: route.query.per_page,
      page: route.query.page,
    });
    cities.value = Array.isArray(items) ? items : [];
    citiesTotal.value = Number(total || 0);

    // light-weight lookup for district form
    if (Array.isArray(items)) {
      citiesLookup.value = items.map(c => ({ id: c.id, name: c.name, code: c.code }));
    }
  } catch (e) {
    citiesError.value = e?.message || 'تعذر تحميل المدن';
  } finally {
    citiesLoading.value = false;
  }
}

// -------------------- Districts state --------------------
const districts = ref([]);
const districtsTotal = ref(0);
const districtsLoading = ref(false);
const districtsError = ref('');

const districtsPage = computed(() => toInt(route.query.page, 1));
const districtsPerPage = computed(() => toInt(route.query.per_page, 25));

const districtsFiltersLocal = reactive({
  q: asString(route.query.q),
  city_id: asString(route.query.city_id),
  city_code: asString(route.query.city_code),
  created_from: asString(route.query.created_from),
  created_to: asString(route.query.created_to),
  sort: asString(route.query.sort || 'created_at'),
  direction: asString(route.query.direction || 'desc'),
  per_page: asString(route.query.per_page || '25'),
});

function updateDistrictsQuery(patch) {
  const next = cleanQuery({
    ...route.query,
    tab: 'districts',
    ...patch,
  });
  router.replace({ query: next });
}

function resetDistrictsFilters() {
  router.replace({
    query: cleanQuery({
      tab: 'districts',
      page: 1,
      per_page: 25,
      sort: 'created_at',
      direction: 'desc',
    }),
  });
}

let districtsQTimer = 0;
watch(
  () => districtsFiltersLocal.q,
  () => {
    window.clearTimeout(districtsQTimer);
    districtsQTimer = window.setTimeout(() => {
      updateDistrictsQuery({ q: districtsFiltersLocal.q, page: 1 });
    }, 350);
  }
);
watch(
  () => [districtsFiltersLocal.city_id, districtsFiltersLocal.city_code, districtsFiltersLocal.created_from, districtsFiltersLocal.created_to, districtsFiltersLocal.sort, districtsFiltersLocal.direction, districtsFiltersLocal.per_page],
  () => {
    updateDistrictsQuery({
      city_id: districtsFiltersLocal.city_id,
      city_code: districtsFiltersLocal.city_code,
      created_from: districtsFiltersLocal.created_from,
      created_to: districtsFiltersLocal.created_to,
      sort: districtsFiltersLocal.sort,
      direction: districtsFiltersLocal.direction,
      per_page: Number(districtsFiltersLocal.per_page) || 25,
      page: 1,
    });
  }
);

async function fetchDistricts() {
  districtsLoading.value = true;
  districtsError.value = '';
  try {
    const { items, total } = await adminLocationsService.listAdminDistricts({
      q: route.query.q,
      city_id: route.query.city_id,
      city_code: route.query.city_code,
      created_from: route.query.created_from,
      created_to: route.query.created_to,
      sort: route.query.sort,
      direction: route.query.direction,
      per_page: route.query.per_page,
      page: route.query.page,
    });
    districts.value = Array.isArray(items) ? items : [];
    districtsTotal.value = Number(total || 0);
  } catch (e) {
    districtsError.value = e?.message || 'تعذر تحميل الأحياء';
  } finally {
    districtsLoading.value = false;
  }
}

// Shared watchers: refetch on URL changes for current tab
watch(
  () => [activeTab.value, route.query.q, route.query.has_districts, route.query.city_id, route.query.city_code, route.query.created_from, route.query.created_to, route.query.sort, route.query.direction, route.query.per_page, route.query.page],
  async () => {
    if (activeTab.value === 'cities') await fetchCities();
    else await fetchDistricts();
  },
  { immediate: true }
);

// Ensure we always have cities lookup for district create/edit
onMounted(async () => {
  if (!citiesLookup.value.length) {
    try {
      const { items } = await adminLocationsService.listAdminCities({ per_page: 100, page: 1, sort: 'name', direction: 'asc' });
      citiesLookup.value = (Array.isArray(items) ? items : []).map(c => ({ id: c.id, name: c.name, code: c.code }));
    } catch {
      // ignore; dropdown will still work if districts endpoint embeds city object
    }
  }
});

// -------------------- City modal --------------------
const cityModal = reactive({
  open: false,
  mode: /** @type {'create'|'edit'|'view'} */ ('create'),
  editingId: null,
  saving: false,
  form: {
    name: '',
    code: '',
  },
  get isView() {
    return this.mode === 'view';
  },
  get modeTitle() {
    if (this.mode === 'create') return 'مدينة جديدة';
    if (this.mode === 'edit') return 'تعديل مدينة';
    return 'عرض مدينة';
  },
});

function openCityModal(mode, city) {
  cityModal.mode = mode;
  cityModal.open = true;
  cityModal.editingId = city?.id ?? null;
  cityModal.form.name = city?.name ?? '';
  cityModal.form.code = city?.code ?? '';
}

async function submitCity() {
  const name = String(cityModal.form.name || '').trim();
  const code = String(cityModal.form.code || '').trim();
  if (!name) {
    toast.warning('أدخل اسم المدينة');
    return;
  }

  cityModal.saving = true;
  try {
    if (cityModal.mode === 'edit' && cityModal.editingId != null) {
      await adminLocationsService.updateAdminCity(cityModal.editingId, { name, code });
      toast.success('تم تحديث المدينة');
    } else {
      await adminLocationsService.createAdminCity({ name, code });
      toast.success('تم إنشاء المدينة');
    }
    cityModal.open = false;
    await fetchCities();
    if (activeTab.value === 'districts') await fetchDistricts();
  } catch (e) {
    toast.error(e?.response?.data?.message || e?.message || 'تعذر حفظ المدينة');
  } finally {
    cityModal.saving = false;
  }
}

// -------------------- District modal --------------------
const districtModal = reactive({
  open: false,
  mode: /** @type {'create'|'edit'|'view'} */ ('create'),
  editingId: null,
  saving: false,
  form: {
    city_id: '',
    name: '',
  },
  get isView() {
    return this.mode === 'view';
  },
  get modeTitle() {
    if (this.mode === 'create') return 'حي جديد';
    if (this.mode === 'edit') return 'تعديل حي';
    return 'عرض حي';
  },
});

function openDistrictModal(mode, district) {
  districtModal.mode = mode;
  districtModal.open = true;
  districtModal.editingId = district?.id ?? null;
  districtModal.form.name = district?.name ?? '';
  districtModal.form.city_id = district?.city_id != null ? String(district.city_id) : String(district?.city?.id ?? '');
}

async function submitDistrict() {
  const name = String(districtModal.form.name || '').trim();
  const city_id = Number(districtModal.form.city_id);
  if (!name || !city_id) {
    toast.warning('اختر المدينة وأدخل اسم الحي');
    return;
  }

  districtModal.saving = true;
  try {
    if (districtModal.mode === 'edit' && districtModal.editingId != null) {
      await adminLocationsService.updateAdminDistrict(districtModal.editingId, { name, city_id });
      toast.success('تم تحديث الحي');
    } else {
      await adminLocationsService.createAdminDistrict({ name, city_id });
      toast.success('تم إنشاء الحي');
    }
    districtModal.open = false;
    await fetchDistricts();
  } catch (e) {
    toast.error(e?.response?.data?.message || e?.message || 'تعذر حفظ الحي');
  } finally {
    districtModal.saving = false;
  }
}

// -------------------- Delete (optimistic) --------------------
const deleteConfirm = reactive({
  open: false,
  type: /** @type {'warning'|'danger'|'info'} */ ('danger'),
  title: '',
  message: '',
  loading: false,
  payload: /** @type {null | { kind: 'city', item: any } | { kind: 'district', item: any }} */ (null),
});

function askDeleteCity(city) {
  deleteConfirm.open = true;
  deleteConfirm.type = 'danger';
  deleteConfirm.title = 'حذف مدينة';
  deleteConfirm.message = `حذف المدينة «${city?.name || ''}»؟ سيتم حذف/تأثير الأحياء المرتبطة بهذه المدينة (Cascade).`;
  deleteConfirm.payload = { kind: 'city', item: city };
}

function askDeleteDistrict(district) {
  deleteConfirm.open = true;
  deleteConfirm.type = 'danger';
  deleteConfirm.title = 'حذف حي';
  deleteConfirm.message = `حذف الحي «${district?.name || ''}»؟`;
  deleteConfirm.payload = { kind: 'district', item: district };
}

async function performDelete() {
  if (!deleteConfirm.payload) return;
  deleteConfirm.loading = true;

  const payload = deleteConfirm.payload;

  // optimistic remove
  let rollback = null;
  if (payload.kind === 'city') {
    const prev = cities.value;
    cities.value = prev.filter(x => x.id !== payload.item.id);
    rollback = () => {
      cities.value = prev;
    };
  } else {
    const prev = districts.value;
    districts.value = prev.filter(x => x.id !== payload.item.id);
    rollback = () => {
      districts.value = prev;
    };
  }

  try {
    if (payload.kind === 'city') {
      await adminLocationsService.deleteAdminCity(payload.item.id);
      toast.success('تم حذف المدينة');
      await fetchCities();
      await fetchDistricts();
    } else {
      await adminLocationsService.deleteAdminDistrict(payload.item.id);
      toast.success('تم حذف الحي');
      await fetchDistricts();
    }
    deleteConfirm.open = false;
    deleteConfirm.payload = null;
  } catch (e) {
    rollback?.();
    toast.error(e?.response?.data?.message || e?.message || 'تعذر الحذف');
  } finally {
    deleteConfirm.loading = false;
  }
}
</script>
