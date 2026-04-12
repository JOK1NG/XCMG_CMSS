<template>
  <div class="page-container">
    <PageHeader title="设备台账" description="管理设备基础信息、状态与所属车间" />

    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="关键字">
          <el-input
            v-model="queryForm.keyword"
            placeholder="设备编号 / 设备名称"
            clearable
            style="width: 220px"
          />
        </el-form-item>

        <el-form-item label="设备分类">
          <el-select
            v-model="queryForm.category"
            placeholder="请选择分类"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="opt in categoryOptions"
              :key="`c-${String(opt.value)}`"
              :label="opt.label"
              :value="String(opt.value)"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="设备状态">
          <el-select
            v-model="queryForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="opt in statusFilterOptions"
              :key="`s-${String(opt.value)}`"
              :label="opt.label"
              :value="String(opt.value)"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="所在车间">
          <el-select
            v-model="queryForm.workshop"
            placeholder="请选择车间"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="opt in workshopOptions"
              :key="`w-${String(opt.value)}`"
              :label="opt.label"
              :value="String(opt.value)"
            />
          </el-select>
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
          <el-button type="primary" @click="openCreate">新增设备</el-button>
          <el-tooltip :disabled="!importUnavailableReason" :content="importUnavailableReason">
            <span>
              <el-button disabled>导入</el-button>
            </span>
          </el-tooltip>
          <el-tooltip :disabled="!exportUnavailableReason" :content="exportUnavailableReason">
            <span>
              <el-button disabled>导出</el-button>
            </span>
          </el-tooltip>
        </div>
        <div class="toolbar-right">
          <span class="toolbar-tip">共 {{ total }} 条设备记录</span>
        </div>
      </div>

      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="equipmentCode" label="设备编号" min-width="160" />
        <el-table-column prop="equipmentName" label="设备名称" min-width="180" />
        <el-table-column prop="categoryName" label="设备分类" min-width="140" />
        <el-table-column prop="model" label="规格型号" min-width="140" />
        <el-table-column prop="workshopName" label="所在车间" min-width="120" />

        <el-table-column label="状态" min-width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="purchaseDate" label="购置日期" min-width="140" />

        <el-table-column label="操作" fixed="right" min-width="220">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetail(row.id)">查看</el-button>
            <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && tableData.length === 0"
        description="暂无设备数据"
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

    <EquipmentFormDialog
      v-model:visible="formVisible"
      :mode="formMode"
      :record-id="editingId"
      :initial="formInitial"
      :category-options="categoryOptions"
      :workshop-options="workshopOptions"
      :status-options="statusFormOptions"
      @success="onFormSuccess"
    />

    <EquipmentDetailDialog v-model:visible="detailVisible" :equipment-id="detailId" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import EquipmentFormDialog from './components/EquipmentFormDialog.vue'
import EquipmentDetailDialog from './components/EquipmentDetailDialog.vue'
import {
  deleteEquipment,
  getEquipmentPage,
  type EquipmentFormPayload,
  type EquipmentItem,
} from '@/api/equipment'
import { loadDictOptions } from '@/composables/useDictOptions'
import {
  EQUIPMENT_CATEGORY_FALLBACK,
  EQUIPMENT_STATUS_FALLBACK,
  WORKSHOP_FALLBACK,
} from '@/constants/dictFallbacks'
import { useListFallbackRows } from '@/composables/useListFallback'

const DEFAULT_PAGE_SIZE = 10

const FALLBACK_ROWS: EquipmentItem[] = [
  {
    id: 1,
    equipmentCode: 'EQ-2026-0001',
    equipmentName: 'CNC 数控车床 #1',
    categoryName: '数控车床',
    model: 'CK6140',
    workshopName: '一车间',
    status: '正常',
    purchaseDate: '2021-03-15',
  },
  {
    id: 2,
    equipmentCode: 'EQ-2026-0002',
    equipmentName: '加工中心 VMC850',
    categoryName: '加工中心',
    model: 'VMC850',
    workshopName: '一车间',
    status: '维修中',
    purchaseDate: '2020-08-20',
  },
  {
    id: 3,
    equipmentCode: 'EQ-2026-0003',
    equipmentName: '三坐标测量机',
    categoryName: '三坐标测量机',
    model: 'CONTURA',
    workshopName: '二车间',
    status: '正常',
    purchaseDate: '2022-01-10',
  },
  {
    id: 4,
    equipmentCode: 'EQ-2026-0004',
    equipmentName: '外圆磨床 M1432B',
    categoryName: '磨床',
    model: 'M1432B',
    workshopName: '一车间',
    status: '保养中',
    purchaseDate: '2019-11-05',
  },
  {
    id: 5,
    equipmentCode: 'EQ-2026-0005',
    equipmentName: '空压机 GA30+',
    categoryName: '空压机',
    model: 'GA30+',
    workshopName: '三车间',
    status: '停用',
    purchaseDate: '2022-09-30',
  },
]

const { shouldUseFallback, applyFallback } = useListFallbackRows({
  fallbackRows: FALLBACK_ROWS,
  resetPageOnFallback: true,
})

const queryForm = reactive({
  keyword: '',
  category: '',
  status: '',
  workshop: '',
  pageNum: 1,
  pageSize: DEFAULT_PAGE_SIZE,
})

const tableData = ref<EquipmentItem[]>([])
const total = ref(0)
const loading = ref(false)

const categoryOptions = ref(EQUIPMENT_CATEGORY_FALLBACK)
const workshopOptions = ref(WORKSHOP_FALLBACK)
const statusFilterOptions = ref(EQUIPMENT_STATUS_FALLBACK)
/** 表单里「设备状态」与筛选一致 */
const statusFormOptions = computed(() => statusFilterOptions.value)

const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const editingId = ref<number | null>(null)
const formInitial = ref<EquipmentFormPayload | null>(null)

const detailVisible = ref(false)
const detailId = ref<number | null>(null)

const importUnavailableReason = '导入接口暂未对接，联调阶段暂不开放'
const exportUnavailableReason = '导出接口暂未对接，联调阶段暂不开放'

const getStatusTagType = (status: string) => {
  switch (status) {
    case '正常':
      return 'success'
    case '维修中':
      return 'danger'
    case '保养中':
      return 'warning'
    case '停用':
      return 'info'
    default:
      return 'info'
  }
}

const loadDicts = async () => {
  const [c, w, s] = await Promise.all([
    loadDictOptions('equipment_category', EQUIPMENT_CATEGORY_FALLBACK),
    loadDictOptions('workshop', WORKSHOP_FALLBACK),
    loadDictOptions('equipment_status', EQUIPMENT_STATUS_FALLBACK),
  ])
  categoryOptions.value = c
  workshopOptions.value = w
  statusFilterOptions.value = s
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getEquipmentPage({
      pageNum: queryForm.pageNum,
      pageSize: queryForm.pageSize,
      keyword: queryForm.keyword || undefined,
      category: queryForm.category || undefined,
      status: queryForm.status || undefined,
      workshop: queryForm.workshop || undefined,
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
  queryForm.category = ''
  queryForm.status = ''
  queryForm.workshop = ''
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

const openCreate = () => {
  formMode.value = 'create'
  editingId.value = null
  formInitial.value = null
  formVisible.value = true
}

const openEdit = (row: EquipmentItem) => {
  formMode.value = 'edit'
  editingId.value = row.id
  formInitial.value = {
    equipmentCode: row.equipmentCode,
    equipmentName: row.equipmentName,
    categoryName: row.categoryName,
    model: row.model,
    workshopName: row.workshopName,
    status: row.status,
    purchaseDate: row.purchaseDate,
  }
  formVisible.value = true
}

const openDetail = (id: number) => {
  detailId.value = id
  detailVisible.value = true
}

const handleDelete = async (row: EquipmentItem) => {
  try {
    await ElMessageBox.confirm(`确定删除设备「${row.equipmentName}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  await deleteEquipment(row.id)
  await loadData()
}

const onFormSuccess = async () => {
  if (formMode.value === 'create') {
    queryForm.pageNum = 1
  }
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
