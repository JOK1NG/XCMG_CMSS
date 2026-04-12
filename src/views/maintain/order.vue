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
            :loading="templateLoading"
          >
            <el-option
              v-for="opt in templateOptions"
              :key="`mt-${opt.id}`"
              :label="opt.templateName"
              :value="opt.id"
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
          <el-tooltip :disabled="!createDisabledReason" :content="createDisabledReason">
            <span>
              <el-button type="primary" :disabled="!!createDisabledReason" @click="createVisible = true">
                手动创建保养工单
              </el-button>
            </span>
          </el-tooltip>
          <el-tooltip :disabled="!ruleDisabledReason" :content="ruleDisabledReason">
            <span>
              <el-button :disabled="!!ruleDisabledReason" @click="ruleVisible = true">规则管理</el-button>
            </span>
          </el-tooltip>
          <el-button disabled>导出</el-button>
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
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" min-width="260">
          <template #default="{ row }">
            <el-tooltip :disabled="!viewDisabledReason(row)" :content="viewDisabledReason(row)">
              <span>
                <el-button type="primary" link :disabled="!!viewDisabledReason(row)" @click="openDetail(row.id)">
                  查看
                </el-button>
              </span>
            </el-tooltip>

            <template v-if="getPrimaryAction(row.status)">
              <el-tooltip
                :disabled="!primaryActionDisabledReason(row)"
                :content="primaryActionDisabledReason(row)"
              >
                <span>
                  <el-button
                    :type="getPrimaryAction(row.status)?.type"
                    link
                    :disabled="!!primaryActionDisabledReason(row)"
                    @click="openDetail(row.id, getPrimaryAction(row.status)?.action)"
                  >
                    {{ getPrimaryAction(row.status)?.label }}
                  </el-button>
                </span>
              </el-tooltip>
            </template>
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

    <MaintainOrderCreateDialog v-model:visible="createVisible" @success="handleCreateSuccess" />

    <MaintainRuleDialog v-model:visible="ruleVisible" @success="loadData" />

    <MaintainOrderDetailDialog
      v-model:visible="detailVisible"
      :order-id="detailOrderId"
      :initial-action="detailInitialAction"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import MaintainOrderCreateDialog from './components/MaintainOrderCreateDialog.vue'
import MaintainRuleDialog from './components/MaintainRuleDialog.vue'
import MaintainOrderDetailDialog from './components/MaintainOrderDetailDialog.vue'
import { getMaintainOrderPage, getMaintainTemplatePage, type MaintainOrderItem } from '@/api/maintain'
import { loadDictOptions } from '@/composables/useDictOptions'
import { MAINTAIN_STATUS_FALLBACK, MAINTAIN_TEMPLATE_FALLBACK } from '@/constants/dictFallbacks'
import { MAINTAIN_ORDER_STATUS_OPTIONS } from '@/constants/maintain'
import { useListFallbackRows } from '@/composables/useListFallback'
import { useAuthStore } from '@/stores/auth'

const DEFAULT_PAGE_SIZE = 10
const FALLBACK_TEMPLATE_OPTIONS = MAINTAIN_TEMPLATE_FALLBACK.map((item, index) => ({
  id: index + 1,
  templateName: item.label,
}))
type QuickAction = 'assign' | 'execute' | 'finish' | 'close' | null
const authStore = useAuthStore()

/** 接口不可用时兜底展示，避免白屏 */
const FALLBACK_ROWS: MaintainOrderItem[] = [
  {
    id: 1,
    maintainOrderCode: 'MO-20260328-0001',
    equipmentId: 101,
    equipmentName: 'CNC 数控车床 #1',
    categoryName: '数控车床',
    templateId: 1,
    templateName: '数控车床月度保养',
    planDate: '2026-03-28',
    plannedExecuteTime: '2026-03-29 09:00:00',
    assigneeId: null,
    assigneeName: null,
    status: '待派工',
    sourceRuleId: 1,
    sourceRuleName: '数控车床月度规则',
  },
  {
    id: 2,
    maintainOrderCode: 'MO-20260328-0002',
    equipmentId: 102,
    equipmentName: '加工中心 VMC850',
    categoryName: '加工中心',
    templateId: 2,
    templateName: '加工中心季度保养',
    planDate: '2026-03-28',
    plannedExecuteTime: '2026-03-30 10:00:00',
    assigneeId: 201,
    assigneeName: '刘工',
    status: '待执行',
    sourceRuleId: 2,
    sourceRuleName: '加工中心季度规则',
  },
  {
    id: 3,
    maintainOrderCode: 'MO-20260328-0003',
    equipmentId: 103,
    equipmentName: '加工中心 VMC850',
    categoryName: '加工中心',
    templateId: 2,
    templateName: '加工中心季度保养',
    planDate: '2026-03-28',
    plannedExecuteTime: '2026-03-28 08:30:00',
    assigneeId: 202,
    assigneeName: '刘工',
    status: '执行中',
    sourceRuleId: 2,
    sourceRuleName: '加工中心季度规则',
  },
  {
    id: 4,
    maintainOrderCode: 'MO-20260325-0005',
    equipmentId: 104,
    equipmentName: '外圆磨床 M1432B',
    categoryName: '磨床',
    templateId: 3,
    templateName: '磨床月度保养',
    planDate: '2026-03-25',
    plannedExecuteTime: '2026-03-25 09:00:00',
    assigneeId: 203,
    assigneeName: '张强',
    status: '已完成',
    sourceRuleId: 3,
    sourceRuleName: '磨床月度规则',
  },
  {
    id: 5,
    maintainOrderCode: 'MO-20260322-0003',
    equipmentId: 105,
    equipmentName: '三坐标测量机',
    categoryName: '检测设备',
    templateId: 4,
    templateName: '检测设备年度校准',
    planDate: '2026-03-22',
    plannedExecuteTime: '2026-03-22 14:00:00',
    assigneeId: 204,
    assigneeName: '李明',
    status: '已关闭',
    sourceRuleId: null,
    sourceRuleName: null,
  },
]

const { shouldUseFallback, applyFallback } = useListFallbackRows({
  fallbackRows: FALLBACK_ROWS,
  resetPageOnFallback: true,
})

const statusOptions = ref(MAINTAIN_STATUS_FALLBACK)
const templateOptions = ref(FALLBACK_TEMPLATE_OPTIONS)
const templateLoading = ref(false)

const queryForm = reactive({
  keyword: '',
  status: '',
  template: undefined as number | undefined,
  dateRange: [] as string[] | null,
  pageNum: 1,
  pageSize: DEFAULT_PAGE_SIZE,
})

const tableData = ref<MaintainOrderItem[]>([])
const total = ref(0)
const loading = ref(false)
const createVisible = ref(false)
const ruleVisible = ref(false)
const detailVisible = ref(false)
const detailOrderId = ref<number | null>(null)
const detailInitialAction = ref<QuickAction>(null)

const createDisabledReason = computed(() => authStore.getMaintainActionDisabledReason('create'))
const ruleDisabledReason = computed(() => authStore.getMaintainActionDisabledReason('manageRules'))

const loadDicts = async () => {
  const s = await loadDictOptions('maintain_status', MAINTAIN_STATUS_FALLBACK)
  statusOptions.value = s
}

const loadTemplates = async () => {
  templateLoading.value = true
  try {
    const data = await getMaintainTemplatePage({ pageNum: 1, pageSize: 200, status: '启用' })
    templateOptions.value = Array.isArray(data.list)
      ? data.list.map((item) => ({ id: item.id, templateName: item.templateName }))
      : []
  } catch {
    templateOptions.value = [...FALLBACK_TEMPLATE_OPTIONS]
  } finally {
    templateLoading.value = false
  }
}

const getStatusTagType = (status: string) => {
  switch (status) {
    case '待派工':
      return 'warning'
    case '待执行':
      return 'primary'
    case '执行中':
      return 'danger'
    case '已完成':
      return 'success'
    case '已关闭':
      return 'info'
    default:
      return 'info'
  }
}

const getStatusLabel = (status: string) =>
  MAINTAIN_ORDER_STATUS_OPTIONS.find((item) => item.value === status)?.label || status

const getPrimaryAction = (status: string): { action: Exclude<QuickAction, null>; label: string; type: 'primary' | 'warning' | 'success' } | null => {
  switch (status) {
    case '待派工':
      return { action: 'assign', label: '派工', type: 'primary' }
    case '待执行':
      return { action: 'execute', label: '执行', type: 'warning' }
    case '执行中':
      return { action: 'finish', label: '完成', type: 'success' }
    default:
      return null
  }
}

const viewDisabledReason = (row: MaintainOrderItem) =>
  authStore.getMaintainActionDisabledReason('view', row.status)

const primaryActionDisabledReason = (row: MaintainOrderItem) => {
  const primary = getPrimaryAction(row.status)
  if (!primary) return ''
  return authStore.getMaintainActionDisabledReason(primary.action, row.status)
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
      template: queryForm.template,
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
  queryForm.template = undefined
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

const openDetail = (orderId: number, action: QuickAction = null) => {
  detailOrderId.value = orderId
  detailInitialAction.value = action
  detailVisible.value = true
}

const handleCreateSuccess = async () => {
  queryForm.pageNum = 1
  await loadData()
}

watch(detailVisible, (visible) => {
  if (!visible) {
    detailInitialAction.value = null
  }
})

onMounted(async () => {
  await Promise.all([loadDicts(), loadTemplates()])
  loadData()
})
</script>

<style scoped>
.table-empty {
  padding: 24px 0;
}
</style>
