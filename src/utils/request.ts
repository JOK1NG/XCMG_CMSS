import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

/** 后端统一响应外壳（与业务 data 区分） */
export interface ApiResult<T = unknown> {
  code: number
  msg: string
  data: T
}

/** 响应拦截器已解包为 data，与 Axios 默认类型不一致，对外用此类型约束 get/post 等 */
export type ApiRequest = Pick<AxiosInstance, 'defaults' | 'interceptors'> & {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
}

const baseURL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '/api'

const service: AxiosInstance = axios.create({
  baseURL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 预留：登录后写入 token 即可自动带上
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 解包业务 data，与 Axios 默认「仍返回 AxiosResponse」类型声明不一致，此处对处理器做断言
service.interceptors.response.use(
  ((response) => {
    const body = response.data as ApiResult | unknown
    if (
      body &&
      typeof body === 'object' &&
      'code' in body &&
      'data' in body
    ) {
      const { code, msg, data } = body as ApiResult
      if (code === 200) {
        return data
      }
      ElMessage.error(msg || '请求失败')
      return Promise.reject(new Error(msg || '请求失败'))
    }
    return body
  }) as Parameters<AxiosInstance['interceptors']['response']['use']>[0],
  ((error) => {
    const status = error.response?.status
    if (status === 401) {
      const reqUrl = String(error.config?.url ?? '')
      const isLoginCall = reqUrl.includes('/auth/login')
      if (!isLoginCall) {
        localStorage.removeItem('token')
        if (router.currentRoute.value.path !== '/login') {
          router
            .push({
              path: '/login',
              query: { redirect: router.currentRoute.value.fullPath },
            })
            .catch(() => {})
        }
      }
      const backendMsg = (error.response?.data as ApiResult | undefined)?.msg
      ElMessage.error(backendMsg || (isLoginCall ? '用户名或密码错误' : '登录已失效，请重新登录'))
      return Promise.reject(error)
    }

    const backendMsg = (error.response?.data as ApiResult | undefined)?.msg
    const message =
      backendMsg || error.message || '网络异常，请稍后重试'
    ElMessage.error(message)
    return Promise.reject(error)
  }) as Parameters<AxiosInstance['interceptors']['response']['use']>[1],
)

const request = service as unknown as ApiRequest

export default request
