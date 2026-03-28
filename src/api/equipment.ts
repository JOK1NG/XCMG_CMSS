import request from '@/utils/request'

export interface EquipmentItem {
  id: number
  equipmentCode: string
  equipmentName: string
  categoryName: string
  model: string
  workshopName: string
  status: string
  purchaseDate: string
}

export interface EquipmentPageParams {
  pageNum: number
  pageSize: number
  keyword?: string
  category?: string
  status?: string
  workshop?: string
}

export interface EquipmentPageData {
  list: EquipmentItem[]
  total: number
}

/** GET /api/equipment/page（baseURL 已含 /api 时为 /equipment/page） */
export function getEquipmentPage(params: EquipmentPageParams) {
  return request.get<EquipmentPageData>('/equipment/page', { params })
}
