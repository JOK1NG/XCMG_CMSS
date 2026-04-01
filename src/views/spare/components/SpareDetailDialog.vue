<template>
  <el-dialog
    :model-value="visible"
    title="备件详情"
    width="560px"
    append-to-body
    @update:model-value="emit('update:visible', $event)"
  >
    <el-skeleton v-if="loading" :rows="8" animated />
    <el-descriptions v-else-if="detail" :column="1" border>
      <el-descriptions-item label="备件编号">{{ detail.spareCode }}</el-descriptions-item>
      <el-descriptions-item label="备件名称">{{ detail.spareName }}</el-descriptions-item>
      <el-descriptions-item label="规格型号">{{ detail.spec }}</el-descriptions-item>
      <el-descriptions-item label="单位">{{ detail.unit }}</el-descriptions-item>
      <el-descriptions-item label="当前库存">{{ detail.stockQty }}</el-descriptions-item>
      <el-descriptions-item label="预警值">{{ detail.warningQty }}</el-descriptions-item>
      <el-descriptions-item label="参考单价">{{ detail.price }}</el-descriptions-item>
      <el-descriptions-item label="供应商">{{ detail.supplierName }}</el-descriptions-item>
      <el-descriptions-item label="存放位置">{{ detail.location }}</el-descriptions-item>
      <el-descriptions-item label="库存状态">
        <el-tag :type="stockTagType(detail)">{{ stockStatusText(detail) }}</el-tag>
      </el-descriptions-item>
    </el-descriptions>
    <el-empty v-else description="暂无数据" />

    <template #footer>
      <el-button type="primary" @click="emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { getSpareDetail, type SpareItem } from '@/api/spare'

const props = defineProps<{
  visible: boolean
  spareId: number | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
}>()

const loading = ref(false)
const detail = ref<SpareItem | null>(null)

const stockStatusText = (row: Pick<SpareItem, 'stockQty' | 'warningQty'>) =>
  row.stockQty <= row.warningQty ? '低库存预警' : '正常'

const stockTagType = (row: Pick<SpareItem, 'stockQty' | 'warningQty'>) =>
  stockStatusText(row) === '正常' ? 'success' : 'danger'

watch(
  () => [props.visible, props.spareId] as const,
  async ([open, id]) => {
    if (!open || id == null) {
      detail.value = null
      return
    }
    loading.value = true
    try {
      detail.value = await getSpareDetail(id)
    } catch {
      detail.value = null
    } finally {
      loading.value = false
    }
  },
)
</script>
