<template>
  <div class="layout-container">
    <aside class="sidebar" :class="{ collapsed: isMenuCollapsed }">
      <div class="logo">Factory CMMS</div>

      <el-menu
        :collapse="isMenuCollapsed"
        :default-active="activeMenu"
        class="menu"
        router
        background-color="#001529"
        text-color="#cfd3dc"
        active-text-color="#409eff"
        collapse-transition
      >
        <el-menu-item v-for="menu in menuItems" :key="menu.path" :index="menu.path">
          <span class="menu-icon">{{ menu.icon }}</span>
          <span class="menu-text">{{ menu.label }}</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <div class="main-wrapper">
      <header class="header">
        <div class="header-left">
          <el-button class="menu-toggle" link @click="toggleMenuCollapse">
            {{ isMenuCollapsed ? '☰' : '▤' }}
          </el-button>
          <div class="header-text">
            <div class="header-title">{{ pageTitle }}</div>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item v-for="item in breadcrumbItems" :key="item.label" :to="item.path ? { path: item.path } : undefined">
                {{ item.label }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </div>
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

interface MenuItem {
  path: string
  label: string
  icon: string
  requiredRoles?: string[]
}

interface BreadcrumbItem {
  label: string
  path?: string
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => {
  return (route.meta.title as string) || '后台管理系统'
})
const displayName = computed(() => authStore.user?.realName || authStore.user?.username || '用户')
const isMenuCollapsed = ref(false)
const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  const matched = route.matched.filter((item) => item.meta?.title)
  const crumbs = matched
    .map((item, index) => ({
      label: (item.meta.title as string) || '页面',
      path: index === matched.length - 1 ? undefined : item.path,
    }))
    .filter((item) => item.label)

  return crumbs as BreadcrumbItem[]
})

const menuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [
    { path: '/dashboard', label: '数据看板', icon: '📊' },
    { path: '/equipment/list', label: '设备台账', icon: '🛠️' },
    { path: '/workorder/list', label: '工单列表', icon: '📋' },
    { path: '/maintain/order', label: '保养工单', icon: '🧰' },
    { path: '/spare/list', label: '备件管理', icon: '📦' },
    {
      path: '/system/user',
      label: '用户管理',
      icon: '👤',
      requiredRoles: ['ROLE_ADMIN', 'ROLE_MAINTAIN_MANAGER'],
    },
  ]

  return items.filter((item) => authStore.canAccessRoles(item.requiredRoles))
})

const syncMenuCollapseByViewport = () => {
  isMenuCollapsed.value = window.innerWidth < 1024
}

const toggleMenuCollapse = () => {
  isMenuCollapsed.value = !isMenuCollapsed.value
}

onMounted(() => {
  syncMenuCollapseByViewport()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncMenuCollapseByViewport)
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

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-toggle {
  padding: 0;
  color: #606266;
  font-size: 18px;
}

.menu-icon {
  margin-right: 8px;
  font-size: 14px;
}

.menu-text {
  white-space: nowrap;
}

.welcome-text {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>