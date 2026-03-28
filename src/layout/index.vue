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
      </header>

      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => {
  return (route.meta.title as string) || '后台管理系统'
})
</script>