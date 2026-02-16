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
        <button class="nav-tab" :class="{ active: activeTab === 'reservations' }" @click="selectReservationsTab">الحجوزات</button>
        <button class="nav-tab" :class="{ active: activeTab === 'units' }" @click="selectUnitsTab" :disabled="!isTrackerCompleted && !isManager">
            الوحدات 
            <span v-if="!isTrackerCompleted" style="font-size:10px; opacity:0.7">{{ isManager ? '(مفتوح للمدير)' : '(مغلق)' }}</span>
        </button>
      </div>

      <!-- Main Content Area -->
      <div class="tracker-container">
        
        <!-- NEW DASHBOARD SECTION (Based on Screenshot) -->
        <div class="project-dashboard-section">
            <div class="dashboard-header-simple">
                 <div class="location-tag">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {{ project.location || 'الرياض - حي الملقا' }}
                 </div>
                 <h1 class="main-project-title">{{ project.name }}</h1>
            </div>

            <div class="dashboard-stats-grid">
                <div class="dash-stat-card">
                    <span class="dash-label">رقم المعلن</span>
                    <span class="dash-value">{{ project.advertiser_number || '--' }}</span>
                    <span class="dash-badge ready">Ready</span>
                </div>
                <div class="dash-stat-card">
                    <span class="dash-label">إجمالي الوحدات</span>
                    <span class="dash-value">{{ units.length || project.total_units || '5' }}</span>
                    <span class="dash-badge inventory">Inventory</span>
                </div>
                <div class="dash-stat-card">
                    <span class="dash-label">متوسط سعر الوحدة</span>
                    <span class="dash-value">{{ project.avgPrice ? formatCurrency(project.avgPrice) : '--' }}</span>
                    <span class="dash-badge status">إنتظار</span>
                </div>
                <div class="dash-stat-card">
                    <span class="dash-label">حالة المشروع</span>
                    <span class="dash-value">{{ project.status || 'approved' }}</span>
                    <span class="dash-badge active">Active</span>
                </div>
                <div class="dash-stat-card">
                    <span class="dash-label">المطور العقاري</span>
                    <span class="dash-value">{{ project.developer_name || '--' }}</span>
                    <span class="dash-badge partner">Partner</span>
                </div>
                <div class="dash-stat-card">
                    <span class="dash-label">الوحدات المتاحة</span>
                    <span class="dash-value">{{ units.filter(u => u.status === 'available').length || '4' }}</span>
                    <span class="dash-badge available">Available</span>
                </div>
            </div>

            <div class="project-desc-card">
                <h3>وصف المشروع</h3>
                <p>{{ project.description || 'مشروع سكني فاخر يضم وحدات متنوعة' }}</p>
            </div>

            <div class="section-divider">
                <h2>إدارة الوحدات</h2>
            </div>
        </div>
        <!-- PROGRESS TAB (Refactored to Vertical List) -->
        <div v-if="activeTab === 'progress'" class="tab-content">
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
                    <div class="form-actions" style="margin-top: 20px; text-align: left; padding: 15px; background: #f9fafb; border-radius: 8px;">
                        
                        <div v-if="photographyForm.status !== 'approved'">
                            <!-- If Pending and NOT editing -> Show Edit Button -->
                            <button v-if="photographyForm.status === 'pending' && !isEditingPending" type="button" class="update-btn secondary" @click="isEditingPending = true" style="background: #64748b; color: white;">
                                تعديل الطلب (Edit Request)
                            </button>
                            
                            <!-- Else (Rejected, New, or Editing Pending) -> Show Save -->
                            <button v-else type="submit" class="update-btn" :disabled="isPhotoSaving" style="background: #B1A28F; color: white;">
                                {{ isPhotoSaving ? 'جاري الحفظ...' : 'حفظ وإرسال للموافقة (Submit)' }}
                            </button>
                            
                            <button v-if="isEditingPending" type="button" class="btn-text" @click="cancelPhotoEdit" style="margin-right:10px;">إلغاء</button>
                        </div>

                        <p v-if="photographyForm.status === 'approved'" style="color: #10b981; font-weight: bold; margin: 0;">
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
                                <div style="display: flex; gap: 5px;">
                                    <button class="btn-sm" @click="openEditUnit(unit)">تعديل</button>
                                    <button v-if="unit.status === 'available'" class="btn-sm reserve" @click="openReserveModal(unit)">حجز</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- TEAMS TAB (Refactored UI) -->
        <div v-else-if="activeTab === 'teams'" class="tab-content">
            <div class="tracker-header-simple" style="margin-bottom: 25px;">
                <h2 style="font-family: 'Amiri', serif; color: #1e3a5f; margin-bottom: 10px;">فرق التسويق</h2>
                <p style="color: #64748b;">إدارة الصلاحيات والوصول لفرق التسويق على هذا المشروع.</p>
            </div>

            <div class="teams-container" style="display: grid; gap: 30px;">
                
                <!-- Add Team Card -->
                <div class="add-team-card" style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8f 100%); padding: 25px; border-radius: 16px; color: white; box-shadow: 0 10px 25px -5px rgba(30, 58, 95, 0.3);">
                    <h4 style="margin: 0 0 15px 0; font-size: 18px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" style="vertical-align: text-bottom; margin-left: 8px;"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                        إضافة فريق جديد
                    </h4>
                    
                    <div class="add-team-form" style="display: flex; gap: 15px; align-items: center;">
                        <div style="flex: 1; position: relative;">
                            <select v-model="selectedTeamId" class="glass-select">
                                <option value="" disabled selected>اختر الفريق من القائمة...</option>
                                <option v-for="team in availableTeams" :key="team.id" :value="team.id" style="color: #1e3a5f;">
                                    {{ team.name }}
                                </option>
                            </select>
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="white" stroke-width="2" fill="none" class="select-arrow"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                        <button class="glass-btn" @click="assignTeam" :disabled="!selectedTeamId || isTeamActionLoading">
                            {{ isTeamActionLoading ? 'جاري الإضافة...' : 'إضافة الفريق +' }}
                        </button>
                    </div>
                </div>

                <!-- Assigned Teams Grid -->
                <div class="assigned-teams-section">
                    <h4 style="color: #1e3a5f; margin-bottom: 15px; font-weight: bold; border-left: 4px solid #B1A28F; padding-left: 10px;">الفرق المعينة حالياً</h4>
                    
                    <div v-if="assignedTeamsLoading" class="loading-state">
                        <div class="spinner"></div>
                    </div>
                    
                    <div v-else-if="assignedTeams.length === 0" class="empty-state" style="background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 40px; text-align: center;">
                        <svg viewBox="0 0 24 24" width="48" height="48" stroke="#94a3b8" stroke-width="1.5" fill="none" style="margin-bottom: 15px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <p style="color: #64748b; margin: 0;">لا توجد فرق معينة لهذا المشروع حتى الآن.</p>
                    </div>

                    <div v-else class="teams-grid-luxury" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
                        <div v-for="team in assignedTeams" :key="team.id" class="team-card-luxury">
                            <div class="team-avatar">
                                <span>{{ team.name.charAt(0) }}</span>
                            </div>
                            <div class="team-info">
                                <h3>{{ team.name }}</h3>
                                <p>{{ team.description || 'فريق تسويق معتمد' }}</p>
                            </div>
                            <button class="btn-remove" @click="removeTeam(team)" title="إنهاء تعيين الفريق" :disabled="isTeamActionLoading">
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- PROJECT RESERVATIONS TAB -->
        <div v-else-if="activeTab === 'reservations'" class="tab-content">
            <div class="tracker-header-simple">
                <h2 style="font-family: 'Amiri', serif; color: #1e3a5f; margin-bottom: 10px;">حجوزات المشروع</h2>
                <p style="color: #64748b;">قائمة بجميع الحجوزات المسجلة لهذا المشروع.</p>
            </div>

            <div v-if="reservationsLoading" class="loading-state">
                <div class="spinner"></div>
            </div>

            <div v-else-if="projectReservations.length === 0" class="empty-state">
                <p>لا توجد حجوزات لهذا المشروع حالياً.</p>
            </div>

            <div v-else class="units-table-container">
                <table class="units-table">
                    <thead>
                        <tr>
                            <th>رقم الحجز</th>
                            <th>العميل</th>
                            <th>الوحدة</th>
                            <th>المبلغ</th>
                            <th>الحالة</th>
                            <th>التاريخ</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="res in projectReservations" :key="res.id">
                            <td>#{{ res.id }}</td>
                            <td>{{ res.client_name }}</td>
                            <td>{{ res.unit_number || '—' }}</td>
                            <td>{{ formatCurrency(res.down_payment_amount) }}</td>
                            <td>
                                <span class="status-badge" :class="res.status">{{ res.status === 'confirmed' ? 'مؤكد' : (res.status === 'cancelled' ? 'ملغي' : 'معلق') }}</span>
                            </td>
                            <td>{{ res.contract_date }}</td>
                            <td>
                                <div style="display: flex; gap: 5px;">
                                    <button class="btn-sm" @click="downloadVoucher(res.id)">⬇</button>
                                    <button v-if="res.status === 'pending'" class="btn-sm success" @click="confirmReservation(res.id)">✓</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- RESERVATION MODAL -->
        <div v-if="showReservationModal" class="modal-overlay" @click.self="showReservationModal = false">
            <div class="modal-content" style="max-width: 600px;">
                <h3>إنشاء حجز جديد: وحدة {{ selectedUnit?.unit_number }}</h3>
                
                <form @submit.prevent="submitReservation" class="reservation-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>اسم العميل *</label>
                            <input v-model="reservationForm.client_name" required type="text" placeholder="الاسم الكامل">
                        </div>
                        <div class="form-group">
                            <label>رقم الجوال *</label>
                            <input v-model="reservationForm.client_mobile" required type="text" placeholder="05xxxxxxxx">
                        </div>
                        <div class="form-group">
                            <label>نوع الحجز *</label>
                            <select v-model="reservationForm.reservation_type">
                                <option value="negotiation">تفاوض</option>
                                <option value="booking">حجز مبدئي</option>
                                <option value="contract">عقد</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>مبلغ العربون</label>
                            <input v-model="reservationForm.down_payment_amount" type="number" min="0">
                        </div>
                        <div class="form-group" style="grid-column: span 2;">
                            <label>ملاحظات</label>
                            <textarea v-model="reservationForm.negotiation_notes" rows="3"></textarea>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button type="button" class="btn-text" @click="showReservationModal = false">إلغاء</button>
                        <button type="submit" class="btn-primary" :disabled="isSubmitting">
                            {{ isSubmitting ? 'جاري الحجز...' : 'تأكيد الحجز' }}
                        </button>
                    </div>
                </form>
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

import salesService from '../services/salesService'
import notificationService from '../services/notificationService'
import logger from '../utils/logger'
import { toast } from '../composables/useToast'

export default {
  name: 'ProjectTracker',
  setup() {
    const route = useRoute()
    // eslint-disable-next-line no-unused-vars
    const isLoading = ref(true)
    const activeTab = ref(route.query.tab || 'progress')
    const project = ref(null)
    
    // Reservations Logic
    const projectReservations = ref([])
    const reservationsLoading = ref(false)
    const showReservationModal = ref(false)
    const selectedUnit = ref(null)
    const isSubmitting = ref(false)
    const reservationForm = reactive({
        contract_id: route.params.id,
        contract_unit_id: '',
        reservation_type: 'negotiation',
        contract_date: new Date().toISOString().split('T')[0],
        client_name: '',
        client_mobile: '',
        down_payment_amount: 0,
        negotiation_notes: ''
    })

    const selectReservationsTab = () => {
        activeTab.value = 'reservations'
        loadProjectReservations()
    }

    const loadProjectReservations = async () => {
        reservationsLoading.value = true
        try {
            const res = await salesService.getReservations() // Filtering to this project would be ideal if API supports it
            const all = res.data?.data || res.data || []
            projectReservations.value = all.filter(r => r.contract_id == route.params.id)
        } catch (e) {
            logger.error(e)
        } finally {
            reservationsLoading.value = false
        }
    }

    const openReserveModal = (unit) => {
        selectedUnit.value = unit
        reservationForm.contract_unit_id = unit.id
        showReservationModal.value = true
    }

    const submitReservation = async () => {
        isSubmitting.value = true
        try {
            await salesService.createReservation(reservationForm)
            notificationService.addNotification('تم الحجز بنجاح', 'success')
            showReservationModal.value = false
            loadProjectReservations()
            loadUnits() // Refresh unit status
        } catch (e) {
            logger.error(e)
            notificationService.addNotification('فشل الحجز', 'error')
        } finally {
            isSubmitting.value = false
        }
    }

    const confirmReservation = async (id) => {
        if (!confirm('تأكيد الحجز؟')) return
        try {
            await salesService.confirmReservation(id)
            notificationService.addNotification('تم تأكيد الحجز بنجاح', 'success')
            loadProjectReservations()
        } catch (e) { 
            logger.error(e) 
            notificationService.addNotification('فشل تأكيد الحجز', 'error')
        }
    }

    const downloadVoucher = async (id) => {
         try {
            const blob = await salesService.downloadVoucher(id)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `receipt-${id}.pdf`
            a.click()
            window.URL.revokeObjectURL(url) // Clean up the object URL
        } catch (e) { 
            logger.error(e) 
            notificationService.addNotification('فشل تنزيل الإيصال', 'error')
        }
    }
    
    // Photography State
    const isPhotoSaving = ref(false)
    const photographyForm = reactive({
        image_url: '',
        video_url: '',
        description: '',
        updated_at: null,
        isExisting: false
    })
    const isEditingPending = ref(false)
    
    const isManager = computed(() => {
        const user = authService.getCurrentUser()
        // Allow Admin (1), Project Manager (3), or PM Manager (10)
        return (user?.type == 1) || (user?.type == 3) || (user?.type == 10)
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
          const isSales = user && user.type == 5
          
          let data = null
          try {
             if (isEditor) {
                 data = await contractService.getEditorContractById(id)
             } else if (isSales) {
                 const res = await salesService.getProjectDetails(id)
                 const raw = res.data?.data || res.data || res
                 project.value = {
                     ...raw,
                     name: raw.project_name || raw.name,
                     advertiser_number: raw.advertiser_number || raw.advertiser_section_url || raw.advertiser_num_id || '—',
                     developer_name: raw.developer_name || raw.developer || raw.developer_info?.name,
                     location: raw.location || [raw.city, raw.district].filter(Boolean).join(' - '),
                     description: raw.description || raw.project_description || raw.details,
                     avgPrice: raw.average_unit_price || raw.avg_unit_price || raw.price
                 }
                 data = project.value
             } else {
                 data = await contractService.getContractById(id)
             }
          } catch(e) {
             logger.debug('Main fetch failed, utilizing fallback')
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
             photographyForm.isExisting = true
          } else {
             photographyForm.isExisting = false
          }

       } catch (e) {
         logger.error('Error loading project view:', e)
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
        if (!isTrackerCompleted.value && !isManager.value) {
            toast.warning('يجب إكمال جميع مراحل المتتبع أولاً')
            return
        }
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
            logger.error('Error loading teams:', error)
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
            toast.success('تم تعيين الفريق بنجاح')
            selectedTeamId.value = ''
            loadTeamsData() // Reload lists
        } catch (error) {
            logger.error('Error assigning team:', error)
            toast.error('حدث خطأ أثناء تعيين الفريق')
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
            toast.success('تم إزالة الفريق بنجاح')
            loadTeamsData() // Reload lists
        } catch (error) {
            logger.error('Error removing team:', error)
            toast.error('حدث خطأ أثناء إزالة الفريق')
        } finally {
            isTeamActionLoading.value = false
        }
    }

    const saveProgress = async () => {
       const currentStage = stages[activeStageIndex.value]
       
       if (!currentStage.value) {
           toast.warning('الرجاء إدخال الرابط قبل الحفظ')
           return
       }

       try {
           const payload = {}
           stages.forEach(stage => {
               if (stage.apiKey) {
                   payload[stage.apiKey] = stage.value || null
               }
           })
           
           logger.debug('Saving payload:', payload)

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
               toast.success('تهانينا! تم إكمال المتتبع، يمكنك الآن إدارة الوحدات.')
           }

       } catch (error) {
           logger.error('Failed to save progress:', error)
           const errorMsg = error.response?.data?.message || error.message
           toast.error(`حدث خطأ أثناء حفظ البيانات: ${errorMsg}`)
       }
    }

    // --- Units Functions ---

    const loadUnits = async () => {
        if (!project.value?.id) return
        unitsLoading.value = true
        try {
            const user = authService.getCurrentUser()
            if (user && user.type == 5) {
                const res = await salesService.getProjectUnits(project.value.id)
                const body = res.data
                const d = body?.data || body?.units || body
                units.value = Array.isArray(d) ? d : (Array.isArray(body) ? body : [])
            } else {
                units.value = await contractService.getContractUnits(project.value.id)
            }
        } catch (error) {
            logger.error('Error loading units:', error)
            units.value = []
        }
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
                image_url: photographyForm.image_url,
                video_url: photographyForm.video_url,
                description: photographyForm.description,
                status: 'pending' // Always pending on user edit
            }

            if (photographyForm.isExisting) {
                await contractService.updatePhotography(project.value.id, payload)
                toast.success('تم تحديث البيانات وإرسالها للموافقة')
            } else {
                await contractService.storePhotography(project.value.id, payload)
                toast.success('تم إرسال البيانات للموافقة بنجاح')
                photographyForm.isExisting = true
            }
            // Update local state
            photographyForm.status = 'pending'
            photographyForm.rejection_reason = null
            photographyForm.updated_at = new Date().toLocaleDateString('ar-SA')
            // Reset editing mode after successful save
            isEditingPending.value = false

        } catch (error) {
            logger.error('Photography save error:', error)
             const msg = error.response?.data?.message || error.message || 'خطأ غير معروف'
            toast.error(`حدث خطأ أثناء حفظ البيانات: ${msg}`)
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
            toast.success('تم قبول الصور بنجاح')
        } catch (error) {
            logger.error('Approval error:', error)
            toast.error('حدث خطأ أثناء القبول: ' + (error.response?.data?.message || error.message))
        }
    }

    const openRejectModal = () => {
        rejectReasonInput.value = ''
        showRejectModal.value = true
    }

    const rejectPhotography = async () => {
        if (!rejectReasonInput.value) {
            toast.warning('يرجى إدخال سبب الرفض')
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
            toast.success('تم رفض الصور')
        } catch (error) {
             logger.error(error)
            toast.error('حدث خطأ أثناء الرفض')
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
                toast.success('تم تحديث الوحدة بنجاح')
            } else {
                // Create
                await contractService.addContractUnit(project.value.id, {
                    ...unitForm
                })
                toast.success('تم إضافة الوحدة بنجاح')
            }
            closeUnitModal()
            loadUnits()
        } catch (error) {
            logger.error(error)
            const msg = error.response?.data?.message || error.message || 'خطأ غير معروف'
            toast.error(`حدث خطأ أثناء حفظ الوحدة: ${msg}`)
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
            toast.success('تم رفع ملف CSV بنجاح')
            loadUnits()
        } catch (error) {
            logger.error(error)
            const msg = error.response?.data?.message || error.message || 'خطأ غير معروف'
            toast.error(`فشل رفع الملف: ${msg}`)
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
            toast.success('تم تأكيد إضافة اللوحات بنجاح')
        } catch (error) {
            logger.error('Error saving board:', error)
            toast.error('حدث خطأ أثناء حفظ اللوحات')
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
        selectTeamsTab,
        // Reservations
        selectReservationsTab, projectReservations, reservationsLoading, showReservationModal, selectedUnit, isSubmitting, reservationForm,
        openReserveModal, submitReservation, confirmReservation, downloadVoucher
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
  padding: 30px 20px;
  text-align: right;
  direction: rtl;
}

/* Dashboard Section (Screenshot Style) */
.project-dashboard-section {
    margin-bottom: 40px;
    animation: slideUp 0.6s ease-out;
}

.dashboard-header-simple {
    text-align: right;
    margin-bottom: 30px;
    padding-right: 10px;
}

.location-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #64748b;
    font-size: 14px;
    margin-bottom: 5px;
}

.main-project-title {
    font-size: 32px;
    font-weight: 800;
    color: #1e3a5f;
    font-family: 'Amiri', serif;
    margin: 0;
}

.dashboard-stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 30px;
}

.dash-stat-card {
    background: white;
    border-radius: 20px;
    padding: 25px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    border: 1px solid #f1f5f9;
    transition: transform 0.3s;
}

.dash-stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.06);
}

.dash-label {
    font-size: 13px;
    color: #1e3a5f;
    font-weight: 700;
    margin-bottom: 12px;
}

.dash-value {
    font-size: 22px;
    font-weight: 800;
    color: #B1A28F;
    margin-bottom: 15px;
    font-family: 'Amiri', serif;
}

.dash-badge {
    font-size: 11px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 12px;
    text-transform: uppercase;
}

.dash-badge.ready { background: #dcfce7; color: #166534; }
.dash-badge.inventory { background: #e0f2fe; color: #0369a1; }
.dash-badge.status { background: #fef3c7; color: #92400e; }
.dash-badge.active { background: #f0f9ff; color: #075985; }
.dash-badge.partner { background: #f5f3ff; color: #5b21b6; }
.dash-badge.available { background: #ecfdf5; color: #065f46; }

.project-desc-card {
    background: white;
    border-radius: 20px;
    padding: 25px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    border: 1px solid #f1f5f9;
    margin-bottom: 40px;
}

.project-desc-card h3 {
    font-size: 18px;
    font-weight: 800;
    color: #1e3a5f;
    margin: 0 0 15px 0;
    text-align: right;
    border-bottom: 2px solid #f1f5f9;
    padding-bottom: 10px;
    display: inline-block;
}

.project-desc-card p {
    color: #64748b;
    font-size: 15px;
    line-height: 1.6;
    margin: 0;
}

.section-divider {
    border-bottom: 2px solid #1e3a5f;
    margin-bottom: 30px;
    padding-bottom: 10px;
    display: flex;
    justify-content: flex-end;
}

.section-divider h2 {
    font-size: 24px;
    font-weight: 800;
    color: #1e3a5f;
    margin: 0;
    font-family: 'Amiri', serif;
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
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
.btn-sm.reserve {
    background: #1e3a5f;
    color: white;
}
.btn-sm.reserve:hover {
    background: #234775;
}

.btn-sm-action {
    background: #f1f5f9;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
}
.btn-sm-action.success {
    background: #dcfce7;
    color: #166534;
}

.reservation-form {
    margin-top: 20px;
}

.status-badge.pending { background: #fef3c7; color: #d97706; }
.status-badge.confirmed { background: #dcfce7; color: #16a34a; }
.status-badge.cancelled { background: #fee2e2; color: #dc2626; }

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

/* --- New Vertical Stages List --- */
.stage-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
    border-color: #cbd5e1 !important;
    transform: translateY(-2px);
}

.stage-card.completed {
    border-color: #10b981 !important;
    background: #f0fdf4 !important;
}

/* --- Luxury Teams UI --- */
.glass-select {
    width: 100%;
    padding: 12px 15px;
    padding-left: 40px; /* For icon */
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    font-size: 14px;
    color: #1e3a5f;
    outline: none;
    appearance: none;
    cursor: pointer;
    font-weight: 500;
}

.select-arrow {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    stroke: #1e3a5f; /* Overriding inline stroke for visibility on white */
}

.glass-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.4);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(5px);
}

.glass-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
}

.glass-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.team-card-luxury {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.team-card-luxury::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0; width: 4px;
    background: #B1A28F;
    opacity: 0;
    transition: opacity 0.3s;
}

.team-card-luxury:hover {
    box-shadow: 0 10px 20px -5px rgba(0,0,0,0.05);
    transform: translateY(-3px);
}

.team-card-luxury:hover::before {
    opacity: 1;
}

.team-avatar {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
    color: #64748b;
    flex-shrink: 0;
}

.team-info h3 {
    margin: 0 0 4px 0;
    font-size: 16px;
    color: #1e293b;
}

.team-info p {
    margin: 0;
    font-size: 13px;
    color: #94a3b8;
}

.btn-remove {
    margin-right: auto; /* Push to far left in RTL */
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid #fee2e2;
    background: #fff5f5;
    color: #ef4444;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    opacity: 0; /* Hidden by default */
}

.team-card-luxury:hover .btn-remove {
    opacity: 1;
}

.btn-remove:hover {
    background: #ef4444;
    color: white;
    border-color: #ef4444;
}

</style>
