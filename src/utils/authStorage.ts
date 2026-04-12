import type { LoginUserInfo, RoleCode } from '@/api/auth'

const TOKEN_KEY = 'token'
const USER_KEY = 'auth_user'
const ROLES_KEY = 'auth_roles'

function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export interface AuthSessionSnapshot {
  token: string
  user: LoginUserInfo | null
  roleCodes: RoleCode[]
}

export function getTokenFromStorage(): string {
  return localStorage.getItem(TOKEN_KEY) ?? ''
}

export function saveAuthSessionToStorage(snapshot: AuthSessionSnapshot) {
  localStorage.setItem(TOKEN_KEY, snapshot.token)
  localStorage.setItem(USER_KEY, JSON.stringify(snapshot.user))
  localStorage.setItem(ROLES_KEY, JSON.stringify(snapshot.roleCodes))
}

export function readAuthSessionFromStorage(): AuthSessionSnapshot {
  const token = getTokenFromStorage()
  const user = parseJson<LoginUserInfo>(localStorage.getItem(USER_KEY))
  const roleCodes = parseJson<RoleCode[]>(localStorage.getItem(ROLES_KEY)) ?? []
  return {
    token,
    user,
    roleCodes: Array.isArray(roleCodes) ? roleCodes : [],
  }
}

export function clearAuthSessionStorage() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(ROLES_KEY)
}
