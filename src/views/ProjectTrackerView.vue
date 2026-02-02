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
           <img :src="project.image || '/img/placeholder-project.jpg'" alt="Project Image" class="header-image" @error="$event.target.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%221200%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201200%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%221200%22%20height%3D%22300%22%20fill%3D%22%23cccccc%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%23666666%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E'" />
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
        <button class="nav-tab" :class="{ active: activeTab === 'photography' }" @click="activeTab = 'photography'">التصوير</button>
        <button class="nav-tab" :class="{ active: activeTab === 'boards' }" @click="activeTab = 'boards'">اللوحات</button>
        <button class="nav-tab" :class="{ active: activeTab === 'teams' }" @click="selectTeamsTab">فرق التسويق</button>
        <button class="nav-tab" :class="{ active: activeTab === 'units' }" @click="selectUnitsTab" :disabled="!isTrackerCompleted">
            الوحدات 
            <span v-if="!isTrackerCompleted" style="font-size:10px; opacity:0.7">(مغلق)</span>
        </button>
      </div>

      <!-- Main Content Area -->
      <div class="tracker-container">
        
        <!-- PROGRESS TAB -->
        <div v-if="activeTab === 'progress'">
            <!-- Tracker Header -->
            <div class="tracker-header-box">
            <h2 class="tracker-title">متتبع حالة المشروع</h2>
            <h3 class="tracker-subtitle">{{ project.name }}</h3>
            <p class="tracker-desc">أكمل جميع المراحل لتمكين إضافة الوحدات. سيتم حفظ البيانات تلقائياً عند الإكمال.</p>
            
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
                    :class="{ 'completed': stage.status === 'completed', 'active': activeStageIndex === index }"
                    @click="selectStage(index)">
                    <div class="step-circle">
                        <span v-if="stage.status === 'completed'">✓</span>
                        <span v-else>{{ index + 1 }}</span>
                    </div>
                    <span class="step-label">{{ stage.name }}</span>
                    <span class="step-sublabel">{{ stage.subLabel }}</span>
                    <span v-if="stage.completedAt" class="step-date">{{ stage.completedAt }}</span>
                </div>
            </div>
            </div>

            <!-- Documents Section (Active Stage Content) -->
            <div class="stage-content-area">
                <h3 class="stage-section-title">
                    {{ stages[activeStageIndex].name }}
                    <span v-if="stages[activeStageIndex].completedAt" class="date-badge">
                        تم الإنجاز
                    </span>
                </h3>

                <!-- Default Stage Content -->
                <div class="input-group">
                    <label>رابط المستند / الملف</label>
                    <div class="input-wrapper">
                        <!-- If completed, show disabled input or allow edit if needed. User asked for "locked". -->
                        <input :type="stages[activeStageIndex].inputType || 'text'" v-model="stages[activeStageIndex].value" class="form-input" :placeholder="stages[activeStageIndex].placeholder || 'https://...'" :disabled="stages[activeStageIndex].status === 'completed'" />
                        <button class="link-btn">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                        </button>
                    </div>
                </div>

                <div class="action-buttons">
                    <button v-if="stages[activeStageIndex].status !== 'completed'" class="update-btn" @click="saveProgress">
                        حفظ وإكمال
                    </button>
                    <button v-else class="update-btn secondary" @click="stages[activeStageIndex].status = 'pending'">
                        تعديل الربط
                    </button>
                </div>
            </div>
        </div>

        <!-- PHOTOGRAPHY TAB -->
        <div v-if="activeTab === 'photography'" class="tab-content">
            <div class="tracker-header-box">
                <h2 class="tracker-title">إدارة التصوير والوسائط</h2>
                <h3 class="tracker-subtitle">{{ project.name }}</h3>
                <p class="tracker-desc">يمكنك هنا رفع وتحديث صور وفيديوهات المشروع.</p>
                
                <div class="status-bar" style="margin-top:15px; display: flex; gap: 10px; align-items: center;">
                    <!-- Status Badge -->
                    <span class="status-badge" 
                        :class="{
                            'pending': photographyForm.status === 'pending',
                            'approved': photographyForm.status === 'approved',
                            'rejected': photographyForm.status === 'rejected'
                        }">
                        {{ 
                            photographyForm.status === 'approved' ? 'تم القبول' : 
                            photographyForm.status === 'rejected' ? 'مرفوض' : 
                            'قيد الانتظار' 
                        }}
                    </span>
                    
                    <div v-if="photographyForm.updated_at" class="update-info-badge" style="color: #6b7280; font-size: 13px;">
                        📅 آخر تحديث: {{ photographyForm.updated_at }}
                    </div>
                </div>

                <!-- Rejection Reason Warning -->
                <div v-if="photographyForm.status === 'rejected' && photographyForm.rejection_reason" class="alert-box error" style="margin-top: 15px; background: #fee2e2; padding: 10px; border-radius: 8px; color: #991b1b;">
                    <strong>سبب الرفض:</strong> {{ photographyForm.rejection_reason }}
                </div>
            </div>

            <div class="stage-content-area" style="max-width: 800px; margin: 0 auto;">
                
                <!-- Manager Approval Controls -->
                <div v-if="isManager && photographyForm.status === 'pending'" class="manager-actions-card" style="background: white; border: 1px solid #e5e7eb; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    <h4 style="margin-top:0; color: #1f2937;">طلب موافقة على الصور</h4>
                    <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">قام المطور برفع صور جديدة. يرجى المراجعة واتخاذ القرار.</p>
                    <div style="display: flex; gap: 10px;">
                        <button @click="approvePhotography" class="btn-success" style="background: #10b981; color: white; padding: 8px 16px; border-radius: 6px; border:none; cursor: pointer; font-weight: bold;">قبول الصور</button>
                        <button @click="openRejectModal" class="btn-danger" style="background: #ef4444; color: white; padding: 8px 16px; border-radius: 6px; border:none; cursor: pointer; font-weight: bold;">رفض</button>
                    </div>
                </div>

                <form @submit.prevent="savePhotographyData">
                    <fieldset :disabled="isPhotoSaving || (isManager && photographyForm.status === 'pending') || (photographyForm.status === 'approved' && !isManager) || (photographyForm.status === 'pending' && !isEditingPending)" style="border:none; padding:0;">
                        <div class="form-grid" style="grid-template-columns: 1fr; gap: 20px;">
                            
                            <!-- Image URL -->
                            <div class="form-group">
                                <label>رابط الصورة (Image URL)</label>
                                <div class="input-wrapper">
                                    <input type="text" v-model="photographyForm.image_url" class="form-input" placeholder="https://..." required />
                                </div>
                            </div>

                            <!-- Video URL -->
                            <div class="form-group">
                                <label>رابط الفيديو (Video URL)</label>
                                <div class="input-wrapper">
                                    <input type="text" v-model="photographyForm.video_url" class="form-input" placeholder="https://..." />
                                </div>
                            </div>

                            <!-- Description -->
                            <div class="form-group">
                                <label>وصف المحتوى (Description)</label>
                                <textarea v-model="photographyForm.description" class="form-input" rows="4" placeholder="وصف للصور والمحتوى..." style="min-height: 100px;"></textarea>
                            </div>

                        </div>
                    </fieldset>

                    <!-- Actions for Submitter moved OUTSIDE disabled fieldset -->
                    <div class="form-actions" style="margin-top: 20px; text-align: left;">
                        <div v-if="!isManager && photographyForm.status !== 'approved'">
                            <!-- If Pending and NOT editing -> Show Edit Button -->
                            <button v-if="photographyForm.status === 'pending' && !isEditingPending" type="button" class="update-btn secondary" @click="isEditingPending = true">
                                تعديل الطلب (Edit)
                            </button>
                            
                            <!-- Else (Rejected, New, or Editing Pending) -> Show Save -->
                            <button v-else type="submit" class="update-btn" :disabled="isPhotoSaving">
                                {{ isPhotoSaving ? 'جاري الحفظ...' : ((photographyForm.status === 'rejected' || isEditingPending) ? 'تحديث وإعادة الإرسال' : 'حفظ وإرسال للموافقة') }}
                            </button>
                            
                            <button v-if="isEditingPending" type="button" class="btn-text" @click="cancelPhotoEdit" style="margin-right:10px;">إلغاء</button>
                        </div>

                        <p v-if="photographyForm.status === 'approved'" style="color: #10b981; font-weight: bold;">
                            ✓ تم اعتماد الصور
                        </p>
                    </div>
                </form>
            </div>
            
            <!-- Rejection Modal -->
            <div v-if="showRejectModal" class="modal-overlay">
                <div class="modal-content">
                    <h3>رفض الصور</h3>
                    <p>يرجى ذكر سبب الرفض ليتمكن المطور من التعديل:</p>
                    <textarea v-model="rejectReasonInput" class="form-input" rows="3" placeholder="سبب الرفض..." style="width: 100%; margin-bottom: 15px;"></textarea>
                    <div class="modal-actions">
                        <button class="btn-text" @click="showRejectModal = false">إلغاء</button>
                        <button class="btn-danger" @click="rejectPhotography" style="background: #ef4444; color: white; padding: 8px 16px; border-radius: 6px; border:none;">تأكيد الرفض</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- BOARDS TAB -->
        <div v-else-if="activeTab === 'boards'" class="tab-content">
            <div class="tracker-header-box">
                <h2 class="tracker-title">اللوحات</h2>
                <h3 class="tracker-subtitle">{{ project.name }}</h3>
                <p class="tracker-desc">إدارة لوحات المشروع وإضافة تفاصيل الوحدات.</p>
            </div>



            <div class="boards-content-area">
                <!-- Pending State: Premium CTA -->
                <div v-if="boardsTabState === 'pending'" class="board-cta-container">
                    <div class="board-cta-card">
                        <div class="cta-icon">
                            <svg viewBox="0 0 24 24" fill="none" class="animate-pulse">
                               <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                               <path d="M9 3V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                               <path d="M15 3V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                               <path d="M3 9H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                               <path d="M3 15H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        
                        <h3 class="cta-title">إعداد لوحات المشروع</h3>
                        <p class="cta-description">
                            ابدأ بإعداد اللوحات والمخططات لهذا المشروع. سيتم إنشاء سجل اللوحات تلقائياً.
                        </p>

                        <button class="cta-btn-premium" @click="saveBoard" :disabled="isBoardSaving">
                            <span v-if="!isBoardSaving">تأكيد وبدء اللوحات</span>
                            <span v-else>جاري الإعداد...</span>
                            <svg v-if="!isBoardSaving" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 5 12 12 19"></polyline></svg>
                        </button>
                    </div>
                </div>

                <!-- Completed State: Data View -->
                <div v-else class="board-completed-view">
                    <div class="completed-info-card">
                         <div class="success-header">
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="3" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <h3>تم إضافة اللوحات بنجاح</h3>
                         </div>
                         <div class="details-summary">
                            <p>تم حفظ تفاصيل لوحات المشروع وهي متاحة الآن في النظام.</p>
                            <button class="btn-text" @click="boardsTabState = 'pending'">تعديل البيانات</button>
                         </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- UNITS TAB -->
        <div v-else-if="activeTab === 'units'" class="tab-content">
            <div class="units-header-actions">
                <h3>إدارة الوحدات</h3>
                <div class="units-btns">
                    <button class="btn-primary" @click="showAddUnitModal = true">إضافة وحدة</button>
                    <button class="btn-outline" @click="$refs.csvInput.click()">
                        رفع CSV
                        <input type="file" ref="csvInput" style="display:none" accept=".csv" @change="handleCsvUpload" />
                    </button>
                </div>
            </div>

            <div v-if="unitsLoading" class="units-loading">جاري تحميل الوحدات...</div>
            
            <div v-else-if="units.length === 0" class="empty-state-tab">
                <p>لا توجد وحدات مضافة لهذا المشروع حتى الآن.</p>
            </div>

            <div v-else class="units-table-container">
                <table class="units-table">
                    <thead>
                        <tr>
                            <th>رقم الوحدة</th>
                            <th>النوع</th>
                            <th>السعر</th>
                            <th>المساحة</th>
                            <th>الحالة</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="unit in units" :key="unit.id">
                            <td>{{ unit.unit_number }}</td>
                            <td>{{ unit.unit_type }}</td>
                            <td>{{ formatCurrency(unit.price) }}</td>
                            <td>{{ unit.area }} م²</td>
                            <td>
                                <span class="status-badge" :class="unit.status">{{ unit.status || 'pending' }}</span>
                            </td>
                            <td>
                                <button class="btn-sm" @click="openEditUnit(unit)">تعديل</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- TEAMS TAB -->
        <div v-else-if="activeTab === 'teams'" class="tab-content">
            <div class="tracker-header-box">
                <h2 class="tracker-title">تعيين فرق التسويق</h2>
                <h3 class="tracker-subtitle">{{ project.name }}</h3>
                <p class="tracker-desc">قم بتعيين الفرق المسؤولة عن تسويق هذا المشروع.</p>
            </div>

            <div class="teams-assignment-area">
                <!-- Add Team Form -->
                <div class="add-team-card">
                    <h4>إضافة فريق للمشروع</h4>
                    <div class="add-team-form">
                        <select v-model="selectedTeamId" class="team-select">
                            <option value="" disabled>اختر فريقاً...</option>
                            <option v-for="team in availableTeams" :key="team.id" :value="team.id">
                                {{ team.name }}
                            </option>
                        </select>
                        <button class="btn-primary" @click="assignTeam" :disabled="!selectedTeamId || isTeamActionLoading">
                            {{ isTeamActionLoading ? 'جاري الإضافة...' : 'إضافة الفريق' }}
                        </button>
                    </div>
                </div>

                <!-- Assigned Teams List -->
                <div class="assigned-teams-list">
                    <h4>الفرق المعينة حالياً</h4>
                    <div v-if="assignedTeamsLoading" class="spinner-sm"></div>
                    <div v-else-if="assignedTeams.length === 0" class="empty-state-sm">
                        لا توجد فرق معينة لهذا المشروع.
                    </div>
                    <div v-else class="teams-grid">
                        <div v-for="team in assignedTeams" :key="team.id" class="team-card-item">
                            <div class="team-info">
                                <span class="team-name">{{ team.name }}</span>
                                <span class="team-desc">{{ team.description || 'لا يوجد وصف' }}</span>
                            </div>
                            <button class="btn-icon delete" @click="removeTeam(team)" title="إزالة الفريق" :disabled="isTeamActionLoading">
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </template>
    
    <div v-else class="error-state">
       <p>لم يتم العثور على المشروع.</p>
       <button @click="$router.push('/project-management')">العودة للقائمة</button>
    </div>

    <!-- Add/Edit Unit Modal -->
    <div v-if="showAddUnitModal" class="modal-overlay">
        <div class="modal-content">
            <h3>{{ isEditingUnit ? 'تعديل الوحدة' : 'إضافة وحدة جديدة' }}</h3>
            <form @submit.prevent="submitUnitForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label>رقم الوحدة</label>
                        <input type="text" v-model="unitForm.unit_number" required :disabled="isEditingUnit" />
                    </div>
                    <div class="form-group">
                        <label>نوع الوحدة</label>
                        <input type="text" v-model="unitForm.unit_type" placeholder="مثال: majestic" required />
                    </div>
                     <div class="form-group">
                        <label>السعر</label>
                        <input type="number" v-model="unitForm.price" required />
                    </div>
                     <div class="form-group">
                        <label>إجمالي السعر</label>
                        <input type="number" v-model="unitForm.total_price" required />
                    </div>
                     <div class="form-group">
                        <label>المساحة</label>
                        <input type="number" v-model="unitForm.area" required />
                    </div>
                    <div class="form-group">
                        <label>الوصف</label>
                        <textarea v-model="unitForm.description"></textarea>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" @click="closeUnitModal" class="btn-text">إلغاء</button>
                    <button type="submit" class="btn-primary">{{ isEditingUnit ? 'تحديث' : 'حفظ' }}</button>
                </div>
            </form>
        </div>
    </div>

  </div>
</template>

<script>
import { ref, onMounted, computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import contractService from '../services/contractService'
import teamService from '../services/teamService'
import authService from '../services/authService'

export default {
  name: 'ProjectTrackerView',
  setup() {
    const route = useRoute()
    // eslint-disable-next-line no-unused-vars
    const isLoading = ref(true)
    const activeTab = ref('progress')
    const project = ref(null)
    
    // Photography State
    const isPhotoSaving = ref(false)
    const photographyForm = reactive({
        image_url: '',
        video_url: '',
        description: '',
        updated_at: null
    })
    const isEditingPending = ref(false)
    
    const isManager = computed(() => {
        const user = authService.getCurrentUser()
        // Allow pure Admin (1) OR Project Manager (3 with flag)
        return (user?.type == 1) || (user?.type == 3 && user?.is_manager)
    })
    
    // Boards State
    const boardsTabState = ref('pending') // 'pending' or 'completed'
    const boardsFormData = reactive({
        projectName: ''
    })
    const isBoardSaving = ref(false)
    const currentDate = new Date().toISOString().split('T')[0]
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    // Teams State
    const assignedTeams = ref([])
    const availableTeams = ref([])
    const selectedTeamId = ref('')
    const assignedTeamsLoading = ref(false)
    const isTeamActionLoading = ref(false)

    // Stages from user request with API keys - UPDATED: Removed Photography
    const stages = reactive([
      { 
        name: 'تجهيز اوراق العقار', 
        subLabel: 'الصكوك والرخص', 
        status: 'pending',
        apiKey: 'real_estate_papers_url',
        value: '',
        completedAt: null
      },
      { 
        name: 'المخطاطات و التصميمات', 
        subLabel: 'المخططات الهندسية', 
        status: 'pending',
        apiKey: 'plans_equipment_docs_url',
        value: '',
        completedAt: null
      },
      { 
        name: 'السجل و الهويه', 
        subLabel: 'سجل وتصنيف', 
        status: 'pending',
        apiKey: 'project_logo_url',
        value: '',
        completedAt: null
      },
      { 
        name: 'الاسعار و الوحدات', 
        subLabel: 'شهاة اتمام و اخرى', 
        status: 'pending',
        apiKey: 'prices_units_url',
        value: '',
        completedAt: null
      }, 
      { 
        name: 'رخصة تسويق', 
        subLabel: 'الاسعار و الوحدات', 
        status: 'pending',
        apiKey: 'marketing_license_url',
        value: '',
        completedAt: null
      },
      { 
        name: 'انشاء رقم المعلن', 
        subLabel: 'رقم المعلن', 
        status: 'pending',
        apiKey: 'advertiser_section_url',
        value: '',
        completedAt: null,
        inputType: 'number',
        placeholder: 'أدخل رقم المعلن'
      }
    ])

    const activeStageIndex = ref(0) 
    const isTrackerCompleted = computed(() => stages.every(s => s.status === 'completed'))

    // Units Logic
    const units = ref([])
    const unitsLoading = ref(false)
    const showAddUnitModal = ref(false)
    const isEditingUnit = ref(false)
    const editingUnitId = ref(null)

    const unitForm = reactive({
        unit_number: '',
        unit_type: '',
        count: 1, // Default from request example
        status: 'pending',
        price: 0,
        total_price: 0,
        area: 0,
        description: ''
    })

    const fetchProject = async () => {
       isLoading.value = true
       try {
          const id = route.params.id
          
          // 1. Fetch Contract Basics
          const user = authService.getCurrentUser()
          const isEditor = user && user.type == 4
          
          let data = null
          try {
             if (isEditor) {
                 data = await contractService.getEditorContractById(id)
             } else {
                 data = await contractService.getContractById(id)
             }
          } catch(e) {
             console.log('Main fetch failed, utilizing fallback')
          }

          if (!data || !data.project_name) {
             const apiCall = isEditor ? contractService.getEditorContracts() : contractService.getContracts()
             const all = await apiCall
             const found = all.find(p => p.id == id)
             if (found) project.value = found
          } else {
             project.value = data
          }
          
          if (!project.value) {
             project.value = {
                id: id,
                name: `أدوار رحاب 1 - حي التعاون الرياض`, 
                // Fallback mock
             }
          }

          // 2. Fetch Existing Tracker Data
          const trackerData = await contractService.getSecondPartyData(id)
          if (trackerData && trackerData.data) {
              const d = trackerData.data
              stages.forEach(stage => {
                  if (stage.apiKey && d[stage.apiKey]) {
                      stage.value = d[stage.apiKey]
                      stage.status = 'completed'
                      // Assuming backend doesn't give date per field easily, we just mark done.
                      stage.completedAt = d.updated_at ? new Date(d.updated_at).toLocaleDateString() : 'تم' 
                  }
              })
              
              // Move index to first pending
              const firstPending = stages.findIndex(s => s.status === 'pending')
              if (firstPending !== -1) activeStageIndex.value = firstPending
              else activeStageIndex.value = stages.length - 1
          }

          // 3. Fetch Photography Data
          const photoData = await contractService.getPhotography(id)
          if (photoData && photoData.data) {
             const p = photoData.data
             photographyForm.image_url = p.image_url || ''
             photographyForm.video_url = p.video_url || ''
             photographyForm.description = p.description || ''
             photographyForm.status = p.status || 'pending' // Default to pending if exists but no status
             photographyForm.rejection_reason = p.rejection_reason || null
             
             if (p.updated_at) {
                 photographyForm.updated_at = new Date(p.updated_at).toLocaleDateString('ar-SA')
             } else if (p.created_at) {
                 photographyForm.updated_at = new Date(p.created_at).toLocaleDateString('ar-SA')
             }
          }

       } catch (e) {
         console.error('Error loading project view:', e)
       } finally {
         isLoading.value = false
       }
    }

    const fetchBoardData = () => {
        if (!project.value) return
        
        // Always prepopulate project name if not already set or if fresh
        if (!boardsFormData.projectName && project.value.name) {
            boardsFormData.projectName = project.value.name
        }

        const savedBoard = localStorage.getItem(`board_${project.value.id}`)
        if (savedBoard) {
            const data = JSON.parse(savedBoard)
            Object.assign(boardsFormData, data)
            boardsTabState.value = 'completed'
        } else {
            boardsTabState.value = 'pending'
        }
    }

    const completedStages = computed(() => stages.filter(s => s.status === 'completed').length)
    
    const progressPercentage = computed(() => {
       const completedCount = stages.filter(s => s.status === 'completed').length
       if (completedCount === stages.length) return 100
       return (completedCount / stages.length) * 100
    })

    const selectStage = (index) => {
       activeStageIndex.value = index
    }

    const selectUnitsTab = () => {
        if (!isTrackerCompleted.value) {
            alert('يجب إكمال جميع مراحل المتتبع أولاً')
            return
        }
        activeTab.value = 'units'
        activeTab.value = 'units'
        loadUnits()
    }

    const selectTeamsTab = () => {
        activeTab.value = 'teams'
        loadTeamsData()
    }

    const loadTeamsData = async () => {
        if (!project.value) return
        assignedTeamsLoading.value = true
        try {
            // Fetch assigned teams
            const assignedData = await teamService.getContractTeams(project.value.id)
            assignedTeams.value = Array.isArray(assignedData) ? assignedData : (assignedData.data || [])

            // Fetch all teams for selection
            const allTeams = await teamService.getTeams()
            
            // Filter out already assigned teams from available list
            const assignedIds = new Set(assignedTeams.value.map(t => t.id))
            availableTeams.value = allTeams.filter(t => !assignedIds.has(t.id))

        } catch (error) {
            console.error('Error loading teams:', error)
        } finally {
            assignedTeamsLoading.value = false
        }
    }

    const assignTeam = async () => {
        if (!selectedTeamId.value) return
        isTeamActionLoading.value = true
        try {
            // API expects { team_ids: [id] }
            await teamService.addTeamsToContract(project.value.id, [selectedTeamId.value])
            alert('تم تعيين الفريق بنجاح')
            selectedTeamId.value = ''
            loadTeamsData() // Reload lists
        } catch (error) {
            console.error('Error assigning team:', error)
            alert('حدث خطأ أثناء تعيين الفريق')
        } finally {
            isTeamActionLoading.value = false
        }
    }

    const removeTeam = async (team) => {
        if (!confirm(`هل أنت متأكد من إزالة الفريق "${team.name}" من المشروع؟`)) return
        isTeamActionLoading.value = true
        try {
            // API expects { team_ids: [id] }
            await teamService.removeTeamsFromContract(project.value.id, [team.id])
            alert('تم إزالة الفريق بنجاح')
            loadTeamsData() // Reload lists
        } catch (error) {
            console.error('Error removing team:', error)
            alert('حدث خطأ أثناء إزالة الفريق')
        } finally {
            isTeamActionLoading.value = false
        }
    }

    const saveProgress = async () => {
       const currentStage = stages[activeStageIndex.value]
       
       if (!currentStage.value) {
           alert('الرجاء إدخال الرابط قبل الحفظ')
           return
       }

       try {
           const payload = {}
           stages.forEach(stage => {
               if (stage.apiKey) {
                   payload[stage.apiKey] = stage.value || null
               }
           })
           
           console.log('Saving payload:', payload)

            // Try Create first, then Update
           try {
               await contractService.storeSecondPartyData(project.value.id, payload)
           } catch {
               await contractService.updateSecondPartyData(project.value.id, payload)
           }

           // Update local state
           currentStage.status = 'completed'
           currentStage.completedAt = new Date().toLocaleDateString('ar-SA')
           
           if (activeStageIndex.value < stages.length - 1) {
               activeStageIndex.value++
           } else {
               alert('تهانينا! تم إكمال المتتبع، يمكنك الآن إدارة الوحدات.')
           }

       } catch (error) {
           console.error('Failed to save progress:', error)
           const errorMsg = error.response?.data?.message || error.message
           alert(`حدث خطأ أثناء حفظ البيانات: ${errorMsg}`)
       }
    }

    // --- Units Functions ---

    const loadUnits = async () => {
        unitsLoading.value = true
        units.value = await contractService.getContractUnits(project.value.id)
        unitsLoading.value = false
    }

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(val)
    }

    const resetUnitForm = () => {
        unitForm.unit_number = ''
        unitForm.unit_type = ''
        unitForm.count = 1
        unitForm.status = 'pending'
        unitForm.price = 0
        unitForm.total_price = 0
        unitForm.area = 0
        unitForm.description = ''
    }

    // --- Photography Functions ---

    const showRejectModal = ref(false)
    const rejectReasonInput = ref('')

    const savePhotographyData = async () => {
        isPhotoSaving.value = true
        try {
            // When user saves, we reset status to 'pending' to request approval again
            // unless it's the manager editing directly (which we assume managers don't do often here, they approve)
            // But if a manager edits, maybe it stays pending/approved? 
            // Stick to requirements: "if rejected... status... if entered links... wait acceptance"
            const payload = {
                ...photographyForm,
                status: 'pending', // Always pending when updated by user
                rejection_reason: null // Clear rejection reason
            }

            try {
                await contractService.storePhotography(project.value.id, payload)
                alert('تم إرسال البيانات للموافقة بنجاح')
            } catch (err) {
                console.log('Store failed, trying update...', err)
                await contractService.updatePhotography(project.value.id, payload)
                alert('تم تحديث البيانات وإرسالها للموافقة')
            }
            // Update local state
            photographyForm.status = 'pending'
            photographyForm.rejection_reason = null
            photographyForm.updated_at = new Date().toLocaleDateString('ar-SA')
            // Reset editing mode after successful save
            isEditingPending.value = false

        } catch (error) {
            console.error('Photography save error:', error)
             const msg = error.response?.data?.message || error.message || 'خطأ غير معروف'
            alert(`حدث خطأ أثناء حفظ البيانات: ${msg}`)
            isEditingPending.value = false
        } finally {
            isPhotoSaving.value = false
        }
    }
    
    const cancelPhotoEdit = () => {
        isEditingPending.value = false
        // Optionally revert data to original logic if we kept a copy
    }

    const approvePhotography = async () => {
        if (!confirm('هل تأكيد قبول الصور؟')) return
        try {
             // Send complete photography data with approved status
             const payload = {
                 status: 'approved' // Set status explicitly
             }
            // Use specific Approve endpoint as requested
            await contractService.approvePhotography(project.value.id, payload)
            photographyForm.status = 'approved'
            alert('تم قبول الصور بنجاح')
        } catch (error) {
            console.error('Approval error:', error)
            alert('حدث خطأ أثناء القبول: ' + (error.response?.data?.message || error.message))
        }
    }

    const openRejectModal = () => {
        rejectReasonInput.value = ''
        showRejectModal.value = true
    }

    const rejectPhotography = async () => {
        if (!rejectReasonInput.value) {
            alert('يرجى إدخال سبب الرفض')
            return
        }
        try {
             await contractService.updatePhotography(project.value.id, {
                status: 'rejected',
                rejection_reason: rejectReasonInput.value
            })
            photographyForm.status = 'rejected'
            photographyForm.rejection_reason = rejectReasonInput.value
            showRejectModal.value = false
            alert('تم رفض الصور')
        } catch (error) {
             console.error(error)
            alert('حدث خطأ أثناء الرفض')
        }
    }

    const closeUnitModal = () => {
        showAddUnitModal.value = false
        isEditingUnit.value = false
        editingUnitId.value = null
        resetUnitForm()
    }

    const submitUnitForm = async () => {
        try {
            if (isEditingUnit.value) {
                // Update
                await contractService.updateContractUnit(editingUnitId.value, {
                    ...unitForm
                })
                alert('تم تحديث الوحدة بنجاح')
            } else {
                // Create
                await contractService.addContractUnit(project.value.id, {
                    ...unitForm
                })
                alert('تم إضافة الوحدة بنجاح')
            }
            closeUnitModal()
            loadUnits()
        } catch (error) {
            console.error(error)
            const msg = error.response?.data?.message || error.message || 'خطأ غير معروف'
            alert(`حدث خطأ أثناء حفظ الوحدة: ${msg}`)
        }
    }

    const openEditUnit = (unit) => {
        isEditingUnit.value = true
        editingUnitId.value = unit.id
        // Populate form
        unitForm.unit_number = unit.unit_number
        unitForm.unit_type = unit.unit_type
        unitForm.price = unit.price
        unitForm.total_price = unit.total_price || unit.price
        unitForm.area = unit.area
        unitForm.description = unit.description || ''
        unitForm.status = unit.status || 'pending'
        showAddUnitModal.value = true
    }

    const handleCsvUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return
        
        const formData = new FormData()
        formData.append('file', file) // Using 'file' as key. If fails, try 'csv_file'

        try {
            await contractService.uploadContractUnitsCsv(project.value.id, formData)
            alert('تم رفع ملف CSV بنجاح')
            loadUnits()
        } catch (error) {
            console.error(error)
            const msg = error.response?.data?.message || error.message || 'خطأ غير معروف'
            alert(`فشل رفع الملف: ${msg}`)
        }
        // Reset input
        event.target.value = ''
    }

    const saveBoard = async () => {
        if (!project.value) return
        isBoardSaving.value = true
        
        try {
            // Simulate API save or use localStorage as per current logic
            const boardData = {
                ...boardsFormData,
                projectId: project.value.id,
                savedAt: new Date().toISOString()
            }
            localStorage.setItem(`board_${project.value.id}`, JSON.stringify(boardData))
            
            // Switch to completed state
            boardsTabState.value = 'completed'
            alert('تم تأكيد إضافة اللوحات بنجاح')
        } catch (error) {
            console.error('Error saving board:', error)
            alert('حدث خطأ أثناء حفظ اللوحات')
        } finally {
            isBoardSaving.value = false
        }
    }

    onMounted(async () => {
        await fetchProject()
        fetchBoardData()
    })

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
       isTrackerCompleted,
       selectStage,
       saveProgress,
       selectUnitsTab,
       // Units
       units,
       unitsLoading,
       showAddUnitModal,
       unitForm,
       isEditingUnit,
       submitUnitForm,
       closeUnitModal,
       openEditUnit,
       handleCsvUpload,
       formatCurrency,
       // Photography
       photographyForm,
       isPhotoSaving,
       savePhotographyData,
       approvePhotography,
       rejectPhotography,
       showRejectModal,
       rejectReasonInput,
       openRejectModal,
        // Boards
        boardsFormData,
        isBoardSaving,
        saveBoard,
        isManager,
        isEditingPending,
        cancelPhotoEdit,
        // Teams
        assignedTeams, availableTeams, selectedTeamId, assignedTeamsLoading, isTeamActionLoading, assignTeam, removeTeam,
        selectTeamsTab
    }
  }
}
</script>

<style scoped>
/* Reuse existing styles plus new ones */
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

.nav-tab:disabled {
    cursor: not-allowed;
    opacity: 0.5;
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

.step-date {
  font-size: 10px;
  color: #28a745; 
  font-weight: 600;
  margin-top: 2px;
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

.date-badge {
    display: inline-block;
    background: #e6fffa;
    color: #047857;
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 20px;
    margin-right: 15px; 
    vertical-align: middle;
    border: 1px solid #a7f3d0;
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

.form-input:disabled {
    background: #e2e8f0;
    color: #94a3b8;
    cursor: not-allowed;
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

.update-btn.secondary {
    background: #64748b;
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

/* Units Tab Styles */
.units-header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.units-btns {
    display: flex;
    gap: 10px;
}

.btn-primary {
    background: #1e3a5f;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
}

.btn-outline {
    background: white;
    color: #1e3a5f;
    border: 1px solid #1e3a5f;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
}

.units-table-container {
    overflow-x: auto;
}

.units-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.units-table th, .units-table td {
    padding: 12px 16px;
    text-align: right;
    border-bottom: 1px solid #f1f5f9;
}

.units-table th {
    background: #f8fafc;
    color: #64748b;
    font-size: 12px;
    font-weight: 600;
}

.status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
}
.status-badge.pending { background: #fef3c7; color: #d97706; }
.status-badge.available { background: #dcfce7; color: #16a34a; }
.status-badge.sold { background: #fee2e2; color: #dc2626; }

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-content {
    background: white;
    padding: 30px;
    border-radius: 12px;
    width: 100%;
    max-width: 500px;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-top: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.form-group label { font-size: 12px; color: #64748b; font-weight: 600; }
.form-group input, .form-group textarea {
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-family: inherit;
}
.form-group textarea { grid-column: span 2; }

.modal-actions {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.btn-text {
    background: none; border: none; color: #64748b; cursor: pointer;
}

/* --- Boards Section Styles --- */


.board-form-container {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    overflow: hidden;
    max-width: 800px;
    margin: 0 auto;
}

.modal-header-strip {
    background: #c0392b;
    color: white;
    padding: 12px;
    text-align: center;
    font-size: 18px;
    font-weight: 800;
    font-family: 'Amiri', serif;
}

.form-container {
    padding: 25px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.section-card {
    border-radius: 12px;
    overflow: hidden;
    background: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.section-card.purple-theme { border: 1px solid #a78bfa; }
.section-card.purple-theme .section-header { background: #8b5cf6; color: white; }

.section-card.yellow-theme { border: 1px solid #fbbf24; }
.section-card.yellow-theme .section-header { background: #fcd34d; color: #451a03; }
.section-card.yellow-theme .section-body { background: #fffbeb; }

.section-header {
    padding: 8px 15px;
    text-align: center;
    font-weight: 700;
    font-size: 15px;
}

.section-body { padding: 15px; }

.vertical-layout { display: flex; flex-direction: column; gap: 10px; }
.grid-layout { display: flex; flex-direction: column; gap: 10px; }
.grid-row { display: flex; gap: 10px; }

.box-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    text-align: center;
    outline: none;
    font-size: 14px;
    transition: all 0.2s;
}

.box-input:focus {
    border-color: #B1A28F;
    box-shadow: 0 0 0 3px rgba(177, 162, 143, 0.2);
}

.form-actions-board {
    margin-top: 10px;
    display: flex;
    justify-content: center;
}

.save-btn-board {
    background: #1e293b;
    color: white;
    padding: 12px 50px;
    border-radius: 10px;
    border: none;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
}

.save-btn-board:hover:not(:disabled) {
    background: #0f172a;
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.save-btn-board:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.board-completed-view {
    padding: 40px 20px;
    text-align: center;
}

.completed-info-card {
    background: white;
    padding: 40px;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    max-width: 500px;
    margin: 0 auto;
}

.success-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    color: #10b981;
    margin-bottom: 20px;
}

.success-header h3 { margin: 0; font-size: 20px; }

.details-summary p { color: #64748b; margin-bottom: 20px; }

.btn-text {
    background: none;
    border: none;
    color: #B1A28F;
    font-weight: 700;
    text-decoration: underline;
    cursor: pointer;
    font-family: inherit;
}
/* --- Premium CTA Styles --- */
.board-cta-container {
    padding: 60px 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
}

.board-cta-card {
    background: white;
    padding: 50px;
    border-radius: 24px;
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08);
    border: 1px solid rgba(177, 162, 143, 0.2);
    text-align: center;
    max-width: 450px;
    width: 100%;
    position: relative;
    overflow: hidden;
}

.board-cta-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 6px;
    background: linear-gradient(90deg, #1e3a5f, #B1A28F, #1e3a5f);
}

.cta-icon {
    width: 80px;
    height: 80px;
    background: #f8fafc;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 25px;
    color: #B1A28F;
    border: 1px solid #e2e8f0;
}

.cta-icon svg {
    width: 40px;
    height: 40px;
}

.cta-title {
    font-size: 24px;
    font-weight: 800;
    color: #1e3a5f;
    margin-bottom: 12px;
    font-family: 'Amiri', serif;
}

.cta-description {
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 35px;
    font-size: 15px;
}

.cta-btn-premium {
    background: linear-gradient(135deg, #1e3a5f 0%, #2c3e50 100%);
    color: white;
    border: none;
    padding: 16px 32px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    transition: all 0.3s ease;
    box-shadow: 0 10px 20px -5px rgba(30, 58, 95, 0.25);
}

.cta-btn-premium:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 15px 30px -5px rgba(30, 58, 95, 0.35);
    background: linear-gradient(135deg, #2c3e50 0%, #1e3a5f 100%);
}

.cta-btn-premium:disabled {
    opacity: 0.7;
    cursor: wait;
    transform: none;
}

.animate-pulse {
    animation: pulse 3s infinite;
}

@keyframes pulse {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
}
</style>
