<template>
  <div class="project-tracker-view">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل بيانات المشروع...</p>
    </div>

    <template v-else-if="project">
      <!-- Project Header -->
      <div class="project-header">
        <div class="header-image-container">
           <img :src="project.image || '/img/placeholder-project.jpg'" alt="Project Image" class="header-image" @error="$event.target.src='https://via.placeholder.com/1200x300?text=Project+Image'" />
           <div class="header-overlay"></div>
           <div class="header-content">
             <div class="header-top">
                <span class="last-update">تاريخ التحديث: {{ currentDate }}</span>
                <span class="last-update-time">{{ currentTime }}</span>
             </div>
             <h1 class="project-title-large">{{ project.name }}</h1>
             <p class="project-subtitle-large">
                القرب من {{ project.distance || '10' }} دقائق جامعة الإمام محمد بن سعود الإسلامية
             </p>
           </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="tabs-nav">
        <button class="nav-tab" :class="{ active: activeTab === 'progress' }" @click="activeTab = 'progress'">تقدم المشروع والمستندات</button>
        <button class="nav-tab" :class="{ active: activeTab === 'units' }" @click="activeTab = 'units'">الوحدات</button>
        <button class="nav-tab" :class="{ active: activeTab === 'photography' }" @click="activeTab = 'photography'">التصوير والوسائط</button>
      </div>

      <!-- Main Content Area -->
      <div class="tracker-container">
        
        <!-- PROGRESS TAB -->
        <div v-if="activeTab === 'progress'">
            <!-- Tracker Header -->
            <div class="tracker-header-box">
            <h2 class="tracker-title">متتبع حالة المشروع</h2>
            <p class="tracker-desc">أكمل جميع المراحل لتمكين إضافة الوحدات. اضغط على مرحلة لإدخال بياناتها</p>
            
            <div class="progress-indicator">
                <span class="progress-label">التقدم</span>
                <span class="progress-val">{{ completedStages }}/{{ stages.length }}</span>
            </div>
            </div>

            <!-- Stepper -->
            <div class="stepper-wrapper">
            <div class="stepper-line">
                <div class="stepper-line-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
            
            <div class="steps-container">
                <div v-for="(stage, index) in stages" :key="index" 
                    class="step-item" 
                    :class="{ 'completed': stage.status === 'completed', 'active': stage.status === 'active' }"
                    @click="selectStage(index)">
                    <div class="step-circle">
                        <span v-if="stage.status === 'completed'">✓</span>
                        <span v-else>{{ index + 1 }}</span>
                    </div>
                    <span class="step-label">{{ stage.name }}</span>
                    <span class="step-sublabel">{{ stage.subLabel }}</span>
                </div>
            </div>
            </div>

            <!-- Documents Section (Active Stage Content) -->
            <div class="stage-content-area">
                <h3 class="stage-section-title">{{ stages[activeStageIndex].name }}</h3>

                <!-- Default Stage Content -->
                <div class="input-group">
                    <label>رابط المشروع</label>
                    <div class="input-wrapper">
                        <input type="text" v-model="projectLink" class="form-input" placeholder="https://..." />
                        <button class="link-btn">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                        </button>
                    </div>
                </div>

                <div class="action-buttons">
                    <button class="update-btn" @click="saveProgress">تحديث الرابط</button>
                </div>
            </div>
        </div>

        <!-- UNITS TAB (Placeholder) -->
        <div v-else-if="activeTab === 'units'" class="tab-content">
            <div class="empty-state-tab">
                <h3>إدارة الوحدات</h3>
                <p>يمكنك إدارة وحدات المشروع هنا بعد اكتمال مرحلة التأسيس.</p>
            </div>
        </div>

        <!-- PHOTOGRAPHY TAB -->
        <div v-else-if="activeTab === 'photography'" class="tab-content">
             <div class="stage-content-area" style="max-width: 100%;">
                <h3 class="stage-section-title">متابعة التصوير والوسائط</h3>
                <p class="section-desc">قم برفع روابط الصور والفيديوهات الخاصة بالمشروع للإعتماد.</p>
                
                <div class="input-group">
                    <label>رابط ملفات المشروع (Drive/Dropbox)</label>
                    <div class="input-wrapper">
                        <input type="text" v-model="photoDriveLink" class="form-input" placeholder="https://drive.google.com/..." />
                        <button class="link-btn">
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        </button>
                    </div>
                </div>
                
                <div class="input-group" style="margin-top: 25px;">
                    <label>وصف المحتوى</label>
                    <textarea v-model="photoDescription" class="form-input" rows="6" placeholder="أدخل تفاصيل عن الصور، الزوايا، أو أي ملاحظات هامة..."></textarea>
                </div>

                <div class="action-buttons" style="margin-top: 30px;">
                    <button class="update-btn" @click="sendPhotographyApproval">
                        <span style="margin-left:8px">🚀</span> إرسال للاعتماد
                    </button>
                </div>
             </div>
        </div>

      </div>
    </template>
    
    <div v-else class="error-state">
       <p>لم يتم العثور على المشروع.</p>
       <button @click="$router.push('/project-management')">العودة للقائمة</button>
    </div>

  </div>
</template>

<script>
import { ref, onMounted, computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import contractService from '../services/contractService'

export default {
  name: 'ProjectTrackerView',
  setup() {
    const route = useRoute()
    const isLoading = ref(true)
    const activeTab = ref('progress')
    const project = ref(null)
    const projectLink = ref('')
    
    // Photography Form Data
    const photoDriveLink = ref('')
    const photoDescription = ref('')
    
    // Dates
    const currentDate = new Date().toISOString().split('T')[0]
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    // Stages from user request
    const stages = reactive([
      { name: 'تجهيز اوراق العقار', subLabel: 'الصكوك والرخص', status: 'completed' },
      { name: 'المخطاطات و التصميمات', subLabel: 'المخططات الهندسية', status: 'completed' },
      { name: 'السجل و الهويه', subLabel: 'سجل وتصنيف', status: 'completed' },
      { name: 'الاسعار و الوحدات', subLabel: 'شهاة اتمام و اخرى', status: 'active' }, 
      { name: 'التصوير', subLabel: 'الصور والفيديو', status: 'pending' },
      { name: 'رخصة تسويق', subLabel: 'الاسعار و الوحدات', status: 'pending' },
      { name: 'انشاء رقم المعلن', subLabel: 'رقم المعلن', status: 'pending' }
    ])

    const activeStageIndex = ref(3) // Default to the active one (index 3 initially)

    const fetchProject = async () => {
       isLoading.value = true
       try {
          const id = route.params.id
          // Try to get full contract details first
          const data = await contractService.getContractById(id)
          // If not found (mock data limitation), list all and find
          if (!data || !data.project_name) {
             const all = await contractService.getContracts()
             const found = all.find(p => p.id == id)
             if (found) project.value = found
          } else {
             project.value = data
          }

          // Fallback mock if completely missing for demo
          if (!project.value) {
             project.value = {
                id: id,
                name: `أدوار رحاب 1 - حي التعاون الرياض`,
                location: 'الرياض - حي التعاون',
                image: '/img/project-header-mock.jpg'
             }
          }
          
          // Set active stage index based on status
          const activeIdx = stages.findIndex(s => s.status === 'active')
          if (activeIdx !== -1) activeStageIndex.value = activeIdx
          
          // Check if we should auto-open photography tab (optional logic)
          
       } catch (e) {
         console.error(e)
       } finally {
         isLoading.value = false
       }
    }

    const completedStages = computed(() => stages.filter(s => s.status === 'completed').length)
    
    const progressPercentage = computed(() => {
       // Calculation based on active index
       const activeIndex = stages.findIndex(s => s.status === 'active')
       if (activeIndex === -1 && stages[stages.length-1].status === 'completed') return 100
       
       const raw = activeIndex === -1 ? 0 : activeIndex
       return (raw / (stages.length - 1)) * 100
    })

    const selectStage = (index) => {
       activeStageIndex.value = index
    }

    const saveProgress = () => {
       alert('تم تحديث البيانات بنجاح')
    }

    const sendPhotographyApproval = () => {
        if (!photoDriveLink.value || !photoDescription.value) {
            alert('الرجاء تعبئة الرابط والوصف')
            return
        }
        // Placeholder API call
        console.log('Sending Photography Approval:', {
            link: photoDriveLink.value,
            description: photoDescription.value,
            projectId: project.value.id
        })
        
        alert('تم إرسال طلب الاعتماد بنجاح')
        // Update stage status locally for demo
        stages[4].status = 'completed' // Assuming index 4 is Photography
        stages[5].status = 'active'
        activeStageIndex.value = 5
        // Maybe switch back to progress tab?
        // activeTab.value = 'progress'
    }

    onMounted(fetchProject)

    return {
       isLoading,
       activeTab,
       project,
       currentDate,
       currentTime,
       stages,
       activeStageIndex,
       completedStages,
       progressPercentage,
       projectLink,
       photoDriveLink,
       photoDescription,
       selectStage,
       saveProgress,
       sendPhotographyApproval
    }
  }
}
</script>

<style scoped>
.project-tracker-view {
  font-family: 'Tajawal', sans-serif;
  padding-bottom: 50px;
}

/* Header Styles */
.project-header {
  position: relative;
  height: 300px;
  width: 100%;
  overflow: hidden;
  margin-bottom: 0; 
}

.header-image-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.header-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%);
}

.header-content {
  position: absolute;
  bottom: 30px;
  right: 30px;
  color: white;
  z-index: 2;
  text-align: right;
}

.header-top {
  display: flex;
  gap: 15px;
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 10px;
}

.project-title-large {
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 5px 0;
  font-family: 'Amiri', serif;
}

.project-subtitle-large {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

/* Tabs */
.tabs-nav {
  background: white;
  padding: 0 30px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}

.nav-tab {
  padding: 20px 5px;
  background: none;
  border: none;
  font-family: 'Tajawal', sans-serif;
  font-size: 15px;
  color: #64748b;
  cursor: pointer;
  position: relative;
  font-weight: 500;
}

.nav-tab.active {
  color: #1e3a5f;
  font-weight: 700;
}

.nav-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: #B1A28F;
  border-radius: 3px 3px 0 0;
}

/* Tracker Container */
.tracker-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: right;
}

.tracker-header-box {
  margin-bottom: 50px;
  position: relative;
}

.tracker-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 10px 0;
  font-family: 'Amiri', serif;
}

.tracker-desc {
  color: #64748b;
  font-size: 15px;
  margin: 0;
}

.progress-indicator {
  position: absolute;
  left: 0;
  top: 5px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.progress-label { font-size: 12px; color: #94a3b8; }
.progress-val { font-size: 16px; font-weight: 700; color: #B1A28F; }

/* Stepper */
.stepper-wrapper {
  position: relative;
  margin-bottom: 60px;
  padding: 0 20px;
}

.stepper-line {
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 2px;
  background: #e2e8f0;
  z-index: 1;
}

.stepper-line-fill {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  background: #B1A28F;
  transition: width 0.3s ease;
}

.steps-container {
  position: relative;
  display: flex;
  justify-content: space-between;
  z-index: 2;
  direction: rtl; /* Should naturally flow */
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  position: relative;
  width: 120px; /* fixed width for centering text */
}

.step-circle {
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #64748b;
  transition: all 0.2s;
}

.step-item.active .step-circle {
  border-color: #B1A28F;
  color: #B1A28F;
  box-shadow: 0 0 0 4px rgba(177, 162, 143, 0.1);
}

.step-item.completed .step-circle {
  background: #B1A28F;
  border-color: #B1A28F;
  color: white;
}

.step-label {
  font-size: 13px;
  font-weight: 700;
  color: #1e3a5f;
  text-align: center;
}

.step-sublabel {
  font-size: 11px;
  color: #94a3b8;
  text-align: center;
}

/* Stage Content */
.stage-content-area {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
}

.stage-section-title {
  color: #1e3a5f;
  font-size: 18px;
  margin: 0 0 20px 0;
  font-family: 'Amiri', serif;
}

.input-group label {
  display: block;
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 600;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-input {
  flex: 1;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  font-family: 'Tajawal', sans-serif;
  color: #1e293b;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #B1A28F;
  background: white;
}

.link-btn {
  width: 42px; height: 42px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #64748b;
  cursor: pointer;
}

.update-btn {
  margin-top: 20px;
  background: #8e7d5c; /* Darker Gold for button */
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Tajawal', sans-serif;
}

.update-btn:hover {
  background: #7a6a4a;
}

.loading-state, .error-state {
  padding: 100px;
  text-align: center;
  color: #94a3b8;
}

.spinner {
   width: 40px; height: 40px; border: 3px solid #f1f5f9; border-top-color: #B1A28F;
   border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
