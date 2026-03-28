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
            <el-option label="待派工" :value="1" />
            <el-option label="已派工" :value="2" />
            <el-option label="维修中" :value="3" />
            <el-option label="待验收" :value="4" />
            <el-option label="已完成" :value="5" />
            <el-option label="已关闭" :value="6" />
          </el-select>
        </el-form-item>

        <el-form-item label="故障等级">
          <el-select
            v-model="queryForm.level"
            placeholder="请选择等级"
            clearable
            style="width: 160px"
          >
            <el-option label="紧急" :value="1" />
            <el-option label="一般" :value="2" />
            <el-option label="低" :value="3" />
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
          <el-button type="primary">发起报修</el-button>
          <el-button>导出</el-button>
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

        <el-table-column label="操作" fixed="right" min-width="180">
          <template #default>
            <el-button type="primary" link>查看</el-button>
            <el-button type="primary" link>派工</el-button>
            <el-button type="danger" link>关闭</el-button>
          </template>
        </el-table-column>
      </el-table>

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
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { getWorkOrderPage, type WorkOrderItem } from '@/api/workorder'

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

const queryForm = reactive({
  keyword: '',
  status: undefined as number | undefined,
  level: undefined as number | undefined,
  dateRange: [] as string[],
  pageNum: 1,
  pageSize: DEFAULT_PAGE_SIZE,
})

const tableData = ref<WorkOrderItem[]>([])
const total = ref(0)
const loading = ref(false)

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

const loadData = async () => {
  const [startDate, endDate] =
    queryForm.dateRange.length === 2 ? queryForm.dateRange : [undefined, undefined]

  loading.value = true
  try {
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
    queryForm.pageNum = 1
    tableData.value = [...FALLBACK_ROWS]
    total.value = FALLBACK_ROWS.length
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

onMounted(() => {
  loadData()
})
</script>