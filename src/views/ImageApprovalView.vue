<template>
  <div class="image-approval-view">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">الموافقة على الصور</h1>
        <p class="page-subtitle">مراجعة واعتماد الصور المرفوعة من قبل مدراء المشاريع.</p>
      </div>
    </div>

    <!-- Stats / Filters (Optional) -->
    <div class="stats-bar">
        <div class="stat-item">
            <span class="stat-label">قيد الانتظار:</span>
            <span class="stat-value">{{ pendingImages.length }}</span>
        </div>
    </div>

    <!-- Images Grid -->
    <div v-if="pendingImages.length === 0" class="empty-state">
        <p>لا يوجد صور بانتظار الموافقة حالياً.</p>
    </div>

    <div v-else class="images-grid">
      <div v-for="img in pendingImages" :key="img.id" class="image-card">
        <div class="image-wrapper">
          <img :src="img.url" :alt="img.projectName" class="project-img" />
          <div class="overlay">
             <span class="project-badge">{{ img.projectName }}</span>
          </div>
        </div>
        
        <div class="card-body">
            <div class="uploader-info">
                <div class="info-row">
                    <span class="label">بواسطة:</span>
                    <span class="value">{{ img.uploader }}</span>
                </div>
                <div class="info-row">
                    <span class="label">التاريخ:</span>
                    <span class="value">{{ img.date }}</span>
                </div>
            </div>

            <div class="actions">
                <button class="action-btn reject" @click="rejectImage(img.id)" title="رفض">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    رفض
                </button>
                <button class="action-btn approve" @click="approveImage(img.id)" title="موافقة">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    موافقة
                </button>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'ImageApprovalView',
  setup() {
    // Mock Data
    const pendingImages = ref([
      { id: 1, url: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Project+A', projectName: 'مشروع الفل', uploader: 'أحمد محمد', date: '2025-01-05' },
      { id: 2, url: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Project+B', projectName: 'مشروع النخيل', uploader: 'سارة علي', date: '2025-01-04' },
      { id: 3, url: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Project+C', projectName: 'مشروع الواحة', uploader: 'خالد عمر', date: '2025-01-05' },
      { id: 4, url: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Project+D', projectName: 'مشروع الربيع', uploader: 'محمد حسن', date: '2025-01-03' },
    ])

    const approveImage = (id) => {
        if(confirm('هل أنت متأكد من الموافقة على هذه الصورة؟')) {
            pendingImages.value = pendingImages.value.filter(img => img.id !== id)
            // In a real app, call API to approve
            alert('تمت الموافقة بنجاح')
        }
    }

    const rejectImage = (id) => {
        if(confirm('هل أنت متأكد من رفض هذه الصورة؟')) {
            pendingImages.value = pendingImages.value.filter(img => img.id !== id)
            // In a real app, call API to reject
            alert('تم رفض الصورة')
        }
    }

    return {
      pendingImages,
      approveImage,
      rejectImage
    }
  }
}
</script>

<style scoped>
.image-approval-view {
  font-family: 'Tajawal', sans-serif;
  animation: fadeIn 0.4s ease-out;
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
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 25px;
}

.image-card {
    background: white; border-radius: 16px;
    overflow: hidden; border: 1px solid #e2e8f0;
    transition: all 0.2s;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
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

.card-body { padding: 15px; }

.uploader-info { margin-bottom: 20px; }
.info-row {
    display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 5px;
}
.info-row .label { color: #64748b; }
.info-row .value { color: #1e293b; font-weight: 600; }

.actions { display: flex; gap: 10px; }
.action-btn {
    flex: 1; padding: 8px; border-radius: 8px; border: none;
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

.empty-state { text-align: center; color: #64748b; padding: 50px; }
</style>
