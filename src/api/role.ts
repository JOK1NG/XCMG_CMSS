import request from '@/utils/request'

export interface RoleItem {
  id: number
  roleCode: string
  roleName: string
  description: string
  permissions: string[]
  status: '启用' | '停用'
  createTime: string
}

export interface RolePageParams {
  pageNum: number
  pageSize: number
  keyword?: string
  status?: string
}

export interface RolePageData {
  list: RoleItem[]
  total: number
}

export interface RolePayload {
  roleCode: string
  roleName: string
  description: string
  permissions: string[]
  status: '启用' | '停用'
}

export function getRolePage(params: RolePageParams) {
  return request.get<RolePageData>('/system/role/page', { params })
}

export function getRoleDetail(id: number) {
  return request.get<RoleItem>(`/system/role/${id}`)
}

export function createRole(data: RolePayload) {
  return request.post<unknown>('/system/role', data)
}

export function updateRole(id: number, data: RolePayload) {
  return request.put<unknown>(`/system/role/${id}`, data)
}

export function deleteRole(id: number) {
  return request.delete<unknown>(`/system/role/${id}`)
}
