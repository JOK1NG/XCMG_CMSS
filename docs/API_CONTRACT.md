# 前后端接口约定（前端视角）

本文档与仓库内 `src/api/*` 保持一致，便于联调时对齐路径与字段。  
基础地址由环境变量 `VITE_API_BASE_URL` 决定（默认 `/api`），请求封装见 [`src/utils/request.ts`](../src/utils/request.ts)。

## 统一响应

若后端返回：

```json
{ "code": 200, "msg": "ok", "data": ... }
```

则前端拦截器会将 **`data` 解包** 后再交给业务代码（与 Axios 默认类型不同）。

非 `code === 200` 时，前端会 `ElMessage.error(msg)` 并 `reject`。

## 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/login` |  body: `{ username, password }`，data: `{ token }` |

请求头：`Authorization: Bearer <token>`（登录成功后写入 `localStorage.token`）。

HTTP **401**：前端会清理 token 并跳转 `/login`（登录接口本身的 401 仅提示错误，不跳转）。

## 字典

优先走后端字典；失败时使用 [`src/constants/dictFallbacks.ts`](../src/constants/dictFallbacks.ts) 中的本地兜底。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/dict/{dictType}` | 返回 `{ label, value }[]`（或 `dictLabel`/`dictValue`，前端会归一化） |

当前使用的 `dictType` 示例：

- `equipment_category` / `equipment_status` / `workshop`
- `workorder_status` / `fault_level`
- `spare_supplier`
- `maintain_status` / `maintain_template`
- `sys_dept` / `sys_role` / `user_status`

## 设备

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/equipment/page` | 分页查询 |
| GET | `/equipment/{id}` | 详情 |
| POST | `/equipment` | 新增 |
| PUT | `/equipment/{id}` | 更新 |
| DELETE | `/equipment/{id}` | 删除 |

## 工单

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/workorder/page` | 分页查询 |
| GET | `/workorder/{id}` | 详情 |
| POST | `/workorder` | 发起报修 body: `{ equipmentId, faultDesc, faultLevel }` |
| PUT | `/workorder/{id}/assign` | 派工 body: `{ assigneeId }` |
| PUT | `/workorder/{id}/close` | 关闭 |

## 系统用户

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/system/user/page` | 分页查询 |
| GET | `/system/user/{id}` | 详情 |
| POST | `/system/user` | 新增 body: `{ username, password, realName, deptName, roleName, phone, status }` |
| PUT | `/system/user/{id}` | 更新 body: `{ username, realName, deptName, roleName, phone, status }`（用户名仅展示，前端编辑时禁用改用户名与否以后端为准） |
| DELETE | `/system/user/{id}` | 删除 |
| PUT | `/system/user/{id}/password` | 重置密码 body: `{ newPassword }` |

## 其他列表页

仍沿用 [`src/api`](../src/api) 中注释：`/spare/page`、`/maintain/order/page` 等分页路径。

## 环境变量（联调/演示）

见仓库根目录 [`.env.example`](../.env.example)。

- `VITE_USE_LIST_FALLBACK`：列表/看板失败时是否填充本地示例数据。
- `VITE_DEV_BYPASS_AUTH`：仅开发环境，跳过登录路由守卫（无后端本地调 UI 时可开）。
