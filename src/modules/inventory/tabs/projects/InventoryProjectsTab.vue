<template>
  <div class="inventory-projects-tab">
    <div class="welcome-header">
      <h1 class="welcome-title">المشاريع على الخريطة</h1>
      <p class="welcome-subtitle">عرض مواقع المشاريع من واجهة المخزون — اضغط على الدبوس لعرض التفاصيل والوحدات.</p>
    </div>

    <div class="filters-grid">
      <div class="filter-group">
        <label>الحالة</label>
        <select v-model="filters.status" class="filter-select">
          <option value="">الكل</option>
          <option value="pending">قيد الانتظار</option>
          <option value="approved">معتمد</option>
          <option value="completed">مكتمل</option>
          <option value="active">نشط</option>
          <option value="rejected">مرفوض</option>
        </select>
      </div>
      <div class="filter-group">
        <label>معرّف المستخدم</label>
        <input v-model="filters.user_id" type="text" class="filter-input" placeholder="اختياري" />
      </div>
      <div class="filter-group">
        <label>المدينة</label>
        <select v-model="filters.city" class="filter-select">
          <option value="">الكل</option>
          <option v-for="c in cityOptions" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>الحي</label>
        <input v-model="filters.district" type="text" class="filter-input" placeholder="اختياري" />
      </div>
      <div class="filter-group filter-span-2">
        <label>اسم المشروع</label>
        <input v-model="filters.project_name" type="text" class="filter-input" placeholder="بحث..." />
      </div>
      <div class="filter-group">
        <label>تصوير</label>
        <select v-model="filters.has_photography" class="filter-select">
          <option value="">الكل</option>
          <option value="1">يوجد</option>
          <option value="0">لا يوجد</option>
        </select>
      </div>
      <div class="filter-group">
        <label>مونتاج</label>
        <select v-model="filters.has_montage" class="filter-select">
          <option value="">الكل</option>
          <option value="1">يوجد</option>
          <option value="0">لا يوجد</option>
        </select>
      </div>
      <div class="filter-group filter-actions">
        <label class="filter-label-spacer">&nbsp;</label>
        <button type="button" class="btn-search" @click="applyFilters">تطبيق الفلاتر</button>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل المواقع...</p>
    </div>

    <div v-else class="map-container">
      <div
        v-if="locations.length && !hasMappablePins"
        class="map-coords-warning"
        role="status"
      >
        تم جلب {{ locations.length }} مشروعاً، لكن لا توجد إحداثيات صالحة (lat/lng) في البيانات — لن تظهر دبابيس حتى يوفّر الـ API حقول الإحداثيات.
      </div>
      <div ref="mapRef" class="map-inner"></div>

      <div v-if="selectedLocation" class="project-card-popup">
        <div class="card-header">
          <h4>{{ cardTitle }}</h4>
          <button type="button" class="close-btn" @click="closeCard" aria-label="إغلاق">×</button>
        </div>
        <div class="card-body">
          <div v-if="detailLoading" class="detail-loading">جاري تحميل التفاصيل...</div>
          <template v-else>
            <p><strong>نوع الوحدات:</strong> {{ cardUnitTypes }}</p>
            <p><strong>حالة المشروع:</strong> {{ cardStatus }}</p>

            <div v-if="cardUnits.length" class="units-block">
              <h5 class="units-title">الوحدات</h5>
              <ul class="units-list">
                <li v-for="(u, idx) in cardUnits" :key="u.id ?? idx" class="unit-row">
                  <span class="unit-main">{{ u.unit_type || u.type || '—' }} — {{ u.unit_number || u.number || '—' }}</span>
                  <span class="unit-meta">{{ formatUnitStatus(u.status) }}</span>
                  <span v-if="u.price != null" class="unit-price">{{ formatPrice(u.price) }}</span>
                </li>
              </ul>
            </div>
            <p v-else class="muted">لا توجد وحدات في الاستجابة.</p>

            <router-link
              v-if="activeContractId"
              :to="{ name: 'ContractForm', params: { id: activeContractId } }"
              class="see-more-link"
            >
              عرض المزيد في العقد
            </router-link>
          </template>
        </div>
      </div>
    </div>

    <div v-if="!isLoading && locations.length === 0" class="empty-state">
      <p>لا توجد مشاريع تطابق الفلاتر أو لا توجد إحداثيات لعرضها.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import inventoryService from '@/services/inventoryService';
import { toast } from '@/composables/useToast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIconUrl, iconRetinaUrl: markerIconRetinaUrl, shadowUrl: markerShadowUrl });

const mapRef = ref(null);
const mapInstance = ref(null);
const markersLayer = ref(null);

const locations = ref([]);
const isLoading = ref(true);
const selectedLocation = ref(null);
const projectDetail = ref(null);
const detailLoading = ref(false);

const filters = reactive({
  status: '',
  user_id: '',
  city: '',
  district: '',
  project_name: '',
  has_photography: '',
  has_montage: '',
});

const cityOptions = ref([]);

const RIYADH_CENTER = [24.7136, 46.6753];

const activeContractId = computed(() => {
  const loc = selectedLocation.value;
  if (!loc) return null;
  return loc.contract_id ?? loc.contractId ?? loc.id ?? null;
});

const cardTitle = computed(() => {
  const d = projectDetail.value;
  const loc = selectedLocation.value;
  if (d) {
    return (
      d.project_name ??
      d.name ??
      d.contract?.project_name ??
      d.contract?.name ??
      loc?.project_name ??
      loc?.name ??
      'مشروع'
    );
  }
  return loc?.project_name ?? loc?.name ?? 'مشروع';
});

const cardUnitTypes = computed(() => {
  const d = projectDetail.value;
  if (!d) return '—';
  if (d.unit_types) {
    return Array.isArray(d.unit_types) ? d.unit_types.join('، ') : String(d.unit_types);
  }
  const units = d.units ?? d.contract_units ?? [];
  if (!Array.isArray(units) || !units.length) return '—';
  const types = [...new Set(units.map(u => u.unit_type || u.type).filter(Boolean))];
  return types.length ? types.join('، ') : '—';
});

const cardStatus = computed(() => {
  const d = projectDetail.value;
  const loc = selectedLocation.value;
  const s = d?.status ?? d?.contract?.status ?? loc?.status;
  return formatProjectStatus(s);
});

const cardUnits = computed(() => {
  const d = projectDetail.value;
  if (!d) return [];
  const raw = d.units ?? d.contract_units ?? d.contract?.contract_units ?? [];
  return Array.isArray(raw) ? raw : [];
});

function formatProjectStatus(s) {
  if (s == null || s === '') return '—';
  const key = String(s).toLowerCase();
  const map = {
    pending: 'قيد الانتظار',
    approved: 'معتمد',
    completed: 'مكتمل',
    active: 'نشط',
    rejected: 'مرفوض',
  };
  return map[key] ?? s;
}

function formatUnitStatus(s) {
  if (s == null || s === '') return '—';
  const key = String(s).toLowerCase();
  const map = {
    available: 'متاحة',
    reserved: 'محجوزة',
    sold: 'مباعة',
    pending: 'قيد الانتظار',
  };
  return map[key] ?? s;
}

function formatPrice(n) {
  if (n == null || n === '') return '';
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return new Intl.NumberFormat('ar-SA').format(num);
}

/**
 * Resolve [lat, lng] from various backend shapes (flat fields, nested location, GeoJSON).
 */
function getLatLng(loc) {
  if (!loc || typeof loc !== 'object') return null;

  let lat;
  let lng;

  const locObj = loc.location;
  if (locObj && typeof locObj === 'object') {
    lat = locObj.lat ?? locObj.latitude;
    lng = locObj.lng ?? locObj.longitude;
  }

  lat = lat ?? loc.latitude ?? loc.lat ?? loc.map_latitude ?? loc.y;
  lng = lng ?? loc.longitude ?? loc.lng ?? loc.map_longitude ?? loc.x;

  if (Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
    lng = parseFloat(loc.coordinates[0]);
    lat = parseFloat(loc.coordinates[1]);
  }

  const geom = loc.geometry;
  if (geom?.type === 'Point' && Array.isArray(geom.coordinates) && geom.coordinates.length >= 2) {
    lng = parseFloat(geom.coordinates[0]);
    lat = parseFloat(geom.coordinates[1]);
  }

  lat = parseFloat(lat);
  lng = parseFloat(lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
  return null;
}

const hasMappablePins = computed(() => locations.value.some(l => getLatLng(l)));

function buildLocationsParams() {
  const p = { per_page: 200 };
  if (filters.status) p.status = filters.status;
  const uid = String(filters.user_id || '').trim();
  if (uid) p.user_id = uid;
  if (filters.city) p.city = filters.city;
  const dist = String(filters.district || '').trim();
  if (dist) p.district = dist;
  const pn = String(filters.project_name || '').trim();
  if (pn) p.project_name = pn;
  if (filters.has_photography === '1' || filters.has_photography === '0') {
    p.has_photography = filters.has_photography;
  }
  if (filters.has_montage === '1' || filters.has_montage === '0') {
    p.has_montage = filters.has_montage;
  }
  return p;
}

function collectCityOptions(arr) {
  const set = new Set();
  (arr || []).forEach(l => {
    if (l.city) set.add(l.city);
  });
  cityOptions.value = [...set].sort();
}

async function fetchLocations() {
  isLoading.value = true;
  try {
    const params = buildLocationsParams();
    const arr = await inventoryService.getContractsLocations(params);
    locations.value = Array.isArray(arr) ? arr : [];
    collectCityOptions(locations.value);
  } catch (e) {
    locations.value = [];
    toast.error(e?.message || 'فشل تحميل مواقع المشاريع');
  } finally {
    isLoading.value = false;
  }
}

/** After DOM shows the map container: init map + markers (must run when isLoading is false). */
async function syncMapAfterLoad() {
  await nextTick();
  if (!mapRef.value) await nextTick();
  if (!mapInstance.value) initMap();
  await nextTick();
  if (mapInstance.value) {
    mapInstance.value.invalidateSize();
    updateMarkers();
  }
}

function initMap() {
  if (!mapRef.value || mapInstance.value) return;
  mapInstance.value = L.map(mapRef.value).setView(RIYADH_CENTER, 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
  }).addTo(mapInstance.value);
}

function updateMarkers() {
  if (!mapInstance.value) return;
  if (markersLayer.value) {
    mapInstance.value.removeLayer(markersLayer.value);
    markersLayer.value = null;
  }
  const layer = L.layerGroup();
  const valid = [];

  locations.value.forEach(loc => {
    const coords = getLatLng(loc);
    if (!coords) return;
    valid.push(coords);
    const marker = L.marker(coords).addTo(layer);
    marker.on('click', () => {
      openPinDetail(loc);
    });
  });

  layer.addTo(mapInstance.value);
  markersLayer.value = layer;

  if (valid.length === 1) {
    mapInstance.value.setView(valid[0], 12);
  } else if (valid.length > 1) {
    const bounds = L.latLngBounds(valid);
    mapInstance.value.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
  } else {
    mapInstance.value.setView(RIYADH_CENTER, 10);
  }
}

async function openPinDetail(loc) {
  selectedLocation.value = loc;
  projectDetail.value = null;
  const contractId = loc.contract_id ?? loc.contractId ?? loc.id;
  if (!contractId) {
    toast.warning('لا يوجد رقم عقد لهذا الموقع');
    return;
  }
  detailLoading.value = true;
  try {
    projectDetail.value = await inventoryService.getContractUnitsShow(contractId);
  } catch (e) {
    projectDetail.value = null;
    toast.error(e?.message || 'فشل تحميل تفاصيل المشروع');
  } finally {
    detailLoading.value = false;
  }
}

function closeCard() {
  selectedLocation.value = null;
  projectDetail.value = null;
}

async function applyFilters() {
  await fetchLocations();
  await syncMapAfterLoad();
}

onMounted(async () => {
  await fetchLocations();
  await syncMapAfterLoad();
});

onUnmounted(() => {
  if (mapInstance.value) {
    mapInstance.value.remove();
    mapInstance.value = null;
  }
  markersLayer.value = null;
});
</script>

<style scoped src="./styles/InventoryProjectsTab.scoped.s1.css"></style>
