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

        <el-form-item label="库存状态">
          <el-select
              v-model="queryForm.stockStatus"
              placeholder="请选择状态"
              clearable
              style="width: 180px"
          >
            <el-option label="正常" value="正常" />
            <el-option label="低库存预警" value="低库存预警" />
          </el-select>
        </el-form-item>

        <el-form-item label="供应商">
          <el-select
              v-model="queryForm.supplier"
              placeholder="请选择供应商"
              clearable
              style="width: 180px"
          >
            <el-option label="洛阳轴承" value="洛阳轴承" />
            <el-option label="西门子工业" value="西门子工业" />
            <el-option label="阿特拉斯" value="阿特拉斯" />
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
          <span class="toolbar-tip">共 {{ tableData.length }} 条备件记录</span>
        </div>
      </div>

      <el-table :data="tableData" border stripe style="width: 100%">
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
            <el-tag :type="getStockTagType(row.stockStatus)">
              {{ row.stockStatus }}
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

      <div class="pagination-wrapper">
        <el-pagination
            background
            layout="total, prev, pager, next, jumper"
            :total="tableData.length"
            :page-size="10"
            :current-page="1"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'

interface SpareItem {
  id: number
  spareCode: string
  spareName: string
  spec: string
  unit: string
  stockQty: number
  warningQty: number
  price: string
  supplierName: string
  location: string
  stockStatus: string
}

const queryForm = reactive({
  keyword: '',
  stockStatus: '',
  supplier: '',
})

const tableData = ref<SpareItem[]>([
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
    stockStatus: '低库存预警',
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
    stockStatus: '正常',
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
    stockStatus: '低库存预警',
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
    stockStatus: '正常',
  },
])

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

const handleSearch = () => {
  console.log('查询条件：', queryForm)
}

const handleReset = () => {
  queryForm.keyword = ''
  queryForm.stockStatus = ''
  queryForm.supplier = ''
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}

.page-desc {
  margin: 8px 0 0;
  font-size: 14px;
  color: #909399;
}

.search-card,
.table-card {
  border-radius: 12px;
}

.search-form {
  margin-bottom: -18px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-tip {
  font-size: 14px;
  color: #909399;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>