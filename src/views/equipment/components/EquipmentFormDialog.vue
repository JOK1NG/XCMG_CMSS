<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑设备' : '新增设备'"
    width="560px"
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
      <el-form-item label="设备编号" prop="equipmentCode">
        <el-input
          v-model="form.equipmentCode"
          placeholder="请输入设备编号"
          :disabled="isEdit"
          maxlength="64"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="设备名称" prop="equipmentName">
        <el-input v-model="form.equipmentName" placeholder="请输入设备名称" maxlength="128" />
      </el-form-item>
      <el-form-item label="设备分类" prop="categoryName">
        <el-select v-model="form.categoryName" placeholder="请选择分类" style="width: 100%">
          <el-option
            v-for="opt in categoryOptions"
            :key="String(opt.value)"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="规格型号" prop="model">
        <el-input v-model="form.model" placeholder="请输入规格型号" maxlength="128" />
      </el-form-item>
      <el-form-item label="所在车间" prop="workshopName">
        <el-select v-model="form.workshopName" placeholder="请选择车间" style="width: 100%">
          <el-option
            v-for="opt in workshopOptions"
            :key="String(opt.value)"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="设备状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
          <el-option
            v-for="opt in statusOptions"
            :key="String(opt.value)"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="购置日期" prop="purchaseDate">
        <el-date-picker
          v-model="form.purchaseDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          style="width: 100%"
        />
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
import { createEquipment, updateEquipment, type EquipmentFormPayload } from '@/api/equipment'
import type { DictItem } from '@/api/dict'

const props = defineProps<{
  visible: boolean
  mode: 'create' | 'edit'
  /** 编辑时传入 */
  recordId?: number | null
  initial?: EquipmentFormPayload | null
  categoryOptions: DictItem[]
  workshopOptions: DictItem[]
  statusOptions: DictItem[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'success'): void
}>()

const isEdit = computed(() => props.mode === 'edit')

const emptyForm = (): EquipmentFormPayload => ({
  equipmentCode: '',
  equipmentName: '',
  categoryName: '',
  model: '',
  workshopName: '',
  status: '正常',
  purchaseDate: '',
})

const form = reactive<EquipmentFormPayload>(emptyForm())
const formRef = ref<FormInstance>()
const submitting = ref(false)

const rules: FormRules = {
  equipmentCode: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
  equipmentName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  categoryName: [{ required: true, message: '请选择设备分类', trigger: 'change' }],
  model: [{ required: true, message: '请输入规格型号', trigger: 'blur' }],
  workshopName: [{ required: true, message: '请选择所在车间', trigger: 'change' }],
  status: [{ required: true, message: '请选择设备状态', trigger: 'change' }],
  purchaseDate: [{ required: true, message: '请选择购置日期', trigger: 'change' }],
}

watch(
  () => [props.visible, props.mode, props.initial] as const,
  ([open]) => {
    if (!open) return
    Object.assign(form, emptyForm())
    if (props.initial) {
      Object.assign(form, props.initial)
    }
    formRef.value?.clearValidate?.()
  },
)

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()
  submitting.value = true
  try {
    if (isEdit.value && props.recordId != null) {
      await updateEquipment(props.recordId, { ...form })
    } else {
      await createEquipment({ ...form })
    }
    emit('success')
    emit('update:visible', false)
  } finally {
    submitting.value = false
  }
}
</script>
