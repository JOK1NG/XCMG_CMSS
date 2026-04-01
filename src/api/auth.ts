import request from '@/utils/request'

export interface LoginPayload {
  username: string
  password: string
}

/** 与 request 解包后一致：仅 data 内字段 */
export interface LoginResult {
  token: string
}

/** POST /auth/login */
export function login(data: LoginPayload) {
  return request.post<LoginResult>('/auth/login', data)
}
