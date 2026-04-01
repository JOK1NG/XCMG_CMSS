import request from '@/utils/request'

/** 下拉选项（统一 label / value，便于表单与筛选复用） */
export interface DictItem {
  label: string
  value: string | number
}

/** 后端可能返回的原始项（兼容常见字段名） */
interface RawDictItem {
  label?: string
  dictLabel?: string
  name?: string
  value?: string | number
  dictValue?: string | number
  code?: string | number
}

function normalizeItem(raw: RawDictItem): DictItem | null {
  const label = raw.dictLabel ?? raw.label ?? raw.name
  const value = raw.dictValue ?? raw.value ?? raw.code
  if (label == null || label === '' || value === undefined || value === null) return null
  return { label: String(label), value: typeof value === 'number' ? value : String(value) }
}

/**
 * 获取字典项（GET /dict/{type} 或 /system/dict/{type}）
 * 联调时与后端约定路径；失败时由调用方决定是否使用本地兜底。
 */
export async function fetchDictItems(dictType: string): Promise<DictItem[]> {
  const raw = await request.get<RawDictItem[]>(`/dict/${dictType}`)
  if (!Array.isArray(raw)) return []
  return raw.map(normalizeItem).filter((x): x is DictItem => x !== null)
}

/** 兼容备用路径（若后端使用 system 前缀） */
export async function fetchDictItemsAlt(dictType: string): Promise<DictItem[]> {
  const raw = await request.get<RawDictItem[]>(`/system/dict/${dictType}`)
  if (!Array.isArray(raw)) return []
  return raw.map(normalizeItem).filter((x): x is DictItem => x !== null)
}
