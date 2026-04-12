import request from '@/utils/request'

export interface LoginPayload {
  username: string
  password: string
}

/** 与 request 解包后一致：仅 data 内字段 */
export type RoleCode =
  | 'ROLE_ADMIN'
  | 'ROLE_MAINTAIN_MANAGER'
  | 'ROLE_EXECUTOR'
  | 'ROLE_VIEWER'
  | (string & {})

export interface LoginUserInfo {
  id: number
  username: string
  realName: string
}

export interface LoginResult {
  token: string
  userInfo?: LoginUserInfo
  user?: LoginUserInfo
  roleCode?: RoleCode
  roleCodes?: RoleCode[]
}

/** POST /auth/login */
export function login(data: LoginPayload) {
  return request.post<LoginResult>('/auth/login', data)
}
