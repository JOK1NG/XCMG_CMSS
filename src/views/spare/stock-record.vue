<template>
  <div class="page-container">
    <PageHeader title="备件出入库记录" description="查询备件库存流水，支持按时间和类型过滤" />

    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="关键字">
          <el-input
            v-model="queryForm.keyword"
            placeholder="备件编码 / 备件名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>

        <el-form-item label="变动类型">
          <el-select v-model="queryForm.changeType" placeholder="全部" clearable style="width: 140px">
            <el-option
              v-for="opt in changeTypeOptions"
              :key="`ct-${String(opt.value)}`"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="变动时间">
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
          <span class="toolbar-tip">共 {{ total }} 条记录</span>
        </div>
      </div>

      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="spareCode" label="备件编码" min-width="140" />
        <el-table-column prop="spareName" label="备件名称" min-width="160" />
        <el-table-column prop="changeType" label="变动类型" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.changeType === '入库' ? 'success' : 'warning'">{{ row.changeType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="变动数量" min-width="110" />
        <el-table-column prop="beforeQty" label="变动前库存" min-width="120" />
        <el-table-column prop="afterQty" label="变动后库存" min-width="120" />
        <el-table-column prop="operatorName" label="操作人" min-width="120" />
        <el-table-column prop="operateTime" label="操作时间" min-width="180" />
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
      </el-table>

      <el-empty v-if="!loading && tableData.length === 0" description="暂无流水记录" class="table-empty" />

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
import {
  getSpareStockRecords,
  type SpareStockRecordItem,
  type SpareStockRecordPageParams,
} from '@/api/spare'
import { useListFallbackRows } from '@/composables/useListFallback'

const DEFAULT_PAGE_SIZE = 10

const FALLBACK_ROWS: SpareStockRecordItem[] = [
  {
    id: 1,
    spareId: 1,
    spareCode: 'SP-202603-01',
    spareName: '轴承润滑脂',
    changeType: '入库',
    quantity: 80,
    beforeQty: 120,
    afterQty: 200,
    operatorName: '王工',
    operateTime: '2026-03-26 09:15:00',
    remark: '供应商到货入库',
  },
  {
    id: 2,
    spareId: 2,
    spareCode: 'SP-202603-02',
    spareName: '密封圈',
    changeType: '出库',
    quantity: 15,
    beforeQty: 40,
    afterQty: 25,
    operatorName: '李工',
    operateTime: '2026-03-26 11:20:00',
    remark: '工单维修使用',
  },
]

const { shouldUseFallback, applyFallback } = useListFallbackRows({
  fallbackRows: FALLBACK_ROWS,
  resetPageOnFallback: true,
})

const changeTypeOptions = [
  { label: '入库', value: '入库' },
  { label: '出库', value: '出库' },
]

const queryForm = reactive({
  keyword: '',
  changeType: undefined as SpareStockRecordPageParams['changeType'] | undefined,
  dateRange: [] as string[] | null,
  pageNum: 1,
  pageSize: DEFAULT_PAGE_SIZE,
})

const tableData = ref<SpareStockRecordItem[]>([])
const total = ref(0)
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const normalizedDateRange = Array.isArray(queryForm.dateRange) ? queryForm.dateRange : []
    const [startDate, endDate] = normalizedDateRange.length === 2 ? normalizedDateRange : [undefined, undefined]
    const data = await getSpareStockRecords({
      pageNum: queryForm.pageNum,
      pageSize: queryForm.pageSize,
      keyword: queryForm.keyword || undefined,
      changeType: queryForm.changeType,
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
  queryForm.changeType = undefined
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
