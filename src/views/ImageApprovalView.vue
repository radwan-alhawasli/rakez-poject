<template>
  <div class="image-approval-view">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">الموافقة على الصور</h1>
        <p class="page-subtitle">مراجعة واعتماد الصور المرفوعة من قبل مدراء المشاريع.</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-bar">
        <div class="stat-item">
            <span class="stat-label">قيد الانتظار:</span>
            <span class="stat-value">{{ isLoading ? '...' : pendingImages.length }}</span>
        </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري البحث عن طلبات معلقة...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="pendingImages.length === 0" class="empty-state">
        <p>لا يوجد صور بانتظار الموافقة حالياً.</p>
    </div>

    <!-- Images Grid -->
    <div v-else class="images-grid">
      <div v-for="img in pendingImages" :key="img.projectId" class="image-card">
        <div class="image-wrapper">
          <img :src="img.image_url" @error="$event.target.src='https://via.placeholder.com/600x400?text=No+Image'" class="project-img" />
          <div class="overlay">
             <span class="project-badge">{{ img.projectName }}</span>
          </div>
        </div>
        
        <div class="card-body">
            <div class="uploader-info">
               
                <div class="info-row wide">
                    <span class="label">الوصف:</span>
                    <p class="value description">{{ img.description || 'لا يوجد وصف' }}</p>
                </div>

                 <div class="links-section">
                    <div class="info-row">
                        <span class="label">رابط الصورة:</span>
                        <a :href="img.image_url" target="_blank" class="link-value">{{ truncateUrl(img.image_url) }}</a>
                    </div>
                    <div class="info-row" v-if="img.video_url">
                        <span class="label">رابط الفيديو:</span>
                        <a :href="img.video_url" target="_blank" class="link-value">{{ truncateUrl(img.video_url) }}</a>
                    </div>
                 </div>

                <div class="info-row">
                    <span class="label">تاريخ التحديث:</span>
                    <span class="value">{{ img.updated_at }}</span>
                </div>
            </div>

            <div class="actions">
                <button class="action-btn reject" @click="openRejectModal(img)" title="رفض">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    رفض
                </button>
                <button class="action-btn approve" @click="approveImage(img)" title="موافقة">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    موافقة
                </button>
            </div>
        </div>
      </div>
    </div>

    <!-- Rejection Modal -->
    <div v-if="showRejectModal" class="modal-overlay">
        <div class="modal-content">
            <h3>رفض الصور</h3>
            <p>يرجى ذكر سبب الرفض ليتمكن المطور من التعديل:</p>
            <textarea v-model="rejectReasonInput" class="form-input" rows="3" placeholder="سبب الرفض..." style="width: 100%; margin-bottom: 15px;"></textarea>
            <div class="modal-actions">
                <button class="btn-text" @click="closeRejectModal">إلغاء</button>
                <button class="btn-danger-solid" @click="confirmReject">تأكيد الرفض</button>
            </div>
        </div>
    </div>

  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import contractService from '../services/contractService'

export default {
  name: 'ImageApprovalView',
  setup() {
    const pendingImages = ref([])
    const isLoading = ref(true)
    const showRejectModal = ref(false)
    const rejectReasonInput = ref('')
    const selectedItem = ref(null)

    const fetchPendingRequests = async () => {
        isLoading.value = true
        try {
            // 1. Get All Contracts
            const contracts = await contractService.getContracts()
            
            // 2. Filter & Parallel Fetch Photography Data
            // We need to check each project for "pending" photography status.
            // Limiting concurrency might be needed for large sets, but here assume manageable count.
            // 2. Filter & Parallel Fetch Photography Data
            const results = await Promise.all(
                contracts.map(async (project) => {
                    try {
                        const response = await contractService.getPhotography(project.id)
                        // Normalize: response can be { data: { ... } } or just { ... }
                        // contractService.getPhotography uses response.data, so response here is what getPhotography returns.
                        // Ideally strictly typed but we'll try both.
                        const data = (response && response.data) ? response.data : response
                        
                        // Debug log 
                        // console.log(`Project ${project.id} photo data:`, data)

                        if (data && data.status === 'pending') {
                            return {
                                projectId: project.id,
                                projectName: project.project_name || project.name || `Project #${project.id}`,
                                ...data,
                                updated_at: new Date(data.updated_at || Date.now()).toLocaleDateString('ar-SA')
                            }
                        }
                    } catch (e) {
                         // console.error(`Error fetching photo for project ${project.id}`, e)
                        return null
                    }
                    return null
                })
            )
            
            pendingImages.value = results.filter(item => item !== null)

        } catch (error) {
            console.error('Error fetching requests:', error)
        } finally {
            isLoading.value = false
        }
    }

    const truncateUrl = (url) => {
        if (!url) return ''
        if (url.length > 40) return url.substring(0, 37) + '...'
        return url
    }

    const approveImage = async (img) => {
        if(!confirm('هل أنت متأكد من الموافقة على هذه الصور؟')) return
        try {
            await contractService.updatePhotography(img.projectId, {
                status: 'approved'
            })
            // Remove from list
            pendingImages.value = pendingImages.value.filter(i => i.projectId !== img.projectId)
            alert('تمت الموافقة بنجاح')
        } catch (error) {
            console.error(error)
            alert('حدث خطأ أثناء الموافقة')
        }
    }

    const openRejectModal = (img) => {
        selectedItem.value = img
        rejectReasonInput.value = ''
        showRejectModal.value = true
    }

    const closeRejectModal = () => {
        showRejectModal.value = false
        selectedItem.value = null
    }

    const confirmReject = async () => {
        if (!rejectReasonInput.value) {
            alert('يرجى إدخال سبب الرفض')
            return
        }
        if (!selectedItem.value) return

        try {
            await contractService.updatePhotography(selectedItem.value.projectId, {
                status: 'rejected',
                rejection_reason: rejectReasonInput.value
            })
            // Remove from list
            pendingImages.value = pendingImages.value.filter(i => i.projectId !== selectedItem.value.projectId)
            alert('تم رفض الصور')
            closeRejectModal()
        } catch (error) {
            console.error(error)
            alert('حدث خطأ أثناء الرفض')
        }
    }

    onMounted(() => {
        fetchPendingRequests()
    })

    return {
      pendingImages,
      isLoading,
      truncateUrl,
      approveImage,
      // Rejection logic
      showRejectModal,
      rejectReasonInput,
      openRejectModal,
      closeRejectModal,
      confirmReject
    }
  }
}
</script>

<style scoped>
.image-approval-view {
  font-family: 'Tajawal', sans-serif;
  animation: fadeIn 0.4s ease-out;
  padding-bottom: 50px;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.page-header { margin-bottom: 30px; }
.page-title { font-size: 28px; font-weight: 800; color: #1e3a5f; margin: 0 0 5px 0; font-family: 'Amiri', serif; }
.page-subtitle { color: #64748b; font-size: 15px; margin: 0; }

.stats-bar {
    margin-bottom: 25px;
    background: white; padding: 15px 20px;
    border-radius: 12px; border: 1px solid #e2e8f0;
    width: fit-content;
}
.stat-item {
    display: flex; gap: 10px; align-items: center; font-weight: 600; color: #1e293b;
}
.stat-value {
    background: #f1f5f9; padding: 2px 8px; border-radius: 4px; color: #64748b;
}

.images-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 25px;
}

.image-card {
    background: white; border-radius: 16px;
    overflow: hidden; border: 1px solid #e2e8f0;
    transition: all 0.2s;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    display: flex; flex-direction: column;
}
.image-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }

.image-wrapper {
    position: relative; height: 180px; background: #f8fafc;
}
.project-img { width: 100%; height: 100%; object-fit: cover; }
.overlay {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
    padding: 15px;
}
.project-badge {
    background: rgba(255,255,255,0.9); color: #1e293b;
    padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;
}

.card-body { padding: 15px; flex: 1; display: flex; flex-direction: column; }

.uploader-info { margin-bottom: 20px; flex: 1; }
.info-row {
    display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;
    align-items: center;
}
.info-row.wide { flex-direction: column; align-items: flex-start; gap: 5px; }

.info-row .label { color: #64748b; white-space: nowrap; margin-left: 10px; }
.info-row .value { color: #1e293b; font-weight: 600; }
.description { font-weight: 400; line-height: 1.5; font-size: 13px; margin: 0; color: #334155; }

.links-section {
    background: #f8fafc; padding: 10px; border-radius: 8px; margin: 10px 0;
}
.link-value {
    color: #3b82f6; text-decoration: none; font-weight: 600; direction: ltr;
}
.link-value:hover { text-decoration: underline; }

.actions { display: flex; gap: 10px; margin-top: auto; }
.action-btn {
    flex: 1; padding: 10px; border-radius: 8px; border: none;
    font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;
    font-size: 13px; transition: background 0.2s;
}
.action-btn svg { width: 16px; height: 16px; }

.action-btn.approve {
    background: #dcfce7; color: #166534;
}
.action-btn.approve:hover { background: #bbf7d0; }

.action-btn.reject {
    background: #fee2e2; color: #991b1b;
}
.action-btn.reject:hover { background: #fecaca; }

.empty-state, .loading-state { text-align: center; color: #64748b; padding: 50px; }
.spinner {
   width: 40px; height: 40px; border: 3px solid #f1f5f9; border-top-color: #B1A28F;
   border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Modal */
.modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); z-index: 1000;
    display: flex; align-items: center; justify-content: center;
}
.modal-content {
    background: white; padding: 30px; border-radius: 12px; width: 90%; max-width: 500px;
}
.modal-actions {
    display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;
}
.btn-text { background: none; border: none; color: #64748b; cursor: pointer; }
.btn-danger-solid { background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.form-input { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; margin-top:10px; }
</style>
