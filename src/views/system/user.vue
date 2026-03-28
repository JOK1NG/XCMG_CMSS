<template>
  <div class="page-container">
    <PageHeader title="用户管理" description="管理系统用户、所属部门、角色与启停状态" />

    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="关键字">
          <el-input
              v-model="queryForm.keyword"
              placeholder="用户名 / 姓名 / 手机号"
              clearable
              style="width: 220px"
          />
        </el-form-item>

        <el-form-item label="部门">
          <el-select
              v-model="queryForm.dept"
              placeholder="请选择部门"
              clearable
              style="width: 180px"
          >
            <el-option label="设备部" value="设备部" />
            <el-option label="维修班" value="维修班" />
            <el-option label="仓储部" value="仓储部" />
            <el-option label="生产部" value="生产部" />
          </el-select>
        </el-form-item>

        <el-form-item label="角色">
          <el-select
              v-model="queryForm.role"
              placeholder="请选择角色"
              clearable
              style="width: 180px"
          >
            <el-option label="超级管理员" value="超级管理员" />
            <el-option label="设备管理员" value="设备管理员" />
            <el-option label="维修工" value="维修工" />
            <el-option label="仓库管理员" value="仓库管理员" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select
              v-model="queryForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 160px"
          >
            <el-option label="启用" value="启用" />
            <el-option label="停用" value="停用" />
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
          <el-button type="primary">新增用户</el-button>
          <el-button>导出</el-button>
        </div>
        <div class="toolbar-right">
          <span class="toolbar-tip">共 {{ tableData.length }} 条用户记录</span>
        </div>
      </div>

      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column prop="realName" label="姓名" min-width="120" />
        <el-table-column prop="deptName" label="部门" min-width="140" />
        <el-table-column prop="roleName" label="角色" min-width="140" />
        <el-table-column prop="phone" label="手机号" min-width="140" />

        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" min-width="180" />

        <el-table-column label="操作" fixed="right" min-width="220">
          <template #default>
            <el-button type="primary" link>查看</el-button>
            <el-button type="primary" link>编辑</el-button>
            <el-button type="warning" link>重置密码</el-button>
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

interface UserItem {
  id: number
  username: string
  realName: string
  deptName: string
  roleName: string
  phone: string
  status: string
  createTime: string
}

const queryForm = reactive({
  keyword: '',
  dept: '',
  role: '',
  status: '',
})

const tableData = ref<UserItem[]>([
  {
    id: 1,
    username: 'admin',
    realName: '系统管理员',
    deptName: '设备部',
    roleName: '超级管理员',
    phone: '13800000000',
    status: '启用',
    createTime: '2026-03-01 09:00:00',
  },
  {
    id: 2,
    username: 'wangwx',
    realName: '王维修',
    deptName: '维修班',
    roleName: '维修工',
    phone: '13700000001',
    status: '启用',
    createTime: '2026-03-05 10:20:00',
  },
  {
    id: 3,
    username: 'liucg',
    realName: '刘班长',
    deptName: '维修班',
    roleName: '设备管理员',
    phone: '13700000002',
    status: '启用',
    createTime: '2026-03-06 14:15:00',
  },
  {
    id: 4,
    username: 'zhangck',
    realName: '张仓库',
    deptName: '仓储部',
    roleName: '仓库管理员',
    phone: '13700000003',
    status: '停用',
    createTime: '2026-03-08 11:40:00',
  },
])

const getStatusTagType = (status: string) => {
  switch (status) {
    case '启用':
      return 'success'
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
  queryForm.dept = ''
  queryForm.role = ''
  queryForm.status = ''
}
</script>