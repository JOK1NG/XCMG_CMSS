<template>
  <el-dialog
    :model-value="visible"
    title="保养工单详情"
    width="1080px"
    append-to-body
    destroy-on-close
    @update:model-value="emit('update:visible', $event)"
  >
    <el-skeleton v-if="loading" :rows="12" animated />

    <div v-else-if="detail" class="detail-wrapper">
      <el-alert type="info" :closable="false">
        <template #title>
          当前状态：<strong>{{ getStatusLabel(detail.status) }}</strong>
          <span class="status-tip">（仅待派工/待执行可关闭）</span>
        </template>
      </el-alert>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="工单编号">{{ detail.maintainOrderCode }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(detail.status)">{{ getStatusLabel(detail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="设备">
          {{ detail.equipmentName }}（ID: {{ detail.equipmentId }}）
        </el-descriptions-item>
        <el-descriptions-item label="设备分类">{{ detail.categoryName || '—' }}</el-descriptions-item>
        <el-descriptions-item label="保养模板">
          {{ detail.templateName }}（ID: {{ detail.templateId }}）
        </el-descriptions-item>
        <el-descriptions-item label="计划日期">{{ detail.planDate || '—' }}</el-descriptions-item>
        <el-descriptions-item label="计划执行时间">{{ detail.plannedExecuteTime || '—' }}</el-descriptions-item>
        <el-descriptions-item label="执行人">{{ detail.assigneeName || '—' }}</el-descriptions-item>
        <el-descriptions-item label="规则来源">
          {{ detail.sourceRuleName || (detail.sourceRuleId ? `规则#${detail.sourceRuleId}` : '手动创建') }}
        </el-descriptions-item>
        <el-descriptions-item label="执行备注">{{ detail.executionRemark || '—' }}</el-descriptions-item>
        <el-descriptions-item label="完成结果">{{ detail.finishResult || '—' }}</el-descriptions-item>
        <el-descriptions-item label="完成备注">{{ detail.finishRemark || '—' }}</el-descriptions-item>
        <el-descriptions-item label="关闭信息" :span="2">
          <template v-if="detail.closeReasonType || detail.closeReasonRemark">
            {{ detail.closeReasonType || '—' }} / {{ detail.closeReasonRemark || '—' }}
          </template>
          <template v-else>—</template>
        </el-descriptions-item>
      </el-descriptions>

      <el-card shadow="never" class="section-card">
        <template #header>状态时间线</template>
        <el-empty v-if="!detail.timeline || detail.timeline.length === 0" description="暂无流转记录" />
        <el-timeline v-else>
          <el-timeline-item
            v-for="item in detail.timeline"
            :key="item.id"
            :timestamp="item.operateTime"
            placement="top"
          >
            <div class="timeline-title">{{ item.action }}</div>
            <div class="timeline-meta">操作人：{{ item.operatorName }}</div>
            <div v-if="item.remark" class="timeline-meta">备注：{{ item.remark }}</div>
          </el-timeline-item>
        </el-timeline>
      </el-card>

      <el-card shadow="never" class="section-card">
        <template #header>执行与完成记录</template>
        <div class="split-block">
          <div class="sub-title">检查项记录</div>
          <el-empty v-if="checkRecordRows.length === 0" description="暂无检查项记录" />
          <el-table v-else :data="checkRecordRows" border stripe size="small">
            <el-table-column prop="itemName" label="检查项" min-width="220" />
            <el-table-column prop="result" label="结果" width="140" />
            <el-table-column prop="remark" label="备注" min-width="240" show-overflow-tooltip />
          </el-table>
        </div>
      </el-card>

      <el-card shadow="never" class="section-card">
        <template #header>耗材/备件使用明细</template>
        <el-empty v-if="spareUsageRows.length === 0" description="暂无耗材记录" />
        <el-table v-else :data="spareUsageRows" border stripe size="small">
          <el-table-column prop="spareName" label="备件名称" min-width="220" />
          <el-table-column prop="qty" label="数量" width="120" />
          <el-table-column prop="unit" label="单位" width="120" />
          <el-table-column prop="remark" label="备注" min-width="220" show-overflow-tooltip />
        </el-table>
      </el-card>

      <el-card shadow="never" class="section-card">
        <template #header>附件列表</template>
        <el-empty v-if="attachmentRows.length === 0" description="暂无附件" />
        <div v-else class="attachments">
          <div v-for="file in attachmentRows" :key="file.id" class="attachment-item">
            <el-link :href="file.fileUrl" target="_blank">{{ file.fileName }}</el-link>
            <span class="attachment-meta">
              {{ file.uploaderName }} · {{ file.uploadTime }}
            </span>
          </div>
        </div>
      </el-card>
    </div>

    <el-empty v-else description="暂无数据" />

    <template #footer>
      <div class="footer-actions">
        <el-tooltip :disabled="!assignDisabledReason" :content="assignDisabledReason">
          <span>
            <el-button type="primary" plain :disabled="!!assignDisabledReason" @click="openAssign">派工</el-button>
          </span>
        </el-tooltip>

        <el-tooltip :disabled="!executeDisabledReason" :content="executeDisabledReason">
          <span>
            <el-button type="warning" plain :disabled="!!executeDisabledReason" @click="openExecute">执行</el-button>
          </span>
        </el-tooltip>

        <el-tooltip :disabled="!finishDisabledReason" :content="finishDisabledReason">
          <span>
            <el-button type="success" plain :disabled="!!finishDisabledReason" @click="openFinish">完成</el-button>
          </span>
        </el-tooltip>

        <el-tooltip :disabled="!closeDisabledReason" :content="closeDisabledReason">
          <span>
            <el-button type="danger" plain :disabled="!!closeDisabledReason" @click="openClose">关闭</el-button>
          </span>
        </el-tooltip>

        <el-button @click="emit('update:visible', false)">关闭</el-button>
      </div>
    </template>

    <el-dialog
      :model-value="assignVisible"
      title="派工"
      width="520px"
      append-to-body
      @update:model-value="assignVisible = $event"
    >
      <el-form ref="assignFormRef" :model="assignForm" :rules="assignRules" label-width="120px">
        <el-form-item label="执行人" prop="assigneeId">
          <el-select
            v-model="assignForm.assigneeId"
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
        <el-form-item label="计划执行时间" prop="plannedExecuteTime">
          <el-date-picker
            v-model="assignForm.plannedExecuteTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择计划执行时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="assignForm.remark" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" :loading="actionSubmitting" @click="submitAssign">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      :model-value="executeVisible"
      title="执行"
      width="520px"
      append-to-body
      @update:model-value="executeVisible = $event"
    >
      <el-form ref="executeFormRef" :model="executeForm" :rules="executeRules" label-width="120px">
        <el-form-item label="执行人" prop="assigneeId">
          <el-select
            v-model="executeForm.assigneeId"
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
        <el-form-item label="计划执行时间" prop="plannedExecuteTime">
          <el-date-picker
            v-model="executeForm.plannedExecuteTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择计划执行时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="开工备注" prop="remark">
          <el-input v-model="executeForm.remark" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="executeVisible = false">取消</el-button>
        <el-button type="primary" :loading="actionSubmitting" @click="submitExecute">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      :model-value="finishVisible"
      title="完成工单"
      width="920px"
      append-to-body
      @update:model-value="finishVisible = $event"
    >
      <el-form ref="finishFormRef" :model="finishForm" :rules="finishRules" label-width="120px">
        <el-form-item label="完成结果" prop="finishResult">
          <el-select v-model="finishForm.finishResult" placeholder="请选择结果" style="width: 100%">
            <el-option
              v-for="item in MAINTAIN_FINISH_RESULT_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="完成时间" prop="finishTime">
          <el-date-picker
            v-model="finishForm.finishTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择完成时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="完成备注">
          <el-input v-model="finishForm.remark" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>

      <el-divider content-position="left">模板检查项</el-divider>
      <el-empty v-if="templateCheckItems.length === 0" description="模板无固定检查项" />
      <div v-else class="dynamic-list">
        <div v-for="(item, idx) in templateCheckItems" :key="`tpl-${idx}`" class="dynamic-row">
          <el-input :model-value="item.itemName" disabled />
          <el-select v-model="item.result" style="width: 140px">
            <el-option v-for="opt in MAINTAIN_CHECK_RESULT_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
          <el-input v-model="item.remark" placeholder="备注" />
        </div>
      </div>

      <el-divider content-position="left">自定义检查项</el-divider>
      <div class="dynamic-list">
        <div v-for="(item, idx) in customCheckItems" :key="`custom-${idx}`" class="dynamic-row">
          <el-input v-model="item.itemName" placeholder="检查项名称" />
          <el-select v-model="item.result" style="width: 140px">
            <el-option v-for="opt in MAINTAIN_CHECK_RESULT_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
          <el-input v-model="item.remark" placeholder="备注" />
          <el-button link type="danger" @click="removeCustomCheckItem(idx)">删除</el-button>
        </div>
      </div>
      <el-button size="small" @click="addCustomCheckItem">新增检查项</el-button>

      <el-divider content-position="left">耗材/备件使用</el-divider>
      <div class="dynamic-list">
        <div v-for="(item, idx) in spareUsages" :key="`spare-${idx}`" class="dynamic-row">
          <el-select
            v-model="item.spareId"
            filterable
            placeholder="请选择备件"
            style="width: 260px"
            :loading="spareLoading"
          >
            <el-option v-for="opt in spareOptions" :key="opt.id" :label="opt.spareName" :value="opt.id" />
          </el-select>
          <el-input-number v-model="item.qty" :min="1" :step="1" />
          <el-input v-model="item.remark" placeholder="备注" />
          <el-button link type="danger" @click="removeSpareUsage(idx)">删除</el-button>
        </div>
      </div>
      <el-button size="small" @click="addSpareUsage">新增备件记录</el-button>

      <el-divider content-position="left">附件上传</el-divider>
      <el-upload
        :http-request="handleUpload"
        :file-list="uploadedFiles"
        multiple
        :limit="10"
        :on-remove="handleRemoveFile"
      >
        <el-button type="primary" plain>上传附件</el-button>
      </el-upload>

      <template #footer>
        <el-button @click="finishVisible = false">取消</el-button>
        <el-button type="primary" :loading="actionSubmitting" @click="submitFinish">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      :model-value="closeVisible"
      title="关闭工单"
      width="520px"
      append-to-body
      @update:model-value="closeVisible = $event"
    >
      <el-form ref="closeFormRef" :model="closeForm" :rules="closeRules" label-width="120px">
        <el-form-item label="关闭原因分类" prop="reasonType">
          <el-select v-model="closeForm.reasonType" placeholder="请选择原因" style="width: 100%">
            <el-option
              v-for="item in MAINTAIN_CLOSE_REASON_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关闭说明" prop="reasonRemark">
          <el-input
            v-model="closeForm.reasonRemark"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
            placeholder="请输入关闭说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeVisible = false">取消</el-button>
        <el-button type="danger" :loading="actionSubmitting" @click="submitClose">确定关闭</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules, type UploadRequestOptions, type UploadUserFile } from 'element-plus'
import {
  assignMaintainOrder,
  closeMaintainOrder,
  finishMaintainOrder,
  getMaintainOrderDetail,
  getMaintainTemplateDetail,
  startMaintainOrder,
  uploadMaintainAttachment,
  type MaintainCheckResult,
  type MaintainCloseReasonType,
  type MaintainFinishResult,
  type MaintainOrderCheckItemRecord,
  type MaintainOrderDetail,
} from '@/api/maintain'
import { getUserPage, type UserItem } from '@/api/system'
import { getSparePage, type SpareItem } from '@/api/spare'
import { useAuthStore } from '@/stores/auth'
import {
  MAINTAIN_CHECK_RESULT_OPTIONS,
  MAINTAIN_CLOSE_REASON_OPTIONS,
  MAINTAIN_FINISH_RESULT_OPTIONS,
  MAINTAIN_ORDER_STATUS_OPTIONS,
} from '@/constants/maintain'

type QuickAction = 'assign' | 'execute' | 'finish' | 'close' | null

const props = defineProps<{
  visible: boolean
  orderId: number | null
  initialAction?: QuickAction
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'success'): void
}>()

const authStore = useAuthStore()

const loading = ref(false)
const actionSubmitting = ref(false)
const detail = ref<MaintainOrderDetail | null>(null)
const handledOpenAction = ref(false)

const userLoading = ref(false)
const userOptions = ref<UserItem[]>([])
const spareLoading = ref(false)
const spareOptions = ref<SpareItem[]>([])

const assignVisible = ref(false)
const executeVisible = ref(false)
const finishVisible = ref(false)
const closeVisible = ref(false)

const assignFormRef = ref<FormInstance>()
const executeFormRef = ref<FormInstance>()
const finishFormRef = ref<FormInstance>()
const closeFormRef = ref<FormInstance>()

const assignForm = reactive({
  assigneeId: undefined as number | undefined,
  plannedExecuteTime: '',
  remark: '',
})

const executeForm = reactive({
  assigneeId: undefined as number | undefined,
  plannedExecuteTime: '',
  remark: '',
})

const finishForm = reactive({
  finishResult: '正常完成' as MaintainFinishResult,
  finishTime: '',
  remark: '',
})

const templateCheckItems = ref<Array<MaintainOrderCheckItemRecord & { result: MaintainCheckResult }>>([])
const customCheckItems = ref<Array<MaintainOrderCheckItemRecord & { result: MaintainCheckResult }>>([])
const spareUsages = ref<Array<{ spareId: number | undefined; qty: number; remark: string }>>([])
const uploadedFiles = ref<UploadUserFile[]>([])

const closeForm = reactive({
  reasonType: undefined as MaintainCloseReasonType | undefined,
  reasonRemark: '',
})

const assignRules: FormRules = {
  assigneeId: [{ required: true, message: '请选择执行人', trigger: 'change' }],
}

const executeRules: FormRules = {
  plannedExecuteTime: [{ required: true, message: '请选择计划执行时间', trigger: 'change' }],
}

const finishRules: FormRules = {
  finishResult: [{ required: true, message: '请选择完成结果', trigger: 'change' }],
  finishTime: [{ required: true, message: '请选择完成时间', trigger: 'change' }],
}

const closeRules: FormRules = {
  reasonType: [{ required: true, message: '请选择关闭原因', trigger: 'change' }],
  reasonRemark: [{ required: true, message: '请输入关闭说明', trigger: 'blur' }],
}

const checkRecordRows = computed(() => detail.value?.checkItemRecords || [])
const spareUsageRows = computed(() => detail.value?.spareUsages || [])
const attachmentRows = computed(() => detail.value?.attachments || [])

const getStatusLabel = (status: string) =>
  MAINTAIN_ORDER_STATUS_OPTIONS.find((item) => item.value === status)?.label || status

const getStatusTagType = (status: string) => {
  switch (status) {
    case '待派工':
      return 'warning'
    case '待执行':
      return 'primary'
    case '执行中':
      return 'danger'
    case '已完成':
      return 'success'
    case '已关闭':
      return 'info'
    default:
      return 'info'
  }
}

const getDisabledReason = (action: 'assign' | 'execute' | 'finish' | 'close') =>
  authStore.getMaintainActionDisabledReason(action, detail.value?.status)

const assignDisabledReason = computed(() => getDisabledReason('assign'))
const executeDisabledReason = computed(() => getDisabledReason('execute'))
const finishDisabledReason = computed(() => getDisabledReason('finish'))
const closeDisabledReason = computed(() => getDisabledReason('close'))

const loadUsers = async () => {
  if (userOptions.value.length > 0) return
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

const loadSpares = async () => {
  if (spareOptions.value.length > 0) return
  spareLoading.value = true
  try {
    const data = await getSparePage({ pageNum: 1, pageSize: 200 })
    spareOptions.value = Array.isArray(data.list) ? data.list : []
  } catch {
    spareOptions.value = []
  } finally {
    spareLoading.value = false
  }
}

const fillUploadedFilesFromDetail = () => {
  uploadedFiles.value = (detail.value?.attachments || []).map((item) => ({
    uid: item.id,
    name: item.fileName,
    status: 'success',
    url: item.fileUrl,
    response: { id: item.id },
  }))
}

const loadDetail = async () => {
  if (!props.visible || props.orderId == null) {
    detail.value = null
    return
  }
  loading.value = true
  try {
    detail.value = await getMaintainOrderDetail(props.orderId)
    fillUploadedFilesFromDetail()
  } catch {
    detail.value = null
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.visible, props.orderId] as const,
  async ([open]) => {
    if (!open) {
      detail.value = null
      handledOpenAction.value = false
      return
    }
    await loadDetail()
    if (props.initialAction && !handledOpenAction.value) {
      handledOpenAction.value = true
      if (props.initialAction === 'assign') openAssign()
      if (props.initialAction === 'execute') openExecute()
      if (props.initialAction === 'finish') openFinish()
      if (props.initialAction === 'close') openClose()
    }
  },
)

watch(
  () => props.visible,
  (open) => {
    if (!open) return
    handledOpenAction.value = false
  },
)

const openAssign = async () => {
  if (assignDisabledReason.value || !detail.value) return
  await loadUsers()
  assignForm.assigneeId = detail.value.assigneeId || undefined
  assignForm.plannedExecuteTime = detail.value.plannedExecuteTime || ''
  assignForm.remark = ''
  assignFormRef.value?.clearValidate?.()
  assignVisible.value = true
}

const openExecute = async () => {
  if (executeDisabledReason.value || !detail.value) return
  await loadUsers()
  executeForm.assigneeId = detail.value.assigneeId || undefined
  executeForm.plannedExecuteTime = detail.value.plannedExecuteTime || ''
  executeForm.remark = ''
  executeFormRef.value?.clearValidate?.()
  executeVisible.value = true
}

const openFinish = async () => {
  if (finishDisabledReason.value || !detail.value) return
  finishForm.finishResult = '正常完成'
  finishForm.finishTime = ''
  finishForm.remark = ''
  finishFormRef.value?.clearValidate?.()
  customCheckItems.value = []
  spareUsages.value = []
  fillUploadedFilesFromDetail()

  await Promise.all([loadSpares(), loadTemplateCheckItems()])
  finishVisible.value = true
}

const openClose = () => {
  if (closeDisabledReason.value) return
  closeForm.reasonType = undefined
  closeForm.reasonRemark = ''
  closeFormRef.value?.clearValidate?.()
  closeVisible.value = true
}

const loadTemplateCheckItems = async () => {
  templateCheckItems.value = []
  if (!detail.value?.templateId) return
  try {
    const template = await getMaintainTemplateDetail(detail.value.templateId)
    templateCheckItems.value = (template.checkItems || []).map((item) => ({
      itemName: item.itemName,
      result: '正常',
      remark: item.remark || '',
    }))
  } catch {
    templateCheckItems.value = []
  }
}

const addCustomCheckItem = () => {
  customCheckItems.value.push({
    itemName: '',
    result: '正常',
    remark: '',
  })
}

const removeCustomCheckItem = (idx: number) => {
  customCheckItems.value.splice(idx, 1)
}

const addSpareUsage = () => {
  spareUsages.value.push({
    spareId: undefined,
    qty: 1,
    remark: '',
  })
}

const removeSpareUsage = (idx: number) => {
  spareUsages.value.splice(idx, 1)
}

const collectAttachmentIds = () =>
  uploadedFiles.value
    .map((file) => Number((file.response as { id?: number } | undefined)?.id))
    .filter((id) => Number.isFinite(id))

const handleUpload = async (options: UploadRequestOptions) => {
  try {
    const file = options.file as File
    const data = await uploadMaintainAttachment(file)
    const uploaded: UploadUserFile = {
      uid: -data.id,
      name: data.fileName,
      status: 'success',
      url: data.fileUrl,
      response: { id: data.id },
    }
    uploadedFiles.value = [...uploadedFiles.value, uploaded]
    options.onSuccess?.(data)
  } catch (error) {
    options.onError?.(error as never)
  }
}

const handleRemoveFile = (file: UploadUserFile) => {
  uploadedFiles.value = uploadedFiles.value.filter((item) => item.uid !== file.uid)
}

const submitAssign = async () => {
  if (!assignFormRef.value || !detail.value || assignForm.assigneeId == null) return
  const valid = await assignFormRef.value.validate().catch(() => false)
  if (!valid) return
  actionSubmitting.value = true
  try {
    await assignMaintainOrder(detail.value.id, {
      assigneeId: assignForm.assigneeId,
      plannedExecuteTime: assignForm.plannedExecuteTime || undefined,
      remark: assignForm.remark || undefined,
    })
    assignVisible.value = false
    emit('success')
    await loadDetail()
  } finally {
    actionSubmitting.value = false
  }
}

const submitExecute = async () => {
  if (!executeFormRef.value || !detail.value) return
  const valid = await executeFormRef.value.validate().catch(() => false)
  if (!valid) return
  actionSubmitting.value = true
  try {
    await startMaintainOrder(detail.value.id, {
      assigneeId: executeForm.assigneeId ?? undefined,
      plannedExecuteTime: executeForm.plannedExecuteTime || undefined,
      remark: executeForm.remark || undefined,
    })
    executeVisible.value = false
    emit('success')
    await loadDetail()
  } finally {
    actionSubmitting.value = false
  }
}

const submitFinish = async () => {
  if (!finishFormRef.value || !detail.value) return
  const valid = await finishFormRef.value.validate().catch(() => false)
  if (!valid) return

  if (customCheckItems.value.some((item) => !item.itemName.trim())) {
    ElMessage.warning('请完善自定义检查项名称')
    return
  }
  if (spareUsages.value.length === 0) {
    ElMessage.warning('请至少填写1条耗材/备件记录')
    return
  }
  if (spareUsages.value.some((item) => !item.spareId || item.qty <= 0)) {
    ElMessage.warning('请完善耗材/备件记录，且数量需大于0')
    return
  }

  actionSubmitting.value = true
  try {
    await finishMaintainOrder(detail.value.id, {
      finishResult: finishForm.finishResult,
      finishTime: finishForm.finishTime || undefined,
      remark: finishForm.remark || undefined,
      checkItemRecords: templateCheckItems.value,
      customCheckItems: customCheckItems.value,
      spareUsages: spareUsages.value.map((item) => ({
        spareId: item.spareId!,
        qty: item.qty,
        remark: item.remark || undefined,
      })),
      attachmentIds: collectAttachmentIds(),
    })
    finishVisible.value = false
    emit('success')
    await loadDetail()
  } finally {
    actionSubmitting.value = false
  }
}

const submitClose = async () => {
  if (!closeFormRef.value || !detail.value || !closeForm.reasonType) return
  const valid = await closeFormRef.value.validate().catch(() => false)
  if (!valid) return
  actionSubmitting.value = true
  try {
    await closeMaintainOrder(detail.value.id, {
      reasonType: closeForm.reasonType,
      reasonRemark: closeForm.reasonRemark,
    })
    closeVisible.value = false
    emit('success')
    await loadDetail()
  } finally {
    actionSubmitting.value = false
  }
}
</script>

<style scoped>
.detail-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-tip {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
}

.section-card {
  border-radius: 8px;
}

.timeline-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.timeline-meta {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.split-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sub-title {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.attachments {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attachment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.attachment-meta {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.dynamic-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}

.dynamic-row {
  display: grid;
  grid-template-columns: 1fr 140px 1fr auto;
  gap: 8px;
  align-items: center;
}
</style>