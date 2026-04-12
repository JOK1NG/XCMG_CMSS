<template>
  <el-dialog
    :model-value="visible"
    title="保养规则管理"
    width="960px"
    destroy-on-close
    append-to-body
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form :inline="true" :model="queryForm">
      <el-form-item label="关键字">
        <el-input v-model="queryForm.keyword" placeholder="规则名称 / 分类 / 模板" clearable style="width: 220px" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="queryForm.enabled"
          placeholder="全部状态"
          clearable
          style="width: 160px"
        >
          <el-option :value="true" label="启用" />
          <el-option :value="false" label="停用" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="toolbar-row">
      <div class="toolbar-left">
        <el-button type="primary" @click="openCreate">新增规则</el-button>
        <span class="toolbar-tip">提前生成天数使用全局值：{{ GLOBAL_ADVANCE_DAYS }} 天</span>
      </div>
      <span class="toolbar-tip">共 {{ total }} 条规则</span>
    </div>

    <el-table v-loading="loading" :data="tableData" border stripe>
      <el-table-column prop="ruleName" label="规则名称" min-width="180" />
      <el-table-column prop="categoryName" label="设备分类" min-width="140" />
      <el-table-column prop="templateName" label="模板" min-width="180" />
      <el-table-column label="周期" min-width="120">
        <template #default="{ row }">
          {{ getCycleLabel(row.cycleType) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" min-width="110">
        <template #default="{ row }">
          <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '启用' : '停用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="nextGenerateDate" label="下次生成日期" min-width="140" />
      <el-table-column prop="lastGeneratedAt" label="最近生成时间" min-width="180" />
      <el-table-column label="操作" fixed="right" min-width="240">
        <template #default="{ row }">
          <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
          <el-button type="warning" link @click="toggleEnabled(row)">
            {{ row.enabled ? '停用' : '启用' }}
          </el-button>
          <el-button type="success" link @click="triggerGenerate(row)">立即生成</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="queryForm.pageNum"
        v-model:page-size="queryForm.pageSize"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :page-sizes="[10, 20, 50]"
        @size-change="handleSizeChange"
        @current-change="loadData"
      />
    </div>

    <el-dialog
      :model-value="formVisible"
      :title="formMode === 'create' ? '新增规则' : '编辑规则'"
      width="560px"
      append-to-body
      @update:model-value="formVisible = $event"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="form.ruleName" maxlength="64" />
        </el-form-item>
        <el-form-item label="设备分类" prop="categoryName">
          <el-select v-model="form.categoryName" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="item in categoryOptions" :key="String(item.value)" :label="item.label" :value="String(item.value)" />
          </el-select>
        </el-form-item>
        <el-form-item label="保养模板" prop="templateId">
          <el-select v-model="form.templateId" placeholder="请选择模板" style="width: 100%" filterable>
            <el-option v-for="item in templateOptions" :key="item.id" :label="item.templateName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="周期" prop="cycleType">
          <el-select v-model="form.cycleType" placeholder="请选择周期" style="width: 100%">
            <el-option
              v-for="item in MAINTAIN_CYCLE_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="是否启用">
          <el-switch v-model="form.enabled" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  createMaintainRule,
  getMaintainRulePage,
  getMaintainTemplatePage,
  setMaintainRuleEnabled,
  triggerMaintainRuleGenerate,
  updateMaintainRule,
  type MaintainCycleType,
  type MaintainRuleItem,
  type MaintainTemplateItem,
} from '@/api/maintain'
import { MAINTAIN_CYCLE_OPTIONS } from '@/constants/maintain'
import { EQUIPMENT_CATEGORY_FALLBACK } from '@/constants/dictFallbacks'
import { loadDictOptions } from '@/composables/useDictOptions'

const GLOBAL_ADVANCE_DAYS = 7

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'success'): void
}>()

const loading = ref(false)
const submitting = ref(false)
const tableData = ref<MaintainRuleItem[]>([])
const total = ref(0)
const templateOptions = ref<MaintainTemplateItem[]>([])
const categoryOptions = ref(EQUIPMENT_CATEGORY_FALLBACK)

const queryForm = reactive({
  keyword: '',
  enabled: undefined as boolean | undefined,
  pageNum: 1,
  pageSize: 10,
})

const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const form = reactive({
  ruleName: '',
  categoryName: '',
  templateId: undefined as number | undefined,
  cycleType: 'MONTHLY' as MaintainCycleType,
  enabled: true,
  remark: '',
})

const rules = computed<FormRules>(() => ({
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  categoryName: [{ required: true, message: '请选择设备分类', trigger: 'change' }],
  templateId: [{ required: true, message: '请选择模板', trigger: 'change' }],
  cycleType: [{ required: true, message: '请选择周期', trigger: 'change' }],
}))

const getCycleLabel = (cycle: MaintainCycleType) =>
  MAINTAIN_CYCLE_OPTIONS.find((item) => item.value === cycle)?.label ?? cycle

const loadTemplates = async () => {
  try {
    const data = await getMaintainTemplatePage({ pageNum: 1, pageSize: 200 })
    templateOptions.value = Array.isArray(data.list) ? data.list : []
  } catch {
    templateOptions.value = []
  }
}

const loadCategories = async () => {
  categoryOptions.value = await loadDictOptions('equipment_category', EQUIPMENT_CATEGORY_FALLBACK)
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getMaintainRulePage({
      pageNum: queryForm.pageNum,
      pageSize: queryForm.pageSize,
      keyword: queryForm.keyword || undefined,
      enabled: queryForm.enabled,
    })
    tableData.value = Array.isArray(data.list) ? data.list : []
    total.value = typeof data.total === 'number' ? data.total : 0
  } catch {
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

watch(
  () => props.visible,
  (open) => {
    if (!open) return
    queryForm.keyword = ''
    queryForm.enabled = undefined
    queryForm.pageNum = 1
    queryForm.pageSize = 10
    loadCategories()
    loadTemplates()
    loadData()
  },
)

const handleSearch = () => {
  queryForm.pageNum = 1
  loadData()
}

const handleReset = () => {
  queryForm.keyword = ''
  queryForm.enabled = undefined
  queryForm.pageNum = 1
  queryForm.pageSize = 10
  loadData()
}

const handleSizeChange = () => {
  queryForm.pageNum = 1
  loadData()
}

const resetForm = () => {
  form.ruleName = ''
  form.categoryName = ''
  form.templateId = undefined
  form.cycleType = 'MONTHLY'
  form.enabled = true
  form.remark = ''
  formRef.value?.clearValidate?.()
}

const openCreate = () => {
  formMode.value = 'create'
  editingId.value = null
  resetForm()
  formVisible.value = true
}

const openEdit = (row: MaintainRuleItem) => {
  formMode.value = 'edit'
  editingId.value = row.id
  form.ruleName = row.ruleName
  form.categoryName = row.categoryName
  form.templateId = row.templateId
  form.cycleType = row.cycleType
  form.enabled = row.enabled
  form.remark = row.remark || ''
  formRef.value?.clearValidate?.()
  formVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value || form.templateId == null) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const payload = {
      ruleName: form.ruleName,
      categoryName: form.categoryName,
      templateId: form.templateId,
      cycleType: form.cycleType,
      enabled: form.enabled,
      advanceDays: GLOBAL_ADVANCE_DAYS,
      remark: form.remark || undefined,
    }
    if (formMode.value === 'edit' && editingId.value != null) {
      await updateMaintainRule(editingId.value, payload)
    } else {
      await createMaintainRule(payload)
    }
    formVisible.value = false
    emit('success')
    await loadData()
  } finally {
    submitting.value = false
  }
}

const toggleEnabled = async (row: MaintainRuleItem) => {
  await setMaintainRuleEnabled(row.id, !row.enabled)
  emit('success')
  await loadData()
}

const triggerGenerate = async (row: MaintainRuleItem) => {
  try {
    await ElMessageBox.confirm(`确认对规则「${row.ruleName}」执行立即生成吗？`, '立即生成确认', {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  await triggerMaintainRuleGenerate(row.id)
  emit('success')
  await loadData()
}
</script>

<style scoped>
.toolbar-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-tip {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
