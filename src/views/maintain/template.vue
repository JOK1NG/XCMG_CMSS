<template>
  <div class="page-container">
    <PageHeader title="保养模板" description="维护保养模板基础信息、状态与生命周期" />

    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="关键字">
          <el-input
            v-model="queryForm.keyword"
            placeholder="模板名称 / 设备分类"
            clearable
            style="width: 240px"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择状态" clearable style="width: 160px">
            <el-option
              v-for="opt in statusOptions"
              :key="`ts-${String(opt.value)}`"
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
          <el-button type="primary" @click="openCreate">新增模板</el-button>
        </div>
        <div class="toolbar-right">
          <span class="toolbar-tip">共 {{ total }} 条模板记录</span>
        </div>
      </div>

      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="templateCode" label="模板编码" min-width="160" />
        <el-table-column prop="templateName" label="模板名称" min-width="190" />
        <el-table-column prop="categoryName" label="设备分类" min-width="140" />
        <el-table-column prop="checkItemCount" label="检查项数量" min-width="130" />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '启用' ? 'success' : 'info'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" min-width="260">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
            <el-button
              type="info"
              link
              @click="openDetail(row)"
            >
              查看
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && tableData.length === 0" description="暂无模板数据" class="table-empty" />

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
      width="620px"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="formModel" :rules="formRules" label-width="100px">
        <el-form-item label="模板编码" prop="templateCode">
          <el-input v-model="formModel.templateCode" placeholder="例如：MT-001" />
        </el-form-item>
        <el-form-item label="模板名称" prop="templateName">
          <el-input v-model="formModel.templateName" placeholder="例如：润滑点检模板" />
        </el-form-item>
        <el-form-item label="设备分类" prop="categoryName">
          <el-input v-model="formModel.categoryName" placeholder="例如：数控机床" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formModel.status">
            <el-radio label="启用">启用</el-radio>
            <el-radio label="停用">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="模板详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="模板编码">{{ detail?.templateCode }}</el-descriptions-item>
        <el-descriptions-item label="模板名称">{{ detail?.templateName }}</el-descriptions-item>
        <el-descriptions-item label="设备分类">{{ detail?.categoryName }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detail?.status }}</el-descriptions-item>
        <el-descriptions-item label="检查项数量">{{ detail?.checkItemCount }}</el-descriptions-item>
      </el-descriptions>

      <el-card shadow="never" class="detail-card">
        <template #header>检查项列表</template>
        <el-table :data="detail?.checkItems ?? []" border stripe style="width: 100%">
          <el-table-column prop="itemName" label="检查项" min-width="200" />
          <el-table-column prop="required" label="必检" width="100">
            <template #default="{ row }">
              <el-tag :type="row.required ? 'success' : 'info'">
                {{ row.required ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="220" />
        </el-table>
      </el-card>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import {
  createMaintainTemplate,
  deleteMaintainTemplate,
  getMaintainTemplateDetail,
  getMaintainTemplatePage,
  updateMaintainTemplate,
  type MaintainTemplateDetail,
  type MaintainTemplateItem,
} from '@/api/maintain'
import { useListFallbackRows } from '@/composables/useListFallback'

const DEFAULT_PAGE_SIZE = 10

const FALLBACK_ROWS: MaintainTemplateItem[] = [
  {
    id: 1,
    templateCode: 'MT-20260301-01',
    templateName: '数控机床周检',
    categoryName: '数控机床',
    status: '启用',
    checkItemCount: 4,
  },
  {
    id: 2,
    templateCode: 'MT-20260301-02',
    templateName: '磨床月检',
    categoryName: '磨床',
    status: '启用',
    checkItemCount: 6,
  },
  {
    id: 3,
    templateCode: 'MT-20260301-03',
    templateName: '空压机季度点检',
    categoryName: '空压机',
    status: '停用',
    checkItemCount: 5,
  },
]

const FALLBACK_DETAIL: MaintainTemplateDetail = {
  id: 1,
  templateCode: 'MT-20260301-01',
  templateName: '数控机床周检',
  categoryName: '数控机床',
  status: '启用',
  checkItemCount: 4,
  checkItems: [
    { id: 1, itemName: '润滑油液位', required: true, remark: '观察油位指示线' },
    { id: 2, itemName: '主轴振动', required: true, remark: '异常需记录数值' },
    { id: 3, itemName: '冷却液液位', required: false, remark: '' },
    { id: 4, itemName: '安全门状态', required: true, remark: '闭合及报警测试' },
  ],
}

const { shouldUseFallback, applyFallback } = useListFallbackRows({
  fallbackRows: FALLBACK_ROWS,
  resetPageOnFallback: true,
})

const statusOptions = [
  { label: '启用', value: '启用' },
  { label: '停用', value: '停用' },
]

const queryForm = reactive({
  keyword: '',
  status: '',
  pageNum: 1,
  pageSize: DEFAULT_PAGE_SIZE,
})

const tableData = ref<MaintainTemplateItem[]>([])
const total = ref(0)
const loading = ref(false)
const submitting = ref(false)
const formVisible = ref(false)
const detailVisible = ref(false)
const editingId = ref<number | null>(null)
const detail = ref<MaintainTemplateDetail | null>(null)

const formModel = reactive({
  templateCode: '',
  templateName: '',
  categoryName: '',
  status: '启用' as '启用' | '停用',
})

const formRef = ref<FormInstance>()
const dialogTitle = computed(() => (editingId.value === null ? '新增模板' : '编辑模板'))

const formRules: FormRules = {
  templateCode: [{ required: true, message: '请输入模板编码', trigger: 'blur' }],
  templateName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  categoryName: [{ required: true, message: '请输入设备分类', trigger: 'blur' }],
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getMaintainTemplatePage({
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

const openEdit = (row: MaintainTemplateItem) => {
  editingId.value = row.id
  formModel.templateCode = row.templateCode
  formModel.templateName = row.templateName
  formModel.categoryName = row.categoryName
  formModel.status = row.status
  formVisible.value = true
}

const resetForm = () => {
  formModel.templateCode = ''
  formModel.templateName = ''
  formModel.categoryName = ''
  formModel.status = '启用'
  formRef.value?.clearValidate()
}

const openDetail = async (row: MaintainTemplateItem) => {
  try {
    const data = await getMaintainTemplateDetail(row.id)
    detail.value = data
  } catch {
    detail.value = {
      ...FALLBACK_DETAIL,
      id: row.id,
      templateCode: row.templateCode,
      templateName: row.templateName,
      categoryName: row.categoryName,
      status: row.status,
      checkItemCount: row.checkItemCount,
    }
  }
  detailVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }
  submitting.value = true
  try {
    const payload = {
      templateCode: formModel.templateCode,
      templateName: formModel.templateName,
      categoryName: formModel.categoryName,
      status: formModel.status,
    }
    if (editingId.value === null) {
      await createMaintainTemplate(payload)
      ElMessage.success('模板创建成功')
    } else {
      await updateMaintainTemplate(editingId.value, payload)
      ElMessage.success('模板更新成功')
    }
    formVisible.value = false
    await loadData()
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (row: MaintainTemplateItem) => {
  try {
    await ElMessageBox.confirm(`确定删除模板「${row.templateName}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  await deleteMaintainTemplate(row.id)
  ElMessage.success('模板删除成功')
  await loadData()
}

onMounted(() => {
  loadData()
})
</script>
