<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑备件' : '新增备件'"
    width="580px"
    destroy-on-close
    append-to-body
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.prevent
    >
      <el-form-item label="备件编号" prop="spareCode">
        <el-input
          v-model="form.spareCode"
          placeholder="请输入备件编号"
          :disabled="isEdit"
          maxlength="64"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="备件名称" prop="spareName">
        <el-input v-model="form.spareName" placeholder="请输入备件名称" maxlength="128" />
      </el-form-item>
      <el-form-item label="规格型号" prop="spec">
        <el-input v-model="form.spec" placeholder="请输入规格型号" maxlength="128" />
      </el-form-item>
      <el-form-item label="单位" prop="unit">
        <el-input v-model="form.unit" placeholder="如：个、台、条" maxlength="32" />
      </el-form-item>
      <el-form-item v-if="!isEdit" label="初始库存" prop="stockQty">
        <el-input-number v-model="form.stockQty" :min="0" :precision="0" style="width: 100%" />
      </el-form-item>
      <el-form-item v-else label="当前库存">
        <el-input :model-value="String(displayStockQty)" disabled />
      </el-form-item>
      <el-form-item label="预警值" prop="warningQty">
        <el-input-number v-model="form.warningQty" :min="0" :precision="0" style="width: 100%" />
      </el-form-item>
      <el-form-item label="参考单价" prop="price">
        <el-input v-model="form.price" placeholder="如：¥680 或数字" maxlength="32" />
      </el-form-item>
      <el-form-item label="供应商" prop="supplierName">
        <el-select v-model="form.supplierName" placeholder="请选择供应商" filterable style="width: 100%">
          <el-option
            v-for="opt in supplierOptions"
            :key="String(opt.value)"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="存放位置" prop="location">
        <el-input v-model="form.location" placeholder="请输入存放位置" maxlength="128" />
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
import { createSpare, updateSpare, type SpareFormPayload } from '@/api/spare'
import type { DictItem } from '@/api/dict'

type FormState = SpareFormPayload & { stockQty: number }

const props = defineProps<{
  visible: boolean
  mode: 'create' | 'edit'
  recordId?: number | null
  initial?: SpareFormPayload | null
  /** 编辑时用于展示只读库存 */
  initialStockQty?: number | null
  supplierOptions: DictItem[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'success'): void
}>()

const isEdit = computed(() => props.mode === 'edit')
const displayStockQty = computed(() =>
  props.initialStockQty != null ? props.initialStockQty : '—',
)

const emptyForm = (): FormState => ({
  spareCode: '',
  spareName: '',
  spec: '',
  unit: '',
  stockQty: 0,
  warningQty: 0,
  price: '',
  supplierName: '',
  location: '',
})

const form = reactive<FormState>(emptyForm())
const formRef = ref<FormInstance>()
const submitting = ref(false)

const rules = computed<FormRules>(() => ({
  spareCode: [{ required: true, message: '请输入备件编号', trigger: 'blur' }],
  spareName: [{ required: true, message: '请输入备件名称', trigger: 'blur' }],
  spec: [{ required: true, message: '请输入规格型号', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入单位', trigger: 'blur' }],
  ...(!isEdit.value
    ? { stockQty: [{ required: true, message: '请填写初始库存', trigger: 'change' }] }
    : {}),
  warningQty: [{ required: true, message: '请填写预警值', trigger: 'change' }],
  price: [{ required: true, message: '请输入参考单价', trigger: 'blur' }],
  supplierName: [{ required: true, message: '请选择供应商', trigger: 'change' }],
  location: [{ required: true, message: '请输入存放位置', trigger: 'blur' }],
}))

watch(
  () => [props.visible, props.mode, props.initial] as const,
  ([open]) => {
    if (!open) return
    Object.assign(form, emptyForm())
    if (props.initial) {
      const { spareCode, spareName, spec, unit, warningQty, price, supplierName, location } =
        props.initial
      Object.assign(form, {
        spareCode,
        spareName,
        spec,
        unit,
        stockQty: 0,
        warningQty,
        price,
        supplierName,
        location,
      })
    }
    formRef.value?.clearValidate?.()
  },
)

const handleSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    const payload: SpareFormPayload = {
      spareCode: form.spareCode,
      spareName: form.spareName,
      spec: form.spec,
      unit: form.unit,
      warningQty: form.warningQty,
      price: form.price,
      supplierName: String(form.supplierName),
      location: form.location,
    }
    if (isEdit.value && props.recordId != null) {
      await updateSpare(props.recordId, { ...payload })
    } else {
      await createSpare({ ...payload, stockQty: form.stockQty })
    }
    emit('success')
    emit('update:visible', false)
  } finally {
    submitting.value = false
  }
}
</script>
