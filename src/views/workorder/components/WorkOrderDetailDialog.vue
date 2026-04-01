<template>
  <el-dialog
    :model-value="visible"
    title="工单详情"
    width="640px"
    append-to-body
    @update:model-value="emit('update:visible', $event)"
  >
    <el-skeleton v-if="loading" :rows="8" animated />
    <el-descriptions v-else-if="detail" :column="1" border>
      <el-descriptions-item label="工单编号">{{ detail.workOrderCode }}</el-descriptions-item>
      <el-descriptions-item label="报修设备">{{ detail.equipmentName }}（ID: {{ detail.equipmentId }}）</el-descriptions-item>
      <el-descriptions-item label="故障描述">{{ detail.faultDesc }}</el-descriptions-item>
      <el-descriptions-item label="故障等级">
        <el-tag :type="levelTagType(detail.faultLevel)">
          {{ detail.faultLevelLabel || faultLevelLabel(detail.faultLevel) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="工单状态">
        <el-tag :type="statusTagType(detail.status)">
          {{ detail.statusLabel || statusLabel(detail.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="报修人">{{ detail.reporterName }}</el-descriptions-item>
      <el-descriptions-item label="报修时间">{{ detail.reportTime }}</el-descriptions-item>
      <el-descriptions-item label="维修人">
        {{ detail.assigneeName || '—' }}
      </el-descriptions-item>
    </el-descriptions>
    <el-empty v-else description="暂无数据" />

    <template #footer>
      <el-button type="primary" @click="emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { getWorkOrderDetail, type WorkOrderItem } from '@/api/workorder'

const props = defineProps<{
  visible: boolean
  workOrderId: number | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
}>()

const loading = ref(false)
const detail = ref<WorkOrderItem | null>(null)

const statusLabel = (status: number) => {
  switch (status) {
    case 1:
      return '待派工'
    case 2:
      return '已派工'
    case 3:
      return '维修中'
    case 4:
      return '待验收'
    case 5:
      return '已完成'
    case 6:
      return '已关闭'
    default:
      return '未知'
  }
}

const faultLevelLabel = (level: number) => {
  switch (level) {
    case 1:
      return '紧急'
    case 2:
      return '一般'
    case 3:
      return '低'
    default:
      return '未知'
  }
}

const statusTagType = (status: number) => {
  switch (status) {
    case 1:
      return 'warning'
    case 2:
      return 'primary'
    case 3:
      return 'danger'
    case 4:
      return 'warning'
    case 5:
      return 'success'
    case 6:
      return 'info'
    default:
      return 'info'
  }
}

const levelTagType = (level: number) => {
  switch (level) {
    case 1:
      return 'danger'
    case 2:
      return 'warning'
    case 3:
      return 'info'
    default:
      return 'info'
  }
}

watch(
  () => [props.visible, props.workOrderId] as const,
  async ([open, id]) => {
    if (!open || id == null) {
      detail.value = null
      return
    }
    loading.value = true
    try {
      detail.value = await getWorkOrderDetail(id)
    } catch {
      detail.value = null
    } finally {
      loading.value = false
    }
  },
)
</script>
