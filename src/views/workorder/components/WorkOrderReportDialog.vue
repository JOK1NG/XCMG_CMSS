<template>
  <el-dialog
    :model-value="visible"
    title="发起报修"
    width="560px"
    destroy-on-close
    append-to-body
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="报修设备" prop="equipmentId">
        <el-select
          v-model="form.equipmentId"
          filterable
          placeholder="请选择设备"
          style="width: 100%"
          :loading="equipmentLoading"
        >
          <el-option
            v-for="eq in equipmentOptions"
            :key="eq.id"
            :label="`${eq.equipmentName}（${eq.equipmentCode}）`"
            :value="eq.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="故障描述" prop="faultDesc">
        <el-input
          v-model="form.faultDesc"
          type="textarea"
          :rows="4"
          placeholder="请描述故障现象"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="故障等级" prop="faultLevel">
        <el-select v-model="form.faultLevel" placeholder="请选择等级" style="width: 100%">
          <el-option
            v-for="opt in faultLevelOptions"
            :key="`fl-${String(opt.value)}`"
            :label="opt.label"
            :value="Number(opt.value)"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { createWorkOrder } from '@/api/workorder'
import { getEquipmentPage } from '@/api/equipment'
import type { EquipmentItem } from '@/api/equipment'
import type { DictItem } from '@/api/dict'

const props = defineProps<{
  visible: boolean
  faultLevelOptions: DictItem[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const equipmentLoading = ref(false)
const equipmentOptions = ref<EquipmentItem[]>([])

const form = reactive({
  equipmentId: undefined as number | undefined,
  faultDesc: '',
  faultLevel: 2 as number,
})

const rules: FormRules = {
  equipmentId: [{ required: true, message: '请选择设备', trigger: 'change' }],
  faultDesc: [{ required: true, message: '请输入故障描述', trigger: 'blur' }],
  faultLevel: [{ required: true, message: '请选择故障等级', trigger: 'change' }],
}

const loadEquipment = async () => {
  equipmentLoading.value = true
  try {
    const data = await getEquipmentPage({ pageNum: 1, pageSize: 200 })
    equipmentOptions.value = Array.isArray(data.list) ? data.list : []
  } catch {
    equipmentOptions.value = []
  } finally {
    equipmentLoading.value = false
  }
}

watch(
  () => props.visible,
  (open) => {
    if (!open) return
    form.equipmentId = undefined
    form.faultDesc = ''
    form.faultLevel = 2
    formRef.value?.clearValidate?.()
    loadEquipment()
  },
)

const handleSubmit = async () => {
  if (!formRef.value || form.equipmentId == null) return
  await formRef.value.validate()
  submitting.value = true
  try {
    await createWorkOrder({
      equipmentId: form.equipmentId,
      faultDesc: form.faultDesc,
      faultLevel: form.faultLevel,
    })
    emit('success')
    emit('update:visible', false)
  } finally {
    submitting.value = false
  }
}
</script>
