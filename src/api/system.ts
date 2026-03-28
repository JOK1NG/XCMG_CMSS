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

/** GET /api/system/user/page（baseURL 已含 /api 时为 /system/user/page） */
export function getUserPage(params: UserPageParams) {
  return request.get<UserPageData>('/system/user/page', { params })
}
