<template>
  <div class="page-container">
    <PageHeader title="工单列表" description="管理维修工单的查询、流转与跟踪" />

    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="关键字">
          <el-input
            v-model="queryForm.keyword"
            placeholder="工单编号 / 设备名称"
            clearable
            style="width: 220px"
          />
        </el-form-item>

        <el-form-item label="工单状态">
          <el-select
            v-model="queryForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="opt in statusOptions"
              :key="`st-${String(opt.value)}`"
              :label="opt.label"
              :value="Number(opt.value)"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="故障等级">
          <el-select
            v-model="queryForm.level"
            placeholder="请选择等级"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="opt in faultLevelOptions"
              :key="`lv-${String(opt.value)}`"
              :label="opt.label"
              :value="Number(opt.value)"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="报修日期">
          <el-date-picker
            v-model="queryForm.dateRange"
            type="daterange"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="reportVisible = true">发起报修</el-button>
          <el-tooltip :disabled="!exportUnavailableReason" :content="exportUnavailableReason">
            <span>
              <el-button disabled>导出</el-button>
            </span>
          </el-tooltip>
        </div>
        <div class="toolbar-right">
          <span class="toolbar-tip">共 {{ total }} 条工单记录</span>
        </div>
      </div>

      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="workOrderCode" label="工单编号" min-width="180" />
        <el-table-column prop="equipmentName" label="报修设备" min-width="180" />
        <el-table-column prop="faultDesc" label="故障描述" min-width="240" show-overflow-tooltip />

        <el-table-column label="故障等级" min-width="120">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.faultLevel)">
              {{ row.faultLevelLabel || getFaultLevelLabel(row.faultLevel) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="工单状态" min-width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ row.statusLabel || getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="reporterName" label="报修人" min-width="120" />
        <el-table-column prop="reportTime" label="报修时间" min-width="180" />
        <el-table-column prop="assigneeName" label="维修人" min-width="120" />

        <el-table-column label="操作" fixed="right" min-width="220">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetail(row.id)">查看</el-button>
            <el-button
              v-if="canAssign(row.status)"
              type="primary"
              link
              @click="openAssign(row)"
            >
              派工
            </el-button>
            <el-button
              v-if="canClose(row.status)"
              type="danger"
              link
              @click="handleClose(row)"
            >
              关闭
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && tableData.length === 0"
        description="暂无工单数据"
        class="table-empty"
      />

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryForm.pageNum"
          v-model:page-size="queryForm.pageSize"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-sizes="[10, 20, 50]"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <WorkOrderDetailDialog v-model:visible="detailVisible" :work-order-id="detailId" />

    <WorkOrderReportDialog
      v-model:visible="reportVisible"
      :fault-level-options="faultLevelOptions"
      @success="onReportSuccess"
    />

    <WorkOrderAssignDialog
      v-model:visible="assignVisible"
      :work-order-id="assignOrderId"
      :work-order-code="assignOrderCode"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import WorkOrderDetailDialog from './components/WorkOrderDetailDialog.vue'
import WorkOrderReportDialog from './components/WorkOrderReportDialog.vue'
import WorkOrderAssignDialog from './components/WorkOrderAssignDialog.vue'
import { closeWorkOrder, getWorkOrderPage, type WorkOrderItem } from '@/api/workorder'
import { loadDictOptions } from '@/composables/useDictOptions'
import { FAULT_LEVEL_FALLBACK, WORKORDER_STATUS_FALLBACK } from '@/constants/dictFallbacks'
import { useListFallbackRows } from '@/composables/useListFallback'

const DEFAULT_PAGE_SIZE = 10

const FALLBACK_ROWS: WorkOrderItem[] = [
  {
    id: 1,
    workOrderCode: 'WO-20260325-0001',
    equipmentId: 2,
    equipmentName: '加工中心 VMC850',
    faultDesc: '主轴异响，加工精度下降',
    faultLevel: 1,
    faultLevelLabel: '紧急',
    status: 3,
    statusLabel: '维修中',
    reporterId: 101,
    reporterName: '李明',
    reportTime: '2026-03-25 08:30:00',
    assigneeId: 201,
    assigneeName: '王刚',
  },
  {
    id: 2,
    workOrderCode: 'WO-20260326-0002',
    equipmentId: 5,
    equipmentName: '数控车床 CK6140',
    faultDesc: '液压系统压力不稳',
    faultLevel: 2,
    faultLevelLabel: '一般',
    status: 2,
    statusLabel: '已派工',
    reporterId: 102,
    reporterName: '张强',
    reportTime: '2026-03-26 10:12:00',
    assigneeId: 202,
    assigneeName: '赵峰',
  },
  {
    id: 3,
    workOrderCode: 'WO-20260327-0003',
    equipmentId: 8,
    equipmentName: '空压机 GA30+',
    faultDesc: '温度报警频繁触发',
    faultLevel: 3,
    faultLevelLabel: '低',
    status: 1,
    statusLabel: '待派工',
    reporterId: 103,
    reporterName: '陈涛',
    reportTime: '2026-03-27 14:05:00',
    assigneeId: null,
    assigneeName: null,
  },
]

const { shouldUseFallback, applyFallback } = useListFallbackRows({
  fallbackRows: FALLBACK_ROWS,
  resetPageOnFallback: true,
})

const queryForm = reactive({
  keyword: '',
  status: undefined as number | undefined,
  level: undefined as number | undefined,
  dateRange: [] as string[] | null,
  pageNum: 1,
  pageSize: DEFAULT_PAGE_SIZE,
})

const tableData = ref<WorkOrderItem[]>([])
const total = ref(0)
const loading = ref(false)

const statusOptions = ref(WORKORDER_STATUS_FALLBACK)
const faultLevelOptions = ref(FAULT_LEVEL_FALLBACK)

const detailVisible = ref(false)
const detailId = ref<number | null>(null)

const reportVisible = ref(false)
const exportUnavailableReason = '导出接口暂未对接，联调阶段暂不开放'

const assignVisible = ref(false)
const assignOrderId = ref<number | null>(null)
const assignOrderCode = ref('')

const getStatusLabel = (status: number) => {
  switch (status) {
    case 1:
      return '待派工'
    case 2:
      return '已派工'
    case 3:
      return '维修中'
    case 4:
      return '待验收'
    case 5:
      return '已完成'
    case 6:
      return '已关闭'
    default:
      return '未知'
  }
}

const getFaultLevelLabel = (level: number) => {
  switch (level) {
    case 1:
      return '紧急'
    case 2:
      return '一般'
    case 3:
      return '低'
    default:
      return '未知'
  }
}

const getStatusTagType = (status: number) => {
  switch (status) {
    case 1:
      return 'warning'
    case 2:
      return 'primary'
    case 3:
      return 'danger'
    case 4:
      return 'warning'
    case 5:
      return 'success'
    case 6:
      return 'info'
    default:
      return 'info'
  }
}

const getLevelTagType = (level: number) => {
  switch (level) {
    case 1:
      return 'danger'
    case 2:
      return 'warning'
    case 3:
      return 'info'
    default:
      return 'info'
  }
}

/** 待派工时允许派工 */
const canAssign = (status: number) => status === 1

/** 未关闭允许关闭 */
const canClose = (status: number) => status !== 6

const loadDicts = async () => {
  const [s, f] = await Promise.all([
    loadDictOptions('workorder_status', WORKORDER_STATUS_FALLBACK),
    loadDictOptions('fault_level', FAULT_LEVEL_FALLBACK),
  ])
  statusOptions.value = s
  faultLevelOptions.value = f
}

const loadData = async () => {
  loading.value = true
  try {
    const normalizedDateRange = Array.isArray(queryForm.dateRange) ? queryForm.dateRange : []
    const [startDate, endDate] =
      normalizedDateRange.length === 2 ? normalizedDateRange : [undefined, undefined]

    const data = await getWorkOrderPage({
      pageNum: queryForm.pageNum,
      pageSize: queryForm.pageSize,
      keyword: queryForm.keyword || undefined,
      status: queryForm.status,
      level: queryForm.level,
      startDate,
      endDate,
    })
    tableData.value = Array.isArray(data.list) ? data.list : []
    total.value = typeof data.total === 'number' ? data.total : 0
  } catch {
    if (shouldUseFallback()) {
      applyFallback(queryForm, tableData, total)
    } else {
      tableData.value = []
      total.value = 0
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryForm.pageNum = 1
  loadData()
}

const handleReset = () => {
  queryForm.keyword = ''
  queryForm.status = undefined
  queryForm.level = undefined
  queryForm.dateRange = []
  queryForm.pageNum = 1
  queryForm.pageSize = DEFAULT_PAGE_SIZE
  loadData()
}

const handlePageChange = () => {
  loadData()
}

const handleSizeChange = () => {
  queryForm.pageNum = 1
  loadData()
}

const openDetail = (id: number) => {
  detailId.value = id
  detailVisible.value = true
}

const openAssign = (row: WorkOrderItem) => {
  assignOrderId.value = row.id
  assignOrderCode.value = row.workOrderCode
  assignVisible.value = true
}

const handleClose = async (row: WorkOrderItem) => {
  try {
    await ElMessageBox.confirm(`确定关闭工单「${row.workOrderCode}」吗？`, '关闭确认', {
      type: 'warning',
      confirmButtonText: '关闭',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  await closeWorkOrder(row.id)
  await loadData()
}

const onReportSuccess = async () => {
  queryForm.pageNum = 1
  await loadData()
}

onMounted(async () => {
  await loadDicts()
  loadData()
})
</script>

<style scoped>
.table-empty {
  padding: 24px 0;
}
</style>
