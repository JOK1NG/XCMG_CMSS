<template>
  <el-dialog
    :model-value="visible"
    title="用户详情"
    width="520px"
    append-to-body
    @update:model-value="emit('update:visible', $event)"
  >
    <el-skeleton v-if="loading" :rows="7" animated />
    <el-descriptions v-else-if="detail" :column="1" border>
      <el-descriptions-item label="用户名">{{ detail.username }}</el-descriptions-item>
      <el-descriptions-item label="姓名">{{ detail.realName }}</el-descriptions-item>
      <el-descriptions-item label="部门">{{ detail.deptName }}</el-descriptions-item>
      <el-descriptions-item label="角色">{{ detail.roleName }}</el-descriptions-item>
      <el-descriptions-item label="手机号">{{ detail.phone }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="detail.status === '启用' ? 'success' : 'info'">{{ detail.status }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ detail.createTime }}</el-descriptions-item>
    </el-descriptions>
    <el-empty v-else description="暂无数据" />

    <template #footer>
      <el-button type="primary" @click="emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { getUserDetail, type UserItem } from '@/api/system'

const props = defineProps<{
  visible: boolean
  userId: number | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
}>()

const loading = ref(false)
const detail = ref<UserItem | null>(null)

watch(
  () => [props.visible, props.userId] as const,
  async ([open, id]) => {
    if (!open || id == null) {
      detail.value = null
      return
    }
    loading.value = true
    try {
      detail.value = await getUserDetail(id)
    } catch {
      detail.value = null
    } finally {
      loading.value = false
    }
  },
)
</script>
