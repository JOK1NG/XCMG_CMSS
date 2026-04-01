import type { DictItem } from '@/api/dict'

/** 后端字典接口不可用时使用（与页面原静态选项一致） */
export const EQUIPMENT_CATEGORY_FALLBACK: DictItem[] = [
  { label: '数控车床', value: '数控车床' },
  { label: '加工中心', value: '加工中心' },
  { label: '磨床', value: '磨床' },
  { label: '三坐标测量机', value: '三坐标测量机' },
  { label: '空压机', value: '空压机' },
]

export const EQUIPMENT_STATUS_FALLBACK: DictItem[] = [
  { label: '正常', value: '正常' },
  { label: '维修中', value: '维修中' },
  { label: '保养中', value: '保养中' },
  { label: '停用', value: '停用' },
]

export const WORKSHOP_FALLBACK: DictItem[] = [
  { label: '一车间', value: '一车间' },
  { label: '二车间', value: '二车间' },
  { label: '三车间', value: '三车间' },
  { label: '仓储部', value: '仓储部' },
]

export const WORKORDER_STATUS_FALLBACK: DictItem[] = [
  { label: '待派工', value: 1 },
  { label: '已派工', value: 2 },
  { label: '维修中', value: 3 },
  { label: '待验收', value: 4 },
  { label: '已完成', value: 5 },
  { label: '已关闭', value: 6 },
]

export const FAULT_LEVEL_FALLBACK: DictItem[] = [
  { label: '紧急', value: 1 },
  { label: '一般', value: 2 },
  { label: '低', value: 3 },
]

export const SPARE_SUPPLIER_FALLBACK: DictItem[] = [
  { label: '洛阳轴承', value: '洛阳轴承' },
  { label: '西门子工业', value: '西门子工业' },
  { label: '阿特拉斯', value: '阿特拉斯' },
]

export const MAINTAIN_STATUS_FALLBACK: DictItem[] = [
  { label: '待执行', value: '待执行' },
  { label: '执行中', value: '执行中' },
  { label: '已完成', value: '已完成' },
  { label: '已关闭', value: '已关闭' },
]

export const MAINTAIN_TEMPLATE_FALLBACK: DictItem[] = [
  { label: '数控车床月度保养', value: '数控车床月度保养' },
  { label: '加工中心季度保养', value: '加工中心季度保养' },
  { label: '磨床月度保养', value: '磨床月度保养' },
  { label: '检测设备年度校准', value: '检测设备年度校准' },
]

export const DEPT_FALLBACK: DictItem[] = [
  { label: '设备部', value: '设备部' },
  { label: '维修班', value: '维修班' },
  { label: '仓储部', value: '仓储部' },
  { label: '生产部', value: '生产部' },
]

export const ROLE_FALLBACK: DictItem[] = [
  { label: '超级管理员', value: '超级管理员' },
  { label: '设备管理员', value: '设备管理员' },
  { label: '维修工', value: '维修工' },
  { label: '仓库管理员', value: '仓库管理员' },
]

export const USER_STATUS_FALLBACK: DictItem[] = [
  { label: '启用', value: '启用' },
  { label: '停用', value: '停用' },
]
