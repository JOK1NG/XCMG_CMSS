# 产品需求文档（PRD）
# 工厂设备维护管理后台系统

> **文档版本：** V1.0.1
> **编写日期：** 2026-03-27
> **适用技术栈：** Vue 3 + Spring Boot 3（参照《后台管理系统开发指南》）
> **文档状态：** 评审修订中

---

## 目录

1. [项目背景与目标](#1-项目背景与目标)
2. [产品定位与用户角色](#2-产品定位与用户角色)
3. [功能需求总览](#3-功能需求总览)
4. [核心业务模块详细需求](#4-核心业务模块详细需求)
5. [系统管理模块（基础框架复用）](#5-系统管理模块基础框架复用)
6. [数据库设计](#6-数据库设计)
7. [接口规范设计](#7-接口规范设计)
8. [非功能性需求](#8-非功能性需求)
9. [开发计划与里程碑](#9-开发计划与里程碑)
10. [附录：术语表](#10-附录术语表)

---

## 1. 项目背景与目标

### 1.1 业务背景

某精密零部件制造工厂（中型规模，员工约 500 人，生产线 8 条）现有设备台账以 Excel 表格维护，设备维修记录依赖纸质工单，主要痛点如下：

| 痛点 | 现状描述 | 影响 |
|------|----------|------|
| 设备信息分散 | 台账存于多个 Excel 文件，版本混乱 | 资产核查耗时长，漏账率高 |
| 维修响应慢 | 口头报修 → 手动派工，平均响应 4 小时以上 | 设备停机影响产能 |
| 无预防性维护 | 仅被动响应故障，无定期保养计划 | 设备故障率高，大修费用居高不下 |
| 备件库存不透明 | 备件采购靠经验，无库存预警 | 急修时缺件率约 30% |
| 数据无法追溯 | 历史维修记录难以查询分析 | 设备寿命预测、费用核算困难 |

### 1.2 项目目标

构建一套**工厂设备维护管理后台系统（CMMS）**，实现：

- **数字化台账**：统一管理全厂设备基础信息，支持二维码快速定位
- **工单闭环**：报修 → 派工 → 维修 → 验收全流程线上化，响应时效可追踪
- **计划性保养**：基于设备类型配置保养计划，系统自动生成保养工单
- **备件管理**：备件入库/出库/库存预警，支持采购申请联动
- **数据看板**：设备稼动率、维修费用、工单完成率等核心指标可视化

### 1.3 项目范围

**本期（V1.0）覆盖：**

- 设备台账管理
- 维修工单管理（报修、派工、维修、验收）
- 预防性保养计划与执行
- 备件库存管理
- 系统管理（用户/角色/部门/菜单，复用开发指南基础框架）
- 数据统计看板

**不在本期范围：**

- 与 ERP 系统的数据对接
- 移动端 App（本期提供 H5 响应式页面供手机访问）
- IoT 设备实时采集数据接入

---

## 2. 产品定位与用户角色

### 2.1 用户角色定义（RBAC 模型）

| 角色 | 角色标识 | 典型人员 | 核心权限范围 |
|------|----------|----------|--------------|
| 超级管理员 | `role_super_admin` | IT 管理员 | 全部权限，系统配置 |
| 设备管理员 | `role_equip_admin` | 设备工程师 | 设备台账管理、保养计划配置、报表查看 |
| 维修班长 | `role_repair_leader` | 维修主管 | 工单派工、验收、备件审批 |
| 维修工 | `role_repair_staff` | 一线维修人员 | 查看派给自己的工单、提交维修记录 |
| 生产操作员 | `role_operator` | 生产线操作工 | 提交报修工单、查看本线设备状态 |
| 只读用户 | `role_viewer` | 管理层 | 查看所有数据，无编辑权限 |

### 2.2 部门结构

```
工厂
├── 生产部
│   ├── 一车间
│   ├── 二车间
│   └── 三车间
├── 设备部
│   ├── 设备管理组
│   └── 维修班
└── 仓储部
    └── 备件库
```

---

## 3. 功能需求总览

### 3.1 模块架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                    工厂设备维护管理后台系统                            │
├──────────────────┬──────────────────┬──────────────────────────────┤
│   📦 设备管理     │   🔧 工单管理     │        📊 数据看板             │
│                  │                  │                              │
│  · 设备台账       │  · 报修工单       │  · 设备可用率                 │
│  · 设备分类       │  · 工单派工       │  · 工单统计                  │
│  · 设备二维码     │  · 维修记录       │  · 维修费用趋势               │
│  · 设备文档       │  · 工单验收       │  · 备件消耗统计               │
├──────────────────┼──────────────────┼──────────────────────────────┤
│   📋 保养管理     │   🗄️ 备件管理    │        ⚙️ 系统管理             │
│                  │                  │                              │
│  · 保养计划模板   │  · 备件档案       │  · 用户管理                  │
│  · 计划生成规则   │  · 入库管理       │  · 角色管理                  │
│  · 保养工单执行   │  · 出库管理       │  · 部门管理                  │
│  · 保养记录查询   │  · 库存预警       │  · 菜单管理                  │
│                  │  · 采购申请       │  · 操作日志                  │
└──────────────────┴──────────────────┴──────────────────────────────┘
```

### 3.2 功能优先级矩阵

| 模块 | 功能点 | 优先级 | 开发阶段 |
|------|--------|--------|----------|
| 系统管理 | 用户/角色/部门/菜单 | P0 | 第二阶段 |
| 设备管理 | 设备台账 CRUD、设备分类 | P0 | 第三阶段 |
| 工单管理 | 报修、派工、维修、验收 | P0 | 第三阶段 |
| 保养管理 | 保养计划、保养工单 | P1 | 第三阶段 |
| 备件管理 | 备件档案、出入库 | P1 | 第三阶段 |
| 数据看板 | 核心指标统计图表 | P2 | 第四阶段 |
| 设备二维码 | 生成/打印二维码 | P2 | 第四阶段 |
| 库存预警 | 低库存自动通知 | P2 | 第四阶段 |

---

## 4. 核心业务模块详细需求

### 4.1 设备管理模块

#### 4.1.1 设备分类管理 (`equip_category`)

**功能描述：** 维护设备分类树，作为设备台账的基础字典。

| 功能 | 描述 | 备注 |
|------|------|------|
| 分类列表 | 树形结构展示，最多 3 级 | 参考指南菜单管理的树形实现 |
| 新增分类 | 填写分类名称、父级分类、排序 | |
| 编辑/删除 | 级联检查是否有设备绑定该分类 | 有设备时禁止删除 |

**示例分类结构：**
```
设备分类
├── 机加工设备
│   ├── 数控车床
│   ├── 加工中心
│   └── 磨床
├── 检测设备
│   ├── 三坐标测量机
│   └── 硬度计
└── 辅助设备
    ├── 叉车
    └── 空压机
```

#### 4.1.2 设备台账管理 (`equip_info`)

**功能描述：** 全厂设备的数字化档案，是系统核心数据实体。

**列表页功能：**

| 功能 | 描述 |
|------|------|
| 分页列表 | 默认每页 20 条，支持排序 |
| 条件筛选 | 按设备名称/编号/分类/所在车间/状态筛选 |
| 批量操作 | 批量导出 Excel、批量报废 |
| 导入 | 支持 Excel 批量导入（提供模板下载） |
| 快速查看 | 点击行展开显示设备基本信息 |

**表单字段（新增/编辑）：**

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| 设备编号 | 文本 | 是 | 系统自动生成，格式：`EQ-{年份}-{序号}` |
| 设备名称 | 文本 | 是 | 最长 64 字 |
| 设备分类 | 下拉（树） | 是 | 关联设备分类表 |
| 规格型号 | 文本 | 是 | |
| 生产厂家 | 文本 | 否 | |
| 出厂编号 | 文本 | 否 | 铭牌上的序列号 |
| 购置日期 | 日期 | 是 | |
| 购置金额 | 数字 | 否 | 单位：元 |
| 所在车间 | 下拉（部门树） | 是 | 关联部门表 |
| 存放位置 | 文本 | 否 | 如："一车间 A 区 03 号位" |
| 设备状态 | 单选 | 是 | 正常 / 维修中 / 保养中 / 停用 / 已报废 |
| 责任人 | 下拉（用户） | 否 | 关联用户表 |
| 设计使用寿命 | 数字 | 否 | 单位：年，设备厂家建议的设计使用寿命；已使用年限由系统根据购置日期自动计算展示 |
| 备注 | 多行文本 | 否 | |
| 设备图片 | 文件上传 | 否 | 最多 5 张，单张 ≤ 5MB |
| 设备文档 | 文件上传 | 否 | 说明书、图纸等 PDF |

**设备状态流转：**

```
正常 ──── 报修 ────► 维修中 ──── 验收通过 ────► 正常
  │                                               ▲
  ├── 计划保养 ──► 保养中 ──── 保养完成 ──────────┘
  │
  └── 管理员操作 ──► 停用 / 已报废
```

#### 4.1.3 设备二维码

**功能描述：** 为每台设备生成唯一二维码，扫码可快速查看设备信息和发起报修。

| 功能 | 描述 |
|------|------|
| 生成二维码 | 基于设备编号生成，包含设备 ID 和跳转链接 |
| 打印预览 | 支持单个/批量打印，标签样式可选（含设备名称、编号、二维码） |
| 扫码报修 | 手机扫码后跳转 H5 页面，预填设备信息，一键发起报修 |

---

### 4.2 工单管理模块

#### 4.2.1 报修工单 (`work_order`)

**功能描述：** 生产操作员或设备管理员发起维修申请，驱动维修闭环流程。

**工单状态流转：**

```
[待派工] ──── 维修班长派工 ────► [已派工] ──── 维修工接单 ────► [维修中]
                                                                    │
                                                                    ▼
              ┌── 验收不通过（退回返修） ── [待验收] ◄── 维修工提交完工
              ▼                                │
           [维修中]                        验收通过
                                               │
                                               ▼
                                           [已完成]

特殊终态：[已关闭] ◄── 任意非终态工单均可由维修班长/设备管理员手动关闭
```

**状态说明：**

| 状态 | 含义 |
|------|------|
| 已完成 | 验收通过，工单正常结束；设备恢复"正常"状态 |
| 已关闭 | 工单异常终结（如误报修撤销、设备已报废等），需填写关闭原因 |

> **变更说明（V1.0.1）：** 原设计验收不通过直接关闭，修正为退回"维修中"以支持返修；新增"已关闭"用于异常终结场景。

**工单字段：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| 工单编号 | 文本 | 自动生成，格式：`WO-{YYYYMMDD}-{序号}` |
| 报修设备 | 关联 | 关联设备台账，支持扫码快速填写 |
| 故障描述 | 多行文本 | 必填，描述故障现象 |
| 故障等级 | 单选 | 紧急 / 一般 / 低级（影响派工优先级） |
| 故障图片 | 上传 | 最多 3 张 |
| 报修人 | 自动填写 | 当前登录用户 |
| 报修时间 | 自动填写 | 系统时间 |
| 期望完成时间 | 日期时间 | 系统根据故障等级自动填充默认SLA（紧急：4h / 一般：24h / 低级：72h），可手动修改 |
| 指派维修工 | 下拉（用户） | 维修班长填写，筛选维修工角色 |
| 接单时间 | 自动填写 | 维修工点击"接单"时记录系统时间 |
| 维修记录 | 多行文本 | 维修工填写，描述维修过程和更换备件 |
| 使用备件 | 关联（多选） | 关联备件档案，填写数量，自动扣减库存 |
| 维修工时 | 数字 | 单位：小时 |
| 维修费用 | 数字 | 单位：元 |
| 验收意见 | 多行文本 | 维修班长填写 |
| 验收结果 | 单选 | 通过 / 不通过 |
| 关闭原因 | 多行文本 | 手动关闭工单时必填，说明关闭理由（如：误报修、设备已报废） |

**权限控制：**

| 操作 | 允许角色 |
|------|----------|
| 发起报修 | 生产操作员、设备管理员、维修班长 |
| 派工 | 维修班长 |
| 提交维修结果 | 被派工的维修工 |
| 验收 | 维修班长 |
| 查看所有工单 | 设备管理员、维修班长、超管 |
| 查看本线工单 | 生产操作员（仅看自己报修的） |
| 关闭工单 | 维修班长、设备管理员（需填写关闭原因） |

#### 4.2.2 工单列表视图

| 视图 | 描述 |
|------|------|
| 待我处理 | 当前用户需要操作的工单（待接单/待维修/待验收） |
| 全部工单 | 完整工单列表，支持多条件筛选和导出 |
| 本月统计 | 快速显示本月工单总量、完成率、平均响应时长 |

---

### 4.3 保养管理模块

#### 4.3.1 保养计划模板 (`maintain_plan_template`)

**功能描述：** 为不同设备分类配置标准保养项目和周期，是自动生成保养工单的规则来源。

**模板字段：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| 模板名称 | 文本 | 如："数控车床月度保养" |
| 适用设备分类 | 下拉（设备分类树） | 可选多个 |
| 保养周期 | 单选 | 日 / 周 / 月 / 季度 / 年 |
| 提前提醒天数 | 数字 | 提前 N 天生成保养工单 |
| 保养项目 | 表格（可增减行） | 每行：项目名称 + 保养标准描述 + 参考工时 |
| 备注 | 文本 | |

**保养项目示例（数控车床月度保养）：**

| 序号 | 保养项目 | 保养标准 | 参考工时(h) |
|------|----------|----------|------------|
| 1 | 导轨清洁润滑 | 用棉布擦净导轨油污，加注 32# 导轨油，均匀涂抹 | 0.5 |
| 2 | 主轴油位检查 | 检查油位计，低于下限须补充 68# 主轴油至上限 | 0.2 |
| 3 | 卡盘夹爪润滑 | 使用黄油枪向各润滑点注入润滑脂 | 0.3 |
| 4 | 过滤器清洗 | 取出冷却液过滤网，清水冲洗晾干后装回 | 0.5 |
| 5 | 行程开关检查 | 手动触发各轴行程开关，验证动作正常 | 0.3 |

#### 4.3.2 保养工单 (`maintain_order`)

**功能描述：** 系统根据模板自动生成，或手动创建的保养任务单。

- 每日 00:00 系统自动扫描所有设备，根据保养计划生成到期工单
- 自动工单状态默认为【待派工】，发送通知给设备管理员
- 手动工单支持设备管理员指定设备直接创建

**保养工单流转与维修工单一致：** 待派工 → 已派工 → 保养中 → 待验收 → 已完成

**执行记录：** 维修工须逐项勾选保养项目完成情况，填写异常备注，上传现场照片（可选）。

---

### 4.4 备件管理模块

#### 4.4.1 备件档案 (`spare_part`)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| 备件编号 | 文本 | 自动生成，格式：`SP-{序号}` |
| 备件名称 | 文本 | 必填 |
| 规格型号 | 文本 | |
| 单位 | 文本 | 个/套/米/升 |
| 适用设备分类 | 多选 | 关联设备分类 |
| 当前库存 | 数字 | 实时更新，不可手动修改 |
| 库存下限 | 数字 | 低于此值触发预警 |
| 存放位置 | 文本 | 如："备件库 A 架 3 层" |
| 参考单价 | 数字 | 元 |
| 供应商 | 文本 | |

#### 4.4.2 入库管理 (`spare_in_record`)

| 功能 | 描述 |
|------|------|
| 新增入库 | 选择备件 + 数量 + 入库原因（采购入库/退库）+ 经手人 |
| 入库记录列表 | 分页查询，按时间/备件/经手人筛选 |
| 导出 Excel | 支持按日期范围导出 |

#### 4.4.3 出库管理 (`spare_out_record`)

| 功能 | 描述 |
|------|------|
| 手动出库 | 选择备件 + 数量 + 出库原因 + 领用人，库存实时扣减 |
| 工单联动出库 | 工单维修记录填写备件后自动生成出库记录 |
| 出库记录列表 | 同入库列表 |

#### 4.4.4 库存预警

- 每次出库操作完成后，系统实时判断该备件库存是否 ≤ 库存下限，若触发则立即标记为【低库存】状态并发送站内通知给设备管理员
- 每日 06:00 执行一次全量库存巡检作为兜底机制，防止因数据不一致导致预警遗漏
- 设备管理员登录时在页面顶部显示低库存预警气泡提醒（数量角标）
- 支持从预警列表一键发起采购申请（生成待采购记录，本期不打通采购流程）

---

### 4.5 数据看板模块

**功能描述：** 首页大屏，展示核心运营指标，支持按时间范围（本周/本月/本季度）筛选。

**看板卡片（共 8 个核心指标）：**

| 指标 | 展示形式 | 计算逻辑 |
|------|----------|----------|
| 设备总数 / 在役设备数 | 数字卡片 | 台账统计 |
| 本月工单总量 | 数字 + 同比箭头 | 工单表统计 |
| 设备可用率 | 环形图 | （计划运行时间 - 维修停机时间）/ 计划运行时间 × 100%；维修停机时间 = 工单"维修中"状态持续时长之和；计划运行时间 = 当月日历天数 × 每日计划运行小时数（系统参数，默认 12h） |
| 工单按时完成率 | 环形图 | 已设置期望完成时间的工单中，实际完成时间 ≤ 期望时间的占比；未设期望时间的工单不计入分母，需显示样本量 |
| 平均维修响应时长 | 数字（小时） | 接单时间 - 报修时间，平均值 |
| 工单状态分布 | 柱状图 | 各状态工单数量 |
| 设备故障排行 | 横向柱状图 TOP5 | 按工单量排名的设备 |
| 本月维修费用趋势 | 折线图 | 按天汇总维修费用 |
| 备件消耗 TOP10 | 表格 | 本月出库数量前 10 备件 |

---

## 5. 系统管理模块（基础框架复用）

> 本模块直接复用《后台管理系统开发指南》的基础框架实现，无需重新设计，仅在角色和部门配置上结合工厂场景做初始化设置。

| 子模块 | 复用指南章节 | 工厂场景定制说明 |
|--------|--------------|-----------------|
| 用户管理 | 2.2 用户管理 | 新增"工号"字段；导入时支持按工厂 Excel 名册格式 |
| 角色管理 | 2.2 角色管理 | 预置 4.1 节定义的 6 个角色，按指南 RBAC 模型配权 |
| 部门管理 | 2.2 部门管理 | 按 2.2 节的工厂组织架构初始化部门树 |
| 菜单管理 | 2.2 菜单管理 | 按本 PRD 模块架构配置菜单和按钮权限 |
| 操作日志 | 2.2 系统监控 | 重点记录：工单状态变更、备件出库、设备状态变更 |
| 登录日志 | 2.2 系统监控 | 无定制 |
| 在线用户 | 2.2 系统监控 | 无定制 |
| 消息通知 | — | 新增模块，详见下方 |

### 5.1 消息通知子模块（新增）

> **变更说明（V1.0.1）：** 新增站内消息通知模块，为工单流转、保养提醒、库存预警等业务场景提供统一的通知能力。

**通知渠道（V1.0）：** 站内消息（页面右上角通知铃铛），显示未读消息数量角标。

**触发场景：**

| 触发事件 | 通知接收人 | 通知内容模板 |
|----------|-----------|-------------|
| 工单派工 | 被指派的维修工 | "您有新的维修工单 {工单编号}，设备 {设备名称}，故障等级：{等级}" |
| 维修工提交完工 | 维修班长 | "工单 {工单编号} 已提交维修完工，请及时验收" |
| 验收不通过（退回） | 被指派的维修工 | "工单 {工单编号} 验收未通过，原因：{验收意见}，请重新维修" |
| 保养工单自动生成 | 设备管理员 | "设备 {设备名称} 已自动生成保养工单 {工单编号}，计划保养日期 {日期}" |
| 库存预警 | 设备管理员 | "备件 {备件名称} 当前库存 {数量}，已低于预警值 {下限}" |

**页面功能：**

| 功能 | 描述 |
|------|------|
| 通知铃铛 | 页面右上角常驻，显示未读数角标，点击展开最近 10 条通知 |
| 通知列表页 | 全部通知的分页列表，支持按类型/已读状态筛选 |
| 标记已读 | 支持单条标记和全部标记已读 |
| 点击跳转 | 点击通知自动跳转到关联的工单详情页 |

**后续版本规划（不在V1.0范围）：** 企业微信/钉钉推送、邮件通知、自定义通知订阅偏好。

---

## 6. 数据库设计

### 6.1 新增业务表清单

| 表名 | 中文名 | 说明 |
|------|--------|------|
| `equip_category` | 设备分类 | 树形结构，含 `parent_id` |
| `equip_info` | 设备台账 | 核心设备档案表 |
| `work_order` | 维修工单 | 维修全流程记录 |
| `work_order_spare` | 工单用料 | 工单与备件的关联（多对多中间表） |
| `maintain_template` | 保养模板 | 保养计划规则 |
| `maintain_template_item` | 保养项目 | 模板下的具体保养项目 |
| `maintain_template_category` | 保养模板适用分类 | 保养模板与设备分类的多对多关联表 |
| `maintain_order` | 保养工单 | 保养执行记录（关联模板） |
| `maintain_order_item` | 保养项执行记录 | 每项保养的完成情况 |
| `spare_part` | 备件档案 | 备件主数据 |
| `spare_in_record` | 备件入库记录 | |
| `spare_out_record` | 备件出库记录 | |
| `spare_part_category` | 备件适用分类 | 备件与设备分类的多对多关联表 |
| `sys_attachment` | 系统附件 | 通用文件附件表，支持设备图片/文档、工单故障图片、保养现场照片等 |
| `sys_notification` | 系统通知 | 站内消息通知表 |

### 6.2 核心表结构

#### 设备台账表 `equip_info`

```sql
CREATE TABLE equip_info (
    id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '设备ID',
    equip_no      VARCHAR(32)  NOT NULL UNIQUE COMMENT '设备编号，如 EQ-2026-0001',
    equip_name    VARCHAR(64)  NOT NULL COMMENT '设备名称',
    category_id   BIGINT       NOT NULL COMMENT '设备分类ID',
    model         VARCHAR(64)  NOT NULL COMMENT '规格型号',
    manufacturer  VARCHAR(64)  COMMENT '生产厂家',
    serial_no     VARCHAR(64)  COMMENT '出厂编号',
    purchase_date DATE         NOT NULL COMMENT '购置日期',
    purchase_cost DECIMAL(12,2) COMMENT '购置金额（元）',
    dept_id       BIGINT       NOT NULL COMMENT '所在部门（车间）',
    location      VARCHAR(128) COMMENT '存放位置',
    status        TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：1正常 2维修中 3保养中 4停用 5已报废',
    owner_id      BIGINT       COMMENT '责任人用户ID',
    design_life   TINYINT      COMMENT '设计使用寿命（年）',
    remark        VARCHAR(512) COMMENT '备注',
    deleted       TINYINT      NOT NULL DEFAULT 0,
    create_by     BIGINT       COMMENT '创建人',
    create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_by     BIGINT       COMMENT '更新人',
    update_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category_id),
    INDEX idx_dept (dept_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备台账';
```

#### 维修工单表 `work_order`

```sql
CREATE TABLE work_order (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_no        VARCHAR(32)  NOT NULL UNIQUE COMMENT '工单编号，如 WO-20260327-0001',
    equip_id        BIGINT       NOT NULL COMMENT '报修设备ID',
    fault_desc      VARCHAR(512) NOT NULL COMMENT '故障描述',
    fault_level     TINYINT      NOT NULL DEFAULT 2 COMMENT '故障等级：1紧急 2一般 3低级',
    status          TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：1待派工 2已派工 3维修中 4待验收 5已完成 6已关闭',
    report_user_id  BIGINT       NOT NULL COMMENT '报修人ID',
    report_time     DATETIME     NOT NULL COMMENT '报修时间',
    expected_time   DATETIME     NOT NULL COMMENT '期望完成时间，根据故障等级自动填充SLA默认值',
    assign_user_id  BIGINT       COMMENT '指派维修工ID',
    assign_time     DATETIME     COMMENT '派工时间',
    receive_time    DATETIME     COMMENT '维修工接单时间',
    repair_desc     VARCHAR(1024) COMMENT '维修记录',
    repair_hours    DECIMAL(5,1) COMMENT '维修工时（小时）',
    repair_cost     DECIMAL(10,2) COMMENT '维修费用（元）',
    finish_time     DATETIME     COMMENT '维修完成时间',
    accept_user_id  BIGINT       COMMENT '验收人ID',
    accept_time     DATETIME     COMMENT '验收时间',
    accept_result   TINYINT      COMMENT '验收结果：1通过 2不通过',
    accept_remark   VARCHAR(256) COMMENT '验收意见',
    close_reason    VARCHAR(512) COMMENT '关闭原因（手动关闭时必填）',
    deleted         TINYINT      NOT NULL DEFAULT 0,
    create_time     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_equip (equip_id),
    INDEX idx_status (status),
    INDEX idx_report_user (report_user_id),
    INDEX idx_assign_user (assign_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='维修工单';
```

#### 备件档案表 `spare_part`

```sql
CREATE TABLE spare_part (
    id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    part_no       VARCHAR(32)  NOT NULL UNIQUE COMMENT '备件编号，如 SP-0001',
    part_name     VARCHAR(64)  NOT NULL COMMENT '备件名称',
    spec          VARCHAR(128) COMMENT '规格型号',
    unit          VARCHAR(16)  NOT NULL DEFAULT '个' COMMENT '计量单位',
    stock_qty     INT          NOT NULL DEFAULT 0 COMMENT '当前库存数量',
    stock_min     INT          NOT NULL DEFAULT 0 COMMENT '库存下限（预警值）',
    location      VARCHAR(128) COMMENT '存放位置',
    unit_price    DECIMAL(10,2) COMMENT '参考单价（元）',
    supplier      VARCHAR(128) COMMENT '供应商',
    remark        VARCHAR(256) COMMENT '备注',
    deleted       TINYINT      NOT NULL DEFAULT 0,
    create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='备件档案';
```

#### 保养模板表 `maintain_template`

```sql
CREATE TABLE maintain_template (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    template_name   VARCHAR(64)  NOT NULL COMMENT '模板名称，如：数控车床月度保养',
    cycle_type      TINYINT      NOT NULL COMMENT '保养周期：1日 2周 3月 4季度 5年',
    advance_days    INT          NOT NULL DEFAULT 3 COMMENT '提前生成工单天数',
    remark          VARCHAR(512) COMMENT '备注',
    status          TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：1启用 0停用',
    deleted         TINYINT      NOT NULL DEFAULT 0,
    create_by       BIGINT       COMMENT '创建人',
    create_time     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_by       BIGINT       COMMENT '更新人',
    update_time     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='保养模板';
```

#### 保养模板与设备分类关联表 `maintain_template_category`

```sql
CREATE TABLE maintain_template_category (
    id            BIGINT  NOT NULL AUTO_INCREMENT PRIMARY KEY,
    template_id   BIGINT  NOT NULL COMMENT '保养模板ID',
    category_id   BIGINT  NOT NULL COMMENT '设备分类ID',
    UNIQUE INDEX uk_template_category (template_id, category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='保养模板适用设备分类';
```

#### 保养项目表 `maintain_template_item`

```sql
CREATE TABLE maintain_template_item (
    id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    template_id   BIGINT       NOT NULL COMMENT '所属模板ID',
    item_name     VARCHAR(64)  NOT NULL COMMENT '保养项目名称',
    item_standard VARCHAR(256) COMMENT '保养标准描述',
    ref_hours     DECIMAL(5,1) COMMENT '参考工时（小时）',
    sort_order    INT          NOT NULL DEFAULT 0 COMMENT '排序',
    INDEX idx_template (template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='保养模板项目';
```

#### 保养工单表 `maintain_order`

```sql
CREATE TABLE maintain_order (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_no        VARCHAR(32)  NOT NULL UNIQUE COMMENT '保养工单编号，如 MO-20260327-0001',
    template_id     BIGINT       NOT NULL COMMENT '关联保养模板ID',
    equip_id        BIGINT       NOT NULL COMMENT '保养设备ID',
    status          TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：1待派工 2已派工 3保养中 4待验收 5已完成 6已关闭',
    plan_date       DATE         NOT NULL COMMENT '计划保养日期',
    source          TINYINT      NOT NULL DEFAULT 1 COMMENT '来源：1系统自动 2手动创建',
    assign_user_id  BIGINT       COMMENT '指派维修工ID',
    assign_time     DATETIME     COMMENT '派工时间',
    receive_time    DATETIME     COMMENT '接单时间',
    finish_time     DATETIME     COMMENT '保养完成时间',
    accept_user_id  BIGINT       COMMENT '验收人ID',
    accept_time     DATETIME     COMMENT '验收时间',
    accept_result   TINYINT      COMMENT '验收结果：1通过 2不通过',
    accept_remark   VARCHAR(256) COMMENT '验收意见',
    close_reason    VARCHAR(512) COMMENT '关闭原因',
    remark          VARCHAR(512) COMMENT '备注',
    deleted         TINYINT      NOT NULL DEFAULT 0,
    create_time     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_equip (equip_id),
    INDEX idx_template (template_id),
    INDEX idx_status (status),
    INDEX idx_plan_date (plan_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='保养工单';
```

#### 保养项执行记录表 `maintain_order_item`

```sql
CREATE TABLE maintain_order_item (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT       NOT NULL COMMENT '保养工单ID',
    template_item_id BIGINT      NOT NULL COMMENT '关联保养模板项目ID',
    item_name       VARCHAR(64)  NOT NULL COMMENT '保养项目名称（冗余存储）',
    is_done         TINYINT      NOT NULL DEFAULT 0 COMMENT '是否完成：0否 1是',
    abnormal_remark VARCHAR(256) COMMENT '异常备注',
    INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='保养项执行记录';
```

#### 备件适用分类关联表 `spare_part_category`

```sql
CREATE TABLE spare_part_category (
    id            BIGINT  NOT NULL AUTO_INCREMENT PRIMARY KEY,
    spare_id      BIGINT  NOT NULL COMMENT '备件ID',
    category_id   BIGINT  NOT NULL COMMENT '设备分类ID',
    UNIQUE INDEX uk_spare_category (spare_id, category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='备件适用设备分类';
```

#### 通用附件表 `sys_attachment`

```sql
CREATE TABLE sys_attachment (
    id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    biz_type      VARCHAR(32)  NOT NULL COMMENT '业务类型：equip_photo/equip_doc/work_order_photo/maintain_photo',
    biz_id        BIGINT       NOT NULL COMMENT '业务ID（设备ID/工单ID等）',
    file_name     VARCHAR(256) NOT NULL COMMENT '原始文件名',
    file_path     VARCHAR(512) NOT NULL COMMENT '存储路径',
    file_size     BIGINT       COMMENT '文件大小（字节）',
    file_type     VARCHAR(32)  COMMENT '文件类型（MIME）',
    sort_order    INT          NOT NULL DEFAULT 0 COMMENT '排序',
    create_by     BIGINT       COMMENT '上传人',
    create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_biz (biz_type, biz_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通用附件';
```

#### 系统通知表 `sys_notification`

```sql
CREATE TABLE sys_notification (
    id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT       NOT NULL COMMENT '接收用户ID',
    title         VARCHAR(128) NOT NULL COMMENT '通知标题',
    content       VARCHAR(512) NOT NULL COMMENT '通知内容',
    noti_type     TINYINT      NOT NULL COMMENT '通知类型：1工单派工 2工单验收 3保养提醒 4库存预警',
    biz_type      VARCHAR(32)  COMMENT '关联业务类型',
    biz_id        BIGINT       COMMENT '关联业务ID',
    is_read       TINYINT      NOT NULL DEFAULT 0 COMMENT '已读状态：0未读 1已读',
    read_time     DATETIME     COMMENT '阅读时间',
    create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_read (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统通知';
```

### 6.3 ER 关系图（业务表）

```
equip_category ◄──── equip_info ────► sys_dept
     (1:N)        │       │              (N:1)
                  │       │
     spare_part_category  sys_attachment（通用附件，多业务关联）
         │                     │
         ▼                     ▼
    spare_part       设备图片/文档/工单故障图片/保养照片
         │
         │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
         work_order  maintain_order  sys_user
              │           │         (责任人)
              │           │
              ▼           ▼
     work_order_spare  maintain_order_item
              │
              ▼
         spare_part ◄──── spare_in_record
              │            spare_out_record
              └──────────────────┘

maintain_template ──► maintain_template_item
       │
       ▼
maintain_template_category ──► equip_category

sys_notification ──► sys_user（接收人）
```

---

## 7. 接口规范设计

> 遵循《后台管理系统开发指南》统一 RESTful 规范，所有接口均需 JWT 鉴权。

### 7.1 设备台账接口

| 方法 | 路径 | 说明 | 权限标识 |
|------|------|------|----------|
| GET | `/api/equip/list` | 分页查询设备列表 | `equip:list` |
| GET | `/api/equip/{id}` | 获取设备详情 | `equip:query` |
| POST | `/api/equip` | 新增设备 | `equip:add` |
| PUT | `/api/equip/{id}` | 编辑设备 | `equip:edit` |
| DELETE | `/api/equip/{ids}` | 删除设备（支持批量） | `equip:remove` |
| POST | `/api/equip/import` | Excel 导入 | `equip:import` |
| GET | `/api/equip/export` | Excel 导出 | `equip:export` |
| GET | `/api/equip/{id}/qrcode` | 生成设备二维码 | `equip:query` |

### 7.2 工单接口

| 方法 | 路径 | 说明 | 权限标识 |
|------|------|------|----------|
| GET | `/api/workorder/list` | 分页查询工单列表 | `workorder:list` |
| GET | `/api/workorder/{id}` | 工单详情 | `workorder:query` |
| POST | `/api/workorder` | 发起报修 | `workorder:add` |
| PUT | `/api/workorder/{id}/assign` | 派工 | `workorder:assign` |
| PUT | `/api/workorder/{id}/submit` | 提交维修完工 | `workorder:submit` |
| PUT | `/api/workorder/{id}/accept` | 验收工单 | `workorder:accept` |
| PUT | `/api/workorder/{id}/close` | 关闭工单（需关闭原因） | `workorder:close` |
| GET | `/api/workorder/my-todo` | 查询待我处理工单 | `workorder:list` |

### 7.3 统一响应格式（复用指南）

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "records": [],
    "total": 100,
    "pageNum": 1,
    "pageSize": 20
  }
}
```

---

## 8. 非功能性需求

### 8.1 性能需求

| 指标 | 要求 |
|------|------|
| 列表接口响应时间 | P95 ≤ 500ms（数据量 10 万条以内） |
| 看板数据加载时间 | ≤ 2 秒 |
| 并发用户数 | 常态 50 人同时在线，峰值（交班时段）支持 100 人同时在线（工厂内网环境） |
| 文件上传限制 | 单文件 ≤ 20MB |

### 8.2 安全需求

- JWT 鉴权，Token 有效期 2 小时，Refresh Token 7 天（复用指南实现）
- 所有按钮操作需配置按钮级别权限（`@PreAuthorize`）
- 敏感操作（删除设备、备件出库）需记录操作日志
- 密码存储使用 BCrypt 加密

### 8.3 可用性需求

- 系统可用性 ≥ 99%（工厂生产时间 7×12 小时）
- 支持 Chrome 90+、Edge 90+ 浏览器
- 页面支持响应式布局，手机端可正常使用工单报修和查询功能

### 8.4 数据需求

- 工单数据保留 3 年
- 操作日志保留 1 年
- 每日 02:00 自动备份数据库（Docker 挂载卷）

---

## 9. 开发计划与里程碑

> 基于《后台管理系统开发指南》的 6 周开发计划，在原有框架上叠加业务模块开发。

| 阶段 | 时间 | 任务内容 | 交付物 |
|------|------|----------|--------|
| **第一阶段** | 第 1 周 | 环境搭建（同指南）；数据库建表；完成设备分类管理 | Hello World 项目；DDL 脚本 |
| **第二阶段** | 第 2 周 | 系统管理基础框架（用户/角色/部门/菜单）；初始化工厂角色和部门数据 | 可登录的基础后台 |
| **第三阶段 A** | 第 3 周 | 设备台账 CRUD；设备状态管理；Excel 导入导出 | 设备台账功能上线 |
| **第三阶段 B** | 第 4 周 | 维修工单完整流程（报修→派工→维修→验收）；备件档案和出入库 | 工单闭环功能上线 |
| **第三阶段 C** | 第 5 周 | 保养计划模板；保养工单自动生成；库存预警 | 保养管理功能上线 |
| **第四阶段** | 第 6 周 | 数据看板图表；设备二维码；系统整体测试；Docker 部署 | 全功能系统 + 部署文档 |

### 9.1 关键里程碑

| 里程碑 | 目标日期 | 验收标准 |
|--------|----------|----------|
| M1：基础框架可用 | 第 2 周末 | 可用账号登录，菜单正常显示，角色权限生效 |
| M2：工单流程完整 | 第 4 周末 | 完整走通一个报修→验收闭环，操作日志可查 |
| M3：全功能上线 | 第 6 周末 | 所有 P0/P1 功能完成，Docker 一键部署成功 |

---

## 10. 附录：术语表

| 术语 | 解释 |
|------|------|
| CMMS | Computerized Maintenance Management System，计算机化维护管理系统 |
| 设备可用率 | （计划运行时间 - 维修停机时间）/ 计划运行时间 × 100%，V1.0 基于工单维修时长近似计算 |
| 预防性维护（PM） | 按计划定期对设备进行检查、清洁、润滑、调整，以预防故障发生 |
| 纠正性维修（CM） | 设备发生故障后的修复性维修，即本系统的"报修工单" |
| RBAC | Role-Based Access Control，基于角色的访问控制 |
| 逻辑删除 | 数据不物理删除，通过 `deleted` 字段标记为已删除（复用指南实现） |

---

> **文档变更记录**
>
> | 版本 | 日期 | 变更内容 | 修改人 |
> |------|------|----------|--------|
> | V1.0.0 | 2026-03-27 | 初稿创建 | — |
> | V1.0.1 | 2026-03-27 | 评审修订：修正工单状态流转（验收不通过退回返修）；稼动率改为设备可用率；期望完成时间改为SLA自动填充；补充附件表/备件分类关联表/保养表DDL/通知表；修正DDL与表单必填不一致；使用年限改为设计使用寿命；库存预警改为事件驱动；新增消息通知模块；新增工单关闭机制 | — |
