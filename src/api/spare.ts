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

/** GET /api/spare/page（baseURL 已含 /api 时为 /spare/page）
 * 说明：stockStatus 由前端根据 stockQty / warningQty 计算展示，不作为后端查询参数。
 */
export function getSparePage(params: SparePageParams) {
  return request.get<SparePageData>('/spare/page', { params })
}
