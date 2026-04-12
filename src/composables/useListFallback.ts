import type { Ref } from 'vue'

/**
 * 列表/看板请求失败时是否使用本地示例数据（开发演示）。
 * 仅在本地开发环境下生效；联调/发布环境默认关闭。
 * `.env`：`VITE_USE_LIST_FALLBACK=true` 强制开启（仅本地开发生效）；未设置时本地开发默认开启。
 */
export function shouldUseListFallback() {
  const isLocalDevMode = import.meta.env.DEV && import.meta.env.MODE === 'development'
  const v = import.meta.env.VITE_USE_LIST_FALLBACK
  if (v === 'true') return isLocalDevMode
  if (v === 'false') return false
  return isLocalDevMode
}

/**
 * 列表请求失败时是否使用本地示例行（开发演示）；联调/发布默认关闭。
 */
export function useListFallbackRows<T>(options: {
  fallbackRows: T[]
  /** 使用兜底时是否将 pageNum 重置为 1 */
  resetPageOnFallback: boolean
}) {
  const shouldUseFallback = () => shouldUseListFallback()

  const applyFallback = (
    queryForm: { pageNum: number },
    tableData: Ref<T[]>,
    total: Ref<number>,
  ) => {
    if (options.resetPageOnFallback) {
      queryForm.pageNum = 1
    }
    tableData.value = [...options.fallbackRows] as T[]
    total.value = options.fallbackRows.length
  }

  return { shouldUseFallback, applyFallback }
}
