<template>
  <div class="reports-tab">
    <div class="section-header-compact">
      <h2 class="section-title">التقارير والإحصائيات</h2>
      <p class="section-subtitle">إصدار تقارير دورية للأداء، الموظفين، والعقود.</p>
    </div>

    <div class="reports-grid">
      
      <!-- 1. Team Performance Report -->
      <div class="report-card">
        <div class="report-icon blue">📊</div>
        <div class="report-content">
          <h3 class="report-title">تقرير أداء الفرق</h3>
          <p class="report-desc">تقرير شهري يوضح أداء الفرق وتحقيق الأهداف.</p>
          
          <div class="report-controls">
            <select v-model="teamReport.month" class="form-select small">
              <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
            </select>
            <select v-model="teamReport.year" class="form-select small">
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>

          <button class="btn-generate" @click="generateTeamReport" :disabled="loading.team">
            <span v-if="loading.team">جاري التحميل...</span>
            <span v-else>📄 إصدار التقرير</span>
          </button>
        </div>
      </div>

      <!-- 2. Marketer Performance Report -->
      <div class="report-card">
        <div class="report-icon purple">👤</div>
        <div class="report-content">
          <h3 class="report-title">تقرير أداء مسوق</h3>
          <p class="report-desc">تقرير تفصيلي لأداء مسوق محدد خلال شهر.</p>
          
          <div class="report-controls">
             <select v-model="marketerReport.marketerId" class="form-select block">
              <option value="" disabled selected>اختر المسوق</option>
              <option v-for="m in marketers" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
            <div class="flex-row">
                <select v-model="marketerReport.month" class="form-select small">
                    <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
                </select>
                <select v-model="marketerReport.year" class="form-select small">
                    <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                </select>
            </div>
          </div>

          <button class="btn-generate" @click="generateMarketerReport" :disabled="loading.marketer || !marketerReport.marketerId">
            <span v-if="loading.marketer">جاري التحميل...</span>
            <span v-else>📄 إصدار التقرير</span>
          </button>
        </div>
      </div>

      <!-- 3. Current Employees Report -->
      <div class="report-card">
        <div class="report-icon green">👥</div>
        <div class="report-content">
          <h3 class="report-title">قائمة الموظفين الحاليين</h3>
          <p class="report-desc">تقرير شامل بجميع الموظفين النشطين في النظام.</p>
          <div class="spacer"></div>
          <button class="btn-generate" @click="generateEmployeesReport" :disabled="loading.employees">
            <span v-if="loading.employees">جاري التحميل...</span>
            <span v-else>📄 تحميل القائمة</span>
          </button>
        </div>
      </div>

      <!-- 4. Expiring Contracts Report -->
      <div class="report-card">
        <div class="report-icon red">⚠️</div>
        <div class="report-content">
          <h3 class="report-title">العقود وفترات التجربة</h3>
          <p class="report-desc">تقرير بالعقود المنتهية وقرب انتهاء فترة التجربة.</p>
          
           <div class="report-controls">
              <label class="control-label">تنبيه قبل (أيام):</label>
              <input type="number" v-model="contractsReport.days" class="form-input small" min="1" max="90">
           </div>

          <button class="btn-generate" @click="generateContractsReport" :disabled="loading.contracts">
            <span v-if="loading.contracts">جاري التحميل...</span>
            <span v-else>📄 تحميل التقرير</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import hrService from '../services/hrService'
import logger from '../utils/logger'

export default {
  name: 'ReportsTab',
  setup() {
    const loading = reactive({
      team: false,
      marketer: false,
      employees: false,
      contracts: false
    })

    const marketers = ref([])
    const currentYear = new Date().getFullYear()
    const years = [currentYear, currentYear - 1, currentYear - 2]

    const teamReport = reactive({ month: new Date().getMonth() + 1, year: currentYear })
    const marketerReport = reactive({ marketerId: '', month: new Date().getMonth() + 1, year: currentYear })
    const contractsReport = reactive({ days: 30 })

    const getMonthName = (m) => {
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
        return months[m - 1]
    }

    const loadMarketers = async () => {
        try {
            // Reusing getMarketerPerformance to get list of marketers, or could use getEmployees({ role: 'marketing' })
            const data = await hrService.getMarketerPerformance()
            marketers.value = data.map(m => ({ id: m.id, name: m.name }))
        } catch (error) {
            logger.error('Error loading marketers', error)
            // Mock capability if service fails
            marketers.value = [
                { id: 1, name: 'أحمد العتيبي' },
                { id: 2, name: 'خالد محمد' },
                { id: 3, name: 'سارة أحمد' }
            ]
        }
    }

    const generateTeamReport = async () => {
        loading.team = true
        try {
            await hrService.generateTeamPerformanceReport(teamReport.month, teamReport.year)
        } catch (error) {
            logger.error('Error generating team report', error)
            alert('حدث خطأ أثناء إصدار التقرير')
        } finally {
            loading.team = false
        }
    }

    const generateMarketerReport = async () => {
        if (!marketerReport.marketerId) return
        loading.marketer = true
        try {
            await hrService.generateMarketerReport(marketerReport.marketerId, marketerReport.month, marketerReport.year)
        } catch (error) {
            logger.error('Error generating marketer report', error)
            alert('حدث خطأ أثناء إصدار التقرير')
        } finally {
            loading.marketer = false
        }
    }

    const generateEmployeesReport = async () => {
        loading.employees = true
        try {
            await hrService.generateEmployeesReport()
        } catch (error) {
            logger.error('Error generating employees report', error)
            alert('حدث خطأ أثناء إصدار التقرير')
        } finally {
            loading.employees = false
        }
    }

    const generateContractsReport = async () => {
        loading.contracts = true
        try {
            await hrService.generateExpiringContractsReport(contractsReport.days)
        } catch (error) {
            logger.error('Error generating contracts report', error)
            alert('حدث خطأ أثناء إصدار التقرير')
        } finally {
            loading.contracts = false
        }
    }

    onMounted(() => {
        loadMarketers()
    })

    return {
        loading,
        marketers,
        years,
        teamReport,
        marketerReport,
        contractsReport,
        getMonthName,
        generateTeamReport,
        generateMarketerReport,
        generateEmployeesReport,
        generateContractsReport
    }
  }
}
</script>

<style scoped>
.reports-tab {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.section-header-compact {
  margin-bottom: 24px;
  border-right: 4px solid #B1A28F;
  padding-right: 15px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 5px 0;
  font-family: 'Amiri', serif;
}

.section-subtitle {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.report-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
}

.report-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border-color: #B1A28F;
}

.report-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 20px;
}

.report-icon.blue { background: #eff6ff; color: #3b82f6; }
.report-icon.purple { background: #f3e8ff; color: #a855f7; }
.report-icon.green { background: #ecfdf5; color: #10b981; }
.report-icon.red { background: #fef2f2; color: #ef4444; }

.report-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.report-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  font-family: 'Amiri', serif;
}

.report-desc {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.report-controls {
  margin-top: auto;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.flex-row {
    display: flex;
    gap: 10px;
}

.form-select, .form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-family: 'Tajawal', sans-serif;
  font-size: 13px;
  background-color: #f8fafc;
}

.form-select.small { flex: 1; }
.block { display: block; width: 100%; }

.control-label {
    font-size: 12px;
    font-weight: 600;
    color: #475569;
}

.spacer { margin-top: auto; }

.btn-generate {
  width: 100%;
  padding: 10px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  color: #475569;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-generate:hover:not(:disabled) {
  background: #1e3a5f;
  border-color: #1e3a5f;
  color: white;
}

.btn-generate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .reports-grid { grid-template-columns: 1fr; }
}
</style>
