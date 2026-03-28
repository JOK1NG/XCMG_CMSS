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
            <el-option label="数控车床" value="数控车床" />
            <el-option label="加工中心" value="加工中心" />
            <el-option label="磨床" value="磨床" />
            <el-option label="三坐标测量机" value="三坐标测量机" />
            <el-option label="空压机" value="空压机" />
          </el-select>
        </el-form-item>

        <el-form-item label="设备状态">
          <el-select
              v-model="queryForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 160px"
          >
            <el-option label="正常" value="正常" />
            <el-option label="维修中" value="维修中" />
            <el-option label="保养中" value="保养中" />
            <el-option label="停用" value="停用" />
          </el-select>
        </el-form-item>

        <el-form-item label="所在车间">
          <el-select
              v-model="queryForm.workshop"
              placeholder="请选择车间"
              clearable
              style="width: 160px"
          >
            <el-option label="一车间" value="一车间" />
            <el-option label="二车间" value="二车间" />
            <el-option label="三车间" value="三车间" />
            <el-option label="仓储部" value="仓储部" />
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
          <el-button type="primary">新增设备</el-button>
          <el-button>导入</el-button>
          <el-button>导出</el-button>
        </div>
        <div class="toolbar-right">
          <span class="toolbar-tip">共 {{ tableData.length }} 条设备记录</span>
        </div>
      </div>

      <el-table :data="tableData" border stripe style="width: 100%">
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
          <template #default>
            <el-button type="primary" link>查看</el-button>
            <el-button type="primary" link>编辑</el-button>
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

interface EquipmentItem {
  id: number
  equipmentCode: string
  equipmentName: string
  categoryName: string
  model: string
  workshopName: string
  status: string
  purchaseDate: string
}

const queryForm = reactive({
  keyword: '',
  category: '',
  status: '',
  workshop: '',
})

const tableData = ref<EquipmentItem[]>([
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
])

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

const handleSearch = () => {
  console.log('查询条件：', queryForm)
}

const handleReset = () => {
  queryForm.keyword = ''
  queryForm.category = ''
  queryForm.status = ''
  queryForm.workshop = ''
}
</script>