<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'in' ? '备件入库' : '备件出库'"
    width="480px"
    destroy-on-close
    append-to-body
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="88px" @submit.prevent>
      <el-form-item v-if="needPickSpare" label="备件" prop="spareId">
        <el-select
          v-model="form.spareId"
          filterable
          placeholder="请选择备件"
          style="width: 100%"
          :loading="spareLoading"
          @change="onSpareChange"
        >
          <el-option
            v-for="s in spareOptions"
            :key="s.id"
            :label="`${s.spareName}（${s.spareCode}）`"
            :value="s.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-else label="备件">
        <el-input :model-value="presetLabel" disabled />
      </el-form-item>
      <el-form-item label="数量" prop="qty">
        <el-input-number
          v-model="form.qty"
          :min="1"
          :max="qtyMax"
          :precision="0"
          style="width: 100%"
          placeholder="正整数"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="200" show-word-limit />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { getSparePage, stockInSpare, stockOutSpare, type SpareItem } from '@/api/spare'

const props = defineProps<{
  visible: boolean
  mode: 'in' | 'out'
  /** 行内操作时传入，工具栏不选备件时为 null */
  presetSpareId: number | null
  presetLabel?: string
  /** 出库时当前库存，用于校验 */
  currentStockQty?: number | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'success'): void
}>()

const needPickSpare = computed(() => props.presetSpareId == null)

const formRef = ref<FormInstance>()
const submitting = ref(false)
const spareLoading = ref(false)
const spareOptions = ref<SpareItem[]>([])

const form = reactive({
  spareId: undefined as number | undefined,
  qty: 1,
  remark: '',
})

/** 出库时可用的库存上限（行内或下拉选中后） */
const maxOutQty = computed(() => {
  if (props.mode !== 'out') return undefined
  if (props.presetSpareId != null && props.currentStockQty != null) return props.currentStockQty
  if (form.spareId != null) {
    const row = spareOptions.value.find((s) => s.id === form.spareId)
    if (row) return row.stockQty
  }
  return undefined
})

/** 出库时限制输入上限；入库不限制 */
const qtyMax = computed(() => (props.mode === 'out' ? maxOutQty.value : undefined))

const onSpareChange = () => {
  formRef.value?.validateField('qty')
}

const validateQty = (_rule: unknown, value: number | undefined, callback: (e?: Error) => void) => {
  if (value == null || value < 1) {
    callback(new Error('请输入不少于 1 的数量'))
    return
  }
  if (props.mode === 'out') {
    const max = maxOutQty.value
    if (max != null && value > max) {
      callback(new Error(`出库数量不能大于当前库存（${max}）`))
      return
    }
  }
  callback()
}

const rules = computed<FormRules>(() => {
  const r: FormRules = {
    qty: [
      { required: true, message: '请输入数量', trigger: 'change' },
      { validator: validateQty, trigger: 'change' },
    ],
  }
  if (needPickSpare.value) {
    r.spareId = [{ required: true, message: '请选择备件', trigger: 'change' }]
  }
  return r
})

const loadSpareOptions = async () => {
  spareLoading.value = true
  try {
    const data = await getSparePage({ pageNum: 1, pageSize: 500 })
    spareOptions.value = Array.isArray(data.list) ? data.list : []
  } catch {
    spareOptions.value = []
  } finally {
    spareLoading.value = false
  }
}

watch(
  () => [props.visible, props.presetSpareId, props.mode] as const,
  ([open, presetId]) => {
    if (!open) return
    form.qty = 1
    form.remark = ''
    form.spareId = presetId ?? undefined
    formRef.value?.clearValidate?.()
    if (presetId == null) {
      loadSpareOptions()
    }
  },
)

const handleSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  const id = props.presetSpareId ?? form.spareId
  if (id == null) return
  submitting.value = true
  try {
    const body = { qty: form.qty, remark: form.remark || undefined }
    if (props.mode === 'in') {
      await stockInSpare(id, body)
    } else {
      await stockOutSpare(id, body)
    }
    emit('success')
    emit('update:visible', false)
  } finally {
    submitting.value = false
  }
}
</script>
