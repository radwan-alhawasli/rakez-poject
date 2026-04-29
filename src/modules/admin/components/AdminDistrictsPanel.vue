<template>
  <section class="rounded-2xl border border-[var(--color-light-gray)] bg-white p-5 shadow-sm">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-extrabold text-[var(--color-navy)]">قائمة الأحياء</h2>
        <p class="mt-0.5 text-xs text-[var(--color-dark-gray)]">مع فلاتر متزامنة مع الرابط + ترقيم صفحات.</p>
      </div>
      <Button class="rounded-xl" @click="$emit('create')">إضافة حي</Button>
    </div>

    <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-12">
      <div class="md:col-span-4">
        <Label class="mb-1 block text-xs">بحث</Label>
        <Input :model-value="filters.q" placeholder="ابحث باسم الحي..." @update:modelValue="v => setFilter('q', v)" />
      </div>

      <div class="md:col-span-3">
        <Label class="mb-1 block text-xs">المدينة</Label>
        <UiSelect :model-value="filters.city_id" @update:modelValue="v => setFilter('city_id', v)">
          <option value="">كل المدن</option>
          <option v-for="c in citiesLookup" :key="c.id" :value="String(c.id)">
            {{ c.name }} ({{ c.code ?? '—' }})
          </option>
        </UiSelect>
      </div>

      <div class="md:col-span-2">
        <Label class="mb-1 block text-xs">كود المدينة</Label>
        <Input :model-value="filters.city_code" placeholder="مثال: riy" @update:modelValue="v => setFilter('city_code', v)" />
      </div>

      <div class="md:col-span-2">
        <Label class="mb-1 block text-xs">من</Label>
        <Input :model-value="filters.created_from" type="date" @update:modelValue="v => setFilter('created_from', v)" />
      </div>

      <div class="md:col-span-1">
        <Label class="mb-1 block text-xs">لكل صفحة</Label>
        <UiSelect :model-value="filters.per_page" @update:modelValue="v => setFilter('per_page', v)">
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </UiSelect>
      </div>
    </div>

    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <div class="w-44">
          <Label class="mb-1 block text-xs">الترتيب</Label>
          <UiSelect :model-value="filters.sort" @update:modelValue="v => setFilter('sort', v)">
            <option value="created_at">تاريخ الإنشاء</option>
            <option value="name">الاسم</option>
            <option value="id">المعرّف</option>
          </UiSelect>
        </div>

        <div class="w-36">
          <Label class="mb-1 block text-xs">الاتجاه</Label>
          <UiSelect :model-value="filters.direction" @update:modelValue="v => setFilter('direction', v)">
            <option value="desc">تنازلي</option>
            <option value="asc">تصاعدي</option>
          </UiSelect>
        </div>

        <div class="w-44">
          <Label class="mb-1 block text-xs">إلى</Label>
          <Input :model-value="filters.created_to" type="date" @update:modelValue="v => setFilter('created_to', v)" />
        </div>

        <Button variant="secondary" class="rounded-xl" @click="$emit('reset')">إعادة تعيين</Button>
      </div>

      <div class="text-xs text-[var(--color-dark-gray)]">
        الإجمالي: <span class="font-extrabold text-[var(--color-navy)]">{{ total }}</span>
      </div>
    </div>

    <div v-if="loading" class="py-10 text-center text-sm text-[var(--color-dark-gray)]">جاري التحميل...</div>
    <div v-else-if="error" class="py-10 text-center text-sm text-red-600">{{ error }}</div>
    <div v-else-if="items.length === 0" class="py-10 text-center text-sm text-[var(--color-dark-gray)]">
      لا توجد أحياء بهذه الفلاتر.
    </div>

    <div v-else class="overflow-x-auto rounded-2xl border border-[var(--color-light-gray)]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="text-right">#</TableHead>
            <TableHead class="text-right">الحي</TableHead>
            <TableHead class="text-right">المدينة</TableHead>
            <TableHead class="text-right">كود المدينة</TableHead>
            <TableHead class="text-right">تاريخ الإنشاء</TableHead>
            <TableHead class="text-right">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="d in items" :key="d.id">
            <TableCell class="font-bold">{{ d.id }}</TableCell>
            <TableCell>{{ d.name }}</TableCell>
            <TableCell>{{ d.city?.name ?? cityNameById(d.city_id) ?? '—' }}</TableCell>
            <TableCell>
              <Badge variant="secondary">{{ d.city?.code ?? cityCodeById(d.city_id) ?? '—' }}</Badge>
            </TableCell>
            <TableCell>{{ formatDate(d.created_at) }}</TableCell>
            <TableCell class="whitespace-nowrap">
              <div class="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="secondary" class="rounded-xl" @click="$emit('view', d)">عرض</Button>
                <Button size="sm" class="rounded-xl" @click="$emit('edit', d)">تعديل</Button>
                <Button size="sm" variant="destructive" class="rounded-xl" @click="$emit('delete', d)">حذف</Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Pagination
      v-if="total > 0 && !loading"
      class="mt-4"
      :current-page="page"
      :total-items="total"
      :per-page="perPage"
      @page-change="p => $emit('page', p)"
      @per-page-change="pp => $emit('per-page', pp)"
    />
  </section>
</template>

<script setup>
import Pagination from '@/components/Pagination.vue';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input.vue';
import UiSelect from '@/components/ui/Select.vue';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const props = defineProps({
  items: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  filters: { type: Object, required: true },
  page: { type: Number, default: 1 },
  perPage: { type: Number, default: 25 },
  citiesLookup: { type: Array, default: () => [] },
});

const emit = defineEmits(['create', 'view', 'edit', 'delete', 'reset', 'page', 'per-page', 'set-filter']);

function setFilter(key, value) {
  emit('set-filter', { key, value });
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function cityNameById(cityId) {
  const id = String(cityId || '');
  const c = props.citiesLookup.find(x => String(x.id) === id);
  return c?.name;
}

function cityCodeById(cityId) {
  const id = String(cityId || '');
  const c = props.citiesLookup.find(x => String(x.id) === id);
  return c?.code;
}
</script>
