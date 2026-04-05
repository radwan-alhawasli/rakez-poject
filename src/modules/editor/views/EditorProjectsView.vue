<template>
  <div class="editor-projects-view">
    <div class="page-header">
      <h1 class="page-title">المشاريع</h1>
      <p class="page-subtitle">قبل المونتاج وبعد المونتاج حسب حالة التصوير والمونتاج.</p>
    </div>

    <div class="tabs-row">
      <button
        :class="['tab-btn', { active: activeTab === 'before' }]"
        @click="activeTab = 'before'"
      >
        قبل المونتاج ({{ beforeMontage.length }})
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'after' }]"
        @click="activeTab = 'after'"
      >
        بعد المونتاج ({{ afterMontage.length }})
      </button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل المشاريع...</p>
    </div>

    <template v-else>
      <!-- Before Montage -->
      <section v-if="activeTab === 'before'" class="content-panel">
        <div v-if="beforeMontage.length === 0" class="empty-state">
          <p>لا توجد مشاريع قبل المونتاج.</p>
        </div>
        <div v-else class="cards-grid">
          <EditorProjectCard
            v-for="p in beforeMontage"
            :key="p.id"
            :project="p"
            :is-manager="isManager"
            status-label="قبل المونتاج"
            status-class="status-pending"
            @add-links="openDetail($event)"
            @see-more="openSeeMore($event)"
            @approve="doApprove($event.id)"
            @reject="openRejectModal($event.id)"
          />
        </div>
      </section>

      <!-- After Montage -->
      <section v-if="activeTab === 'after'" class="content-panel">
        <div v-if="afterMontage.length === 0" class="empty-state">
          <p>لا توجد مشاريع بعد المونتاج.</p>
        </div>
        <template v-else>
          <div class="cards-grid">
            <EditorProjectCard
              v-for="p in afterMontage"
              :key="p.id"
              :project="p"
              :is-manager="isManager"
              :status-label="montageStatusLabel(p)"
              :status-class="montageStatusClass(p)"
              :has-links="isManager ? (montageHasLinksMap[p.id] ?? null) : null"
              compact-links
              @add-links="openDetail($event)"
              @see-more="openSeeMore($event)"
              @approve="doApprove($event.id)"
              @reject="openRejectModal($event.id)"
            />
          </div>
        </template>
      </section>
    </template>

    <!-- Detail + Montage Modal -->
    <div v-if="selectedProject" class="modal-overlay" @click.self="closeDetail">
      <div class="modal-box modal-large">
        <div class="modal-header">
          <h2>{{ selectedProject.name || selectedProject.project_name || selectedProject.title || selectedProject.project_title || selectedProject.contract_number || 'تفاصيل المشروع' }}</h2>
          <button type="button" class="btn-close" @click="closeDetail">×</button>
        </div>
        <div v-if="detailLoading" class="loading-inline">جاري تحميل التفاصيل...</div>
        <template v-else>
          <div v-if="detail || montageData" class="detail-fields">
            <p><strong>رقم المعلن:</strong> <span :class="{ 'value-null': !displayDetail.advertiser_number }">{{ displayDetail.advertiser_number ?? '—' }}</span></p>
            <p><strong>رابط التصوير:</strong>
              <a v-if="displayDetail.photography_link && displayDetail.photography_link !== '—'" :href="displayDetail.photography_link" target="_blank" rel="noopener noreferrer" class="link-cell">{{ displayDetail.photography_link }}</a>
              <span v-else :class="{ 'value-null': true }">—</span></p>
            <p><strong>رابط الفيديو:</strong>
              <a v-if="displayDetail.video_link && displayDetail.video_link !== '—'" :href="displayDetail.video_link" target="_blank" rel="noopener noreferrer" class="link-cell">{{ displayDetail.video_link }}</a>
              <span v-else :class="{ 'value-null': true }">—</span></p>
            <p><strong>الوصف:</strong> <span :class="{ 'value-null': !displayDetail.description }">{{ displayDetail.description ?? '—' }}</span></p>
            <p><strong>الوحدات المتاحة:</strong> <span :class="{ 'value-null': displayDetail.available_units == null }">{{ displayDetail.available_units !== undefined && displayDetail.available_units !== null ? displayDetail.available_units : '—' }}</span></p>
          </div>
          <!-- سبب رفض المونتاج (يظهر عند الرفض فقط) -->
          <div v-if="montageRejectionNote" class="rejection-details-panel" role="region" aria-label="تفاصيل رفض المونتاج">
            <h4 class="rejection-details-panel__title">تفاصيل رفض المونتاج</h4>
            <p class="rejection-details-panel__body">{{ montageRejectionNote }}</p>
            <p class="rejection-details-panel__hint">عند تحديث الروابط أو الوصف والضغط على «تحديث» يُعاد إرسال العمل لـ <strong>قيد المراجعة</strong> بعد اعتماد الخادم.</p>
          </div>
          <!-- Montage form: images, videos, description -->
          <div class="montage-form-section">
            <h4>قسم المونتاج (صور، فيديو، وصف)</h4>
            <div class="form-grid">
              <div class="form-group">
                <label>رابط الصور</label>
                <input v-model="montageForm.image_url" type="text" class="form-input" placeholder="URL" />
              </div>
              <div class="form-group">
                <label>رابط الفيديو</label>
                <input v-model="montageForm.video_url" type="text" class="form-input" placeholder="URL" />
              </div>
              <div class="form-group full-width">
                <label>الوصف</label>
                <textarea v-model="montageForm.description" class="form-input" rows="3" placeholder="الوصف"></textarea>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="closeDetail">إغلاق</button>
              <button type="button" class="btn-primary" :disabled="montageSaving" @click="submitMontage">
                {{ montageData && Object.keys(montageData).length ? 'تحديث' : 'حفظ' }}
              </button>
            </div>
          </div>
          <!-- Manager: Approve / Reject (after montage only, إن لم يُعتمد/يُرفض بعد) -->
          <div
            v-if="
              isManager &&
              activeTab === 'after' &&
              montageData &&
              (selectedProject.has_montage_data == 1 || selectedProject.has_montage == 1 || selectedProject.has_montage === true) &&
              !isMontageDecisionFinal(selectedProject, montageStatusLabel(selectedProject))
            "
            class="manager-actions"
          >
            <h4>قرار المدير</h4>
            <div class="action-buttons">
              <button type="button" class="btn-approve" @click="doApprove(selectedProject.id)">قبول</button>
              <button type="button" class="btn-reject" @click="openRejectModal(selectedProject.id)">رفض</button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- See More modal (third screen): detail only, expandable long content -->
    <div v-if="seeMoreProject" class="modal-overlay" @click.self="closeSeeMore">
      <div class="modal-box modal-large modal-see-more">
        <div class="modal-header">
          <h2>{{ seeMoreProject.name || seeMoreProject.project_name || seeMoreProject.title || seeMoreProject.contract_number || 'تفاصيل المشروع' }}</h2>
          <button type="button" class="btn-close" @click="closeSeeMore">×</button>
        </div>
        <div v-if="seeMoreLoading" class="loading-inline">جاري تحميل التفاصيل...</div>
        <template v-else>
          <div class="detail-fields see-more-fields">
            <div class="detail-field" :class="{ expanded: seeMoreExpanded.advertiser }">
              <p><strong>رقم المعلن:</strong> <span :class="{ 'value-null': !seeMoreDisplay.advertiser_number }">{{ seeMoreDisplay.advertiser_number ?? '—' }}</span></p>
              <button v-if="isLongContent(seeMoreDisplay.advertiser_number)" type="button" class="btn-expand" @click="seeMoreExpanded.advertiser = !seeMoreExpanded.advertiser">{{ seeMoreExpanded.advertiser ? 'عرض أقل' : 'عرض المزيد' }}</button>
            </div>
            <div class="detail-field" :class="{ expanded: seeMoreExpanded.photography }">
              <p><strong>رابط التصوير:</strong>
                <a v-if="seeMoreDisplay.photography_link" :href="seeMoreDisplay.photography_link" target="_blank" rel="noopener noreferrer" class="link-cell">{{ seeMoreExpanded.photography ? seeMoreDisplay.photography_link : truncateUrl(seeMoreDisplay.photography_link) }}</a>
                <span v-else :class="{ 'value-null': true }">—</span>
              </p>
              <button v-if="isLongContent(seeMoreDisplay.photography_link)" type="button" class="btn-expand" @click="seeMoreExpanded.photography = !seeMoreExpanded.photography">{{ seeMoreExpanded.photography ? 'عرض أقل' : 'عرض المزيد' }}</button>
            </div>
            <div class="detail-field" :class="{ expanded: seeMoreExpanded.video }">
              <p><strong>رابط الفيديو:</strong>
                <a v-if="seeMoreDisplay.video_link" :href="seeMoreDisplay.video_link" target="_blank" rel="noopener noreferrer" class="link-cell">{{ seeMoreExpanded.video ? seeMoreDisplay.video_link : truncateUrl(seeMoreDisplay.video_link) }}</a>
                <span v-else :class="{ 'value-null': true }">—</span>
              </p>
              <button v-if="isLongContent(seeMoreDisplay.video_link)" type="button" class="btn-expand" @click="seeMoreExpanded.video = !seeMoreExpanded.video">{{ seeMoreExpanded.video ? 'عرض أقل' : 'عرض المزيد' }}</button>
            </div>
            <div class="detail-field" :class="{ expanded: seeMoreExpanded.description }">
              <p><strong>الوصف:</strong> <span :class="{ 'value-null': !seeMoreDisplay.description }">{{ seeMoreExpanded.description ? (seeMoreDisplay.description ?? '—') : (truncateText(seeMoreDisplay.description, 80) ?? '—') }}</span></p>
              <button v-if="isLongContent(seeMoreDisplay.description)" type="button" class="btn-expand" @click="seeMoreExpanded.description = !seeMoreExpanded.description">{{ seeMoreExpanded.description ? 'عرض أقل' : 'عرض المزيد' }}</button>
            </div>
            <div class="detail-field" :class="{ expanded: seeMoreExpanded.units }">
              <p><strong>الوحدات المتاحة:</strong> <span :class="{ 'value-null': seeMoreDisplay.available_units == null }">{{ seeMoreDisplay.available_units !== undefined && seeMoreDisplay.available_units !== null ? seeMoreDisplay.available_units : '—' }}</span></p>
              <div v-if="seeMoreUnits.length" class="units-list">
                <button type="button" class="btn-expand" @click="seeMoreExpanded.units = !seeMoreExpanded.units">{{ seeMoreExpanded.units ? 'إخفاء تفاصيل الوحدات' : 'عرض تفاصيل الوحدات (' + seeMoreUnits.length + ')' }}</button>
                <ul v-if="seeMoreExpanded.units" class="units-expanded">
                  <li v-for="(u, i) in seeMoreUnits" :key="u.id || i">
                    {{ u.unit_type }} {{ u.unit_number }} — {{ u.status }} — {{ formatPrice(u.price) }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div v-if="seeMoreMontageRejection" class="rejection-details-panel" role="region" aria-label="تفاصيل رفض المونتاج">
            <h4 class="rejection-details-panel__title">تفاصيل رفض المونتاج</h4>
            <p class="rejection-details-panel__body">{{ seeMoreMontageRejection }}</p>
          </div>
          <div v-if="seeMoreMontageStatusLine" class="see-more-montage-status">
            <p><strong>حالة اعتماد المونتاج:</strong> {{ seeMoreMontageStatusLine }}</p>
          </div>
        </template>
      </div>
    </div>

    <!-- Reject reason modal -->
    <div v-if="rejectTargetId" class="modal-overlay" @click.self="rejectTargetId = null">
      <div class="modal-box">
        <h3>سبب الرفض</h3>
        <textarea v-model="rejectReason" class="form-input" rows="4" placeholder="أدخل سبب الرفض (إجباري)"></textarea>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="rejectTargetId = null">إلغاء</button>
          <button type="button" class="btn-reject" :disabled="!rejectReason.trim()" @click="doReject">إرسال الرفض</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import EditorProjectCard from '@/modules/editor/components/EditorProjectCard.vue';
import { useEditorProjectsView } from '@/modules/editor/composables/useEditorProjectsView';

const {
  isLoading,
  beforeMontage,
  afterMontage,
  detail,
  detailLoading,
  montageData,
  isManager,
  activeTab,
  selectedProject,
  montageForm,
  montageSaving,
  rejectTargetId,
  rejectReason,
  seeMoreProject,
  seeMoreLoading,
  seeMoreExpanded,
  montageRejectionNote,
  seeMoreMontageRejection,
  seeMoreMontageStatusLine,
  displayDetail,
  seeMoreDisplay,
  seeMoreUnits,
  openDetail,
  openSeeMore,
  closeSeeMore,
  closeDetail,
  isLongContent,
  truncateText,
  truncateUrl,
  formatPrice,
  montageStatusLabel,
  montageStatusClass,
  montageHasLinksMap,
  submitMontage,
  doApprove,
  openRejectModal,
  doReject,
  isMontageDecisionFinal,
} = useEditorProjectsView();
</script>


<style scoped src="./styles/EditorProjectsView.scoped.s1.css"></style>
