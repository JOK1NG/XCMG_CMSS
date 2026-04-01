<template>
  <div class="page-container">
    <PageHeader
        title="备件管理"
        description="管理备件档案、库存数量、预警值与供应信息"
    />

    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="关键字">
          <el-input
              v-model="queryForm.keyword"
              placeholder="备件编号 / 备件名称"
              clearable
              style="width: 220px"
          />
        </el-form-item>

        <el-form-item label="供应商">
          <el-select
              v-model="queryForm.supplier"
              placeholder="请选择供应商"
              clearable
              style="width: 180px"
          >
            <el-option
                v-for="opt in supplierOptions"
                :key="`sup-${String(opt.value)}`"
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
          <el-button type="primary">新增备件</el-button>
          <el-button>入库</el-button>
          <el-button>出库</el-button>
          <el-button>导出</el-button>
        </div>
        <div class="toolbar-right">
          <span class="toolbar-tip">共 {{ total }} 条备件记录</span>
        </div>
      </div>

      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="spareCode" label="备件编号" min-width="150" />
        <el-table-column prop="spareName" label="备件名称" min-width="180" />
        <el-table-column prop="spec" label="规格型号" min-width="140" />
        <el-table-column prop="unit" label="单位" min-width="90" />
        <el-table-column prop="stockQty" label="当前库存" min-width="100" />
        <el-table-column prop="warningQty" label="预警值" min-width="100" />
        <el-table-column prop="price" label="参考单价" min-width="120" />
        <el-table-column prop="supplierName" label="供应商" min-width="140" />
        <el-table-column prop="location" label="存放位置" min-width="140" />

        <el-table-column label="库存状态" min-width="130">
          <template #default="{ row }">
            <el-tag :type="getStockTagType(getStockStatus(row))">
              {{ getStockStatus(row) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" min-width="260">
          <template #default>
            <el-button type="primary" link>查看</el-button>
            <el-button type="primary" link>编辑</el-button>
            <el-button type="warning" link>入库</el-button>
            <el-button type="success" link>出库</el-button>
            <el-button type="danger" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
          v-if="!loading && tableData.length === 0"
          description="暂无备件数据"
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
import { getSparePage, type SpareItem } from '@/api/spare'
import { loadDictOptions } from '@/composables/useDictOptions'
import { SPARE_SUPPLIER_FALLBACK } from '@/constants/dictFallbacks'
import { useListFallbackRows } from '@/composables/useListFallback'

const DEFAULT_PAGE_SIZE = 10

/** 接口不可用时兜底展示，避免白屏 */
const FALLBACK_ROWS: SpareItem[] = [
  {
    id: 1,
    spareCode: 'SP-0001',
    spareName: '主轴轴承 7210C',
    spec: '50×90×20mm',
    unit: '个',
    stockQty: 3,
    warningQty: 5,
    price: '¥680',
    supplierName: '洛阳轴承',
    location: 'A架1层',
  },
  {
    id: 2,
    spareCode: 'SP-0002',
    spareName: '液压油滤芯',
    spec: 'HF-125',
    unit: '个',
    stockQty: 12,
    warningQty: 4,
    price: '¥95',
    supplierName: '西门子工业',
    location: 'B架2层',
  },
  {
    id: 3,
    spareCode: 'SP-0003',
    spareName: '冷却液泵',
    spec: 'CP-220',
    unit: '台',
    stockQty: 1,
    warningQty: 2,
    price: '¥1,250',
    supplierName: '西门子工业',
    location: 'C架1层',
  },
  {
    id: 4,
    spareCode: 'SP-0004',
    spareName: '空压机皮带',
    spec: 'B-1200',
    unit: '条',
    stockQty: 8,
    warningQty: 3,
    price: '¥160',
    supplierName: '阿特拉斯',
    location: 'D架3层',
  },
]

const { shouldUseFallback, applyFallback } = useListFallbackRows({
  fallbackRows: FALLBACK_ROWS,
  resetPageOnFallback: true,
})

const supplierOptions = ref(SPARE_SUPPLIER_FALLBACK)

const queryForm = reactive({
  keyword: '',
  supplier: '',
  pageNum: 1,
  pageSize: DEFAULT_PAGE_SIZE,
})

const tableData = ref<SpareItem[]>([])
const total = ref(0)
const loading = ref(false)

const loadDicts = async () => {
  supplierOptions.value = await loadDictOptions('spare_supplier', SPARE_SUPPLIER_FALLBACK)
}

const getStockStatus = (row: Pick<SpareItem, 'stockQty' | 'warningQty'>) => {
  return row.stockQty <= row.warningQty ? '低库存预警' : '正常'
}

const getStockTagType = (status: string) => {
  switch (status) {
    case '正常':
      return 'success'
    case '低库存预警':
      return 'danger'
    default:
      return 'info'
  }
}

const loadData = async () => {
  loading.value = true
  try {
    // 备注：stockStatus 是前端根据库存数量计算的展示字段，不参与后端分页查询，避免分页后前端过滤导致总数失真。
    const data = await getSparePage({
      pageNum: queryForm.pageNum,
      pageSize: queryForm.pageSize,
      keyword: queryForm.keyword || undefined,
      supplier: queryForm.supplier || undefined,
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
  queryForm.supplier = ''
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