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
        <el-menu-item v-for="menu in menuItems" :key="menu.path" :index="menu.path">
          {{ menu.label }}
        </el-menu-item>
      </el-menu>
    </aside>

    <div class="main-wrapper">
      <header class="header">
        <div class="header-title">{{ pageTitle }}</div>
        <div class="header-actions">
          <span class="welcome-text">你好，{{ displayName }}</span>
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
import { useAuthStore } from '@/stores/auth'

interface MenuItem {
  path: string
  label: string
  requiredRoles?: string[]
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => {
  return (route.meta.title as string) || '后台管理系统'
})
const displayName = computed(() => authStore.user?.realName || authStore.user?.username || '用户')
const menuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [
    { path: '/dashboard', label: '数据看板' },
    { path: '/equipment/list', label: '设备台账' },
    { path: '/workorder/list', label: '工单列表' },
    { path: '/maintain/order', label: '保养工单' },
    { path: '/spare/list', label: '备件管理' },
    {
      path: '/system/user',
      label: '用户管理',
      requiredRoles: ['ROLE_ADMIN', 'ROLE_MAINTAIN_MANAGER'],
    },
  ]

  return items.filter((item) => authStore.canAccessRoles(item.requiredRoles))
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
  authStore.clearSession()
  await router.push({ path: '/login' })
}
</script>

<style scoped>
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.welcome-text {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>