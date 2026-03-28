import request from '@/utils/request'

export interface MaintainOrderItem {
  id: number
  maintainOrderCode: string
  equipmentName: string
  templateName: string
  planDate: string
  assigneeName: string
  status: string
}

export interface MaintainOrderPageParams {
  pageNum: number
  pageSize: number
  keyword?: string
  status?: string
  template?: string
  startDate?: string
  endDate?: string
}

export interface MaintainOrderPageData {
  list: MaintainOrderItem[]
  total: number
}

/** GET /api/maintain/order/page（baseURL 已含 /api 时为 /maintain/order/page） */
export function getMaintainOrderPage(params: MaintainOrderPageParams) {
  return request.get<MaintainOrderPageData>('/maintain/order/page', { params })
}
