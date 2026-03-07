<template>
  <div class="marketing-view">
    <!-- Tab Content -->
    <div class="tab-content custom-scrollbar">
      <MarketingDashboardTab v-if="activeTab === 'dashboard'" />
      <MarketingProjectsTab v-else-if="activeTab === 'projects'" />
      <MarketingDeveloperPlanTab v-else-if="activeTab === 'developer-plan' || activeTab === 'plans'" />
      <MarketingEmployeePlansTab v-else-if="activeTab === 'employee-plans'" />
      <MarketingTasksTab v-else-if="activeTab === 'tasks'" />
      <MarketingLeadsTab v-else-if="activeTab === 'leads'" />
      <MarketingExpectedSalesTab v-else-if="activeTab === 'expected-sales'" />
      <MarketingReportsTab v-else-if="activeTab === 'reports'" />
      <MarketingAiAssistantTab v-else-if="activeTab === 'ai-assistant'" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import MarketingDashboardTab from '@/components/marketing/MarketingDashboardTab.vue';
import MarketingProjectsTab from '@/components/marketing/MarketingProjectsTab.vue';
import MarketingDeveloperPlanTab from '@/components/marketing/MarketingDeveloperPlanTab.vue';
import MarketingEmployeePlansTab from '@/components/marketing/MarketingEmployeePlansTab.vue';
import MarketingTasksTab from '@/components/marketing/MarketingTasksTab.vue';
import MarketingLeadsTab from '@/components/marketing/MarketingLeadsTab.vue';
import MarketingExpectedSalesTab from '@/components/marketing/MarketingExpectedSalesTab.vue';
import MarketingReportsTab from '@/components/marketing/MarketingReportsTab.vue';
import MarketingAiAssistantTab from '@/components/marketing/MarketingAiAssistantTab.vue';

const route = useRoute();

const VALID_TABS = ['dashboard', 'projects', 'tasks', 'leads', 'expected-sales', 'reports', 'plans', 'developer-plan', 'employee-plans', 'ai-assistant'];

const activeTab = computed(() => {
  const path = String(route.path || '').replace(/\/$/, '');
  const parts = path.split('/').filter(Boolean);
  const tab = parts[1] || 'dashboard';
  return VALID_TABS.includes(tab) ? tab : 'dashboard';
});
</script>

<style scoped>
.marketing-view {
  direction: rtl;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.tab-content {
  padding: 30px;
  overflow-y: auto;
  max-height: calc(100dvh - 160px);
}

.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(177, 162, 143, 0.05); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #b1a28f 0%, #8c7851 100%); border-radius: 10px; }
</style>

<style>
/* Welcome Header - use global styles (blue gradient, white text) */
.marketing-view .welcome-header { animation: mktSlideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
@keyframes mktSlideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

/* Stats Grid */
.marketing-view .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 40px; }
.marketing-view .stat-card { position: relative; background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%); border-radius: var(--radius-lg); padding: 32px; display: flex; align-items: center; justify-content: space-between; border: 1px solid rgba(177, 162, 143, 0.15); box-shadow: 0 4px 6px -1px rgba(30, 58, 95, 0.03), 0 10px 20px -5px rgba(30, 58, 95, 0.05), 0 0 0 1px rgba(177, 162, 143, 0.1); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; }
.marketing-view .stat-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, rgba(177, 162, 143, 0.05) 0%, transparent 100%); opacity: 0; transition: opacity 0.4s ease; }
.marketing-view .stat-card:hover::before { opacity: 1; }
.marketing-view .hover-lift { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.marketing-view .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 12px 24px -4px rgba(30, 58, 95, 0.1), 0 20px 40px -8px rgba(177, 162, 143, 0.15), 0 0 0 1px rgba(177, 162, 143, 0.2); }
.marketing-view .animate-fade-in-up { animation: mktFadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) backwards; }
@keyframes mktFadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
.marketing-view .animate-stagger-1 { animation-delay: 0.1s; }
.marketing-view .animate-stagger-2 { animation-delay: 0.2s; }
.marketing-view .animate-stagger-3 { animation-delay: 0.3s; }
.marketing-view .animate-stagger-4 { animation-delay: 0.4s; }
.marketing-view .stat-content { display: flex; flex-direction: column; gap: 10px; z-index: 1; }
.marketing-view .stat-label { font-size: 14px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.marketing-view .stat-value { font-size: 36px; font-weight: 700; color: #1e3a5f; line-height: 1; }
.marketing-view .stat-value.number { font-variant-numeric: lining-nums tabular-nums; }
.marketing-view .stat-desc { font-size: 13px; color: #94a3b8; }
.marketing-view .stat-icon-bg { width: 80px; height: 80px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; overflow: hidden; }
.marketing-view .stat-icon-bg::before { content: ''; position: absolute; inset: 0; background: inherit; filter: blur(20px); opacity: 0.5; }
.marketing-view .stat-icon-bg svg { width: 36px; height: 36px; position: relative; z-index: 1; color: white; }
.marketing-view .stat-icon-bg.projects { background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%); }
.marketing-view .stat-icon-bg.units { background: linear-gradient(135deg, #2d5a8f 0%, #1e3a5f 100%); }
.marketing-view .stat-icon-bg.ready { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
.marketing-view .stat-icon-bg.dollar { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }

/* Overview Section */
.marketing-view .overview-section { background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%); border-radius: var(--radius-lg); padding: 32px; border: 1px solid rgba(177, 162, 143, 0.15); box-shadow: 0 4px 6px -1px rgba(30, 58, 95, 0.03), 0 10px 20px -5px rgba(30, 58, 95, 0.05); }
.marketing-view .section-header { margin-bottom: 24px; }
.marketing-view .section-title-chart { font-size: 24px; font-weight: 700; color: #1e3a5f; margin: 0 0 8px 0; }
.marketing-view .section-desc { font-size: 14px; color: #64748b; margin: 0; }
.marketing-view .chart-placeholder { height: 300px; background: rgba(177, 162, 143, 0.03); border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 2px dashed rgba(177, 162, 143, 0.2); }

/* Section Header Compact */
.marketing-view .section-header-compact { margin-bottom: 30px; }
.marketing-view .section-title { font-size: 28px; font-weight: 700; color: #1e3a5f; margin: 0 0 8px 0; }
.marketing-view .section-subtitle { font-size: 14px; color: #64748b; margin: 0; }

/* Buttons */
.marketing-view .btn-primary { background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 12px rgba(177, 162, 143, 0.25); display: inline-flex; align-items: center; justify-content: center; }
.marketing-view .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(177, 162, 143, 0.35); filter: brightness(1.1); }
.marketing-view .btn-primary:disabled { background: #cbd5e1; cursor: not-allowed; transform: none; box-shadow: none; opacity: 0.7; }
.marketing-view .btn-secondary { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; padding: 12px 24px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
.marketing-view .btn-secondary:hover { background: #e2e8f0; color: #475569; }
.marketing-view .plus-icon { font-size: 20px; font-weight: 700; margin-left: 8px; }

/* Projects Grid */
.marketing-view .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; }
.marketing-view .project-card { background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%); border-radius: 16px; padding: 24px; border: 1px solid rgba(177, 162, 143, 0.15); box-shadow: 0 4px 6px -1px rgba(30, 58, 95, 0.03), 0 10px 20px -5px rgba(30, 58, 95, 0.05); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.marketing-view .project-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -4px rgba(30, 58, 95, 0.1), 0 20px 40px -8px rgba(177, 162, 143, 0.15); }
.marketing-view .project-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px; }
.marketing-view .project-name { font-size: 18px; font-weight: 700; color: #1e3a5f; margin: 0; flex: 1; }
.marketing-view .project-status { padding: 4px 12px; border-radius: var(--radius-lg); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.marketing-view .status-active { background: rgba(16, 185, 129, 0.1); color: #059669; }
.marketing-view .status-completed { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
.marketing-view .status-pending { background: rgba(245, 158, 11, 0.1); color: #d97706; }
.marketing-view .status-cancelled { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
.marketing-view .project-details { margin-bottom: 20px; }
.marketing-view .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(177, 162, 143, 0.1); font-size: 14px; }
.marketing-view .detail-row:last-child { border-bottom: none; }
.marketing-view .detail-label { color: #64748b; font-weight: 500; }
.marketing-view .detail-value { color: #1e3a5f; font-weight: 600; }
.marketing-view .detail-value.number { font-variant-numeric: lining-nums tabular-nums; }
.marketing-view .project-actions { display: flex; gap: 12px; }
.marketing-view .btn-view, .marketing-view .btn-plan { flex: 1; padding: 10px 16px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
.marketing-view .btn-view { background: rgba(177, 162, 143, 0.1); color: #b1a28f; border: 1px solid rgba(177, 162, 143, 0.2); }
.marketing-view .btn-view:hover { background: rgba(177, 162, 143, 0.2); }
.marketing-view .btn-plan { background: rgba(30, 58, 95, 0.1); color: #1e3a5f; border: 1px solid rgba(30, 58, 95, 0.2); }
.marketing-view .btn-plan:hover { background: rgba(30, 58, 95, 0.2); }
.marketing-view .btn-view svg, .marketing-view .btn-plan svg { width: 16px; height: 16px; }

/* Tasks List */
.marketing-view .tasks-list { display: flex; flex-direction: column; gap: 16px; }
.marketing-view .task-card { background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%); border-radius: 16px; padding: 20px; border: 1px solid rgba(177, 162, 143, 0.15); box-shadow: 0 2px 4px -1px rgba(30, 58, 95, 0.03), 0 4px 8px -2px rgba(30, 58, 95, 0.05); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.marketing-view .task-card:hover { transform: translateX(-4px); box-shadow: 0 8px 16px -4px rgba(30, 58, 95, 0.1), 0 12px 24px -8px rgba(177, 162, 143, 0.15); }
.marketing-view .task-header { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
.marketing-view .task-checkbox { position: relative; width: 24px; height: 24px; cursor: pointer; flex-shrink: 0; }
.marketing-view .task-checkbox input[type='checkbox'] { position: absolute; opacity: 0; cursor: pointer; }
.marketing-view .checkmark { position: absolute; top: 0; left: 0; height: 24px; width: 24px; background: rgba(177, 162, 143, 0.1); border: 2px solid rgba(177, 162, 143, 0.3); border-radius: 6px; transition: all 0.3s ease; }
.marketing-view .task-checkbox input[type='checkbox']:checked ~ .checkmark { background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%); border-color: #b1a28f; }
.marketing-view .task-checkbox .checkmark::after { content: ''; position: absolute; display: none; left: 7px; top: 3px; width: 6px; height: 10px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
.marketing-view .task-checkbox input[type='checkbox']:checked ~ .checkmark::after { display: block; }
.marketing-view .task-info { flex: 1; }
.marketing-view .task-title { font-size: 16px; font-weight: 600; color: #1e3a5f; margin: 0 0 4px 0; transition: all 0.3s ease; }
.marketing-view .task-title.completed { text-decoration: line-through; color: #94a3b8; }
.marketing-view .task-description { font-size: 14px; color: #64748b; margin: 0; }
.marketing-view .task-status-badge { padding: 6px 14px; border-radius: var(--radius-lg); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
.marketing-view .task-completed { background: rgba(16, 185, 129, 0.1); color: #059669; }
.marketing-view .task-in-progress { background: rgba(245, 158, 11, 0.1); color: #d97706; }
.marketing-view .task-pending { background: rgba(148, 163, 184, 0.1); color: #64748b; }
.marketing-view .task-meta { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #94a3b8; }

/* Leads Table */
.marketing-view .leads-table-container { background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%); border-radius: 16px; padding: 24px; border: 1px solid rgba(177, 162, 143, 0.15); box-shadow: 0 4px 6px -1px rgba(30, 58, 95, 0.03), 0 10px 20px -5px rgba(30, 58, 95, 0.05); overflow-x: auto; }
.marketing-view .luxury-table { width: 100%; border-collapse: collapse; }
.marketing-view .luxury-table thead { background: rgba(177, 162, 143, 0.05); border-bottom: 2px solid rgba(177, 162, 143, 0.15); }
.marketing-view .luxury-table th { padding: 16px; text-align: right; font-size: 14px; font-weight: 700; color: #1e3a5f; text-transform: uppercase; letter-spacing: 0.5px; }
.marketing-view .luxury-table tbody tr { border-bottom: 1px solid rgba(177, 162, 143, 0.1); transition: all 0.3s ease; }
.marketing-view .luxury-table tbody tr:hover { background: rgba(177, 162, 143, 0.03); }
.marketing-view .luxury-table td { padding: 16px; font-size: 14px; color: #1e3a5f; vertical-align: middle; }
.marketing-view .lead-name { font-weight: 600; color: #1e3a5f; }

/* Premium Developer Plan */
.marketing-view .plan-output-luxury { background: white; border: 1px solid rgba(177, 162, 143, 0.2); display: flex; flex-direction: column; }
.marketing-view .premium-metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px; }
.marketing-view .metric-mini-card { background: #fdfbf7; padding: 16px; border-radius: 12px; display: flex; align-items: center; gap: 12px; border: 1px solid rgba(177, 162, 143, 0.1); transition: all 0.3s ease; }
.marketing-view .metric-mini-card:hover { background: white; box-shadow: 0 4px 12px rgba(177, 162, 143, 0.1); }
.marketing-view .metric-icon-small { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; }
.marketing-view .metric-icon-small svg { width: 20px; height: 20px; }
.marketing-view .metric-icon-small.budget { background: linear-gradient(135deg, #b1a28f, #8c7851); }
.marketing-view .metric-icon-small.impressions { background: linear-gradient(135deg, #1e3a5f, #2d5a8f); }
.marketing-view .metric-icon-small.clicks { background: linear-gradient(135deg, #10b981, #059669); }
.marketing-view .metric-icon-small.duration { background: linear-gradient(135deg, #f59e0b, #d97706); }
.marketing-view .m-label { display: block; font-size: 12px; color: #64748b; margin-bottom: 2px; }
.marketing-view .m-value { display: block; font-size: 16px; font-weight: 700; color: #1e3a5f; }
.marketing-view .math-formulas-box { margin-top: 30px; padding-top: 20px; border-top: 1px dashed rgba(177, 162, 143, 0.3); }
.marketing-view .formula-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #8c7851; margin-bottom: 12px; }
.marketing-view .formula-item { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; padding: 8px 12px; background: rgba(177, 162, 143, 0.05); border-radius: var(--radius-sm); }
.marketing-view .f-name { color: #64748b; font-weight: 600; }
.marketing-view .f-math { color: #1e3a5f; font-weight: 700; }
.marketing-view .field-icon { width: 16px; height: 16px; vertical-align: middle; margin-left: 8px; color: #b1a28f; }

/* AI Assistant */
.marketing-view .ai-chat-container { display: grid; grid-template-columns: minmax(260px, 320px) 1fr; height: clamp(520px, 70dvh, 760px); max-height: calc(100dvh - 220px); background: white; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid rgba(177, 162, 143, 0.15); box-shadow: 0 10px 30px rgba(177, 161, 142, 0.08); }
.marketing-view .ai-sidebar { background: #fdfbf7; border-left: 1px solid rgba(177, 162, 143, 0.15); display: flex; flex-direction: column; min-height: 0; min-width: 0; }
.marketing-view .sidebar-header-ai { padding: 24px; border-bottom: 1px solid rgba(177, 162, 143, 0.1); }
.marketing-view .sidebar-header-ai h3 { font-size: 16px; color: #1e3a5f; margin: 0 0 16px 0; }
.marketing-view .btn-new-chat { width: 100%; padding: 10px; border-radius: 10px; background: white; border: 2px dashed #b1a28f; color: #b1a28f; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
.marketing-view .btn-new-chat:hover { background: #b1a28f; color: white; }
.marketing-view .conversations-list-ai { flex: 1; overflow-y: auto; padding: 12px; min-height: 0; }
.marketing-view .conversation-item-ai { padding: 12px 16px; border-radius: 12px; display: flex; align-items: center; gap: 12px; cursor: pointer; font-size: 14px; color: #64748b; margin-bottom: 4px; transition: all 0.2s ease; }
.marketing-view .conversation-item-ai:hover { background: rgba(177, 162, 143, 0.1); color: #1e3a5f; }
.marketing-view .conversation-item-ai.active { background: #b1a28f; color: white; }
.marketing-view .ai-main-chat { display: flex; flex-direction: column; background: white; min-height: 0; min-width: 0; }
.marketing-view .chat-messages { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 16px; min-height: 0; }
.marketing-view .chat-bubble { max-width: 80%; display: flex; }
.marketing-view .chat-bubble.user { align-self: flex-end; }
.marketing-view .chat-bubble.assistant { align-self: flex-start; }
.marketing-view .bubble-content { padding: 14px 20px; border-radius: 16px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05); }
.marketing-view .user .bubble-content { background: linear-gradient(135deg, #1e3a5f, #2d5a8f); color: white; border-bottom-left-radius: 4px; }
.marketing-view .assistant .bubble-content { background: #f1f5f9; color: #1e3a5f; border-bottom-right-radius: 4px; }
.marketing-view .bubble-sender { font-size: 11px; font-weight: 700; margin-bottom: 4px; opacity: 0.8; text-transform: uppercase; }
.marketing-view .chat-input-area { padding: 24px; border-top: 1px solid rgba(177, 162, 143, 0.1); }
.marketing-view .input-wrapper { display: flex; align-items: center; background: #f8fafc; border-radius: 14px; padding: 8px 16px; border: 1px solid #e2e8f0; }
.marketing-view .input-wrapper textarea { flex: 1; background: transparent; border: none; outline: none; padding: 10px 0; resize: none; max-height: 100px; }
.marketing-view .btn-send-ai { background: #1e3a5f; color: white; width: 40px; height: 40px; border-radius: 10px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
.marketing-view .btn-send-ai:hover:not(:disabled) { transform: scale(1.05); background: #2d5a8f; }
.marketing-view .btn-send-ai:disabled { opacity: 0.5; cursor: not-allowed; }
.marketing-view .btn-send-ai svg { width: 20px; height: 20px; }
.marketing-view .ai-welcome-box { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px; margin: auto; }
.marketing-view .ai-avatar-large { font-size: 64px; margin-bottom: 20px; }
.marketing-view .ai-welcome-box h3 { color: #1e3a5f; margin-bottom: 12px; }
.marketing-view .ai-welcome-box p { color: #64748b; max-width: 400px; line-height: 1.6; }
.marketing-view .quick-prompts { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 30px; }
.marketing-view .quick-prompts button { padding: 10px 18px; border-radius: 12px; background: white; border: 1px solid rgba(177, 162, 143, 0.2); color: #1e3a5f; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
.marketing-view .quick-prompts button:hover { border-color: #b1a28f; background: #fdfbf7; }
.marketing-view .typing-indicator { display: flex; gap: 4px; padding: 4px; }
.marketing-view .typing-indicator span { width: 8px; height: 8px; background: #64748b; border-radius: 50%; animation: mktTyping 1s infinite alternate; }
.marketing-view .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.marketing-view .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
@keyframes mktTyping { from { opacity: 0.3; transform: translateY(0); } to { opacity: 1; transform: translateY(-4px); } }

/* Streaming cursor (ChatGPT-style) */
.marketing-view .bubble-text { white-space: pre-wrap; word-break: break-word; line-height: 1.7; }
.marketing-view .streaming-cursor {
  display: inline-block;
  width: 3px;
  height: 1.1em;
  background: #1e3a5f;
  margin-right: 4px;
  vertical-align: text-bottom;
  border-radius: 2px;
  animation: streamBlink 0.6s steps(2) infinite;
}
@keyframes streamBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

.marketing-view .chat-bubble.streaming .bubble-content {
  background: #f8fafc;
  border: 1px solid rgba(30, 58, 95, 0.08);
}

/* Stop streaming button */
.marketing-view .btn-stop-ai {
  background: #dc2626;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  animation: stopPulse 1.5s ease-in-out infinite;
}
.marketing-view .btn-stop-ai:hover { background: #b91c1c; transform: scale(1.05); }
.marketing-view .btn-stop-ai svg { width: 18px; height: 18px; }
@keyframes stopPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.3); } 50% { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); } }

.marketing-view .lead-contact { direction: ltr; text-align: left; font-variant-numeric: lining-nums tabular-nums; }
.marketing-view .lead-source-badge { display: inline-block; padding: 6px 12px; border-radius: var(--radius-lg); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
.marketing-view .source-snapchat { background: rgba(255, 252, 0, 0.1); color: #ffd700; }
.marketing-view .source-instagram { background: rgba(225, 48, 108, 0.1); color: #e1306c; }
.marketing-view .source-twitter { background: rgba(29, 155, 240, 0.1); color: #1d9bf0; }
.marketing-view .source-facebook { background: rgba(24, 119, 242, 0.1); color: #1877f2; }
.marketing-view .source-google { background: rgba(66, 133, 244, 0.1); color: #4285f4; }
.marketing-view .source-website { background: rgba(177, 162, 143, 0.1); color: #b1a28f; }
.marketing-view .source-referral { background: rgba(16, 185, 129, 0.1); color: #059669; }
.marketing-view .source-other { background: rgba(148, 163, 184, 0.1); color: #64748b; }
.marketing-view .lead-date { font-variant-numeric: lining-nums tabular-nums; color: #64748b; }
.marketing-view .details-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 16px; }
.marketing-view .detail-item { background: rgba(177, 162, 143, 0.04); border: 1px solid rgba(177, 162, 143, 0.12); border-radius: 12px; padding: 12px 14px; display: flex; justify-content: space-between; gap: 12px; }
.marketing-view .details-teams { display: flex; flex-wrap: wrap; gap: 10px; }
.marketing-view .team-pill { background: rgba(30, 58, 95, 0.06); border: 1px solid rgba(30, 58, 95, 0.12); color: #1e3a5f; border-radius: 999px; padding: 8px 12px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; }
.marketing-view .team-name { font-weight: 700; }
.marketing-view .team-role { opacity: 0.8; }
.marketing-view .btn-icon { background: rgba(177, 162, 143, 0.1); border: 1px solid rgba(177, 162, 143, 0.2); width: 36px; height: 36px; border-radius: var(--radius-sm); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; color: #b1a28f; }
.marketing-view .btn-icon:hover { background: rgba(177, 162, 143, 0.2); transform: scale(1.1); }
.marketing-view .btn-icon svg { width: 16px; height: 16px; }

/* Loading & Empty States */
.marketing-view .loading-state,
.marketing-view .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; }
.marketing-view .spinner { width: 48px; height: 48px; border: 4px solid rgba(177, 162, 143, 0.15); border-top-color: #b1a28f; border-radius: 50%; animation: mktSpin 0.8s linear infinite; margin-bottom: 20px; }
@keyframes mktSpin { to { transform: rotate(360deg); } }
.marketing-view .spinner-small { width: 18px; height: 18px; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: white; border-radius: 50%; animation: mktSpin 0.8s linear infinite; margin-left: 8px; }
.marketing-view .loading-state p,
.marketing-view .empty-state p { font-size: 16px; color: #64748b; margin: 0; }
.marketing-view .empty-state svg { width: 64px; height: 64px; color: #cbd5e1; margin-bottom: 16px; }

/* Sub-tabs */
.marketing-view .btn-tab-mini { padding: 8px 20px; border-radius: 10px; border: 1px solid rgba(177, 162, 143, 0.2); background: white; color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
.marketing-view .btn-tab-mini:hover { background: #fdfbf7; border-color: #b1a28f; color: #b1a28f; }
.marketing-view .btn-tab-mini.active { background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%); color: white; border-color: #b1a28f; box-shadow: 0 4px 10px rgba(177, 162, 143, 0.2); }

/* Modal */
.marketing-view .modal-overlay { position: fixed; inset: 0; background: rgba(30, 58, 95, 0.5); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; animation: mktFadeIn 0.3s ease; }
@keyframes mktFadeIn { from { opacity: 0; } to { opacity: 1; } }
.marketing-view .modal-content { background: white; border-radius: var(--radius-lg); max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(30, 58, 95, 0.3); }
.marketing-view .animate-scale-in { animation: mktScaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
@keyframes mktScaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
.marketing-view .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 24px; border-bottom: 1px solid rgba(177, 162, 143, 0.15); }
.marketing-view .modal-title { font-size: 20px; font-weight: 700; color: #1e3a5f; margin: 0; }
.marketing-view .modal-close { width: 32px; height: 32px; border: none; background: rgba(177, 162, 143, 0.1); border-radius: var(--radius-sm); font-size: 24px; line-height: 1; color: #64748b; cursor: pointer; transition: all 0.3s ease; }
.marketing-view .modal-close:hover { background: rgba(177, 162, 143, 0.2); color: #1e3a5f; }
.marketing-view .modal-body { padding: 24px; }
.marketing-view .form-group { margin-bottom: 20px; }
.marketing-view .form-group label { display: block; font-size: 14px; font-weight: 600; color: #64748b; margin-bottom: 8px; }
.marketing-view .form-group label .required { color: #ef4444; margin-right: 4px; }
.marketing-view .form-input { width: 100%; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 15px; background: #fdfbf7; transition: all 0.2s; color: #1e3a5f; text-align: right; }
.marketing-view .form-input:focus { outline: none; border-color: #b1a28f; box-shadow: 0 0 0 3px rgba(177, 162, 143, 0.1); background: white; }
.marketing-view .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 24px; border-top: 1px solid rgba(177, 162, 143, 0.15); }
.marketing-view .animate-fade-in { animation: mktFadeIn 0.4s ease-out; }

/* AI Chat Responsive */
@media (max-width: 991px) {
  .marketing-view .ai-chat-container { grid-template-columns: 1fr; height: auto; max-height: none; }
  .marketing-view .ai-main-chat { min-height: clamp(460px, 55dvh, 720px); }
  .marketing-view .chat-messages { padding: 16px; }
  .marketing-view .chat-input-area { padding: 16px; }
  .marketing-view .ai-sidebar { border-left: none; border-top: 1px solid rgba(177, 162, 143, 0.15); }
  .marketing-view .sidebar-header-ai { padding: 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .marketing-view .sidebar-header-ai h3 { margin: 0; font-size: 15px; }
  .marketing-view .btn-new-chat { width: auto; padding: 8px 12px; white-space: nowrap; }
  .marketing-view .conversations-list-ai { max-height: 220px; }
}
@media (max-width: 768px) {
  .marketing-view .tab-content { padding: 20px; }
  .marketing-view .welcome-title { font-size: 24px; }
  .marketing-view .stats-grid { grid-template-columns: 1fr; }
  .marketing-view .projects-grid { grid-template-columns: 1fr; }
  .marketing-view .section-title { font-size: 22px; }
  .marketing-view .detail-row { flex-direction: column; gap: 4px; }
  .marketing-view .leads-table-container { overflow-x: scroll; }
  .marketing-view .luxury-table { min-width: 600px; }
  .marketing-view .details-grid { grid-template-columns: 1fr; }
}
@media (max-width: 576px) {
  .marketing-view .tab-content { padding: 14px; }
  .marketing-view .welcome-title { font-size: 20px; }
  .marketing-view .section-title { font-size: 18px; }
  .marketing-view .luxury-table th, .marketing-view .luxury-table td { padding: 10px 8px; font-size: 12px; }
  .marketing-view .stat-card { padding: 14px; }
  .marketing-view .form-input { min-width: 0; max-width: 100%; }
  .marketing-view .premium-metrics-grid { grid-template-columns: 1fr; }
  .marketing-view .modal-content { max-width: 100%; border-radius: 12px 12px 0 0; }
  .marketing-view .modal-overlay { padding: 0; align-items: flex-end; }
  .marketing-view .conversations-list-ai { max-height: 180px; }
}
@media (max-width: 320px) {
  .marketing-view .tab-content { padding: 10px; }
  .marketing-view .welcome-title { font-size: 18px; }
  .marketing-view .section-title { font-size: 16px; }
  .marketing-view .stat-card { padding: 12px; border-radius: 12px; }
  .marketing-view .stat-value { font-size: 24px; }
  .marketing-view .stat-icon-bg { width: 56px; height: 56px; border-radius: 12px; }
  .marketing-view .stat-icon-bg svg { width: 26px; height: 26px; }
  .marketing-view .luxury-table th, .marketing-view .luxury-table td { padding: 8px 6px; font-size: 11px; }
  .marketing-view .form-input { padding: 10px 12px; font-size: 14px; min-width: 0; }
  .marketing-view .btn-primary, .marketing-view .btn-secondary { padding: 10px 16px; font-size: 13px; }
}
@media (min-width: 1200px) {
  .marketing-view .stats-grid { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
  .marketing-view .projects-grid { grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); }
}
@media (min-width: 1920px) {
  .marketing-view .tab-content { padding: 36px; }
  .marketing-view .welcome-title { font-size: 34px; }
  .marketing-view .section-title { font-size: 28px; }
  .marketing-view .stats-grid { gap: 24px; }
  .marketing-view .luxury-table th, .marketing-view .luxury-table td { padding: 20px; font-size: 15px; }
}
@media (min-width: 2560px) {
  .marketing-view .tab-content { padding: 44px; }
  .marketing-view .welcome-title { font-size: 40px; }
  .marketing-view .section-title { font-size: 32px; }
  .marketing-view .luxury-table th, .marketing-view .luxury-table td { padding: 24px; font-size: 16px; }
  .marketing-view .stat-value { font-size: 34px; }
}
@media (min-width: 3840px) {
  .marketing-view .tab-content { padding: 56px; }
  .marketing-view .welcome-title { font-size: 50px; }
  .marketing-view .section-title { font-size: 38px; }
  .marketing-view .luxury-table th, .marketing-view .luxury-table td { padding: 30px; font-size: 20px; }
  .marketing-view .stat-value { font-size: 42px; }
  .marketing-view .projects-grid { gap: 28px; }
}

/* Dark Mode */
html.dark .marketing-view .stat-card { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-color: #334155; }
html.dark .marketing-view .stat-card:hover { border-color: rgba(196, 181, 162, 0.3); }
html.dark .marketing-view .overview-section { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-color: #334155; }
html.dark .marketing-view .project-card { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-color: #334155; }
html.dark .marketing-view .project-card:hover { border-color: rgba(196, 181, 162, 0.3); }
html.dark .marketing-view .task-card { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-color: #334155; }
html.dark .marketing-view .task-card.task-completed { opacity: 0.6; }
html.dark .marketing-view .leads-table-container { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-color: #334155; }
html.dark .marketing-view .luxury-table th { background: #0f172a; color: #94a3b8; border-color: #334155; }
html.dark .marketing-view .luxury-table td { color: #cbd5e1; border-color: #1e293b; }
html.dark .marketing-view .luxury-table tbody tr:hover { background: rgba(96, 165, 250, 0.05); }
html.dark .marketing-view .btn-secondary { background: #1e293b; color: #94a3b8; border-color: #334155; }
html.dark .marketing-view .btn-secondary:hover { background: #334155; color: #e2e8f0; }
html.dark .marketing-view .plan-output-luxury { background: #1e293b; border-color: #334155; }
html.dark .marketing-view .metric-mini-card { background: #0f172a; border-color: #334155; }
html.dark .marketing-view .metric-mini-card:hover { background: #1e293b; }
html.dark .marketing-view .premium-metrics-grid { color: #e2e8f0; }
html.dark .marketing-view .ai-chat-container { background: #1e293b; border-color: #334155; }
html.dark .marketing-view .ai-sidebar { background: #0f172a; border-color: #334155; }
html.dark .marketing-view .ai-main-chat { background: #1e293b; }
html.dark .marketing-view .btn-new-chat { background: #1e293b; border-color: #c4b5a2; color: #c4b5a2; }
html.dark .marketing-view .btn-new-chat:hover { background: rgba(196, 181, 162, 0.1); }
html.dark .marketing-view .conversation-item-ai { color: #94a3b8; border-color: #334155; }
html.dark .marketing-view .conversation-item-ai:hover { background: #1e293b; color: #e2e8f0; }
html.dark .marketing-view .assistant .bubble-content { background: #0f172a; color: #e2e8f0; border-color: #334155; }
html.dark .marketing-view .input-wrapper { background: #0f172a; border-color: #334155; }
html.dark .marketing-view .input-wrapper input { background: transparent; color: #e2e8f0; }
html.dark .marketing-view .quick-prompts button { background: #1e293b; border-color: #334155; color: #94a3b8; }
html.dark .marketing-view .quick-prompts button:hover { border-color: #c4b5a2; background: rgba(196, 181, 162, 0.05); color: #e2e8f0; }
html.dark .marketing-view .btn-tab-mini { background: #1e293b; border-color: #334155; color: #94a3b8; }
html.dark .marketing-view .btn-tab-mini:hover { background: #334155; color: #e2e8f0; }
html.dark .marketing-view .btn-tab-mini.active { background: var(--color-navy-dark); border-color: var(--color-navy-dark); color: #ffffff; }
html.dark .marketing-view .ai-welcome-box { background: rgba(196, 181, 162, 0.05); border-color: #334155; }
html.dark .marketing-view .modal-overlay { background: rgba(0, 0, 0, 0.7); }
html.dark .marketing-view .modal-content { background: #1e293b; border-color: #334155; }
</style>
