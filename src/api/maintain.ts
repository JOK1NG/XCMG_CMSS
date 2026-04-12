import request from '@/utils/request'

export type MaintainOrderStatus = '待派工' | '待执行' | '执行中' | '已完成' | '已关闭'
export type MaintainFinishResult = '正常完成' | '部分完成' | '异常完成'
export type MaintainCheckResult = '正常' | '异常' | '不适用'
export type MaintainCloseReasonType = '无法执行' | '重复工单' | '设备停用' | '其他'
export type MaintainCycleType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'

export interface MaintainOrderItem {
  id: number
  maintainOrderCode: string
  equipmentId: number
  equipmentName: string
  categoryName?: string
  templateId: number
  templateName: string
  planDate: string
  plannedExecuteTime?: string
  assigneeId: number | null
  assigneeName: string | null
  status: MaintainOrderStatus | string
  sourceRuleId?: number | null
  sourceRuleName?: string | null
}

export interface MaintainOrderTimelineItem {
  id: number
  action: string
  operatorName: string
  operateTime: string
  remark?: string
}

export interface MaintainOrderCheckItemRecord {
  id?: number
  itemName: string
  result: MaintainCheckResult
  remark?: string
}

export interface MaintainOrderSpareUsage {
  spareId: number
  spareName: string
  qty: number
  unit?: string
  remark?: string
}

export interface MaintainOrderAttachment {
  id: number
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  uploaderName: string
  uploadTime: string
}

export interface MaintainOrderDetail extends MaintainOrderItem {
  executionRemark?: string
  executeTime?: string
  finishTime?: string
  finishResult?: MaintainFinishResult
  finishRemark?: string
  closeTime?: string
  closeReasonType?: MaintainCloseReasonType
  closeReasonRemark?: string
  timeline: MaintainOrderTimelineItem[]
  checkItemRecords: MaintainOrderCheckItemRecord[]
  spareUsages: MaintainOrderSpareUsage[]
  attachments: MaintainOrderAttachment[]
}

export interface MaintainOrderPageParams {
  pageNum: number
  pageSize: number
  keyword?: string
  status?: string
  template?: string | number
  startDate?: string
  endDate?: string
}

export interface MaintainOrderPageData {
  list: MaintainOrderItem[]
  total: number
}

export interface CreateMaintainOrderPayload {
  equipmentId: number
  templateId: number
  planDate: string
  remark?: string
  assignNow?: boolean
  assigneeId?: number
  plannedExecuteTime?: string
}

export interface AssignMaintainOrderPayload {
  assigneeId: number
  plannedExecuteTime?: string
  remark?: string
}

export interface StartMaintainOrderPayload {
  assigneeId?: number
  plannedExecuteTime?: string
  remark?: string
}

export interface FinishMaintainOrderPayload {
  finishResult: MaintainFinishResult
  finishTime?: string
  remark?: string
  checkItemRecords: MaintainOrderCheckItemRecord[]
  customCheckItems: MaintainOrderCheckItemRecord[]
  spareUsages: Array<{ spareId: number; qty: number; remark?: string }>
  attachmentIds: number[]
}

export interface CloseMaintainOrderPayload {
  reasonType: MaintainCloseReasonType
  reasonRemark: string
}

export interface MaintainRuleItem {
  id: number
  ruleName: string
  categoryName: string
  templateId: number
  templateName: string
  cycleType: MaintainCycleType
  enabled: boolean
  advanceDays: number
  nextGenerateDate?: string
  lastGeneratedAt?: string
  remark?: string
}

export interface MaintainRulePageParams {
  pageNum: number
  pageSize: number
  keyword?: string
  enabled?: boolean
}

export interface MaintainRulePageData {
  list: MaintainRuleItem[]
  total: number
}

export interface MaintainRulePayload {
  ruleName: string
  categoryName: string
  templateId: number
  cycleType: MaintainCycleType
  enabled: boolean
  advanceDays: number
  remark?: string
}

export interface MaintainTemplateItem {
  id: number
  templateCode: string
  templateName: string
  categoryName: string
  status: '启用' | '停用'
  checkItemCount: number
}

export interface MaintainTemplatePageData {
  list: MaintainTemplateItem[]
  total: number
}

export interface MaintainTemplatePageParams {
  pageNum: number
  pageSize: number
  keyword?: string
  status?: string
}

export interface MaintainTemplateCheckItem {
  id: number
  itemName: string
  required: boolean
  remark?: string
}

export interface MaintainTemplateDetail extends MaintainTemplateItem {
  checkItems: MaintainTemplateCheckItem[]
}

export interface MaintainAttachmentUploadResult {
  id: number
  fileName: string
  fileUrl: string
}

/** GET /api/maintain/order/page（baseURL 已含 /api 时为 /maintain/order/page） */
export function getMaintainOrderPage(params: MaintainOrderPageParams) {
  return request.get<MaintainOrderPageData>('/maintain/order/page', { params })
}

/** GET /maintain/order/{id} */
export function getMaintainOrderDetail(id: number) {
  return request.get<MaintainOrderDetail>(`/maintain/order/${id}`)
}

/** POST /maintain/order */
export function createMaintainOrder(data: CreateMaintainOrderPayload) {
  return request.post<unknown>('/maintain/order', data)
}

/** PUT /maintain/order/{id}/assign */
export function assignMaintainOrder(id: number, data: AssignMaintainOrderPayload) {
  return request.put<unknown>(`/maintain/order/${id}/assign`, data)
}

/** PUT /maintain/order/{id}/start */
export function startMaintainOrder(id: number, data: StartMaintainOrderPayload) {
  return request.put<unknown>(`/maintain/order/${id}/start`, data)
}

/** PUT /maintain/order/{id}/finish */
export function finishMaintainOrder(id: number, data: FinishMaintainOrderPayload) {
  return request.put<unknown>(`/maintain/order/${id}/finish`, data)
}

/** PUT /maintain/order/{id}/close */
export function closeMaintainOrder(id: number, data: CloseMaintainOrderPayload) {
  return request.put<unknown>(`/maintain/order/${id}/close`, data)
}

/** GET /maintain/rule/page */
export function getMaintainRulePage(params: MaintainRulePageParams) {
  return request.get<MaintainRulePageData>('/maintain/rule/page', { params })
}

/** POST /maintain/rule */
export function createMaintainRule(data: MaintainRulePayload) {
  return request.post<unknown>('/maintain/rule', data)
}

/** PUT /maintain/rule/{id} */
export function updateMaintainRule(id: number, data: MaintainRulePayload) {
  return request.put<unknown>(`/maintain/rule/${id}`, data)
}

/** PUT /maintain/rule/{id}/enabled */
export function setMaintainRuleEnabled(id: number, enabled: boolean) {
  return request.put<unknown>(`/maintain/rule/${id}/enabled`, { enabled })
}

/** POST /maintain/rule/{id}/generate */
export function triggerMaintainRuleGenerate(id: number) {
  return request.post<unknown>(`/maintain/rule/${id}/generate`)
}

/** GET /maintain/template/page */
export function getMaintainTemplatePage(params: MaintainTemplatePageParams) {
  return request.get<MaintainTemplatePageData>('/maintain/template/page', { params })
}

/** GET /maintain/template/{id} */
export function getMaintainTemplateDetail(id: number) {
  return request.get<MaintainTemplateDetail>(`/maintain/template/${id}`)
}

/** POST /maintain/attachment/upload */
export function uploadMaintainAttachment(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<MaintainAttachmentUploadResult>('/maintain/attachment/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
