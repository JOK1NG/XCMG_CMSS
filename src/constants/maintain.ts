import type { DictItem } from '@/api/dict'
import type {
  MaintainCheckResult,
  MaintainCloseReasonType,
  MaintainCycleType,
  MaintainFinishResult,
  MaintainOrderStatus,
} from '@/api/maintain'

export const MAINTAIN_ORDER_STATUS_OPTIONS: Array<DictItem & { value: MaintainOrderStatus }> = [
  { label: '待派工', value: '待派工' },
  { label: '待执行', value: '待执行' },
  { label: '执行中', value: '执行中' },
  { label: '已完成', value: '已完成' },
  { label: '已关闭', value: '已关闭' },
]

export const MAINTAIN_CYCLE_OPTIONS: Array<DictItem & { value: MaintainCycleType }> = [
  { label: '每日', value: 'DAILY' },
  { label: '每周', value: 'WEEKLY' },
  { label: '每月', value: 'MONTHLY' },
  { label: '每季度', value: 'QUARTERLY' },
  { label: '每年', value: 'YEARLY' },
]

export const MAINTAIN_FINISH_RESULT_OPTIONS: Array<DictItem & { value: MaintainFinishResult }> = [
  { label: '正常完成', value: '正常完成' },
  { label: '部分完成', value: '部分完成' },
  { label: '异常完成', value: '异常完成' },
]

export const MAINTAIN_CHECK_RESULT_OPTIONS: Array<DictItem & { value: MaintainCheckResult }> = [
  { label: '正常', value: '正常' },
  { label: '异常', value: '异常' },
  { label: '不适用', value: '不适用' },
]

export const MAINTAIN_CLOSE_REASON_OPTIONS: Array<DictItem & { value: MaintainCloseReasonType }> = [
  { label: '无法执行', value: '无法执行' },
  { label: '重复工单', value: '重复工单' },
  { label: '设备停用', value: '设备停用' },
  { label: '其他', value: '其他' },
]
