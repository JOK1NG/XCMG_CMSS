<template>
  <el-dialog
    :model-value="visible"
    title="手动创建保养工单"
    width="640px"
    destroy-on-close
    append-to-body
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" @submit.prevent>
      <el-form-item label="保养设备" prop="equipmentId">
        <el-select
          v-model="form.equipmentId"
          filterable
          placeholder="请选择设备"
          style="width: 100%"
          :loading="equipmentLoading"
        >
          <el-option
            v-for="item in equipmentOptions"
            :key="item.id"
            :label="`${item.equipmentName}（${item.equipmentCode}）`"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="保养模板" prop="templateId">
        <el-select
          v-model="form.templateId"
          filterable
          placeholder="请选择模板"
          style="width: 100%"
          :loading="templateLoading"
        >
          <el-option
            v-for="item in templateOptions"
            :key="item.id"
            :label="item.templateName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="计划日期" prop="planDate">
        <el-date-picker
          v-model="form.planDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择计划日期"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="建单并派工">
        <el-switch v-model="form.assignNow" />
      </el-form-item>

      <el-form-item v-if="form.assignNow" label="执行人" prop="assigneeId">
        <el-select
          v-model="form.assigneeId"
          filterable
          placeholder="请选择执行人"
          style="width: 100%"
          :loading="userLoading"
        >
          <el-option
            v-for="item in userOptions"
            :key="item.id"
            :label="`${item.realName}（${item.username}）`"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item v-if="form.assignNow" label="计划执行时间" prop="plannedExecuteTime">
        <el-date-picker
          v-model="form.plannedExecuteTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择计划执行时间"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="3"
          maxlength="500"
          show-word-limit
          placeholder="请输入备注"
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
import { createMaintainOrder, getMaintainTemplatePage, type MaintainTemplateItem } from '@/api/maintain'
import { getEquipmentPage, type EquipmentItem } from '@/api/equipment'
import { getUserPage, type UserItem } from '@/api/system'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const equipmentLoading = ref(false)
const templateLoading = ref(false)
const userLoading = ref(false)

const equipmentOptions = ref<EquipmentItem[]>([])
const templateOptions = ref<MaintainTemplateItem[]>([])
const userOptions = ref<UserItem[]>([])

const form = reactive({
  equipmentId: undefined as number | undefined,
  templateId: undefined as number | undefined,
  planDate: '',
  assignNow: false,
  assigneeId: undefined as number | undefined,
  plannedExecuteTime: '',
  remark: '',
})

const rules = computed<FormRules>(() => ({
  equipmentId: [{ required: true, message: '请选择设备', trigger: 'change' }],
  templateId: [{ required: true, message: '请选择模板', trigger: 'change' }],
  planDate: [{ required: true, message: '请选择计划日期', trigger: 'change' }],
  ...(form.assignNow
    ? {
        assigneeId: [{ required: true, message: '请选择执行人', trigger: 'change' }],
        plannedExecuteTime: [{ required: true, message: '请选择计划执行时间', trigger: 'change' }],
      }
    : {}),
}))

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

const loadTemplates = async () => {
  templateLoading.value = true
  try {
    const data = await getMaintainTemplatePage({ pageNum: 1, pageSize: 200, status: '启用' })
    templateOptions.value = Array.isArray(data.list) ? data.list : []
  } catch {
    templateOptions.value = []
  } finally {
    templateLoading.value = false
  }
}

const loadUsers = async () => {
  userLoading.value = true
  try {
    const data = await getUserPage({ pageNum: 1, pageSize: 200 })
    userOptions.value = Array.isArray(data.list) ? data.list : []
  } catch {
    userOptions.value = []
  } finally {
    userLoading.value = false
  }
}

watch(
  () => props.visible,
  (open) => {
    if (!open) return
    form.equipmentId = undefined
    form.templateId = undefined
    form.planDate = ''
    form.assignNow = false
    form.assigneeId = undefined
    form.plannedExecuteTime = ''
    form.remark = ''
    formRef.value?.clearValidate?.()
    loadEquipment()
    loadTemplates()
    loadUsers()
  },
)

const handleSubmit = async () => {
  if (!formRef.value || form.equipmentId == null || form.templateId == null || !form.planDate) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await createMaintainOrder({
      equipmentId: form.equipmentId,
      templateId: form.templateId,
      planDate: form.planDate,
      remark: form.remark || undefined,
      assignNow: form.assignNow,
      assigneeId: form.assignNow ? form.assigneeId : undefined,
      plannedExecuteTime: form.assignNow ? form.plannedExecuteTime || undefined : undefined,
    })
    emit('success')
    emit('update:visible', false)
  } finally {
    submitting.value = false
  }
}
</script>
