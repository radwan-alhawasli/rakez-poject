<template>
  <div class="editor-projects-view">
    <!-- طابور قبول الوسائط (مدير): بعد المونتاج + قيد المراجعة فقط -->
    <template v-if="isPendingQueueOnly">
      <div class="page-header">
        <h1 class="page-title">قبول الوسائط</h1>
        <p class="page-subtitle">
          مشاريع أُكمل مونتاجها وبانتظار اعتمادك أو رفضها.
        </p>
      </div>
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل المشاريع...</p>
      </div>
      <section v-else class="content-panel">
        <div v-if="afterMontageListForView.length === 0" class="empty-state">
          <p>لا توجد مشاريع بانتظار قبول الوسائط.</p>
        </div>
        <div v-else class="cards-grid">
          <EditorProjectCard
            v-for="p in afterMontageListForView"
            :key="p.id"
            :project="p"
            variant="after"
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
      </section>
    </template>

    <template v-else>
      <div class="page-header">
        <h1 class="page-title">المشاريع</h1>
        <p class="page-subtitle">
          التبويبان يصفّان القائمة: «قبل المونتاج» لما يحتاج إدخال/تصحيح روابط المونتاج؛ «بعد المونتاج» يعرض فقط المشاريع التي لديها روابط كاملة في <strong>قسم المونتاج</strong> وليست بحالة رفض.
        </p>
      </div>

      <div class="tabs-row" role="tablist" aria-label="تصفية المشاريع حسب مرحلة المونتاج">
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'before'"
          :class="['tab-btn', { active: activeTab === 'before' }]"
          @click="goProjectsTab('before')"
        >
          قبل المونتاج ({{ beforeMontage.length }})
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'after'"
          :class="['tab-btn', { active: activeTab === 'after' }]"
          @click="goProjectsTab('after')"
        >
          بعد المونتاج ({{ afterMontage.length }})
        </button>
      </div>
      <p v-if="activeTab === 'after'" class="tab-filter-hint" role="note">
        تصفية نشطة: مشاريع بروابط مونتاج كاملة (صورة، فيديو، وصف) وحالة المونتاج ليست «مرفوض» — يشمل الروابط المحفوظة في قسم المونتاج أو الواردة على العقد.
      </p>

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
              variant="before"
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
          <div v-else class="cards-grid">
            <EditorProjectCard
              v-for="p in afterMontageListForView"
              :key="p.id"
              :project="p"
              variant="after"
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
        </section>
      </template>
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
          <div v-if="detail || montageData" class="detail-fields photography-source-block">
            <h4 class="modal-section-title">بيانات التصوير الأصلية (مرجع للمحرر)</h4>
            <p><strong>رقم المعلن:</strong> <span :class="{ 'value-null': !photographySourceDetail.advertiser_number || photographySourceDetail.advertiser_number === '—' }">{{ photographySourceDetail.advertiser_number ?? '—' }}</span></p>
            <p><strong>حالة التصوير:</strong>
              <span
                class="status-badge inline-status"
                :class="photographySourceDetail.photography_status.class"
              >{{ photographySourceDetail.photography_status.label }}</span>
            </p>
            <p><strong>رابط التصوير (الأصل):</strong>
              <a v-if="photographySourceDetail.photography_link && photographySourceDetail.photography_link !== '—'" :href="photographySourceDetail.photography_link" target="_blank" rel="noopener noreferrer" class="link-cell">{{ photographySourceDetail.photography_link }}</a>
              <span v-else :class="{ 'value-null': true }">—</span></p>
            <p><strong>رابط الفيديو (الأصل):</strong>
              <a v-if="photographySourceDetail.video_link && photographySourceDetail.video_link !== '—'" :href="photographySourceDetail.video_link" target="_blank" rel="noopener noreferrer" class="link-cell">{{ photographySourceDetail.video_link }}</a>
              <span v-else :class="{ 'value-null': true }">—</span></p>
            <p><strong>الوصف (الأصل):</strong> <span :class="{ 'value-null': photographySourceDetail.description === '—' }">{{ photographySourceDetail.description ?? '—' }}</span></p>
            <p><strong>الوحدات المتاحة:</strong> <span :class="{ 'value-null': photographySourceDetail.available_units == null }">{{ photographySourceDetail.available_units !== undefined && photographySourceDetail.available_units !== null ? photographySourceDetail.available_units : '—' }}</span></p>
          </div>
          <!-- سبب رفض المونتاج (يظهر عند الرفض فقط) -->
          <div v-if="montageRejectionNote" class="rejection-details-panel" role="region" aria-label="تفاصيل رفض المونتاج">
            <h4 class="rejection-details-panel__title">تفاصيل رفض المونتاج</h4>
            <p class="rejection-details-panel__body">{{ montageRejectionNote }}</p>
            <p class="rejection-details-panel__hint">عند تحديث روابط المونتاج أو الوصف والضغط على «حفظ» أو «تحديث» يُعاد إرسال العمل لـ <strong>قيد المراجعة</strong> بعد اعتماد الخادم.</p>
          </div>
          <!-- Montage form: images, videos, description -->
          <div class="montage-form-section">
            <h4>مخرجات المونتاج (الروابط بعد التعديل)</h4>
            <p class="montage-form-hint">
              أدخل روابط الصور والفيديو والوصف <strong>بعد المونتاج</strong>؛ عند اكتمال الحقول الثلاثة يُرسل الطلب إلى تبويب «بعد المونتاج» لمراجعة المدير.
            </p>
            <div class="form-grid">
              <div class="form-group">
                <label>رابط صور المونتاج</label>
                <input v-model="montageForm.image_url" type="text" class="form-input" placeholder="URL" />
              </div>
              <div class="form-group">
                <label>رابط فيديو المونتاج</label>
                <input v-model="montageForm.video_url" type="text" class="form-input" placeholder="URL" />
              </div>
              <div class="form-group full-width">
                <label>وصف المونتاج</label>
                <textarea v-model="montageForm.description" class="form-input" rows="3" placeholder="وصف المحتوى بعد المونتاج"></textarea>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="closeDetail">إغلاق</button>
              <button type="button" class="btn-primary" :disabled="montageSaving" @click="submitMontage">
                {{ montageData && Object.keys(montageData).length ? 'تحديث' : 'حفظ' }}
              </button>
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
  isPendingQueueOnly,
  afterMontageListForView,
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
  photographySourceDetail,
  seeMoreDisplay,
  seeMoreUnits,
  goProjectsTab,
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
} = useEditorProjectsView();
</script>


<style scoped src="./styles/EditorProjectsView.scoped.s1.css"></style>
