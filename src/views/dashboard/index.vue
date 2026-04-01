<template>
  <div class="page-container">
    <PageHeader title="数据看板" description="展示设备运行、工单响应等核心运营指标" />

    <el-row :gutter="16">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="never" class="kpi-card" v-loading="loading">
          <div class="kpi-label">在役设备数</div>
          <div class="kpi-value">{{ summary.runningEquipmentCount }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="never" class="kpi-card" v-loading="loading">
          <div class="kpi-label">本月工单数</div>
          <div class="kpi-value">{{ summary.monthWorkOrderCount }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="never" class="kpi-card" v-loading="loading">
          <div class="kpi-label">设备可用率</div>
          <div class="kpi-value">{{ summary.availabilityRate }}%</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="never" class="kpi-card" v-loading="loading">
          <div class="kpi-label">平均响应时长</div>
          <div class="kpi-value">{{ summary.avgResponseHours }}h</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="16">
        <el-card shadow="never" class="chart-card" v-loading="chartLoading">
          <template #header>
            <div class="chart-title">维修费用趋势</div>
          </template>
          <div ref="costTrendRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card shadow="never" class="chart-card" v-loading="chartLoading">
          <template #header>
            <div class="chart-title">工单状态分布</div>
          </template>
          <div ref="statusDistRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import * as echarts from 'echarts'
import PageHeader from '@/components/PageHeader.vue'
import {
  getDashboardCostTrend,
  getDashboardSummary,
  getDashboardWorkOrderStatus,
  type DashboardCostTrendItem,
  type DashboardSummaryData,
  type DashboardWorkOrderStatusItem,
} from '@/api/dashboard'
import { shouldUseListFallback } from '@/composables/useListFallback'

const FALLBACK_SUMMARY: DashboardSummaryData = {
  runningEquipmentCount: 42,
  monthWorkOrderCount: 30,
  availabilityRate: 94.6,
  avgResponseHours: 1.8,
}

const FALLBACK_COST_TREND: DashboardCostTrendItem[] = [
  { statDate: '2026-03-21', costAmount: 1200 },
  { statDate: '2026-03-22', costAmount: 850 },
  { statDate: '2026-03-23', costAmount: 2100 },
  { statDate: '2026-03-24', costAmount: 1600 },
  { statDate: '2026-03-25', costAmount: 1300 },
  { statDate: '2026-03-26', costAmount: 1950 },
  { statDate: '2026-03-27', costAmount: 900 },
]

const FALLBACK_STATUS_DIST: DashboardWorkOrderStatusItem[] = [
  { status: 1, statusLabel: '待派工', count: 3 },
  { status: 2, statusLabel: '已派工', count: 2 },
  { status: 3, statusLabel: '维修中', count: 4 },
  { status: 4, statusLabel: '待验收', count: 2 },
  { status: 5, statusLabel: '已完成', count: 18 },
]

const summary = reactive<DashboardSummaryData>({
  ...FALLBACK_SUMMARY,
})
const loading = ref(false)
const chartLoading = ref(false)
const costTrendRef = ref<HTMLElement | null>(null)
const statusDistRef = ref<HTMLElement | null>(null)
let costTrendChart: echarts.ECharts | null = null
let statusDistChart: echarts.ECharts | null = null

const renderCostTrendChart = (rows: DashboardCostTrendItem[]) => {
  if (!costTrendChart || !rows.length) {
    return
  }
  costTrendChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: {
      type: 'category',
      data: rows.map((item) => item.statDate),
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '{value}' },
      splitLine: { lineStyle: { type: 'dashed' } },
    },
    series: [
      {
        type: 'line',
        data: rows.map((item) => item.costAmount),
        smooth: true,
        areaStyle: {},
      },
    ],
  })
}

const renderStatusDistChart = (rows: DashboardWorkOrderStatusItem[]) => {
  if (!statusDistChart || !rows.length) {
    return
  }
  statusDistChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, type: 'scroll' },
    series: [
      {
        type: 'pie',
        radius: ['42%', '70%'],
        center: ['50%', '45%'],
        data: rows.map((item) => ({
          value: item.count,
          name: item.statusLabel,
        })),
        label: { formatter: '{b}: {c}' },
      },
    ],
  })
}

const loadSummary = async () => {
  loading.value = true
  try {
    const data = await getDashboardSummary()
    summary.runningEquipmentCount = Number(data.runningEquipmentCount) || 0
    summary.monthWorkOrderCount = Number(data.monthWorkOrderCount) || 0
    summary.availabilityRate = Number(data.availabilityRate) || 0
    summary.avgResponseHours = Number(data.avgResponseHours) || 0
  } catch {
    if (shouldUseListFallback()) {
      summary.runningEquipmentCount = FALLBACK_SUMMARY.runningEquipmentCount
      summary.monthWorkOrderCount = FALLBACK_SUMMARY.monthWorkOrderCount
      summary.availabilityRate = FALLBACK_SUMMARY.availabilityRate
      summary.avgResponseHours = FALLBACK_SUMMARY.avgResponseHours
    } else {
      summary.runningEquipmentCount = 0
      summary.monthWorkOrderCount = 0
      summary.availabilityRate = 0
      summary.avgResponseHours = 0
    }
  } finally {
    loading.value = false
  }
}

const loadCharts = async () => {
  chartLoading.value = true
  try {
    const [costTrendRows, statusRows] = await Promise.all([
      getDashboardCostTrend(),
      getDashboardWorkOrderStatus(),
    ])
    const costRows = Array.isArray(costTrendRows) ? costTrendRows : []
    const stRows = Array.isArray(statusRows) ? statusRows : []
    renderCostTrendChart(
      costRows.length ? costRows : shouldUseListFallback() ? FALLBACK_COST_TREND : [],
    )
    renderStatusDistChart(
      stRows.length ? stRows : shouldUseListFallback() ? FALLBACK_STATUS_DIST : [],
    )
  } catch {
    if (shouldUseListFallback()) {
      renderCostTrendChart(FALLBACK_COST_TREND)
      renderStatusDistChart(FALLBACK_STATUS_DIST)
    } else {
      renderCostTrendChart([])
      renderStatusDistChart([])
    }
  } finally {
    chartLoading.value = false
  }
}

const handleResize = () => {
  costTrendChart?.resize()
  statusDistChart?.resize()
}

const initCharts = () => {
  if (costTrendRef.value && !costTrendChart) {
    costTrendChart = echarts.init(costTrendRef.value)
  }
  if (statusDistRef.value && !statusDistChart) {
    statusDistChart = echarts.init(statusDistRef.value)
  }
}

onMounted(() => {
  initCharts()
  loadSummary()
  loadCharts()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  costTrendChart?.dispose()
  statusDistChart?.dispose()
  costTrendChart = null
  statusDistChart = null
})
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.kpi-card {
  border-radius: 12px;
}

.kpi-label {
  color: #909399;
  font-size: 14px;
}

.kpi-value {
  margin-top: 8px;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 700;
  color: #303133;
}

.chart-card {
  margin-top: 16px;
  border-radius: 12px;
}

.chart-container {
  height: 320px;
  width: 100%;
}

.chart-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}
</style>