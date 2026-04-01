<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑用户' : '新增用户'"
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
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="form.username"
          placeholder="请输入登录用户名"
          :disabled="isEdit"
          maxlength="64"
          show-word-limit
        />
      </el-form-item>
      <el-form-item v-if="!isEdit" label="初始密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入初始密码"
          show-password
          maxlength="32"
          autocomplete="new-password"
        />
      </el-form-item>
      <el-form-item label="姓名" prop="realName">
        <el-input v-model="form.realName" placeholder="请输入真实姓名" maxlength="64" />
      </el-form-item>
      <el-form-item label="部门" prop="deptName">
        <el-select v-model="form.deptName" placeholder="请选择部门" style="width: 100%">
          <el-option
            v-for="opt in deptOptions"
            :key="String(opt.value)"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="角色" prop="roleName">
        <el-select v-model="form.roleName" placeholder="请选择角色" style="width: 100%">
          <el-option
            v-for="opt in roleOptions"
            :key="String(opt.value)"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
          <el-option
            v-for="opt in statusOptions"
            :key="String(opt.value)"
            :label="opt.label"
            :value="opt.value"
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
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { createUser, updateUser, type UserFormPayload } from '@/api/system'
import type { DictItem } from '@/api/dict'

type FormState = UserFormPayload & { password: string }

const props = defineProps<{
  visible: boolean
  mode: 'create' | 'edit'
  recordId?: number | null
  initial?: UserFormPayload | null
  deptOptions: DictItem[]
  roleOptions: DictItem[]
  statusOptions: DictItem[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'success'): void
}>()

const isEdit = computed(() => props.mode === 'edit')

const emptyForm = (): FormState => ({
  username: '',
  password: '',
  realName: '',
  deptName: '',
  roleName: '',
  phone: '',
  status: '启用',
})

const form = reactive<FormState>(emptyForm())
const formRef = ref<FormInstance>()
const submitting = ref(false)

const validatePhone = (_rule: unknown, value: string, callback: (e?: Error) => void) => {
  if (!value) {
    callback()
    return
  }
  if (!/^1\d{10}$/.test(value)) {
    callback(new Error('请输入 11 位手机号'))
    return
  }
  callback()
}

const rules = computed<FormRules>(() => ({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  ...(!isEdit.value
    ? { password: [{ required: true, message: '请输入初始密码', trigger: 'blur' }] }
    : {}),
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  deptName: [{ required: true, message: '请选择部门', trigger: 'change' }],
  roleName: [{ required: true, message: '请选择角色', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { validator: validatePhone, trigger: 'blur' },
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}))

watch(
  () => [props.visible, props.mode, props.initial] as const,
  ([open]) => {
    if (!open) return
    Object.assign(form, emptyForm())
    if (props.initial) {
      const { username, realName, deptName, roleName, phone, status } = props.initial
      Object.assign(form, { username, realName, deptName, roleName, phone, status, password: '' })
    }
    formRef.value?.clearValidate?.()
  },
)

const handleSubmit = async () => {
  if (!formRef.value) return
  // validate() → Promise<boolean>：失败时 reject，少数路径（如无 model）会 resolve false，需一并拦截
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    const payload: UserFormPayload = {
      username: form.username,
      realName: form.realName,
      deptName: form.deptName,
      roleName: form.roleName,
      phone: form.phone,
      status: form.status,
    }
    if (isEdit.value && props.recordId != null) {
      await updateUser(props.recordId, { ...payload })
    } else {
      await createUser({ ...payload, password: form.password })
    }
    emit('success')
    emit('update:visible', false)
  } finally {
    submitting.value = false
  }
}
</script>
