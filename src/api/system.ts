import request from '@/utils/request'

export interface UserItem {
  id: number
  username: string
  realName: string
  deptName: string
  roleName: string
  phone: string
  status: string
  createTime: string
}

export interface UserPageParams {
  pageNum: number
  pageSize: number
  keyword?: string
  dept?: string
  role?: string
  status?: string
}

export interface UserPageData {
  list: UserItem[]
  total: number
}

/** 新增/编辑提交体（与列表展示字段一致，便于联调） */
export interface UserFormPayload {
  username: string
  realName: string
  deptName: string
  roleName: string
  phone: string
  status: string
}

/** GET /api/system/user/page（baseURL 已含 /api 时为 /system/user/page） */
export function getUserPage(params: UserPageParams) {
  return request.get<UserPageData>('/system/user/page', { params })
}

/** GET /system/user/{id} */
export function getUserDetail(id: number) {
  return request.get<UserItem>(`/system/user/${id}`)
}

/** POST /system/user body 含 password */
export function createUser(data: UserFormPayload & { password: string }) {
  return request.post<unknown>('/system/user', data)
}

/** PUT /system/user/{id} */
export function updateUser(id: number, data: UserFormPayload) {
  return request.put<unknown>(`/system/user/${id}`, data)
}

/** DELETE /system/user/{id} */
export function deleteUser(id: number) {
  return request.delete<unknown>(`/system/user/${id}`)
}

/** PUT /system/user/{id}/password */
export function resetUserPassword(id: number, data: { newPassword: string }) {
  return request.put<unknown>(`/system/user/${id}/password`, data)
}
