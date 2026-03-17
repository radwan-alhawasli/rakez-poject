<template>
  <div class="inventory-projects-tab">
    <div class="welcome-header">
      <h1 class="welcome-title">المشاريع على الخريطة</h1>
      <p class="welcome-subtitle">عرض المشاريع ومواقعها مع إمكانية الفلترة.</p>
    </div>

    <div class="filters-bar">
      <div class="filter-group">
        <label>المدينة</label>
        <select v-model="filterCity" class="filter-select">
          <option value="">الكل</option>
          <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>نوع الوحدة</label>
        <select v-model="filterUnitType" class="filter-select">
          <option value="">الكل</option>
          <option v-for="u in unitTypes" :key="u" :value="u">{{ u }}</option>
        </select>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل المواقع...</p>
    </div>

    <div v-else class="map-container">
      <div ref="mapRef" class="map-inner"></div>

      <div v-if="selectedProject" class="project-card-popup">
        <div class="card-header">
          <h4>{{ selectedProject.project_name || selectedProject.name || 'مشروع' }}</h4>
          <button type="button" class="close-btn" @click="selectedProject = null" aria-label="إغلاق">×</button>
        </div>
        <div class="card-body">
          <p><strong>نوع الوحدة:</strong> {{ selectedProject.unit_type || selectedProject.unit_types || '—' }}</p>
          <p><strong>الحالة:</strong> {{ selectedProject.status || '—' }}</p>
          <router-link
            v-if="selectedProject.id || selectedProject.contract_id"
            :to="{ name: 'ContractForm', params: { id: selectedProject.id || selectedProject.contract_id } }"
            class="see-more-link"
          >
            عرض المزيد
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="!isLoading && locations.length === 0" class="empty-state">
      <p>لا توجد مشاريع بمواقع لعرضها.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import inventoryService from '@/services/inventoryService';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon with Vite
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIconUrl, iconRetinaUrl: markerIconRetinaUrl, shadowUrl: markerShadowUrl });

const mapRef = ref(null);
const mapInstance = ref(null);
const locations = ref([]);
const isLoading = ref(true);
const selectedProject = ref(null);
const filterCity = ref('');
const filterUnitType = ref('');

const cities = ref([]);
const unitTypes = ref([]);

const RIYADH_CENTER = [24.7136, 46.6753];

function getLatLng(loc) {
  const lat = parseFloat(loc.latitude ?? loc.lat ?? loc.y);
  const lng = parseFloat(loc.longitude ?? loc.lng ?? loc.x);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
  return null;
}

async function fetchLocations() {
  isLoading.value = true;
  try {
    const params = {};
    if (filterCity.value) params.city = filterCity.value;
    let data = await inventoryService.getContractsLocations({ ...params, per_page: 200 });
    let arr = Array.isArray(data) ? data : (data?.data ?? []);
    if (arr.length === 0) {
      const indexRes = await inventoryService.getContractsAdminIndex({ per_page: 200 });
      arr = (indexRes?.items ?? []).map((c, i) => ({
        ...c,
        project_name: c.project_name || c.name || c.contract_number,
        latitude: 24.7136 + (i % 5) * 0.05,
        longitude: 46.6753 + (i % 5) * 0.05,
      }));
    }
    locations.value = arr;

    const citySet = new Set();
    const unitSet = new Set();
    arr.forEach(l => {
      if (l.city) citySet.add(l.city);
      if (l.unit_type) unitSet.add(l.unit_type);
      if (l.unit_types) (Array.isArray(l.unit_types) ? l.unit_types : [l.unit_types]).forEach(u => unitSet.add(u));
    });
    cities.value = [...citySet].sort();
    unitTypes.value = [...unitSet].sort();
  } catch (e) {
    locations.value = [];
  } finally {
    isLoading.value = false;
  }
}

function initMap() {
  if (!mapRef.value || mapInstance.value) return;
  mapInstance.value = L.map(mapRef.value).setView(RIYADH_CENTER, 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(mapInstance.value);
}

function updateMarkers() {
  if (!mapInstance.value) return;
  if (window._inventoryMarkersLayer) {
    mapInstance.value.removeLayer(window._inventoryMarkersLayer);
  }
  const layer = L.layerGroup();
  const filtered = filterUnitType.value
    ? locations.value.filter(l => (l.unit_type || '').includes(filterUnitType.value) || (l.unit_types || []).includes(filterUnitType.value))
    : locations.value;

  filtered.forEach(loc => {
    const coords = getLatLng(loc);
    if (!coords) return;
    const marker = L.marker(coords).addTo(layer);
    marker.on('click', () => {
      selectedProject.value = loc;
    });
  });

  layer.addTo(mapInstance.value);
  window._inventoryMarkersLayer = layer;
}

watch([filterCity, filterUnitType], () => {
  if (filterCity.value) fetchLocations();
  else updateMarkers();
});

onMounted(async () => {
  await fetchLocations();
  initMap();
  setTimeout(updateMarkers, 100);
});

onUnmounted(() => {
  if (mapInstance.value) {
    mapInstance.value.remove();
    mapInstance.value = null;
  }
  window._inventoryMarkersLayer = null;
});
</script>

<style scoped>
.inventory-projects-tab {
  direction: rtl;
}

.welcome-header {
  margin-bottom: 24px;
  text-align: right;
}

.welcome-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.welcome-subtitle {
  font-size: 0.95rem;
  color: var(--color-dark-gray);
  margin: 0;
}

.filters-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-dark-gray);
}

.filter-select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(177, 162, 143, 0.3);
  min-width: 160px;
  font-size: 14px;
}

.map-container {
  position: relative;
  height: 500px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(177, 162, 143, 0.2);
}

.map-inner {
  width: 100%;
  height: 100%;
}

.project-card-popup {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 280px;
  background: var(--color-white);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(177, 162, 143, 0.2);
  z-index: 1000;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(177, 162, 143, 0.15);
}

.card-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-dark-gray);
  line-height: 1;
}

.card-body {
  padding: 16px;
}

.card-body p {
  margin: 0 0 8px 0;
  font-size: 14px;
}

.see-more-link {
  display: inline-block;
  margin-top: 12px;
  color: var(--color-gold);
  font-weight: 600;
  text-decoration: none;
}

.see-more-link:hover {
  text-decoration: underline;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(177, 162, 143, 0.2);
  border-top-color: var(--color-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
