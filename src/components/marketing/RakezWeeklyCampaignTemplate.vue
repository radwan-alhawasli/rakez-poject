<!-- قالب خطة المطور للتصدير كـ PDF فقط -->
<template>
  <div class="report-shell" dir="rtl">
    <div class="a4-page">
      <header class="top-logo">
        <img v-if="logoSrc" :src="logoSrc" alt="RAKEZ Logo" class="logo-img" width="120" height="48" loading="lazy" />
        <div v-else class="logo-text-wrap">
          <div class="logo-mark">راكز</div>
          <div class="logo-en">RAKEZ</div>
        </div>
      </header>

      <section class="content">
        <h1 class="main-title">❖ الحملات الإعلانية على المنصات الإلكترونية</h1>
        <h2 class="sub-title">خطة أسبوعية مرنة :</h2>

        <table class="campaign-table">
          <thead>
            <tr>
              <th class="col-no">م</th>
              <th class="col-platform">المنصة الإعلانية</th>
              <th class="col-clicks">النقرات</th>
              <th class="col-impressions">المشاهدات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in rows" :key="row.id ?? index">
              <td class="text-center">{{ row.id }}</td>
              <td class="platform-cell">{{ row.platform }}</td>
              <td class="text-center">{{ formatNumber(row.clicks) }}</td>
              <td class="text-center">{{ formatNumber(row.impressions) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="spacer-row">
              <td colspan="4"></td>
            </tr>
            <tr class="total-row">
              <td colspan="2" class="total-label">الإجمالي</td>
              <td class="text-center total-number">{{ formatNumber(totalClicks) }}</td>
              <td class="text-center total-number">{{ formatNumber(totalImpressions) }}</td>
            </tr>
          </tfoot>
        </table>

        <div class="notes">
          <p>❖ الأرقام مرنة بشكل أسبوعي</p>
          <p>❖ سيتم تفعيل حملات - Traffic - Awareness - Leads - Sales</p>
        </div>
      </section>

      <footer class="page-footer">
        <div class="footer-left">
          <div>☎ {{ footer.phone }}</div>
          <div>@ {{ footer.website }}</div>
        </div>
        <div class="footer-center">
          <div>{{ footer.addressAr }}</div>
          <div>{{ footer.addressEn }}</div>
          <div>رقم السجل: {{ footer.cr }}</div>
          <div>C.R. {{ footer.cr }}</div>
        </div>
        <div class="footer-right">
          <div>{{ footer.companyAr }}</div>
          <div>{{ footer.companyEn }}</div>
        </div>
      </footer>

      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  logoSrc: {
    type: String,
    default: ''
  },
  rows: {
    type: Array,
    default: () => [
      { id: '01', platform: 'منصة إنستغرام', clicks: 11538, impressions: 2307692 },
      { id: '02', platform: 'منصة سناب', clicks: 4307, impressions: 1653846 },
      { id: '03', platform: 'منصة تيك توك', clicks: 1923, impressions: 711538 },
      { id: '05', platform: 'منصة تويتر X', clicks: 769, impressions: 192307 },
      { id: '06', platform: 'منصة جوجل (ضمن يوتيوب)', clicks: 3269, impressions: 615384 },
      { id: '07', platform: 'منصات أخرى (بيوت - سكني - حراج ...)', clicks: 576, impressions: 69230 },
      { id: '08', platform: 'منصة عقار', clicks: 673, impressions: 76923 }
    ]
  },
  footer: {
    type: Object,
    default: () => ({
      phone: '920015711',
      website: 'rakezalaqaria.com',
      addressAr: 'المملكة العربية السعودية - الرياض، حي الملقا، طريق أنس بن مالك 3110',
      addressEn: 'Kingdom of Saudi Arabia - Riyadh 3110 Anas Bin Malik street, Al Malqa Dist.',
      cr: '1010653001',
      companyAr: 'شركة راكز العقارية',
      companyEn: 'RAKEZ REAL ESTATE CO.'
    })
  }
})

const totalClicks = computed(() =>
  props.rows.reduce((sum, row) => sum + Number(row.clicks ?? 0), 0)
)

const totalImpressions = computed(() =>
  props.rows.reduce((sum, row) => sum + Number(row.impressions ?? 0), 0)
)

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Number(value ?? 0))
}
</script>

<style>
@font-face {
  font-family: 'Amiri';
  src: url('/fonts/Amiri-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
</style>
<style scoped>
.report-shell {
  min-height: 100vh;
  background: #e9e9e9;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 32px 16px;
  box-sizing: border-box;
  font-family: 'Amiri', 'Traditional Arabic', serif;
}

.a4-page {
  width: 794px;
  min-height: 1123px;
  background: #ffffff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 42px 52px 115px;
  box-sizing: border-box;
  font-family: 'Amiri', 'Traditional Arabic', serif;
}

.top-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
  margin-bottom: 24px;
}

.logo-img {
  max-width: 120px;
  max-height: 120px;
  object-fit: contain;
}

.logo-text-wrap {
  text-align: center;
  line-height: 1;
}

.logo-mark {
  font-size: 60px;
  font-weight: 700;
  color: #b7aa98;
}

.logo-en {
  margin-top: 6px;
  font-size: 18px;
  letter-spacing: 3px;
  color: #1f2430;
}

.content {
  margin-top: 18px;
}

.main-title {
  margin: 0;
  text-align: center;
  font-size: 28px;
  font-weight: 800;
  color: #0f2440;
}

.sub-title {
  margin: 38px 0 26px;
  text-align: right;
  font-size: 30px;
  font-weight: 800;
  color: #0f2440;
}

.campaign-table {
  width: 73%;
  margin: 0 auto;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 19px;
  color: #11243d;
}

.campaign-table th,
.campaign-table td {
  border: 1.5px solid #99a0a8;
  padding: 14px 12px;
  vertical-align: middle;
}

.campaign-table thead th {
  background: #ffffff;
  font-weight: 800;
}

.col-no {
  width: 8%;
}

.col-platform {
  width: 45%;
}

.col-clicks,
.col-impressions {
  width: 23.5%;
}

.platform-cell,
.total-label {
  background: #b7aa98;
  font-weight: 700;
}

.text-center {
  text-align: center;
}

.spacer-row td {
  background: #f6f6f6;
  height: 24px;
  padding: 8px;
}

.total-row td {
  font-weight: 800;
}

.total-label {
  text-align: center;
  font-size: 22px;
}

.total-number {
  font-size: 22px;
}

.notes {
  text-align: center;
  margin-top: 42px;
  color: #0f2440;
  font-size: 21px;
  font-weight: 800;
  line-height: 1.9;
}

.page-footer {
  position: absolute;
  bottom: 34px;
  left: 52px;
  right: 52px;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 16px;
  align-items: end;
  color: #9f9588;
  font-size: 11px;
  line-height: 1.7;
  z-index: 2;
}

.footer-left {
  text-align: left;
}

.footer-center {
  text-align: center;
}

.footer-right {
  text-align: right;
}

.shape {
  position: absolute;
  border: 1px solid rgba(183, 170, 152, 0.45);
  background: rgba(183, 170, 152, 0.04);
  z-index: 1;
}

.shape-1 {
  width: 150px;
  height: 220px;
  right: 20px;
  bottom: -35px;
  clip-path: polygon(35% 0, 100% 30%, 100% 100%, 0 100%, 0 25%);
}

.shape-2 {
  width: 120px;
  height: 180px;
  right: 75px;
  bottom: -10px;
  clip-path: polygon(40% 0, 100% 28%, 100% 100%, 0 100%, 0 22%);
}

.shape-3 {
  width: 90px;
  height: 140px;
  right: 130px;
  bottom: 18px;
  clip-path: polygon(45% 0, 100% 25%, 100% 100%, 0 100%, 0 18%);
}

.shape-4 {
  width: 60px;
  height: 100px;
  right: 175px;
  bottom: 48px;
  clip-path: polygon(48% 0, 100% 20%, 100% 100%, 0 100%, 0 15%);
}

@media print {
  .report-shell {
    background: transparent;
    padding: 0;
  }
  .a4-page {
    width: 210mm;
    min-height: 297mm;
    box-shadow: none;
    margin: 0;
  }
}
</style>
