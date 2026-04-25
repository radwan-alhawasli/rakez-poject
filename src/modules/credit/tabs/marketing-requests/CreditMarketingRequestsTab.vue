<template>
  <div class="management-view">
    <div class="section-header-compact">
      <div>
        <h2 class="section-title">طلب تسويق</h2>
        <p class="section-subtitle">إدارة طلبات التسويق الخاصة بالمطورين</p>
      </div>
      <button class="btn-primary" @click="openCreate">إضافة طلب جديد</button>
    </div>

    <div class="metrics-table-container">
      <div class="table-responsive">
        <table class="metrics-table table-mobile-stacked">
          <thead>
            <tr>
              <th>#</th>
              <th>اسم المطور</th>
              <th>رقم المطور</th>
              <th>الوصف</th>
              <th>منشئ الطلب</th>
              <th>تاريخ الإنشاء</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="7" class="text-center py-4">جاري التحميل...</td>
            </tr>
            <tr v-else-if="requestsList.length === 0">
              <td colspan="7" class="text-center py-4">لا توجد طلبات تسويق</td>
            </tr>
            <tr v-for="(req, index) in requestsList" :key="req.id">
              <td data-label="#">{{ index + 1 + (currentPage - 1) * perPage }}</td>
              <td data-label="اسم المطور">{{ req.developer_name || '—' }}</td>
              <td data-label="رقم المطور"><span dir="ltr">{{ req.developer_number || '—' }}</span></td>
              <td data-label="الوصف" class="max-w-xs truncate" :title="req.description">{{ req.description || '—' }}</td>
              <td data-label="منشئ الطلب">{{ req.created_by?.name || '—' }}</td>
              <td data-label="تاريخ الإنشاء">{{ formatDate(req.created_at) }}</td>
              <td data-label="الإجراءات">
                <RowActions>
                  <button type="button" class="btn-action edit" @click="openEdit(req)">تعديل</button>
                  <button type="button" class="btn-action delete" @click="openDelete(req)">حذف</button>
                  <template #menu>
                    <DropdownMenuItem @click="openEdit(req)">تعديل</DropdownMenuItem>
                    <DropdownMenuItem @click="openDelete(req)">حذف</DropdownMenuItem>
                    <DropdownMenuItem v-if="req.location" @click="openLocation(req.location)">فتح الرابط</DropdownMenuItem>
                  </template>
                </RowActions>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Pagination
      v-if="totalItems > 0"
      :current-page="currentPage"
      :total-items="totalItems"
      :per-page="perPage"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    />

    <!-- Create Modal -->
    <AppModal v-if="showCreateModal" :open="true" title="إضافة طلب تسويق" @update:open="(v) => { if (!v) showCreateModal = false }">
      <template #default>
        <div class="form-group">
          <label class="form-label">اسم المطور</label>
          <input v-model="form.developer_name" type="text" class="form-input" placeholder="اسم المطور" />
        </div>
        <div class="form-group">
          <label class="form-label">رقم المطور</label>
          <input v-model="form.developer_number" type="text" class="form-input" placeholder="رقم المطور" dir="ltr" />
        </div>
        <div class="form-group">
          <label class="form-label">الرابط / الموقع (Location)</label>
          <input v-model="form.location" type="text" class="form-input" placeholder="https://..." dir="ltr" />
        </div>
        <div class="form-group">
          <label class="form-label">الوصف</label>
          <textarea v-model="form.description" class="form-input" rows="3" placeholder="وصف إضافي..."></textarea>
        </div>
      </template>
      <template #footer>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showCreateModal = false">إلغاء</button>
          <button class="btn-primary" @click="createRequest" :disabled="isSaving">{{ isSaving ? 'جاري الحفظ...' : 'حفظ' }}</button>
        </div>
      </template>
    </AppModal>

    <!-- Edit Modal -->
    <AppModal v-if="showEditModal" :open="true" title="تعديل طلب تسويق" @update:open="(v) => { if (!v) showEditModal = false }">
      <template #default>
        <div class="form-group">
          <label class="form-label">اسم المطور</label>
          <input v-model="form.developer_name" type="text" class="form-input" placeholder="اسم المطور" />
        </div>
        <div class="form-group">
          <label class="form-label">رقم المطور</label>
          <input v-model="form.developer_number" type="text" class="form-input" placeholder="رقم المطور" dir="ltr" />
        </div>
        <div class="form-group">
          <label class="form-label">الرابط / الموقع (Location)</label>
          <input v-model="form.location" type="text" class="form-input" placeholder="https://..." dir="ltr" />
        </div>
        <div class="form-group">
          <label class="form-label">الوصف</label>
          <textarea v-model="form.description" class="form-input" rows="3" placeholder="وصف إضافي..."></textarea>
        </div>
      </template>
      <template #footer>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showEditModal = false">إلغاء</button>
          <button class="btn-primary" @click="updateRequest" :disabled="isSaving">{{ isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات' }}</button>
        </div>
      </template>
    </AppModal>

    <!-- Delete Modal -->
    <AppModal v-if="showDeleteModal" :open="true" title="تأكيد الحذف" @update:open="(v) => { if (!v) showDeleteModal = false }">
      <template #default>
        <p>هل أنت متأكد من رغبتك في حذف طلب التسويق للمطور <strong>{{ selectedRequest?.developer_name }}</strong>؟</p>
      </template>
      <template #footer>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDeleteModal = false">إلغاء</button>
          <button class="btn-primary danger" style="background-color: #dc2626; color: white;" @click="deleteRequest" :disabled="isSaving">
            {{ isSaving ? 'جاري الحذف...' : 'حذف' }}
          </button>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Pagination from '@/components/Pagination.vue';
import AppModal from '@/components/AppModal.vue';
import RowActions from '@/components/RowActions.vue';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useMarketingRequests } from '@/composables/credit/useMarketingRequests';
import { useFormatters } from '@/composables/useFormatters';

const {
  isLoading,
  requestsList,
  currentPage,
  perPage,
  totalItems,
  loadRequests,
  handlePageChange,
  handlePerPageChange,
  showCreateModal,
  showEditModal,
  showDeleteModal,
  selectedRequest,
  form,
  isSaving,
  openCreate,
  openEdit,
  openDelete,
  createRequest,
  updateRequest,
  deleteRequest
} = useMarketingRequests();

const { formatDate } = useFormatters();

const openLocation = (url) => {
  if (url) {
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    window.open(url, '_blank');
  }
};

onMounted(() => {
  loadRequests();
});
</script>

<style scoped>
.text-center { text-align: center; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.max-w-xs { max-width: 20rem; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.danger { background-color: #dc2626 !important; color: white !important; border-color: #dc2626 !important; }
.danger:hover { background-color: #b91c1c !important; }
</style>
