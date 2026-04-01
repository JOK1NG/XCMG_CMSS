import request from '@/utils/request'

export interface SpareItem {
  id: number
  spareCode: string
  spareName: string
  spec: string
  unit: string
  stockQty: number
  warningQty: number
  price: string
  supplierName: string
  location: string
}

export interface SparePageParams {
  pageNum: number
  pageSize: number
  keyword?: string
  supplier?: string
}

export interface SparePageData {
  list: SpareItem[]
  total: number
}

/** 新增/编辑档案字段（库存主要通过入出库变更；新增时可带初始库存） */
export interface SpareFormPayload {
  spareCode: string
  spareName: string
  spec: string
  unit: string
  warningQty: number
  price: string
  supplierName: string
  location: string
}

/** POST 时可传初始库存 */
export type SpareCreatePayload = SpareFormPayload & { stockQty?: number }

/** GET /api/spare/page（baseURL 已含 /api 时为 /spare/page）
 * 说明：库存状态由前端根据 stockQty / warningQty 计算展示，不作为后端查询参数。
 */
export function getSparePage(params: SparePageParams) {
  return request.get<SparePageData>('/spare/page', { params })
}

/** GET /spare/{id} */
export function getSpareDetail(id: number) {
  return request.get<SpareItem>(`/spare/${id}`)
}

/** POST /spare */
export function createSpare(data: SpareCreatePayload) {
  return request.post<unknown>('/spare', data)
}

/** PUT /spare/{id} */
export function updateSpare(id: number, data: SpareFormPayload) {
  return request.put<unknown>(`/spare/${id}`, data)
}

/** DELETE /spare/{id} */
export function deleteSpare(id: number) {
  return request.delete<unknown>(`/spare/${id}`)
}

/** PUT /spare/{id}/stock-in */
export function stockInSpare(id: number, data: { qty: number; remark?: string }) {
  return request.put<unknown>(`/spare/${id}/stock-in`, data)
}

/** PUT /spare/{id}/stock-out */
export function stockOutSpare(id: number, data: { qty: number; remark?: string }) {
  return request.put<unknown>(`/spare/${id}/stock-out`, data)
}
