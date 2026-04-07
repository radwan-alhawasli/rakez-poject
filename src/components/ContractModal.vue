<template>
  <AppModal
    :open="true"
    size="xl"
    subtitle="مراجعة كاملة لبيانات السجل قبل الموافقة أو الرفض."
    @update:open="(v) => { if (v === false) closeModal() }"
  >
    <template #title>
      <div class="header-title-row flex items-center gap-2 flex-wrap">
        <span class="font-extrabold text-[var(--color-navy)]">تفاصيل العقد/الطلب</span>
        <span :class="['status-badge-header', normalizedStatus]">
          {{
            normalizedStatus === 'approved'
              ? 'موافق عليه'
              : normalizedStatus === 'rejected'
              ? 'مرفوض'
              : 'معلق'
          }}
        </span>
      </div>
    </template>
    <div class="modal-content contract-acceptance-body">
      <div class="contract-detail-panels">
        <!-- بيانات المطور / الطرف الثاني -->
        <section class="details-section detail-panel">
          <div class="section-header">
            <div class="section-bar"></div>
            <h3 class="section-title">بيانات المطور</h3>
          </div>
          <div class="details-list">
            <div class="detail-row">
              <span class="detail-label">الاسم</span>
              <span class="detail-value">{{ contractDetails.name }}</span>
            </div>
            <div v-if="contractDetails.developerRole" class="detail-row">
              <span class="detail-label">الصفة</span>
              <span class="detail-value">{{ contractDetails.developerRole }}</span>
            </div>
            <div v-if="contractDetails.secondPartyCr" class="detail-row">
              <span class="detail-label">السجل التجاري</span>
              <span class="detail-value detail-value-mono">{{ contractDetails.secondPartyCr }}</span>
            </div>
            <div v-if="contractDetails.secondPartyEmail" class="detail-row">
              <span class="detail-label">البريد</span>
              <span class="detail-value detail-value-mono">{{ contractDetails.secondPartyEmail }}</span>
            </div>
            <div v-if="contractDetails.secondPartyPhone" class="detail-row">
              <span class="detail-label">الهاتف</span>
              <span class="detail-value detail-value-mono">{{ contractDetails.secondPartyPhone }}</span>
            </div>
          </div>
        </section>

        <!-- المشروع -->
        <section class="details-section detail-panel">
          <div class="section-header">
            <div class="section-bar"></div>
            <h3 class="section-title">المشروع</h3>
          </div>
          <div v-if="contractDetails.projectImageUrl" class="contract-modal-project-image-wrap">
            <img
              :src="contractDetails.projectImageUrl"
              alt="صورة المشروع"
              class="contract-modal-project-image"
              width="400"
              height="240"
              loading="lazy"
              @error="$event.target.style.display='none'"
            />
          </div>
          <div class="details-list">
            <div class="detail-row">
              <span class="detail-label">اسم المشروع</span>
              <span class="detail-value">{{ contractDetails.projectName }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">نوع الوحدات</span>
              <span class="detail-value">{{ contractDetails.unitType }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">عدد الوحدات</span>
              <span class="detail-value">{{ contractDetails.unitCount }}</span>
            </div>
            <div v-if="contractDetails.totalPrice" class="detail-row">
              <span class="detail-label">إجمالي السعر</span>
              <span class="detail-value highlight">{{ contractDetails.totalPrice }}</span>
            </div>
          </div>
        </section>
      </div>

      <!-- تفاصيل التسويق -->
      <section class="details-section detail-panel detail-panel--wide">
        <div class="section-header">
          <div class="section-bar"></div>
          <h3 class="section-title">تفاصيل التسويق</h3>
        </div>
        <div class="details-list details-list--cols">
          <div class="detail-row">
            <span class="detail-label">المسوق (جلب)</span>
            <span class="detail-value">{{ contractDetails.marketer }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">نسبة السعي</span>
            <span class="detail-value">{{ contractDetails.commissionPercent || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">السعي من</span>
            <span class="detail-value">{{ contractDetails.commissionFrom || '—' }}</span>
          </div>
        </div>
      </section>
    </div>
    <template #footer>
      <div class="modal-footer-action flex flex-col gap-3">
        <div
          v-if="normalizedStatus === 'pending' && hasPermission('contracts.approve')"
          class="contract-notes-wrap w-full"
        >
          <label class="contract-notes-label">ملاحظات (اختياري)</label>
          <textarea
            v-model="contractNotes"
            class="contract-notes-input"
            rows="2"
            placeholder="مثال: تمت المراجعة والموافقة"
          />
        </div>
        <div class="flex gap-3 justify-end flex-wrap w-full">
          <!-- شريط تأكيد من واجهة الموقع (بدون نافذة المتصفح) -->
          <div
            v-if="pendingConfirm"
            class="confirm-inline w-full rounded-xl border-2 p-4"
            :class="pendingConfirm === 'reject' ? 'confirm-inline-danger' : 'confirm-inline-info'"
          >
            <p class="confirm-inline-text">{{ pendingConfirm === 'approve' ? 'هل أنت متأكد من الموافقة على العقد؟' : 'هل أنت متأكد من رفض العقد؟' }}</p>
            <div class="confirm-inline-actions flex gap-2 justify-end flex-wrap">
              <button type="button" class="btn-close-large" :disabled="isActionLoading" @click="pendingConfirm = null">
                إلغاء
              </button>
              <button
                type="button"
                :class="pendingConfirm === 'approve' ? 'btn-approve' : 'btn-reject'"
                :disabled="isActionLoading"
                @click="confirmApproveOrReject"
              >
                {{ isActionLoading ? 'جاري التنفيذ...' : (pendingConfirm === 'approve' ? 'موافقة' : 'رفض') }}
              </button>
            </div>
          </div>
          <template v-else>
            <button @click="closeModal" class="btn-close-large" :disabled="isActionLoading">إغلاق</button>
            <div
              v-if="normalizedStatus === 'pending' && hasPermission('contracts.approve')"
              class="action-buttons flex gap-2"
            >
              <button type="button" class="btn-reject" :disabled="isActionLoading" @click="rejectContract">
                رفض العقد
              </button>
              <button type="button" class="btn-approve" :disabled="isActionLoading" @click="approveContract">
                الموافقة على العقد
              </button>
            </div>
          </template>
        </div>
      </div>
    </template>
  </AppModal>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppModal from '@/components/AppModal.vue'
import { usePermissions } from '@/composables/usePermissions'
import contractService from '@/services/contractService'
import { toast } from '@/composables/useToast'

export default {
  name: 'ContractModal',
  components: { AppModal },
  props: {
    contract: {
      type: Object,
      required: true,
    },
  },
  emits: ['close', 'approve', 'reject'],
  setup(props, { emit }) {
    const { hasPermission } = usePermissions();
    const isActionLoading = ref(false);
    /** تأكيد من واجهة الموقع: 'approve' | 'reject' | null */
    const pendingConfirm = ref(null);

    // Handle Escape key
    const handleEscape = e => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    // Lock body scroll when modal is open
    onMounted(() => {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    });

    onUnmounted(() => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    });

    const contractNotes = ref('');

    // بيانات تفاصيل العقد المحددة - ربط صحيح مع API
    const contractDetails = computed(() => {
      const c = props.contract || {};
      const sp =
        c.second_party_data && typeof c.second_party_data === 'object' ? c.second_party_data : {};

      // حساب عدد الوحدات ونوعها من units array إذا كان موجوداً
      let unitType = 'N/A';
      let unitCount = 0;

      if (c.units && Array.isArray(c.units) && c.units.length > 0) {
        // جمع عدد الوحدات من جميع العناصر
        unitCount = c.units.reduce((sum, unit) => sum + (parseInt(unit.count) || 0), 0);
        // أخذ نوع الوحدة من العنصر الأول (أو دمج الأنواع إذا كانت مختلفة)
        const types = c.units
          .map(u => u.type)
          .filter(t => t)
          .join('، ');
        unitType = types || 'N/A';
      } else {
        // استخدام الحقول المباشرة إذا لم يكن هناك units array
        unitType = c.unit_type || 'N/A';
        unitCount = c.units_count || c.unit_count || 0;
      }

      // نسبة السعي والسعي من — حقول مسطّحة أو داخل info / contract
      const commissionPercentRaw =
        c.commission_percent ??
        c.commission_percentage ??
        c.info?.commission_percent ??
        c.info?.commission_percentage ??
        c.contract?.commission_percent ??
        c.contract?.commission_percentage ??
        c.second_party_data?.commission_percent;
      let commissionPercent = '';
      if (commissionPercentRaw !== undefined && commissionPercentRaw !== null && String(commissionPercentRaw).trim() !== '') {
        const s = String(commissionPercentRaw).trim();
        if (s.includes('%')) {
          commissionPercent = s;
        } else {
          const n = parseFloat(s.replace(/,/g, ''));
          commissionPercent = Number.isFinite(n) ? `${n}%` : `${s}%`;
        }
      }
      const commissionFromRaw = (
        c.commission_from ??
        c.info?.commission_from ??
        c.contract?.commission_from ??
        ''
      )
        .toString()
        .trim()
        .toLowerCase();
      const commissionFrom =
        commissionFromRaw === 'owner'
          ? 'من المالك'
          : commissionFromRaw === 'partner' || commissionFromRaw === 'buyer'
            ? 'من المشتري'
            : commissionFromRaw
              ? String(c.commission_from ?? '')
              : '';

      // إجمالي السعر من API (total_price)
      const totalPrice =
        c.total_price != null && c.total_price !== ''
          ? Number(c.total_price).toLocaleString('ar-SA') + ' ر.س'
          : '';

      // صورة المشروع من الـ API — تعرض سواء معتمدة أو قيد المراجعة
      const photo = c.photography_department;
      const projectImageUrl =
        (c.project_image_url && String(c.project_image_url).trim()) ||
        (photo && (photo.image_url ?? photo.image) && String(photo.image_url || photo.image).trim()) ||
        (c.image && String(c.image).trim()) ||
        '';

      const secondPartyCr =
        sp.second_party_cr_number ??
        c.second_party_cr_number ??
        (c.developer_number != null ? String(c.developer_number) : '');
      const secondPartyEmail = (sp.second_party_email ?? c.second_party_email ?? '').toString().trim();
      const secondPartyPhone = (sp.second_party_phone ?? c.second_party_phone ?? '').toString().trim();
      const developerRole = (sp.second_party_role ?? c.second_party_role ?? '').toString().trim();

      return {
        // بيانات المطور — مسطّحة أو من second_party_data
        name:
          c.developer_name ||
          c.developer ||
          sp.second_party_name ||
          c.second_party_name ||
          'غير محدد',
        developerRole,
        secondPartyCr: secondPartyCr || '',
        secondPartyEmail,
        secondPartyPhone,

        // بيانات المشروع - من API الحقول الصحيحة (unit_count, total_price, project_image_url)
        projectName: c.project_name || 'غير محدد',
        projectImageUrl: projectImageUrl || null,
        unitType: unitType,
        unitCount: unitCount,
        totalPrice,

        // تفاصيل التسويق — مقدم الطلب من user.name أو created_by_name
        marketer: c.created_by_name || c.user?.name || c.marketer || c.marketer_name || 'غير محدد',

        // نسبة السعي والسعي من (فارغ إن لم يرجعه الـ API)
        commissionPercent,
        commissionFrom,
      };
    });

    // حساب الحالة المعيارية للعرض والتحقق
    const normalizedStatus = computed(() => {
      const s = props.contract?.status ? String(props.contract.status).toLowerCase() : 'pending';
      if (s === 'approved') return 'approved';
      if (s === 'rejected' || s === 'refused') return 'rejected';
      return 'pending';
    });

    const closeModal = () => {
      emit('close');
    };

    /** فتح شريط التأكيد (من واجهة الموقع) */
    const approveContract = () => { pendingConfirm.value = 'approve'; };
    const rejectContract = () => { pendingConfirm.value = 'reject'; };

    /** تنفيذ الموافقة أو الرفض بعد التأكيد من الشريط */
    const confirmApproveOrReject = async () => {
      const action = pendingConfirm.value;
      if (!action) return;
      const contractId = props.contract?.id ?? props.contract?.contract_id;
      if (!contractId) {
        toast.error('معرف العقد غير متوفر');
        pendingConfirm.value = null;
        return;
      }
      const isApprove = action === 'approve';
      isActionLoading.value = true;
      try {
        const notes = contractNotes.value?.trim() || '';
        if (isApprove) {
          await contractService.approveContract(contractId, notes);
          toast.success('تم اعتماد العقد');
          emit('approve');
        } else {
          await contractService.rejectContract(contractId, notes);
          toast.success('تم رفض العقد');
          emit('reject');
        }
        contractNotes.value = '';
        pendingConfirm.value = null;
        closeModal();
      } catch (err) {
        const res = err?.response?.data || err?.data || {};
        const errMsg =
          res.message ||
          (res.errors && typeof res.errors === 'object' ? Object.values(res.errors).flat()[0] : null) ||
          err?.message ||
          (isApprove ? 'حدث خطأ أثناء اعتماد العقد' : 'حدث خطأ أثناء رفض العقد');
        toast.error(errMsg);
      } finally {
        isActionLoading.value = false;
      }
    };

    return {
      contractDetails,
      contractNotes,
      closeModal,
      approveContract,
      rejectContract,
      confirmApproveOrReject,
      normalizedStatus,
      hasPermission,
      isActionLoading,
      pendingConfirm,
    };
  },
};
</script>

<style scoped src="./styles/ContractModal.scoped.s1.css"></style>
