<template>
  <div class="page-container">
    <PageHeader title="保养工单" description="管理设备保养计划、执行与完成情况" />

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

        <el-form-item label="保养状态">
          <el-select
            v-model="queryForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="opt in statusOptions"
              :key="`ms-${String(opt.value)}`"
              :label="opt.label"
              :value="String(opt.value)"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="保养模板">
          <el-select
            v-model="queryForm.template"
            placeholder="请选择模板"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="opt in templateOptions"
              :key="`mt-${String(opt.value)}`"
              :label="opt.label"
              :value="String(opt.value)"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="计划日期">
          <el-date-picker
            v-model="queryForm.dateRange"
            type="daterange"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px"
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
          <el-button type="primary">手动创建保养工单</el-button>
          <el-button>导出</el-button>
        </div>
        <div class="toolbar-right">
          <span class="toolbar-tip">共 {{ total }} 条保养工单记录</span>
        </div>
      </div>

      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="maintainOrderCode" label="工单编号" min-width="180" />
        <el-table-column prop="equipmentName" label="保养设备" min-width="180" />
        <el-table-column prop="templateName" label="保养模板" min-width="180" />
        <el-table-column prop="planDate" label="计划日期" min-width="140" />
        <el-table-column prop="assigneeName" label="执行人" min-width="120" />

        <el-table-column label="状态" min-width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" min-width="260">
          <template #default="{ row }">
            <el-button type="primary" link>查看</el-button>
            <el-button v-if="row.status === '待执行'" type="warning" link>执行</el-button>
            <el-button v-if="row.status === '执行中'" type="success" link>完成</el-button>
            <el-button type="danger" link>关闭</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && tableData.length === 0"
        description="暂无保养工单数据"
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { getMaintainOrderPage, type MaintainOrderItem } from '@/api/maintain'
import { loadDictOptions } from '@/composables/useDictOptions'
import { MAINTAIN_STATUS_FALLBACK, MAINTAIN_TEMPLATE_FALLBACK } from '@/constants/dictFallbacks'
import { useListFallbackRows } from '@/composables/useListFallback'

const DEFAULT_PAGE_SIZE = 10

/** 接口不可用时兜底展示，避免白屏 */
const FALLBACK_ROWS: MaintainOrderItem[] = [
  {
    id: 1,
    maintainOrderCode: 'MO-20260328-0001',
    equipmentName: 'CNC 数控车床 #1',
    templateName: '数控车床月度保养',
    planDate: '2026-03-28',
    assigneeName: '王维修',
    status: '待执行',
  },
  {
    id: 2,
    maintainOrderCode: 'MO-20260328-0002',
    equipmentName: '加工中心 VMC850',
    templateName: '加工中心季度保养',
    planDate: '2026-03-28',
    assigneeName: '刘工',
    status: '执行中',
  },
  {
    id: 3,
    maintainOrderCode: 'MO-20260325-0005',
    equipmentName: '外圆磨床 M1432B',
    templateName: '磨床月度保养',
    planDate: '2026-03-25',
    assigneeName: '张强',
    status: '已完成',
  },
  {
    id: 4,
    maintainOrderCode: 'MO-20260322-0003',
    equipmentName: '三坐标测量机',
    templateName: '检测设备年度校准',
    planDate: '2026-03-22',
    assigneeName: '李明',
    status: '已关闭',
  },
]

const { shouldUseFallback, applyFallback } = useListFallbackRows({
  fallbackRows: FALLBACK_ROWS,
  resetPageOnFallback: true,
})

const statusOptions = ref(MAINTAIN_STATUS_FALLBACK)
const templateOptions = ref(MAINTAIN_TEMPLATE_FALLBACK)

const queryForm = reactive({
  keyword: '',
  status: '',
  template: '',
  dateRange: [] as string[] | null,
  pageNum: 1,
  pageSize: DEFAULT_PAGE_SIZE,
})

const tableData = ref<MaintainOrderItem[]>([])
const total = ref(0)
const loading = ref(false)

const loadDicts = async () => {
  const [s, t] = await Promise.all([
    loadDictOptions('maintain_status', MAINTAIN_STATUS_FALLBACK),
    loadDictOptions('maintain_template', MAINTAIN_TEMPLATE_FALLBACK),
  ])
  statusOptions.value = s
  templateOptions.value = t
}

const getStatusTagType = (status: string) => {
  switch (status) {
    case '待执行':
      return 'warning'
    case '执行中':
      return 'primary'
    case '已完成':
      return 'success'
    case '已关闭':
      return 'info'
    default:
      return 'info'
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const normalizedDateRange = Array.isArray(queryForm.dateRange) ? queryForm.dateRange : []
    const [startDate, endDate] =
      normalizedDateRange.length === 2 ? normalizedDateRange : [undefined, undefined]

    const data = await getMaintainOrderPage({
      pageNum: queryForm.pageNum,
      pageSize: queryForm.pageSize,
      keyword: queryForm.keyword || undefined,
      status: queryForm.status || undefined,
      template: queryForm.template || undefined,
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
  queryForm.status = ''
  queryForm.template = ''
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
