<template>
  <div class="layout-container">
    <aside class="sidebar">
      <div class="logo">Factory CMMS</div>

      <el-menu
          :default-active="activeMenu"
          class="menu"
          router
          background-color="#001529"
          text-color="#cfd3dc"
          active-text-color="#409eff"
      >
        <el-menu-item index="/dashboard">数据看板</el-menu-item>
        <el-menu-item index="/equipment/list">设备台账</el-menu-item>
        <el-menu-item index="/workorder/list">工单列表</el-menu-item>
        <el-menu-item index="/maintain/order">保养工单</el-menu-item>
        <el-menu-item index="/spare/list">备件管理</el-menu-item>
        <el-menu-item index="/system/user">用户管理</el-menu-item>
      </el-menu>
    </aside>

    <div class="main-wrapper">
      <header class="header">
        <div class="header-title">{{ pageTitle }}</div>
        <div class="header-actions">
          <el-button link type="primary" @click="handleLogout">退出登录</el-button>
        </div>
      </header>

      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => {
  return (route.meta.title as string) || '后台管理系统'
})

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定退出当前账号吗？', '退出确认', {
      type: 'warning',
      confirmButtonText: '退出',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  localStorage.removeItem('token')
  await router.push({ path: '/login' })
}
</script>