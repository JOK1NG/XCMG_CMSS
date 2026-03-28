# CMMS 原型落地文档（细化版）
## 页面字段明细 + 接口请求/响应示例 JSON

## 1. 文档说明

本文档是在《CMMS 页面清单 + 接口清单 + 开发顺序表》基础上的细化版本，重点补充两类开发最需要的内容：

- 每个页面的字段明细
- 每个接口的请求/响应示例 JSON

适用对象：

- 前端开发
- 后端开发
- 联调人员
- 测试人员
- 项目负责人

---

## 2. 统一约定

## 2.1 通用响应结构

建议所有后端接口统一返回以下结构：

```json
{
  "code": 200,
  "msg": "success",
  "data": {}
}
```

分页接口统一为：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [],
    "pageNum": 1,
    "pageSize": 10,
    "total": 0
  }
}
```

---

## 2.2 通用枚举建议

### 设备状态
```json
[
  { "value": 1, "label": "正常" },
  { "value": 2, "label": "维修中" },
  { "value": 3, "label": "保养中" },
  { "value": 4, "label": "停用" },
  { "value": 5, "label": "已报废" }
]
```

### 工单状态
```json
[
  { "value": 1, "label": "待派工" },
  { "value": 2, "label": "已派工" },
  { "value": 3, "label": "维修中" },
  { "value": 4, "label": "待验收" },
  { "value": 5, "label": "已完成" },
  { "value": 6, "label": "已关闭" }
]
```

### 故障等级
```json
[
  { "value": 1, "label": "紧急" },
  { "value": 2, "label": "一般" },
  { "value": 3, "label": "低级" }
]
```

### 通用状态
```json
[
  { "value": 1, "label": "启用" },
  { "value": 0, "label": "停用" }
]
```

---

## 3. 登录页

## 3.1 页面字段明细

### 表单字段

| 字段名 | 前端字段 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| 用户名 | username | string | 是 | 登录账号 |
| 密码 | password | string | 是 | 登录密码 |

### 页面按钮
| 按钮名称 | 动作 | 接口 |
|---|---|---|
| 登录 | 提交登录 | POST /api/auth/login |

---

## 3.2 接口明细

### 3.2.1 用户登录

- 方法：POST
- 地址：`/api/auth/login`

请求示例：

```json
{
  "username": "admin",
  "password": "123456"
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.xxx.yyy",
    "userId": 1,
    "username": "admin",
    "realName": "系统管理员"
  }
}
```

失败响应示例：

```json
{
  "code": 401,
  "msg": "用户名或密码错误",
  "data": null
}
```

---

### 3.2.2 获取当前用户信息

- 方法：GET
- 地址：`/api/auth/me`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "userId": 1,
    "username": "admin",
    "realName": "系统管理员",
    "deptId": 1,
    "deptName": "设备部",
    "roleList": [
      {
        "roleId": 1,
        "roleName": "超级管理员"
      }
    ],
    "phone": "13800000000"
  }
}
```

---

### 3.2.3 获取当前用户菜单权限

- 方法：GET
- 地址：`/api/auth/menus`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "menuId": 1,
      "menuName": "数据看板",
      "path": "/dashboard",
      "component": "dashboard/index",
      "icon": "LayoutDashboard",
      "children": []
    },
    {
      "menuId": 2,
      "menuName": "设备管理",
      "path": "/equipment",
      "component": "Layout",
      "icon": "Settings",
      "children": [
        {
          "menuId": 21,
          "menuName": "设备台账",
          "path": "/equipment/list",
          "component": "equipment/list"
        }
      ]
    }
  ]
}
```

---

## 4. 数据看板页

## 4.1 页面字段明细

### KPI 卡片字段

| 展示项 | 前端字段 | 类型 | 说明 |
|---|---|---|---|
| 在役设备数 | runningEquipmentCount | number | 正常在用设备总数 |
| 本月工单数 | monthWorkOrderCount | number | 本月新建工单数量 |
| 设备可用率 | availabilityRate | number | 百分比 |
| 平均响应时长 | avgResponseHours | number | 单位：小时 |

### 费用趋势图字段

| 字段名 | 前端字段 | 类型 | 说明 |
|---|---|---|---|
| 日期 | statDate | string | yyyy-MM-dd |
| 费用 | costAmount | number | 维修费用 |

### 工单状态分布字段

| 字段名 | 前端字段 | 类型 | 说明 |
|---|---|---|---|
| 状态值 | status | number | 枚举值 |
| 状态名称 | statusLabel | string | 中文名称 |
| 数量 | count | number | 工单数量 |

### 故障排行字段

| 字段名 | 前端字段 | 类型 | 说明 |
|---|---|---|---|
| 设备ID | equipmentId | number | 设备主键 |
| 设备名称 | equipmentName | string | 设备名称 |
| 故障次数 | faultCount | number | 时间范围内次数 |

### 备件消耗排行字段

| 字段名 | 前端字段 | 类型 | 说明 |
|---|---|---|---|
| 备件ID | spareId | number | 备件主键 |
| 备件名称 | spareName | string | 名称 |
| 消耗数量 | consumeQty | number | 时间范围内数量 |

---

## 4.2 接口明细

### 4.2.1 获取看板汇总数据

- 方法：GET
- 地址：`/api/dashboard/summary`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "runningEquipmentCount": 42,
    "monthWorkOrderCount": 30,
    "availabilityRate": 94.6,
    "avgResponseHours": 1.8
  }
}
```

---

### 4.2.2 获取维修费用趋势

- 方法：GET
- 地址：`/api/dashboard/cost-trend?startDate=2026-03-01&endDate=2026-03-31`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": [
    { "statDate": "2026-03-21", "costAmount": 1200 },
    { "statDate": "2026-03-22", "costAmount": 850 },
    { "statDate": "2026-03-23", "costAmount": 2100 }
  ]
}
```

---

### 4.2.3 获取工单状态分布

- 方法：GET
- 地址：`/api/dashboard/workorder-status`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": [
    { "status": 1, "statusLabel": "待派工", "count": 3 },
    { "status": 2, "statusLabel": "已派工", "count": 2 },
    { "status": 3, "statusLabel": "维修中", "count": 4 },
    { "status": 4, "statusLabel": "待验收", "count": 2 },
    { "status": 5, "statusLabel": "已完成", "count": 18 }
  ]
}
```

---

### 4.2.4 获取设备故障排行

- 方法：GET
- 地址：`/api/dashboard/fault-rank`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": [
    { "equipmentId": 2, "equipmentName": "加工中心 VMC850", "faultCount": 5 },
    { "equipmentId": 1, "equipmentName": "CNC 数控车床 #1", "faultCount": 4 }
  ]
}
```

---

### 4.2.5 获取备件消耗排行

- 方法：GET
- 地址：`/api/dashboard/spare-rank`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": [
    { "spareId": 1, "spareName": "主轴轴承 7210C", "consumeQty": 8 },
    { "spareId": 4, "spareName": "液压油滤芯", "consumeQty": 6 }
  ]
}
```

---

## 5. 设备台账页

## 5.1 页面字段明细

### 查询条件字段

| 字段名 | 前端字段 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| 关键字 | keyword | string | 否 | 可搜设备编号/设备名称 |
| 设备分类ID | categoryId | number | 否 | 下拉筛选 |
| 设备状态 | status | number | 否 | 枚举 |
| 所在车间ID | workshopId | number | 否 | 下拉筛选 |
| 页码 | pageNum | number | 是 | 分页参数 |
| 每页条数 | pageSize | number | 是 | 分页参数 |

### 列表字段

| 显示名称 | 前端字段 | 类型 | 说明 |
|---|---|---|---|
| 设备ID | id | number | 主键 |
| 设备编号 | equipmentCode | string | 唯一业务编号 |
| 设备名称 | equipmentName | string | 名称 |
| 分类ID | categoryId | number | 分类主键 |
| 分类名称 | categoryName | string | 分类展示 |
| 规格型号 | model | string | 型号 |
| 所在车间ID | workshopId | number | 主键 |
| 所在车间 | workshopName | string | 展示字段 |
| 状态 | status | number | 枚举 |
| 状态名称 | statusLabel | string | 展示字段 |
| 购置日期 | purchaseDate | string | yyyy-MM-dd |

### 新增/编辑表单字段

| 字段名 | 前端字段 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| 设备编号 | equipmentCode | string | 是 | 唯一 |
| 设备名称 | equipmentName | string | 是 | - |
| 分类ID | categoryId | number | 是 | 关联分类 |
| 规格型号 | model | string | 否 | - |
| 制造商 | manufacturer | string | 否 | - |
| 所在车间ID | workshopId | number | 是 | - |
| 存放位置 | location | string | 否 | - |
| 购置日期 | purchaseDate | string | 否 | yyyy-MM-dd |
| 启用日期 | startUseDate | string | 否 | yyyy-MM-dd |
| 状态 | status | number | 是 | 默认正常 |
| 备注 | remark | string | 否 | 最长 500 字 |

### 详情字段

```json
{
  "id": 1,
  "equipmentCode": "EQ-2026-0001",
  "equipmentName": "CNC 数控车床 #1",
  "categoryId": 1,
  "categoryName": "数控车床",
  "model": "CK6140",
  "manufacturer": "沈阳机床",
  "workshopId": 1,
  "workshopName": "一车间",
  "location": "A区01号位",
  "purchaseDate": "2021-03-15",
  "startUseDate": "2021-04-01",
  "status": 1,
  "statusLabel": "正常",
  "remark": "主生产设备"
}
```

---

## 5.2 接口明细

### 5.2.1 查询设备分页列表

- 方法：GET
- 地址：`/api/equipment/page`

请求参数示例：

```json
{
  "pageNum": 1,
  "pageSize": 10,
  "keyword": "数控车床",
  "categoryId": 1,
  "status": 1,
  "workshopId": 1
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "equipmentCode": "EQ-2026-0001",
        "equipmentName": "CNC 数控车床 #1",
        "categoryId": 1,
        "categoryName": "数控车床",
        "model": "CK6140",
        "workshopId": 1,
        "workshopName": "一车间",
        "status": 1,
        "statusLabel": "正常",
        "purchaseDate": "2021-03-15"
      }
    ],
    "pageNum": 1,
    "pageSize": 10,
    "total": 42
  }
}
```

---

### 5.2.2 获取设备详情

- 方法：GET
- 地址：`/api/equipment/1`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 1,
    "equipmentCode": "EQ-2026-0001",
    "equipmentName": "CNC 数控车床 #1",
    "categoryId": 1,
    "categoryName": "数控车床",
    "model": "CK6140",
    "manufacturer": "沈阳机床",
    "workshopId": 1,
    "workshopName": "一车间",
    "location": "A区01号位",
    "purchaseDate": "2021-03-15",
    "startUseDate": "2021-04-01",
    "status": 1,
    "statusLabel": "正常",
    "remark": "主生产设备"
  }
}
```

---

### 5.2.3 新增设备

- 方法：POST
- 地址：`/api/equipment`

请求示例：

```json
{
  "equipmentCode": "EQ-2026-0009",
  "equipmentName": "卧式加工中心 HMC63",
  "categoryId": 2,
  "model": "HMC63",
  "manufacturer": "大连机床",
  "workshopId": 1,
  "location": "A区09号位",
  "purchaseDate": "2024-08-01",
  "startUseDate": "2024-08-20",
  "status": 1,
  "remark": "新增设备"
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "新增成功",
  "data": {
    "id": 9
  }
}
```

---

### 5.2.4 编辑设备

- 方法：PUT
- 地址：`/api/equipment/9`

请求示例：

```json
{
  "equipmentName": "卧式加工中心 HMC63-改",
  "categoryId": 2,
  "model": "HMC63",
  "manufacturer": "大连机床",
  "workshopId": 1,
  "location": "A区10号位",
  "purchaseDate": "2024-08-01",
  "startUseDate": "2024-08-20",
  "status": 1,
  "remark": "位置已调整"
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "修改成功",
  "data": true
}
```

---

### 5.2.5 删除设备

- 方法：DELETE
- 地址：`/api/equipment/9`

响应示例：

```json
{
  "code": 200,
  "msg": "删除成功",
  "data": true
}
```

---

## 6. 设备分类页

## 6.1 页面字段明细

| 字段名 | 前端字段 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| 分类ID | id | number | 否 | 主键 |
| 分类名称 | categoryName | string | 是 | 如数控车床 |
| 分类编码 | categoryCode | string | 是 | 唯一编码 |
| 排序号 | sortNo | number | 否 | 默认 0 |
| 状态 | status | number | 是 | 1 启用 0 停用 |
| 备注 | remark | string | 否 | - |

---

## 6.2 接口明细

### 6.2.1 获取设备分类列表

- 方法：GET
- 地址：`/api/equipment/category/list`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "categoryCode": "LATHE",
      "categoryName": "数控车床",
      "sortNo": 1,
      "status": 1,
      "remark": ""
    }
  ]
}
```

---

### 6.2.2 新增设备分类

- 方法：POST
- 地址：`/api/equipment/category`

请求示例：

```json
{
  "categoryCode": "MILLING",
  "categoryName": "加工中心",
  "sortNo": 2,
  "status": 1,
  "remark": "加工中心类设备"
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "新增成功",
  "data": {
    "id": 2
  }
}
```

---

### 6.2.3 编辑设备分类

- 方法：PUT
- 地址：`/api/equipment/category/2`

请求示例：

```json
{
  "categoryName": "立式加工中心",
  "sortNo": 2,
  "status": 1,
  "remark": "调整名称"
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "修改成功",
  "data": true
}
```

---

### 6.2.4 删除设备分类

- 方法：DELETE
- 地址：`/api/equipment/category/2`

响应示例：

```json
{
  "code": 200,
  "msg": "删除成功",
  "data": true
}
```

---

## 7. 工单列表页

## 7.1 页面字段明细

### 查询条件字段

| 字段名 | 前端字段 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| 关键字 | keyword | string | 否 | 可搜工单编号/设备名称 |
| 工单状态 | status | number | 否 | 枚举 |
| 故障等级 | level | number | 否 | 枚举 |
| 开始日期 | startDate | string | 否 | yyyy-MM-dd |
| 结束日期 | endDate | string | 否 | yyyy-MM-dd |
| 页码 | pageNum | number | 是 | 分页 |
| 每页条数 | pageSize | number | 是 | 分页 |

### 列表字段

| 显示名称 | 前端字段 | 类型 | 说明 |
|---|---|---|---|
| 工单ID | id | number | 主键 |
| 工单编号 | workOrderCode | string | 唯一编号 |
| 设备ID | equipmentId | number | 设备主键 |
| 报修设备 | equipmentName | string | 展示 |
| 故障描述 | faultDesc | string | 展示 |
| 故障等级 | faultLevel | number | 枚举 |
| 故障等级名称 | faultLevelLabel | string | 展示 |
| 工单状态 | status | number | 枚举 |
| 工单状态名称 | statusLabel | string | 展示 |
| 报修人ID | reporterId | number | 用户主键 |
| 报修人 | reporterName | string | 展示 |
| 报修时间 | reportTime | string | yyyy-MM-dd HH:mm:ss |
| 维修人ID | assigneeId | number | 用户主键 |
| 维修人 | assigneeName | string | 展示 |

### 报修表单字段

| 字段名 | 前端字段 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| 设备ID | equipmentId | number | 是 | 选择设备 |
| 故障描述 | faultDesc | string | 是 | 最长 500 字 |
| 故障等级 | faultLevel | number | 是 | 紧急/一般/低级 |
| 报修人ID | reporterId | number | 是 | 当前用户或指定 |
| 联系方式 | contactPhone | string | 否 | 电话 |
| 附件列表 | attachmentList | array | 否 | 图片/文件 |

### 派工表单字段

| 字段名 | 前端字段 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| 维修人ID | assigneeId | number | 是 | 指定维修人员 |
| 派工备注 | assignRemark | string | 否 | - |

### 完工表单字段

| 字段名 | 前端字段 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| 维修说明 | repairRemark | string | 是 | 维修过程说明 |
| 是否使用备件 | hasSpareUsed | boolean | 是 | true/false |
| 备件列表 | spareUsedList | array | 否 | 备件明细 |
| 完工时间 | finishTime | string | 是 | yyyy-MM-dd HH:mm:ss |

### 验收表单字段

| 字段名 | 前端字段 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| 验收结果 | checkResult | number | 是 | 1通过 0不通过 |
| 验收意见 | checkRemark | string | 否 | - |
| 验收时间 | checkTime | string | 是 | yyyy-MM-dd HH:mm:ss |

---

## 7.2 接口明细

### 7.2.1 查询工单分页列表

- 方法：GET
- 地址：`/api/workorder/page`

请求参数示例：

```json
{
  "pageNum": 1,
  "pageSize": 10,
  "keyword": "VMC850",
  "status": 3,
  "level": 1,
  "startDate": "2026-03-01",
  "endDate": "2026-03-31"
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "workOrderCode": "WO-20260325-0001",
        "equipmentId": 2,
        "equipmentName": "加工中心 VMC850",
        "faultDesc": "主轴异响，加工精度下降",
        "faultLevel": 1,
        "faultLevelLabel": "紧急",
        "status": 3,
        "statusLabel": "维修中",
        "reporterId": 101,
        "reporterName": "李明",
        "reportTime": "2026-03-25 08:30:00",
        "assigneeId": 201,
        "assigneeName": "王维修"
      }
    ],
    "pageNum": 1,
    "pageSize": 10,
    "total": 30
  }
}
```

---

### 7.2.2 获取工单详情

- 方法：GET
- 地址：`/api/workorder/1`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 1,
    "workOrderCode": "WO-20260325-0001",
    "equipmentId": 2,
    "equipmentName": "加工中心 VMC850",
    "faultDesc": "主轴异响，加工精度下降",
    "faultLevel": 1,
    "faultLevelLabel": "紧急",
    "reporterId": 101,
    "reporterName": "李明",
    "contactPhone": "13800000000",
    "reportTime": "2026-03-25 08:30:00",
    "assignUserId": 11,
    "assignUserName": "刘班长",
    "assignTime": "2026-03-25 09:00:00",
    "assigneeId": 201,
    "assigneeName": "王维修",
    "repairRemark": "已更换主轴轴承并重新校准",
    "finishTime": "2026-03-25 14:30:00",
    "checkResult": 1,
    "checkRemark": "验收通过",
    "checkTime": "2026-03-25 15:00:00",
    "status": 5,
    "statusLabel": "已完成",
    "spareUsedList": [
      {
        "spareId": 1,
        "spareName": "主轴轴承 7210C",
        "useQty": 2
      }
    ]
  }
}
```

---

### 7.2.3 发起报修

- 方法：POST
- 地址：`/api/workorder/report`

请求示例：

```json
{
  "equipmentId": 2,
  "faultDesc": "主轴异响，加工精度下降",
  "faultLevel": 1,
  "reporterId": 101,
  "contactPhone": "13800000000",
  "attachmentList": []
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "报修成功",
  "data": {
    "id": 1,
    "workOrderCode": "WO-20260325-0001"
  }
}
```

---

### 7.2.4 派工

- 方法：POST
- 地址：`/api/workorder/1/assign`

请求示例：

```json
{
  "assigneeId": 201,
  "assignRemark": "优先处理"
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "派工成功",
  "data": true
}
```

---

### 7.2.5 接单

- 方法：POST
- 地址：`/api/workorder/1/accept`

请求示例：

```json
{}
```

响应示例：

```json
{
  "code": 200,
  "msg": "接单成功",
  "data": true
}
```

---

### 7.2.6 开始维修

- 方法：POST
- 地址：`/api/workorder/1/start`

请求示例：

```json
{
  "startRemark": "开始拆检主轴系统"
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "状态已更新为维修中",
  "data": true
}
```

---

### 7.2.7 提交完工

- 方法：POST
- 地址：`/api/workorder/1/finish`

请求示例：

```json
{
  "repairRemark": "已更换主轴轴承并重新校准",
  "hasSpareUsed": true,
  "spareUsedList": [
    {
      "spareId": 1,
      "useQty": 2
    }
  ],
  "finishTime": "2026-03-25 14:30:00"
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "提交完工成功",
  "data": true
}
```

---

### 7.2.8 验收工单

- 方法：POST
- 地址：`/api/workorder/1/check`

请求示例：

```json
{
  "checkResult": 1,
  "checkRemark": "设备恢复正常，验收通过",
  "checkTime": "2026-03-25 15:00:00"
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "验收完成",
  "data": true
}
```

---

### 7.2.9 关闭工单

- 方法：POST
- 地址：`/api/workorder/1/close`

请求示例：

```json
{
  "closeRemark": "重复报修，已合并处理"
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "工单已关闭",
  "data": true
}
```

---

### 7.2.10 查询工单流转记录

- 方法：GET
- 地址：`/api/workorder/1/logs`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "actionType": "REPORT",
      "actionLabel": "发起报修",
      "operatorId": 101,
      "operatorName": "李明",
      "actionTime": "2026-03-25 08:30:00",
      "remark": "提交报修"
    },
    {
      "id": 2,
      "actionType": "ASSIGN",
      "actionLabel": "派工",
      "operatorId": 11,
      "operatorName": "刘班长",
      "actionTime": "2026-03-25 09:00:00",
      "remark": "派工给王维修"
    }
  ]
}
```

---

## 8. 保养管理页

## 8.1 页面字段明细

### 保养工单列表字段

| 显示名称 | 前端字段 | 类型 | 说明 |
|---|---|---|---|
| 工单ID | id | number | 主键 |
| 工单编号 | maintainOrderCode | string | 唯一编号 |
| 设备ID | equipmentId | number | 主键 |
| 设备名称 | equipmentName | string | 展示 |
| 模板ID | templateId | number | 主键 |
| 模板名称 | templateName | string | 展示 |
| 计划日期 | planDate | string | yyyy-MM-dd |
| 状态 | status | number | 枚举 |
| 状态名称 | statusLabel | string | 展示 |
| 执行人ID | assigneeId | number | 用户主键 |
| 执行人 | assigneeName | string | 展示 |

### 保养模板表单字段

| 字段名 | 前端字段 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| 模板名称 | templateName | string | 是 | - |
| 保养周期类型 | cycleType | string | 是 | DAY/MONTH/QUARTER/YEAR |
| 周期值 | cycleValue | number | 是 | 如 30 天 |
| 适用设备分类ID列表 | categoryIdList | array | 是 | 多选 |
| 保养项目列表 | itemList | array | 是 | 项目集合 |
| 状态 | status | number | 是 | 启用/停用 |
| 备注 | remark | string | 否 | - |

### 保养执行字段

| 字段名 | 前端字段 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| 执行说明 | executeRemark | string | 是 | - |
| 执行结果 | executeResult | number | 是 | 1正常 0异常 |
| 执行时间 | executeTime | string | 是 | yyyy-MM-dd HH:mm:ss |

---

## 8.2 接口明细

### 8.2.1 查询保养工单分页列表

- 方法：GET
- 地址：`/api/maintain/order/page`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "maintainOrderCode": "MO-20260328-0001",
        "equipmentId": 1,
        "equipmentName": "CNC 数控车床 #1",
        "templateId": 1,
        "templateName": "数控车床月度保养",
        "planDate": "2026-03-28",
        "status": 1,
        "statusLabel": "待执行",
        "assigneeId": null,
        "assigneeName": null
      }
    ],
    "pageNum": 1,
    "pageSize": 10,
    "total": 12
  }
}
```

---

### 8.2.2 获取保养工单详情

- 方法：GET
- 地址：`/api/maintain/order/1`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 1,
    "maintainOrderCode": "MO-20260328-0001",
    "equipmentId": 1,
    "equipmentName": "CNC 数控车床 #1",
    "templateId": 1,
    "templateName": "数控车床月度保养",
    "planDate": "2026-03-28",
    "status": 1,
    "statusLabel": "待执行",
    "itemList": [
      { "itemName": "清洁设备外观", "itemResult": null },
      { "itemName": "检查润滑情况", "itemResult": null }
    ]
  }
}
```

---

### 8.2.3 手动创建保养工单

- 方法：POST
- 地址：`/api/maintain/order`

请求示例：

```json
{
  "equipmentId": 1,
  "templateId": 1,
  "planDate": "2026-03-28",
  "assigneeId": 201
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "创建成功",
  "data": {
    "id": 1,
    "maintainOrderCode": "MO-20260328-0001"
  }
}
```

---

### 8.2.4 执行保养

- 方法：POST
- 地址：`/api/maintain/order/1/execute`

请求示例：

```json
{
  "executeRemark": "已按清单完成检查",
  "executeResult": 1,
  "executeTime": "2026-03-28 10:00:00"
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "执行成功",
  "data": true
}
```

---

### 8.2.5 提交保养完成

- 方法：POST
- 地址：`/api/maintain/order/1/finish`

请求示例：

```json
{
  "finishRemark": "保养完成，设备状态正常",
  "finishTime": "2026-03-28 11:30:00"
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "保养完成",
  "data": true
}
```

---

### 8.2.6 查询保养模板列表

- 方法：GET
- 地址：`/api/maintain/template/list`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "templateName": "数控车床月度保养",
      "cycleType": "MONTH",
      "cycleValue": 1,
      "categoryIdList": [1],
      "status": 1,
      "remark": ""
    }
  ]
}
```

---

### 8.2.7 新增保养模板

- 方法：POST
- 地址：`/api/maintain/template`

请求示例：

```json
{
  "templateName": "加工中心季度保养",
  "cycleType": "QUARTER",
  "cycleValue": 1,
  "categoryIdList": [2],
  "itemList": [
    { "itemName": "检查润滑系统", "sortNo": 1 },
    { "itemName": "检查主轴冷却", "sortNo": 2 }
  ],
  "status": 1,
  "remark": "季度保养模板"
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "新增成功",
  "data": {
    "id": 2
  }
}
```

---

### 8.2.8 编辑保养模板

- 方法：PUT
- 地址：`/api/maintain/template/2`

请求示例：

```json
{
  "templateName": "加工中心季度保养（修订）",
  "cycleType": "QUARTER",
  "cycleValue": 1,
  "categoryIdList": [2],
  "itemList": [
    { "itemName": "检查润滑系统", "sortNo": 1 }
  ],
  "status": 1,
  "remark": "修订后版本"
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "修改成功",
  "data": true
}
```

---

### 8.2.9 删除保养模板

- 方法：DELETE
- 地址：`/api/maintain/template/2`

响应示例：

```json
{
  "code": 200,
  "msg": "删除成功",
  "data": true
}
```

---

## 9. 备件管理页

## 9.1 页面字段明细

### 查询条件字段

| 字段名 | 前端字段 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| 关键字 | keyword | string | 否 | 搜备件名称/编号 |
| 低库存标记 | lowStockOnly | boolean | 否 | 是否仅看预警 |
| 页码 | pageNum | number | 是 | 分页 |
| 每页条数 | pageSize | number | 是 | 分页 |

### 备件列表字段

| 显示名称 | 前端字段 | 类型 | 说明 |
|---|---|---|---|
| 备件ID | id | number | 主键 |
| 备件编号 | spareCode | string | 唯一编号 |
| 备件名称 | spareName | string | - |
| 规格型号 | spec | string | - |
| 单位 | unit | string | 个/台/桶等 |
| 当前库存 | stockQty | number | 当前库存 |
| 预警值 | warningQty | number | 安全库存 |
| 参考单价 | price | number | 元 |
| 供应商 | supplierName | string | - |
| 存放位置 | location | string | - |

### 新增/编辑表单字段

| 字段名 | 前端字段 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| 备件编号 | spareCode | string | 是 | 唯一 |
| 备件名称 | spareName | string | 是 | - |
| 规格型号 | spec | string | 否 | - |
| 单位 | unit | string | 是 | - |
| 当前库存 | stockQty | number | 是 | 默认 0 |
| 预警值 | warningQty | number | 是 | 安全库存 |
| 参考单价 | price | number | 否 | - |
| 供应商名称 | supplierName | string | 否 | - |
| 存放位置 | location | string | 否 | - |
| 备注 | remark | string | 否 | - |

### 入库表单字段

| 字段名 | 前端字段 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| 备件ID | spareId | number | 是 | - |
| 入库数量 | inQty | number | 是 | >0 |
| 入库单价 | inPrice | number | 否 | - |
| 入库原因 | inReason | string | 否 | 采购/退回等 |
| 入库时间 | inTime | string | 是 | yyyy-MM-dd HH:mm:ss |

### 出库表单字段

| 字段名 | 前端字段 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| 备件ID | spareId | number | 是 | - |
| 出库数量 | outQty | number | 是 | >0 |
| 关联工单ID | workOrderId | number | 否 | 用于维修领料 |
| 出库原因 | outReason | string | 否 | 维修/损耗等 |
| 出库时间 | outTime | string | 是 | yyyy-MM-dd HH:mm:ss |

---

## 9.2 接口明细

### 9.2.1 查询备件分页列表

- 方法：GET
- 地址：`/api/spare/page`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "spareCode": "SP-0001",
        "spareName": "主轴轴承 7210C",
        "spec": "50×90×20mm",
        "unit": "个",
        "stockQty": 3,
        "warningQty": 5,
        "price": 680,
        "supplierName": "洛阳轴承",
        "location": "A架1层"
      }
    ],
    "pageNum": 1,
    "pageSize": 10,
    "total": 20
  }
}
```

---

### 9.2.2 获取备件详情

- 方法：GET
- 地址：`/api/spare/1`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 1,
    "spareCode": "SP-0001",
    "spareName": "主轴轴承 7210C",
    "spec": "50×90×20mm",
    "unit": "个",
    "stockQty": 3,
    "warningQty": 5,
    "price": 680,
    "supplierName": "洛阳轴承",
    "location": "A架1层",
    "remark": ""
  }
}
```

---

### 9.2.3 新增备件

- 方法：POST
- 地址：`/api/spare`

请求示例：

```json
{
  "spareCode": "SP-0007",
  "spareName": "主轴皮带",
  "spec": "B-1200",
  "unit": "条",
  "stockQty": 5,
  "warningQty": 2,
  "price": 160,
  "supplierName": "某供应商",
  "location": "B架3层",
  "remark": "易损件"
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "新增成功",
  "data": {
    "id": 7
  }
}
```

---

### 9.2.4 编辑备件

- 方法：PUT
- 地址：`/api/spare/7`

请求示例：

```json
{
  "spareName": "主轴同步皮带",
  "spec": "B-1200",
  "unit": "条",
  "stockQty": 6,
  "warningQty": 2,
  "price": 180,
  "supplierName": "某供应商",
  "location": "B架3层",
  "remark": "名称修订"
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "修改成功",
  "data": true
}
```

---

### 9.2.5 删除备件

- 方法：DELETE
- 地址：`/api/spare/7`

响应示例：

```json
{
  "code": 200,
  "msg": "删除成功",
  "data": true
}
```

---

### 9.2.6 查询库存预警列表

- 方法：GET
- 地址：`/api/spare/warning-list`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "spareCode": "SP-0001",
      "spareName": "主轴轴承 7210C",
      "stockQty": 3,
      "warningQty": 5
    },
    {
      "id": 3,
      "spareCode": "SP-0003",
      "spareName": "冷却液泵",
      "stockQty": 1,
      "warningQty": 2
    }
  ]
}
```

---

### 9.2.7 入库

- 方法：POST
- 地址：`/api/spare/in-stock`

请求示例：

```json
{
  "spareId": 1,
  "inQty": 10,
  "inPrice": 650,
  "inReason": "采购入库",
  "inTime": "2026-03-27 10:00:00"
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "入库成功",
  "data": true
}
```

---

### 9.2.8 出库

- 方法：POST
- 地址：`/api/spare/out-stock`

请求示例：

```json
{
  "spareId": 1,
  "outQty": 2,
  "workOrderId": 1,
  "outReason": "维修领料",
  "outTime": "2026-03-27 11:00:00"
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "出库成功",
  "data": true
}
```

---

### 9.2.9 查询入库记录

- 方法：GET
- 地址：`/api/spare/in-record/page`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "spareId": 1,
        "spareName": "主轴轴承 7210C",
        "inQty": 10,
        "inPrice": 650,
        "inReason": "采购入库",
        "inTime": "2026-03-27 10:00:00"
      }
    ],
    "pageNum": 1,
    "pageSize": 10,
    "total": 5
  }
}
```

---

### 9.2.10 查询出库记录

- 方法：GET
- 地址：`/api/spare/out-record/page`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "spareId": 1,
        "spareName": "主轴轴承 7210C",
        "outQty": 2,
        "workOrderId": 1,
        "outReason": "维修领料",
        "outTime": "2026-03-27 11:00:00"
      }
    ],
    "pageNum": 1,
    "pageSize": 10,
    "total": 8
  }
}
```

---

## 10. 用户管理页

## 10.1 页面字段明细

### 用户列表字段

| 显示名称 | 前端字段 | 类型 | 说明 |
|---|---|---|---|
| 用户ID | id | number | 主键 |
| 用户名 | username | string | 登录账号 |
| 姓名 | realName | string | 真实姓名 |
| 部门ID | deptId | number | 主键 |
| 部门名称 | deptName | string | 展示 |
| 角色ID列表 | roleIdList | array | 多角色 |
| 角色名称列表 | roleNameList | array | 展示 |
| 手机号 | phone | string | - |
| 状态 | status | number | 启用/停用 |

### 新增/编辑用户表单字段

| 字段名 | 前端字段 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| 用户名 | username | string | 是 | 唯一 |
| 密码 | password | string | 新增必填 | 编辑可不传 |
| 姓名 | realName | string | 是 | - |
| 部门ID | deptId | number | 是 | - |
| 角色ID列表 | roleIdList | array | 是 | 至少一个 |
| 手机号 | phone | string | 否 | - |
| 状态 | status | number | 是 | 启用/停用 |

---

## 10.2 接口明细

### 10.2.1 查询用户分页列表

- 方法：GET
- 地址：`/api/system/user/page`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "username": "admin",
        "realName": "系统管理员",
        "deptId": 1,
        "deptName": "设备部",
        "roleIdList": [1],
        "roleNameList": ["超级管理员"],
        "phone": "13800000000",
        "status": 1
      }
    ],
    "pageNum": 1,
    "pageSize": 10,
    "total": 8
  }
}
```

---

### 10.2.2 获取用户详情

- 方法：GET
- 地址：`/api/system/user/1`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 1,
    "username": "admin",
    "realName": "系统管理员",
    "deptId": 1,
    "roleIdList": [1],
    "phone": "13800000000",
    "status": 1
  }
}
```

---

### 10.2.3 新增用户

- 方法：POST
- 地址：`/api/system/user`

请求示例：

```json
{
  "username": "wangwx",
  "password": "123456",
  "realName": "王维修",
  "deptId": 2,
  "roleIdList": [3],
  "phone": "13700000000",
  "status": 1
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "新增成功",
  "data": {
    "id": 9
  }
}
```

---

### 10.2.4 编辑用户

- 方法：PUT
- 地址：`/api/system/user/9`

请求示例：

```json
{
  "realName": "王维修",
  "deptId": 2,
  "roleIdList": [3],
  "phone": "13700000001",
  "status": 1
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "修改成功",
  "data": true
}
```

---

### 10.2.5 删除用户

- 方法：DELETE
- 地址：`/api/system/user/9`

响应示例：

```json
{
  "code": 200,
  "msg": "删除成功",
  "data": true
}
```

---

## 11. 角色管理页

## 11.1 页面字段明细

| 字段名 | 前端字段 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| 角色ID | id | number | 否 | 主键 |
| 角色名称 | roleName | string | 是 | - |
| 角色编码 | roleCode | string | 是 | 唯一 |
| 数据权限范围 | dataScope | string | 否 | ALL/DEPT/SELF |
| 状态 | status | number | 是 | 启用/停用 |
| 备注 | remark | string | 否 | - |
| 菜单ID列表 | menuIdList | array | 否 | 权限配置 |

---

## 11.2 接口明细

### 11.2.1 获取角色列表

- 方法：GET
- 地址：`/api/system/role/list`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "roleName": "超级管理员",
      "roleCode": "SUPER_ADMIN",
      "dataScope": "ALL",
      "status": 1,
      "remark": ""
    }
  ]
}
```

---

### 11.2.2 新增角色

- 方法：POST
- 地址：`/api/system/role`

请求示例：

```json
{
  "roleName": "维修工",
  "roleCode": "REPAIR_USER",
  "dataScope": "SELF",
  "status": 1,
  "remark": "维修人员角色",
  "menuIdList": [1, 2, 21, 3]
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "新增成功",
  "data": {
    "id": 3
  }
}
```

---

### 11.2.3 编辑角色

- 方法：PUT
- 地址：`/api/system/role/3`

请求示例：

```json
{
  "roleName": "维修工",
  "roleCode": "REPAIR_USER",
  "dataScope": "SELF",
  "status": 1,
  "remark": "维修工角色",
  "menuIdList": [1, 2, 21, 3]
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "修改成功",
  "data": true
}
```

---

### 11.2.4 删除角色

- 方法：DELETE
- 地址：`/api/system/role/3`

响应示例：

```json
{
  "code": 200,
  "msg": "删除成功",
  "data": true
}
```

---

## 12. 部门管理页

## 12.1 页面字段明细

| 字段名 | 前端字段 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| 部门ID | id | number | 否 | 主键 |
| 部门名称 | deptName | string | 是 | - |
| 上级部门ID | parentId | number | 否 | 根节点可空 |
| 排序号 | sortNo | number | 否 | 默认 0 |
| 负责人 | leaderName | string | 否 | - |
| 状态 | status | number | 是 | 启用/停用 |

---

## 12.2 接口明细

### 12.2.1 获取部门树

- 方法：GET
- 地址：`/api/system/dept/tree`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "deptName": "设备部",
      "parentId": 0,
      "sortNo": 1,
      "leaderName": "陈总",
      "status": 1,
      "children": [
        {
          "id": 2,
          "deptName": "维修班",
          "parentId": 1,
          "sortNo": 1,
          "leaderName": "刘班长",
          "status": 1,
          "children": []
        }
      ]
    }
  ]
}
```

---

### 12.2.2 新增部门

- 方法：POST
- 地址：`/api/system/dept`

请求示例：

```json
{
  "deptName": "仓储部",
  "parentId": 1,
  "sortNo": 3,
  "leaderName": "张主管",
  "status": 1
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "新增成功",
  "data": {
    "id": 5
  }
}
```

---

### 12.2.3 编辑部门

- 方法：PUT
- 地址：`/api/system/dept/5`

请求示例：

```json
{
  "deptName": "仓储中心",
  "parentId": 1,
  "sortNo": 3,
  "leaderName": "张主管",
  "status": 1
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "修改成功",
  "data": true
}
```

---

### 12.2.4 删除部门

- 方法：DELETE
- 地址：`/api/system/dept/5`

响应示例：

```json
{
  "code": 200,
  "msg": "删除成功",
  "data": true
}
```

---

## 13. 菜单管理页

## 13.1 页面字段明细

| 字段名 | 前端字段 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| 菜单ID | id | number | 否 | 主键 |
| 菜单名称 | menuName | string | 是 | - |
| 上级菜单ID | parentId | number | 否 | 根菜单可空 |
| 路由地址 | path | string | 否 | 前端路由 |
| 组件路径 | component | string | 否 | 页面组件路径 |
| 权限标识 | permCode | string | 否 | 按钮权限 |
| 菜单类型 | menuType | string | 是 | MENU/BUTTON |
| 图标 | icon | string | 否 | - |
| 排序号 | sortNo | number | 否 | - |
| 状态 | status | number | 是 | 启用/停用 |

---

## 13.2 接口明细

### 13.2.1 获取菜单树

- 方法：GET
- 地址：`/api/system/menu/tree`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "menuName": "数据看板",
      "parentId": 0,
      "path": "/dashboard",
      "component": "dashboard/index",
      "permCode": "dashboard:view",
      "menuType": "MENU",
      "icon": "LayoutDashboard",
      "sortNo": 1,
      "status": 1,
      "children": []
    }
  ]
}
```

---

### 13.2.2 新增菜单

- 方法：POST
- 地址：`/api/system/menu`

请求示例：

```json
{
  "menuName": "设备台账",
  "parentId": 2,
  "path": "/equipment/list",
  "component": "equipment/list",
  "permCode": "equipment:list",
  "menuType": "MENU",
  "icon": "Settings",
  "sortNo": 1,
  "status": 1
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "新增成功",
  "data": {
    "id": 21
  }
}
```

---

### 13.2.3 编辑菜单

- 方法：PUT
- 地址：`/api/system/menu/21`

请求示例：

```json
{
  "menuName": "设备台账",
  "parentId": 2,
  "path": "/equipment/list",
  "component": "equipment/list",
  "permCode": "equipment:list",
  "menuType": "MENU",
  "icon": "Settings",
  "sortNo": 1,
  "status": 1
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "修改成功",
  "data": true
}
```

---

### 13.2.4 删除菜单

- 方法：DELETE
- 地址：`/api/system/menu/21`

响应示例：

```json
{
  "code": 200,
  "msg": "删除成功",
  "data": true
}
```

---

## 14. 操作日志页

## 14.1 页面字段明细

| 字段名 | 前端字段 | 类型 | 说明 |
|---|---|---|---|
| 日志ID | id | number | 主键 |
| 模块名称 | moduleName | string | 如工单管理 |
| 操作类型 | actionType | string | 新增/编辑/删除等 |
| 操作人ID | operatorId | number | 用户主键 |
| 操作人姓名 | operatorName | string | 展示 |
| 请求地址 | requestUrl | string | 接口地址 |
| 请求方法 | requestMethod | string | GET/POST 等 |
| 操作时间 | operateTime | string | yyyy-MM-dd HH:mm:ss |
| 操作结果 | resultFlag | number | 1成功 0失败 |
| 备注 | remark | string | 补充信息 |

---

## 14.2 接口明细

### 14.2.1 查询操作日志分页列表

- 方法：GET
- 地址：`/api/system/log/page`

响应示例：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "moduleName": "工单管理",
        "actionType": "派工",
        "operatorId": 11,
        "operatorName": "刘班长",
        "requestUrl": "/api/workorder/1/assign",
        "requestMethod": "POST",
        "operateTime": "2026-03-25 09:00:00",
        "resultFlag": 1,
        "remark": "派工给王维修"
      }
    ],
    "pageNum": 1,
    "pageSize": 10,
    "total": 100
  }
}
```

---

## 15. 前后端联调重点提醒

## 15.1 前端要特别确认的点

- 枚举字段返回的是数字、字符串还是同时返回 label
- 日期字段格式是否统一
- 分页字段命名是否统一为 pageNum/pageSize/total/list
- 删除接口返回 true 还是返回空对象
- 新增接口返回新增 ID 还是直接返回完整对象
- 详情接口是否包含展示字段和 ID 字段两套信息

## 15.2 后端要特别确认的点

- 状态流转必须做合法性校验
- 出库时必须校验库存是否充足
- 删除基础数据时必须校验是否被业务引用
- 编号类字段建议统一自动生成
- 工单完成时若用了备件，应同时写出库记录
- 重要操作建议写操作日志和流转日志

---

## 16. 一句话结论

到这一步，原型就已经不只是“页面示意图”了，而是接近真正的开发蓝图。

下一步最适合做的是：

**继续补“数据库表结构设计 + 字段类型 + 关联关系 + 建表 SQL 草案”**

这样前端、后端、数据库三部分就能真正并行推进。
