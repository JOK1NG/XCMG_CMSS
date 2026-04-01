import request from '@/utils/request'

export interface WorkOrderItem {
  id: number
  workOrderCode: string
  equipmentId: number
  equipmentName: string
  faultDesc: string
  faultLevel: number
  faultLevelLabel: string
  status: number
  statusLabel: string
  reporterId: number
  reporterName: string
  reportTime: string
  assigneeId: number | null
  assigneeName: string | null
}

export interface WorkOrderPageParams {
  pageNum: number
  pageSize: number
  keyword?: string
  status?: number
  level?: number
  startDate?: string
  endDate?: string
}

export interface WorkOrderPageData {
  list: WorkOrderItem[]
  total: number
}

/** 发起报修 */
export interface WorkOrderCreatePayload {
  equipmentId: number
  faultDesc: string
  faultLevel: number
}

/** 派工 */
export interface WorkOrderAssignPayload {
  assigneeId: number
}

/** GET /api/workorder/page（baseURL 已含 /api 时为 /workorder/page） */
export function getWorkOrderPage(params: WorkOrderPageParams) {
  return request.get<WorkOrderPageData>('/workorder/page', { params })
}

/** GET /workorder/{id} */
export function getWorkOrderDetail(id: number) {
  return request.get<WorkOrderItem>(`/workorder/${id}`)
}

/** POST /workorder */
export function createWorkOrder(data: WorkOrderCreatePayload) {
  return request.post<unknown>('/workorder', data)
}

/** PUT /workorder/{id}/assign */
export function assignWorkOrder(id: number, data: WorkOrderAssignPayload) {
  return request.put<unknown>(`/workorder/${id}/assign`, data)
}

/** PUT /workorder/{id}/close */
export function closeWorkOrder(id: number) {
  return request.put<unknown>(`/workorder/${id}/close`)
}
