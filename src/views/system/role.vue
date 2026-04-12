<template>
  <div class="page-container">
    <PageHeader title="角色管理" description="维护系统角色、权限描述及状态" />

    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="关键字">
          <el-input
            v-model="queryForm.keyword"
            placeholder="角色编码 / 角色名称"
            clearable
            style="width: 220px"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择状态" clearable style="width: 160px">
            <el-option
              v-for="opt in statusOptions"
              :key="`r-${String(opt.value)}`"
              :label="opt.label"
              :value="String(opt.value)"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="openCreate">新增角色</el-button>
        </div>
        <div class="toolbar-right">
          <span class="toolbar-tip">共 {{ total }} 条角色记录</span>
        </div>
      </div>

      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="roleCode" label="角色编码" min-width="140" />
        <el-table-column prop="roleName" label="角色名称" min-width="160" />
        <el-table-column prop="description" label="描述" min-width="240" show-overflow-tooltip />
        <el-table-column prop="permissions" label="权限集合" min-width="260">
          <template #default="{ row }">
            <el-tag
              v-for="permission in row.permissions"
              :key="`${row.id}-${permission}`"
              size="small"
              class="permission-tag"
            >
              {{ permission }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '启用' ? 'success' : 'info'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="180" />
        <el-table-column label="操作" fixed="right" min-width="210">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && tableData.length === 0"
        description="暂无角色数据"
        class="table-empty"
      />

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryForm.pageNum"
          v-model:page-size="queryForm.pageSize"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-sizes="[10, 20, 50]"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="formVisible"
      :title="dialogTitle"
      width="680px"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="formModel" :rules="formRules" label-width="100px">
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model="formModel.roleCode" placeholder="例如：ROLE_ADMIN" />
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="formModel.roleName" placeholder="例如：管理员" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="formModel.description"
            type="textarea"
            :rows="2"
            placeholder="补充角色职责说明"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formModel.status">
            <el-radio label="启用">启用</el-radio>
            <el-radio label="停用">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="权限集合">
          <el-select
            v-model="formModel.permissions"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入或选择权限"
            style="width: 100%"
          >
            <el-option v-for="p in permissionPresets" :key="p" :value="p" :label="p" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import { useListFallbackRows } from '@/composables/useListFallback'
import {
  createRole,
  deleteRole,
  getRolePage,
  updateRole,
  type RoleItem,
} from '@/api/role'

const DEFAULT_PAGE_SIZE = 10

const FALLBACK_ROWS: RoleItem[] = [
  {
    id: 1,
    roleCode: 'ROLE_ADMIN',
    roleName: '超级管理员',
    description: '系统级权限管理，包括所有菜单和角色配置权限',
    permissions: ['system:view', 'system:user', 'system:role'],
    status: '启用',
    createTime: '2026-03-01 09:00:00',
  },
  {
    id: 2,
    roleCode: 'ROLE_MAINTAIN_MANAGER',
    roleName: '保养管理员',
    description: '负责工单/保养/备件等维护业务的管理操作',
    permissions: ['workorder:view', 'maintain:view', 'spare:view'],
    status: '启用',
    createTime: '2026-03-02 10:20:00',
  },
]

const { shouldUseFallback, applyFallback } = useListFallbackRows({
  fallbackRows: FALLBACK_ROWS,
  resetPageOnFallback: true,
})

const statusOptions = ref([
  { label: '启用', value: '启用' },
  { label: '停用', value: '停用' },
])

const permissionPresets = ['system:view', 'system:user', 'system:role', 'workorder:view', 'maintain:view', 'spare:view']

const queryForm = reactive({
  keyword: '',
  status: '',
  pageNum: 1,
  pageSize: DEFAULT_PAGE_SIZE,
})

const tableData = ref<RoleItem[]>([])
const total = ref(0)
const loading = ref(false)
const submitting = ref(false)

const formVisible = ref(false)
const editingId = ref<number | null>(null)
const formModel = reactive({
  roleCode: '',
  roleName: '',
  description: '',
  status: '启用' as '启用' | '停用',
  permissions: [] as string[],
})
const formRef = ref<FormInstance>()

const dialogTitle = computed(() => (editingId.value === null ? '新增角色' : '编辑角色'))

const formRules: FormRules = {
  roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入角色描述', trigger: 'blur' }],
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getRolePage({
      pageNum: queryForm.pageNum,
      pageSize: queryForm.pageSize,
      keyword: queryForm.keyword || undefined,
      status: queryForm.status || undefined,
    })
    tableData.value = Array.isArray(data.list) ? data.list : []
    total.value = typeof data.total === 'number' ? data.total : 0
  } catch {
    if (shouldUseFallback()) {
      applyFallback(queryForm, tableData, total)
    } else {
      tableData.value = []
      total.value = 0
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryForm.pageNum = 1
  loadData()
}

const handleReset = () => {
  queryForm.keyword = ''
  queryForm.status = ''
  queryForm.pageNum = 1
  queryForm.pageSize = DEFAULT_PAGE_SIZE
  loadData()
}

const handlePageChange = () => {
  loadData()
}

const handleSizeChange = () => {
  queryForm.pageNum = 1
  loadData()
}

const openCreate = () => {
  editingId.value = null
  resetForm()
  formVisible.value = true
}

const openEdit = (row: RoleItem) => {
  editingId.value = row.id
  formModel.roleCode = row.roleCode
  formModel.roleName = row.roleName
  formModel.description = row.description
  formModel.status = row.status
  formModel.permissions = row.permissions.slice()
  formVisible.value = true
}

const resetForm = () => {
  formModel.roleCode = ''
  formModel.roleName = ''
  formModel.description = ''
  formModel.status = '启用'
  formModel.permissions = []
  formRef.value?.clearValidate()
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }
  submitting.value = true
  const payload = {
    roleCode: formModel.roleCode,
    roleName: formModel.roleName,
    description: formModel.description,
    status: formModel.status,
    permissions: formModel.permissions,
  }
  try {
    if (editingId.value === null) {
      await createRole(payload)
      ElMessage.success('角色创建成功')
    } else {
      await updateRole(editingId.value, payload)
      ElMessage.success('角色更新成功')
    }
    formVisible.value = false
    await loadData()
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (row: RoleItem) => {
  try {
    await ElMessageBox.confirm(`确定删除角色「${row.roleName}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  await deleteRole(row.id)
  ElMessage.success('角色删除成功')
  await loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.permission-tag {
  margin-right: 6px;
  margin-bottom: 6px;
}
</style>
