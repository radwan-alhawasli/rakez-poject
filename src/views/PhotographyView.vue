<template>
  <div class="photography-view">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">إدارة التصوير والوسائط</h1>
        <p class="page-subtitle">متابعة وتوثيق الوسائط المتعددة للمشاريع (صور، فيديو، جولات افتراضية)</p>
      </div>
      <div class="header-actions">
         <div class="stats-badge">
            <span class="stat-value">{{ activeCount }}</span>
            <span class="stat-label">مشروع قيد التصوير</span>
         </div>
      </div>
    </div>

    <!-- Projects Grid -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <div v-else class="media-grid">
      <div v-for="project in projects" :key="project.id" class="media-card" :class="{ 'has-media': project.hasMedia }">
        
        <!-- Image & Status -->
        <div class="card-visual">
           <img :src="project.image" alt="Project" class="project-img" @error="$event.target.src='https://via.placeholder.com/400x300'" />
           <div class="overlay-gradient"></div>
           
           <div class="media-status" :class="project.mediaStatus">
              <span class="status-dot"></span>
              {{ project.mediaStatusLabel }}
           </div>

           <button class="expand-btn" @click="openProjectModal(project)">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
           </button>
        </div>

        <!-- Content -->
        <div class="card-body">
           <h3 class="card-title">{{ project.name }}</h3>
           <p class="card-loc">{{ project.location }}</p>
           
           <div class="media-info">
              <div class="info-item">
                 <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                 <span>{{ project.photoCount || 0 }} صور</span>
              </div>
              <div class="info-item">
                 <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                 <span>{{ project.hasVideo ? 'يوجد فيديو' : 'لا يوجد فيديو' }}</span>
              </div>
           </div>

           <!-- Quick Action -->
           <button class="action-btn" @click="openProjectModal(project)">
              {{ project.hasMedia ? 'تعديل الوسائط' : 'إضافة وسائط' }}
           </button>
        </div>
      </div>
    </div>

    <!-- Media Edit Modal -->
    <transition name="modal-fade">
      <div v-if="selectedProject" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-content">
           <button class="close-modal" @click="closeModal">×</button>
           
           <div class="modal-header">
              <h2>{{ selectedProject.name }}</h2>
              <p>تحديث روابط وملفات الوسائط</p>
           </div>

           <div class="modal-body">
              <div class="form-group">
                 <label>رابط ملفات (Drive / Dropbox)</label>
                 <div class="input-with-icon">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    <input v-model="form.driveLink" placeholder="https://..." type="text" />
                 </div>
              </div>

              <div class="form-group">
                 <label>وصف / ملاحظات</label>
                 <textarea v-model="form.description" rows="4" placeholder="تفاصيل عن الصور والمحتوى..."></textarea>
              </div>

              <div class="preview-box" v-if="form.driveLink">
                 <div class="preview-icon">📂</div>
                 <div class="preview-text">
                    <strong>تم ربط المجلد</strong>
                    <span>{{ form.driveLink }}</span>
                 </div>
                 <div class="check-icon">✓</div>
              </div>
           </div>

           <div class="modal-footer">
              <button class="btn-cancel" @click="closeModal">إلغاء</button>
              <button class="btn-save" @click="saveMedia">
                 <span v-if="isSaving">جاري الحفظ...</span>
                 <span v-else>إرسال للاعتماد</span>
              </button>
           </div>

        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import { ref, computed, reactive, onMounted } from 'vue'
import contractService from '../services/contractService'

export default {
  name: 'PhotographyView',
  setup() {
    const isLoading = ref(true)
    const projects = ref([])
    const selectedProject = ref(null)
    const isSaving = ref(false)

    // Form State
    const form = reactive({
       driveLink: '',
       description: ''
    })

    const fetchProjects = async () => {
       isLoading.value = true
       try {
         const data = await contractService.getContracts()
         // Filter only active/approved projects as candidates
         projects.value = data
            .filter(p => p.status === 'Approved')
            .map(p => ({
               id: p.id,
               name: p.project_name || p.name,
               location: `${p.district || ''} - ${p.city || ''}`,
               image: p.project_image_url || '/img/placeholder-project.jpg',
               // Mocking specific media state
               hasMedia: Math.random() > 0.7, 
               mediaStatus: Math.random() > 0.7 ? 'completed' : 'pending',
               mediaStatusLabel: Math.random() > 0.7 ? 'مكتمل' : 'بانتظار الرفع',
               photoCount: Math.floor(Math.random() * 20),
               hasVideo: Math.random() > 0.5
            }))
       } catch (e) {
         console.error(e)
       } finally {
         isLoading.value = false
       }
    }

    const activeCount = computed(() => projects.value.length)

    const openProjectModal = (project) => {
       selectedProject.value = project
       // Load existing data if any (mocked)
       form.driveLink = project.hasMedia ? 'https://drive.google.com/drive/folders/xyz' : ''
       form.description = ''
    }

    const closeModal = () => {
       selectedProject.value = null
       form.driveLink = ''
       form.description = ''
    }

    const saveMedia = async () => {
       if(!form.driveLink) return
       isSaving.value = true
       
       // Simulate API call
       setTimeout(() => {
          isSaving.value = false
          // Update local state
          const idx = projects.value.findIndex(p => p.id === selectedProject.value.id)
          if(idx !== -1) {
             projects.value[idx].hasMedia = true
             projects.value[idx].mediaStatus = 'completed'
             projects.value[idx].mediaStatusLabel = 'تم الرفع (قيد المراجعة)'
          }
          closeModal()
       }, 1000)
    }

    onMounted(fetchProjects)

    return {
       isLoading,
       projects,
       activeCount,
       selectedProject,
       form,
       isSaving,
       openProjectModal,
       closeModal,
       saveMedia
    }
  }
}
</script>

<style scoped>
.photography-view {
  font-family: 'Tajawal', sans-serif;
  padding-bottom: 50px;
  animation: fadeIn 0.4s ease;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.page-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 40px; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px;
}
.page-title { font-size: 28px; font-weight: 800; color: #1e3a5f; margin: 0 0 5px 0; font-family: 'Amiri', serif; }
.page-subtitle { color: #64748b; font-size: 15px; margin: 0; }

.stats-badge {
   background: white; border: 1px solid #e2e8f0; padding: 5px 15px;
   border-radius: 12px; display: flex; flex-direction: column; align-items: center;
   box-shadow: 0 2px 5px rgba(0,0,0,0.03);
}
.stat-value { font-size: 20px; font-weight: 800; color: #B1A28F; }
.stat-label { font-size: 11px; color: #64748b; }

/* Grid */
.media-grid {
   display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px;
}

.media-card {
   background: white; border-radius: 20px; overflow: hidden;
   box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: all 0.3s ease;
   border: 1px solid transparent; display: flex; flex-direction: column;
}
.media-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.08); }
.media-card.has-media { border-color: rgba(16, 185, 129, 0.2); }

.card-visual { height: 180px; position: relative; overflow: hidden; }
.project-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.media-card:hover .project-img { transform: scale(1.05); }

.overlay-gradient {
   position: absolute; inset: 0;
   background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
}

.media-status {
   position: absolute; top: 12px; right: 12px;
   background: rgba(255,255,255,0.95); padding: 4px 10px;
   border-radius: 20px; font-size: 11px; font-weight: 700;
   display: flex; align-items: center; gap: 5px;
   color: #64748b; backdrop-filter: blur(4px);
}
.media-status.completed { color: #10b981; }
.media-status.pending { color: #f59e0b; }

.status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

.expand-btn {
   position: absolute; top: 12px; left: 12px;
   width: 32px; height: 32px; border-radius: 50%;
   background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4);
   color: white; display: flex; align-items: center; justify-content: center;
   cursor: pointer; transition: 0.2s; opacity: 0; transform: translateY(10px);
}
.media-card:hover .expand-btn { opacity: 1; transform: translateY(0); }
.expand-btn:hover { background: white; color: #1e3a5f; }

.card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; }
.card-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 5px 0; }
.card-loc { font-size: 13px; color: #94a3b8; margin: 0 0 20px 0; }

.media-info { display: flex; gap: 15px; margin-bottom: 20px; }
.info-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b; }
.info-icon { width: 14px; height: 14px; opacity: 0.7; }

.action-btn {
   margin-top: auto; width: 100%; border: 1px solid #e2e8f0;
   background: #f8fafc; padding: 10px; border-radius: 10px;
   color: #1e3a5f; font-weight: 600; font-size: 13px; cursor: pointer;
   transition: 0.2s;
}
.action-btn:hover { background: #1e3a5f; color: white; border-color: #1e3a5f; }

/* Modal */
.modal-backdrop {
   position: fixed; inset: 0; background: rgba(0,0,0,0.5);
   z-index: 1000; display: flex; align-items: center; justify-content: center;
   backdrop-filter: blur(4px);
}

.modal-content {
   background: white; width: 90%; max-width: 500px;
   border-radius: 24px; padding: 30px; position: relative;
   box-shadow: 0 20px 50px rgba(0,0,0,0.2);
}

.close-modal {
   position: absolute; top: 20px; left: 20px;
   width: 32px; height: 32px; background: #f1f5f9; border: none;
   border-radius: 50%; font-size: 20px; cursor: pointer; color: #64748b;
}
.close-modal:hover { background: #e2e8f0; color: #ef4444; }

.modal-header { text-align: center; margin-bottom: 30px; }
.modal-header h2 { font-size: 22px; font-weight: 800; margin: 0 0 5px 0; color: #1e3a5f; font-family: 'Amiri', serif; }
.modal-header p { color: #94a3b8; font-size: 14px; margin: 0; }

.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }

.input-with-icon { position: relative; }
.input-icon { position: absolute; right: 12px; top: 12px; width: 20px; color: #94a3b8; }
.input-with-icon input {
   width: 100%; padding: 12px 45px 12px 15px; border: 1px solid #e2e8f0;
   border-radius: 10px; font-family: inherit; outline: none; transition: 0.2s;
}
textarea {
   width: 100%; padding: 15px; border: 1px solid #e2e8f0;
   border-radius: 10px; font-family: inherit; outline: none; transition: 0.2s; resize: none;
}
input:focus, textarea:focus { border-color: #B1A28F; box-shadow: 0 0 0 3px rgba(177, 162, 143, 0.1); }

.preview-box {
   background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px;
   border-radius: 10px; display: flex; align-items: center; gap: 10px;
   margin-bottom: 20px;
}
.preview-icon { font-size: 20px; }
.preview-text { display: flex; flex-direction: column; font-size: 12px; flex: 1; overflow: hidden; }
.preview-text strong { color: #15803d; margin-bottom: 2px; }
.preview-text span { color: #16a34a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.check-icon { color: #15803d; font-weight: 800; }

.modal-footer { display: flex; gap: 15px; }
.btn-cancel {
   flex: 1; padding: 12px; background: white; border: 1px solid #e2e8f0;
   border-radius: 10px; cursor: pointer; font-weight: 600; color: #64748b;
}
.btn-save {
   flex: 2; padding: 12px; background: #B1A28F; border: none;
   border-radius: 10px; cursor: pointer; font-weight: 600; color: white;
   transition: 0.2s;
}
.btn-save:hover { background: #968875; }

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.loading-container { text-align: center; padding: 50px; }
.spinner { width: 40px; height: 40px; border: 3px solid #f1f5f9; border-top-color: #B1A28F; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
