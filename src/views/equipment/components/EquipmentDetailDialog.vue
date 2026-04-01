<template>
  <el-dialog
    :model-value="visible"
    title="设备详情"
    width="520px"
    append-to-body
    @update:model-value="emit('update:visible', $event)"
  >
    <el-skeleton v-if="loading" :rows="6" animated />
    <el-descriptions v-else-if="detail" :column="1" border>
      <el-descriptions-item label="设备编号">{{ detail.equipmentCode }}</el-descriptions-item>
      <el-descriptions-item label="设备名称">{{ detail.equipmentName }}</el-descriptions-item>
      <el-descriptions-item label="设备分类">{{ detail.categoryName }}</el-descriptions-item>
      <el-descriptions-item label="规格型号">{{ detail.model }}</el-descriptions-item>
      <el-descriptions-item label="所在车间">{{ detail.workshopName }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="statusTagType(detail.status)">{{ detail.status }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="购置日期">{{ detail.purchaseDate }}</el-descriptions-item>
    </el-descriptions>
    <el-empty v-else description="暂无数据" />

    <template #footer>
      <el-button type="primary" @click="emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { getEquipmentDetail, type EquipmentItem } from '@/api/equipment'

const props = defineProps<{
  visible: boolean
  equipmentId: number | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
}>()

const loading = ref(false)
const detail = ref<EquipmentItem | null>(null)

const statusTagType = (status: string) => {
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

watch(
  () => [props.visible, props.equipmentId] as const,
  async ([open, id]) => {
    if (!open || id == null) {
      detail.value = null
      return
    }
    loading.value = true
    try {
      detail.value = await getEquipmentDetail(id)
    } catch {
      detail.value = null
    } finally {
      loading.value = false
    }
  },
)
</script>
