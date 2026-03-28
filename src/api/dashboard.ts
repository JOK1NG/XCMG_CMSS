import request from '@/utils/request'

export interface DashboardSummaryData {
  runningEquipmentCount: number
  monthWorkOrderCount: number
  availabilityRate: number
  avgResponseHours: number
}

export interface DashboardCostTrendItem {
  statDate: string
  costAmount: number
}

export interface DashboardCostTrendParams {
  startDate?: string
  endDate?: string
}

export interface DashboardWorkOrderStatusItem {
  status: number
  statusLabel: string
  count: number
}

/** GET /api/dashboard/summary（baseURL 已含 /api 时为 /dashboard/summary） */
export function getDashboardSummary() {
  return request.get<DashboardSummaryData>('/dashboard/summary')
}

/** GET /api/dashboard/cost-trend（baseURL 已含 /api 时为 /dashboard/cost-trend） */
export function getDashboardCostTrend(params?: DashboardCostTrendParams) {
  return request.get<DashboardCostTrendItem[]>('/dashboard/cost-trend', { params })
}

/** GET /api/dashboard/workorder-status（baseURL 已含 /api 时为 /dashboard/workorder-status） */
export function getDashboardWorkOrderStatus() {
  return request.get<DashboardWorkOrderStatusItem[]>('/dashboard/workorder-status')
}
