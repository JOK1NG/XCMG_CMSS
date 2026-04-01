# Factory CMMS（工厂设备维护管理后台）

Vue 3 + Vite + TypeScript + Element Plus。

## 本地开发

```bash
npm install
npm run dev
```

## 环境变量

复制 `.env.example` 为 `.env` 并按需修改：

- **`VITE_API_BASE_URL`**：后端 API 根路径（默认 `/api`）。生产/联调请指向真实网关或配合反向代理。
- **`VITE_USE_LIST_FALLBACK`**：列表与数据看板请求失败时，是否使用本地示例数据（开发默认行为见 `.env.example`）。
- **`VITE_DEV_BYPASS_AUTH`**：仅开发环境，跳过登录路由守卫（无后端仅调 UI 时可临时开启）。

## 登录与鉴权

- 登录页：`/login`（成功后将 `token` 写入 `localStorage`）。
- 已登录访问业务页；未登录会重定向到登录页并带上 `redirect`。
- 请求头自动携带 `Authorization: Bearer <token>`；HTTP **401** 会清理 token 并回登录页。
- 布局右上角可「退出登录」。

## 接口约定

前后端字段与路径说明见 [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md)。

## 构建

```bash
npm run build
npm run preview
```
