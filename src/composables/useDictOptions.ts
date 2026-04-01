import { ref, type Ref } from 'vue'
import { fetchDictItems } from '@/api/dict'
import type { DictItem } from '@/api/dict'

/**
 * 加载字典：优先请求后端，失败则使用本地兜底（联调/演示可用）
 */
export async function loadDictOptions(
  dictType: string,
  fallback: DictItem[],
): Promise<DictItem[]> {
  try {
    const list = await fetchDictItems(dictType)
    if (list.length > 0) return list
  } catch {
    /* 使用兜底 */
  }
  return fallback
}

/**
 * 在组件内使用：返回响应式 options 与 reload 方法
 */
export function useDictOptions(dictType: string, fallback: DictItem[]) {
  const options: Ref<DictItem[]> = ref([...fallback])

  const reload = async () => {
    options.value = await loadDictOptions(dictType, fallback)
  }

  return { options, reload }
}
