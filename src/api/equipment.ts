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

/** 新增/编辑提交体（与列表字段对齐，便于联调） */
export interface EquipmentFormPayload {
  equipmentCode: string
  equipmentName: string
  categoryName: string
  model: string
  workshopName: string
  status: string
  purchaseDate: string
}

/** GET /api/equipment/page（baseURL 已含 /api 时为 /equipment/page） */
export function getEquipmentPage(params: EquipmentPageParams) {
  return request.get<EquipmentPageData>('/equipment/page', { params })
}

/** GET /equipment/{id} */
export function getEquipmentDetail(id: number) {
  return request.get<EquipmentItem>(`/equipment/${id}`)
}

/** POST /equipment */
export function createEquipment(data: EquipmentFormPayload) {
  return request.post<unknown>('/equipment', data)
}

/** PUT /equipment/{id} */
export function updateEquipment(id: number, data: EquipmentFormPayload) {
  return request.put<unknown>(`/equipment/${id}`, data)
}

/** DELETE /equipment/{id} */
export function deleteEquipment(id: number) {
  return request.delete<unknown>(`/equipment/${id}`)
}
