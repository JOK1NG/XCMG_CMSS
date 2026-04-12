import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { LoginResult, LoginUserInfo, RoleCode } from '@/api/auth'
import {
  clearAuthSessionStorage,
  readAuthSessionFromStorage,
  saveAuthSessionToStorage,
} from '@/utils/authStorage'

export type EffectiveRole =
  | 'ROLE_ADMIN'
  | 'ROLE_MAINTAIN_MANAGER'
  | 'ROLE_EXECUTOR'
  | 'ROLE_VIEWER'

export type MaintainOrderStatus = '待派工' | '待执行' | '执行中' | '已完成' | '已关闭'
export type MaintainAction =
  | 'view'
  | 'manageRules'
  | 'create'
  | 'assign'
  | 'execute'
  | 'finish'
  | 'close'
  | 'downloadAttachment'

const ROLE_PRIORITY: EffectiveRole[] = [
  'ROLE_ADMIN',
  'ROLE_MAINTAIN_MANAGER',
  'ROLE_EXECUTOR',
  'ROLE_VIEWER',
]

const ROLE_ACTIONS: Record<EffectiveRole, MaintainAction[]> = {
  ROLE_ADMIN: ['view', 'manageRules', 'create', 'assign', 'execute', 'finish', 'close', 'downloadAttachment'],
  ROLE_MAINTAIN_MANAGER: [
    'view',
    'manageRules',
    'create',
    'assign',
    'execute',
    'finish',
    'close',
    'downloadAttachment',
  ],
  ROLE_EXECUTOR: ['view', 'manageRules', 'create', 'execute', 'finish', 'downloadAttachment'],
  ROLE_VIEWER: ['view', 'downloadAttachment'],
}

function normalizeRoleCodes(input: RoleCode[] | undefined, fallback?: RoleCode): RoleCode[] {
  if (Array.isArray(input) && input.length > 0) return input
  if (fallback) return [fallback]
  return []
}

function pickEffectiveRole(roleCodes: RoleCode[]): EffectiveRole {
  for (const role of ROLE_PRIORITY) {
    if (roleCodes.includes(role)) return role
  }
  return 'ROLE_VIEWER'
}

export function normalizeMaintainStatus(status: string | number | null | undefined): MaintainOrderStatus | null {
  if (status == null) return null
  const str = String(status)
  switch (str) {
    case '1':
    case '待派工':
      return '待派工'
    case '2':
    case '待执行':
    case '已派工':
      return '待执行'
    case '3':
    case '执行中':
    case '维修中':
      return '执行中'
    case '4':
    case '5':
    case '已完成':
    case '待验收':
      return '已完成'
    case '6':
    case '已关闭':
      return '已关闭'
    default:
      return null
  }
}

/**
 * 当前阶段仅做保养模块动作级权限控制（按钮级）；
 * 菜单/路由级入口权限后续作为独立任务处理。
 */
function actionAllowedByStatus(action: MaintainAction, status: MaintainOrderStatus | null): boolean {
  if (status == null) return action === 'view' || action === 'manageRules' || action === 'create'
  switch (action) {
    case 'assign':
      return status === '待派工'
    case 'execute':
      return status === '待执行'
    case 'finish':
      return status === '执行中'
    case 'close':
      return status === '待派工' || status === '待执行'
    default:
      return true
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const user = ref<LoginUserInfo | null>(null)
  const roleCodes = ref<RoleCode[]>([])
  const initialized = ref(false)

  const isLoggedIn = computed(() => token.value.length > 0)
  const effectiveRole = computed<EffectiveRole>(() => pickEffectiveRole(roleCodes.value))
  const effectiveActions = computed<MaintainAction[]>(() => ROLE_ACTIONS[effectiveRole.value])

  const persist = () => {
    if (!token.value) {
      clearAuthSessionStorage()
      return
    }
    saveAuthSessionToStorage({
      token: token.value,
      user: user.value,
      roleCodes: roleCodes.value,
    })
  }

  const applySession = (payload: { token: string; user: LoginUserInfo | null; roleCodes: RoleCode[] }) => {
    token.value = payload.token
    user.value = payload.user
    roleCodes.value = payload.roleCodes
    persist()
  }

  const initFromStorage = () => {
    if (initialized.value) return
    const snapshot = readAuthSessionFromStorage()
    token.value = snapshot.token
    user.value = snapshot.user
    roleCodes.value = snapshot.roleCodes
    initialized.value = true
  }

  const setLoginResult = (result: LoginResult) => {
    const normalizedUser = result.userInfo ?? result.user ?? null
    const normalizedRoles = normalizeRoleCodes(result.roleCodes, result.roleCode)
    applySession({
      token: result.token,
      user: normalizedUser,
      roleCodes: normalizedRoles,
    })
    initialized.value = true
  }

  const clearSession = () => {
    token.value = ''
    user.value = null
    roleCodes.value = []
    initialized.value = true
    clearAuthSessionStorage()
  }

  const canManageMaintainAction = (action: MaintainAction, status?: string | number | null) => {
    const allowedByRole = effectiveActions.value.includes(action)
    if (!allowedByRole) return false
    const normalizedStatus = normalizeMaintainStatus(status)
    return actionAllowedByStatus(action, normalizedStatus)
  }

  const getMaintainActionDisabledReason = (action: MaintainAction, status?: string | number | null) => {
    if (!effectiveActions.value.includes(action)) {
      return '当前角色无权限执行该操作'
    }
    if (!actionAllowedByStatus(action, normalizeMaintainStatus(status))) {
      return '当前工单状态不允许该操作'
    }
    return ''
  }

  return {
    token,
    user,
    roleCodes,
    initialized,
    isLoggedIn,
    effectiveRole,
    initFromStorage,
    setLoginResult,
    clearSession,
    canManageMaintainAction,
    getMaintainActionDisabledReason,
  }
})
