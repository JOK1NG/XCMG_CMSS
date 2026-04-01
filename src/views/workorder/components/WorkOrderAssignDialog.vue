<template>
  <el-dialog
    :model-value="visible"
    title="派工"
    width="480px"
    destroy-on-close
    append-to-body
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="工单编号">
        <el-input :model-value="workOrderCode" disabled />
      </el-form-item>
      <el-form-item label="维修人" prop="assigneeId">
        <el-select
          v-model="form.assigneeId"
          filterable
          placeholder="请选择维修人"
          style="width: 100%"
          :loading="userLoading"
        >
          <el-option
            v-for="u in userOptions"
            :key="u.id"
            :label="`${u.realName}（${u.username}）`"
            :value="u.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { assignWorkOrder } from '@/api/workorder'
import { getUserPage, type UserItem } from '@/api/system'

const props = defineProps<{
  visible: boolean
  workOrderId: number | null
  workOrderCode: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const userLoading = ref(false)
const userOptions = ref<UserItem[]>([])

const form = reactive({
  assigneeId: undefined as number | undefined,
})

const rules: FormRules = {
  assigneeId: [{ required: true, message: '请选择维修人', trigger: 'change' }],
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
  () => [props.visible, props.workOrderId] as const,
  ([open]) => {
    if (!open) return
    form.assigneeId = undefined
    formRef.value?.clearValidate?.()
    loadUsers()
  },
)

const handleSubmit = async () => {
  if (!formRef.value || props.workOrderId == null || form.assigneeId == null) return
  await formRef.value.validate()
  submitting.value = true
  try {
    await assignWorkOrder(props.workOrderId, { assigneeId: form.assigneeId })
    emit('success')
    emit('update:visible', false)
  } finally {
    submitting.value = false
  }
}
</script>
