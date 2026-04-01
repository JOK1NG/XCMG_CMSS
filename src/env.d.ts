/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  /** 列表请求失败时使用本地示例数据：true / false；未设置时开发环境默认启用 */
  readonly VITE_USE_LIST_FALLBACK?: string
  /** 开发环境跳过登录路由守卫（仅本地 UI 调试，切勿用于生产构建） */
  readonly VITE_DEV_BYPASS_AUTH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}