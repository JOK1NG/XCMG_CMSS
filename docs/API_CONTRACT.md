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
| POST | `/auth/login` |  body: `{ username, password }`，data: `{ token, userInfo, roleCodes }` |

登录返回建议结构（前端实际兼容 `userInfo` / `user`，`roleCode` / `roleCodes`）：

```json
{
  "token": "xxx",
  "userInfo": { "id": 1, "username": "admin", "realName": "系统管理员" },
  "roleCodes": ["ROLE_ADMIN"]
}
```

`roleCodes` 约定值（按优先级高到低）：`ROLE_ADMIN`、`ROLE_MAINTAIN_MANAGER`、`ROLE_EXECUTOR`、`ROLE_VIEWER`。

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

## 备件

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/spare/page` | 分页查询 |
| GET | `/spare/{id}` | 详情 |
| POST | `/spare` | 新增 body: `{ spareCode, spareName, spec, unit, warningQty, price, supplierName, location, stockQty? }`（`stockQty` 为可选初始库存） |
| PUT | `/spare/{id}` | 更新档案 body: 与列表字段一致（不含库存数量；库存通过入出库变更） |
| DELETE | `/spare/{id}` | 删除 |
| PUT | `/spare/{id}/stock-in` | 入库 body: `{ qty, remark? }` |
| PUT | `/spare/{id}/stock-out` | 出库 body: `{ qty, remark? }` |

## 保养工单与规则（第二阶段）

### 保养工单

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/maintain/order/page` | 分页查询，支持 `keyword/status/template/startDate/endDate` |
| GET | `/maintain/order/{id}` | 工单详情（基础信息 + 时间线 + 执行/完成记录 + 耗材 + 附件 + 规则来源） |
| POST | `/maintain/order` | 手动建单，支持只建单或建单并派工 |
| PUT | `/maintain/order/{id}/assign` | 派工 body: `{ assigneeId, plannedExecuteTime?, remark? }` |
| PUT | `/maintain/order/{id}/start` | 执行 body: `{ assigneeId?, plannedExecuteTime?, remark? }` |
| PUT | `/maintain/order/{id}/finish` | 完成（结果、检查项、耗材、附件） |
| PUT | `/maintain/order/{id}/close` | 关闭 body: `{ reasonType, reasonRemark }` |

### 保养规则

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/maintain/rule/page` | 规则分页 |
| POST | `/maintain/rule` | 新增规则 |
| PUT | `/maintain/rule/{id}` | 编辑规则 |
| PUT | `/maintain/rule/{id}/enabled` | 启停规则 body: `{ enabled }` |
| POST | `/maintain/rule/{id}/generate` | 单条规则立即生成/补生成 |

### 保养模板

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/maintain/template/page` | 模板分页（供规则和建单选择） |
| GET | `/maintain/template/{id}` | 模板详情（固定检查项） |

### 附件上传

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/maintain/attachment/upload` | `multipart/form-data`，字段名 `file` |

### 状态机与枚举约定

- 状态机：`待派工 -> 待执行 -> 执行中 -> 已完成`，仅 `待派工/待执行` 允许关闭。
- 完成结果：`正常完成` / `部分完成` / `异常完成`。
- 检查项结果：`正常` / `异常` / `不适用`。
- 关闭原因分类：`无法执行` / `重复工单` / `设备停用` / `其他`（需补充文本说明）。
- 周期枚举：`DAILY` / `WEEKLY` / `MONTHLY` / `QUARTERLY` / `YEARLY`。
- 生成规则：全局统一提前天数；若上一周期工单未完成，则阻止下一周期新工单生成。

## 环境变量（联调/演示）

见仓库根目录 [`.env.example`](../.env.example)。

- `VITE_USE_LIST_FALLBACK`：列表/看板失败时是否填充本地示例数据。
- `VITE_DEV_BYPASS_AUTH`：仅开发环境，跳过登录路由守卫（无后端本地调 UI 时可开）。
