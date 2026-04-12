<template>
  <div class="page-container">
    <PageHeader title="数据看板" description="展示设备运行、工单响应等核心运营指标" />

    <el-card shadow="never" class="filter-card">
      <el-form inline class="filter-form">
        <el-form-item label="维修费用日期范围">
          <el-date-picker
            v-model="costTrendDateRange"
            type="daterange"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleTrendDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleTrendDateSearch">查询</el-button>
          <el-button @click="handleTrendDateReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

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
  type DashboardCostTrendParams,
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
const costTrendDateRange = ref<string[]>([])
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

const buildCostTrendParams = (): DashboardCostTrendParams => {
  const normalizedRange = Array.isArray(costTrendDateRange.value) ? costTrendDateRange.value : []
  if (normalizedRange.length !== 2) {
    return {}
  }
  const [startDate, endDate] = normalizedRange
  if (!startDate || !endDate) {
    return {}
  }
  return { startDate, endDate }
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
  const costTrendParams = buildCostTrendParams()
  try {
    const [costTrendResult, statusResult] = await Promise.allSettled([
      getDashboardCostTrend(costTrendParams),
      getDashboardWorkOrderStatus(),
    ])
    const useFallback = shouldUseListFallback()

    const costRows =
      costTrendResult.status === 'fulfilled' && Array.isArray(costTrendResult.value)
        ? costTrendResult.value
        : useFallback
          ? FALLBACK_COST_TREND
          : []
    const statusRows =
      statusResult.status === 'fulfilled' && Array.isArray(statusResult.value)
        ? statusResult.value
        : useFallback
          ? FALLBACK_STATUS_DIST
          : []

    renderCostTrendChart(costRows)
    renderStatusDistChart(statusRows)
  } catch {
    // Promise.allSettled 理论上不会因子任务失败抛出，这里只兜底意外异常。
    const fallback = shouldUseListFallback()
    renderCostTrendChart(fallback ? FALLBACK_COST_TREND : [])
    renderStatusDistChart(fallback ? FALLBACK_STATUS_DIST : [])
  } finally {
    chartLoading.value = false
  }
}

const handleTrendDateSearch = () => {
  loadCharts()
}

const handleTrendDateReset = () => {
  costTrendDateRange.value = []
  loadCharts()
}

const handleTrendDateChange = () => {
  if (!costTrendDateRange.value || costTrendDateRange.value.length < 2) {
    return
  }
  loadCharts()
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

.filter-card {
  border-radius: 12px;
}

.filter-form {
  margin-bottom: -8px;
}
</style>