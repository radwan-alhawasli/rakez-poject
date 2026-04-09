<template>
  <div class="inventory-projects-tab">
    <div class="welcome-header">
      <h1 class="welcome-title">المشاريع على الخريطة</h1>
      <p class="welcome-subtitle">عرض مواقع المشاريع من واجهة المخزون — اضغط على الدبوس لعرض التفاصيل والوحدات.</p>
    </div>

    <div class="inventory-project-filter-bar">
      <div class="filter-group filter-group-project">
        <label for="inventory-project-select">المشروع</label>
        <select
          id="inventory-project-select"
          v-model="selectedProjectName"
          class="filter-select filter-select-project"
        >
          <option value="">كل المشاريع</option>
          <option v-for="name in projectNameOptions" :key="name" :value="name">{{ name }}</option>
        </select>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل المواقع...</p>
    </div>

    <div v-else-if="locations.length === 0" class="empty-state">
      <p>لا توجد مشاريع للعرض على الخريطة.</p>
    </div>

    <div v-else-if="filteredLocations.length === 0" class="empty-state">
      <p>لا يوجد مشروع بهذا الاسم في القائمة المحمّلة.</p>
    </div>

    <div v-else class="map-container">
      <div
        v-if="filteredLocations.length && !hasMappablePins"
        class="map-coords-warning"
        role="status"
      >
        تم جلب {{ filteredLocations.length }} مشروعاً{{ selectedProjectName ? ' (بعد التصفية)' : '' }}، لكن لا توجد إحداثيات صالحة (lat/lng) في البيانات — لن تظهر دبابيس حتى يوفّر الـ API حقول الإحداثيات.
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
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

/** إطار تقريبي للرياض الكبرى — عند عدم وجود دبابيس أو عند التحميل الأول */
const RIYADH_METRO_BOUNDS = [
  [24.38, 46.38],
  [25.05, 47.1],
];

const selectedProjectName = ref('');

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
  return new Intl.NumberFormat('ar-SA', { numberingSystem: 'latn' }).format(num);
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

const projectNameOptions = computed(() => {
  const set = new Set();
  locations.value.forEach(l => {
    const n = String(l.project_name ?? l.name ?? '').trim();
    if (n) set.add(n);
  });
  return [...set].sort((a, b) => a.localeCompare(b, 'ar'));
});

const filteredLocations = computed(() => {
  const q = selectedProjectName.value.trim();
  if (!q) return locations.value;
  return locations.value.filter(l => String(l.project_name ?? l.name ?? '').trim() === q);
});

const hasMappablePins = computed(() => filteredLocations.value.some(l => getLatLng(l)));

async function fetchLocations() {
  isLoading.value = true;
  try {
    const arr = await inventoryService.getContractsLocations({ per_page: 500 });
    locations.value = Array.isArray(arr) ? arr : [];
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
  mapInstance.value = L.map(mapRef.value, { zoomControl: true });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
  }).addTo(mapInstance.value);
  mapInstance.value.fitBounds(RIYADH_METRO_BOUNDS, { padding: [20, 20], maxZoom: 12 });
}

function updateMarkers() {
  if (!mapInstance.value) return;
  if (markersLayer.value) {
    mapInstance.value.removeLayer(markersLayer.value);
    markersLayer.value = null;
  }
  const layer = L.layerGroup();
  const valid = [];

  filteredLocations.value.forEach(loc => {
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
    mapInstance.value.fitBounds(RIYADH_METRO_BOUNDS, { padding: [28, 28], maxZoom: 12 });
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

watch(
  filteredLocations,
  async () => {
    closeCard();
    await nextTick();
    if (mapInstance.value) updateMarkers();
  },
  { deep: true },
);

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
