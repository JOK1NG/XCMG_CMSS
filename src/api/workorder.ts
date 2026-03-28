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

/** GET /api/workorder/page（baseURL 已含 /api 时为 /workorder/page） */
export function getWorkOrderPage(params: WorkOrderPageParams) {
  return request.get<WorkOrderPageData>('/workorder/page', { params })
}
