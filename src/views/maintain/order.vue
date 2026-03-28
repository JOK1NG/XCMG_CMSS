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
            <el-option label="待执行" value="待执行" />
            <el-option label="执行中" value="执行中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已关闭" value="已关闭" />
          </el-select>
        </el-form-item>

        <el-form-item label="保养模板">
          <el-select
              v-model="queryForm.template"
              placeholder="请选择模板"
              clearable
              style="width: 180px"
          >
            <el-option label="数控车床月度保养" value="数控车床月度保养" />
            <el-option label="加工中心季度保养" value="加工中心季度保养" />
            <el-option label="磨床月度保养" value="磨床月度保养" />
          </el-select>
        </el-form-item>

        <el-form-item label="计划日期">
          <el-date-picker
              v-model="queryForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
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
          <span class="toolbar-tip">共 {{ tableData.length }} 条保养工单记录</span>
        </div>
      </div>

      <el-table :data="tableData" border stripe style="width: 100%">
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

interface MaintainOrderItem {
  id: number
  maintainOrderCode: string
  equipmentName: string
  templateName: string
  planDate: string
  assigneeName: string
  status: string
}

const queryForm = reactive({
  keyword: '',
  status: '',
  template: '',
  dateRange: [],
})

const tableData = ref<MaintainOrderItem[]>([
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
])

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

const handleSearch = () => {
  console.log('查询条件：', queryForm)
}

const handleReset = () => {
  queryForm.keyword = ''
  queryForm.status = ''
  queryForm.template = ''
  queryForm.dateRange = []
}
</script>