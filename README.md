# Factory CMMS — 工厂设备维护管理后台

面向工厂设备运维场景的 B 端管理系统，覆盖设备台账、维修工单、周期性保养、备件库存、数据看板等核心业务流程。

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | Vue 3.5 + TypeScript 5.9 |
| 构建 | Vite 8 |
| UI 组件 | Element Plus 2 + @element-plus/icons-vue |
| 状态管理 | Pinia 3 |
| 路由 | Vue Router 5 |
| HTTP | Axios（统一封装 `src/utils/request.ts`） |
| 图表 | ECharts 6 |
| DX | unplugin-auto-import / unplugin-vue-components（自动导入） |

## 功能模块

| 模块 | 路由 | 说明 |
|------|------|------|
| 数据看板 | `/dashboard` | 设备总数、工单状态分布、维护成本趋势（ECharts） |
| 设备台账 | `/equipment/list` | 设备 CRUD、分类/状态筛选 |
| 维修工单 | `/workorder/list` | 报修 → 派工 → 关闭 |
| 保养工单 | `/maintain/order` | 手动建单 / 规则自动生成 → 派工 → 执行 → 完成 → 关闭 |
| 保养模板 | `/maintain/template` | 定义保养检查项模板，供规则和建单引用（管理员/保养主管可见） |
| 备件管理 | `/spare/list` | 备件档案 + 入库/出库操作 |
| 出入库记录 | `/spare/stock-record` | 备件库存变动流水 |
| 用户管理 | `/system/user` | 账号 CRUD、重置密码（管理员/保养主管可见） |
| 角色管理 | `/system/role` | 角色 CRUD（仅管理员可见） |

### 角色与权限

系统内置四个角色，按优先级从高到低：

- **ROLE_ADMIN** — 全部操作
- **ROLE_MAINTAIN_MANAGER** — 保养全流程管理 + 用户管理
- **ROLE_EXECUTOR** — 执行保养、完成保养
- **ROLE_VIEWER** — 只读查看

保养模块实现了按钮级权限控制（角色 × 工单状态双重校验），路由级菜单权限通过 `meta.requiredRoles` 控制。

## 项目结构

```
src/
├── api/            # 按模块拆分的 HTTP 请求（auth, equipment, workorder, maintain, spare, …）
├── assets/         # 静态资源
├── components/     # 公共组件（PageHeader 等）
├── composables/    # 组合式函数（useDictOptions, useListFallback）
├── constants/      # 枚举常量、字典兜底数据
├── layout/         # 侧边栏 + 顶栏 + 面包屑布局
├── router/         # 路由定义 + 全局守卫
├── stores/         # Pinia Store（auth — 登录态 + 权限判断）
├── styles/         # 全局样式
├── utils/          # request 封装、authStorage
└── views/          # 页面视图（按模块分目录，每个模块内含 components/ 子目录）
```

## 快速开始

### 环境要求

- **Node.js** >= 18（推荐 20+）
- **npm** >= 9

### 安装与启动

```bash
git clone <repo-url>
cd factory_cmss
cp .env.example .env        # 按需修改环境变量
npm install
npm run dev                  # 启动开发服务器（默认 http://localhost:5173）
```

### 环境变量

复制 `.env.example` 为 `.env` 并按需修改：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `VITE_API_BASE_URL` | `/api` | 后端 API 前缀。联调时指向真实网关或配合 Vite proxy |
| `VITE_USE_LIST_FALLBACK` | `true`（dev） | 列表 / 看板请求失败时是否回退到本地示例数据。生产环境自动关闭 |
| `VITE_DEV_BYPASS_AUTH` | 注释 | 仅开发环境，跳过登录守卫以便无后端调试 UI。**生产勿用** |

> 如需代理后端 API，在 `vite.config.ts` 中添加 `server.proxy` 配置，将 `/api` 转发到后端地址。

## 登录与鉴权

1. 访问 `/login`，输入用户名密码 → 调用 `POST /auth/login`
2. 登录成功后 token 写入 `sessionStorage`，后续请求自动携带 `Authorization: Bearer <token>`
3. 未登录访问业务页会重定向到 `/login?redirect=<原路径>`
4. 后端返回 HTTP 401 → 自动清理 token 并跳回登录页
5. 布局右上角可「退出登录」

## 接口约定

前后端字段与路径详见 [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md)。

核心约定：

- **统一响应格式**：`{ code: 200, msg: "ok", data: ... }`，前端拦截器自动解包 `data`
- **分页参数**：`page`（页码，从 1 开始）、`size`（每页条数），响应包含 `total`
- **字典接口**：`GET /dict/{dictType}` 返回 `{ label, value }[]`，失败时回退本地兜底数据

## 构建与部署

```bash
npm run build       # TypeScript 检查 + Vite 生产构建，输出到 dist/
npm run preview     # 本地预览生产产物
```

生产部署时将 `dist/` 目录部署到静态服务器（Nginx / CDN），并配置所有路由 fallback 到 `index.html`（SPA history 模式）。

Nginx 参考片段：

```nginx
location / {
    root   /path/to/dist;
    index  index.html;
    try_files $uri $uri/ /index.html;
}

location /api/ {
    proxy_pass http://backend-server:8080/api/;
}
```

## 项目文档

`docs/` 目录包含完整的设计与开发文档：

| 文档 | 内容 |
|------|------|
| [API_CONTRACT.md](docs/API_CONTRACT.md) | 前后端接口路径、字段、状态机约定 |
| [保养工单联调验收清单.md](docs/保养工单联调验收清单.md) | 保养模块联调验收 checklist |
| [PRD_工厂设备维护管理后台系统](docs/PRD_工厂设备维护管理后台系统_Opus_V1.0.1_副本.md) | 产品需求文档 |
| [数据库表结构设计](docs/数据库表结构设计_建表SQL草案_副本.md) | 建表 SQL 草案 |
| [SpringBoot后端工程骨架设计](docs/SpringBoot后端工程骨架设计_副本.md) | 后端架构设计 |
| [页面清单_接口清单_开发顺序表](docs/页面清单_接口清单_开发顺序表_副本.md) | 页面 & 接口开发排期 |
| [页面字段明细_接口请求响应示例JSON](docs/页面字段明细_接口请求响应示例JSON_副本.md) | 各页面字段与示例 JSON |
| [前端原型设计](docs/前端原型设计_副本.md) | UI 原型说明 |
| [工单模块完整代码模板](docs/工单模块完整代码模板_副本.md) | 工单模块代码参考 |
| [后台管理系统开发指南](docs/后台管理系统开发指南（修订版）_副本.md) | 前端开发规范与指南 |
