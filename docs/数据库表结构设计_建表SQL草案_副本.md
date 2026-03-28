# CMMS 数据库表结构设计 + 字段类型 + 关联关系 + 建表 SQL 草案

## 1. 文档说明

本文档用于承接前面的原型落地文档与接口文档，进一步把系统推进到数据库设计层面。

本稿包含四部分内容：

- 数据库核心实体说明
- 表结构与字段类型建议
- 表之间的关联关系
- MySQL 建表 SQL 草案

适用场景：

- Vue + SpringBoot 项目开发
- 后端建模
- 数据库设计
- 接口联调前准备
- 毕设/课程项目文档落地

默认假设：

- 数据库：MySQL 8.x
- 字符集：utf8mb4
- 主键策略：bigint 自增
- 时间字段：datetime
- 逻辑删除：可选，本稿先给物理字段保留位
- 审计字段：create_by、create_time、update_by、update_time

---

## 2. 核心实体总览

建议优先建设以下 14 张核心表：

1. `sys_user` 用户表
2. `sys_role` 角色表
3. `sys_user_role` 用户角色关联表
4. `sys_dept` 部门表
5. `sys_menu` 菜单表
6. `equipment_category` 设备分类表
7. `equipment` 设备表
8. `work_order` 工单主表
9. `work_order_log` 工单流转日志表
10. `maintain_template` 保养模板表
11. `maintain_template_item` 保养模板明细表
12. `maintain_order` 保养工单表
13. `spare_part` 备件表
14. `spare_in_record` 备件入库记录表
15. `spare_out_record` 备件出库记录表

如果你想压缩课程项目规模，最小可落地版本建议保留这 9 张：

- `sys_user`
- `sys_role`
- `sys_user_role`
- `equipment_category`
- `equipment`
- `work_order`
- `work_order_log`
- `spare_part`
- `spare_out_record`

---

## 3. 统一字段规范建议

### 3.1 主键字段
- 字段名：`id`
- 类型：`bigint`
- 说明：主键，自增

### 3.2 状态字段
统一使用 `tinyint`：

- 设备状态 `status`
- 工单状态 `status`
- 启停状态 `status`
- 删除标志 `deleted`

### 3.3 审计字段
建议所有核心业务表保留：

- `create_by` varchar(64)
- `create_time` datetime
- `update_by` varchar(64)
- `update_time` datetime
- `deleted` tinyint default 0

### 3.4 编码字段
凡是业务编号、编码类字段建议唯一：

- `equipment_code`
- `work_order_code`
- `maintain_order_code`
- `spare_code`
- `role_code`
- `category_code`

---

## 4. 表之间的关联关系

## 4.1 用户权限相关

- `sys_user.dept_id` -> `sys_dept.id`
- `sys_user_role.user_id` -> `sys_user.id`
- `sys_user_role.role_id` -> `sys_role.id`

## 4.2 设备相关

- `equipment.category_id` -> `equipment_category.id`

## 4.3 工单相关

- `work_order.equipment_id` -> `equipment.id`
- `work_order.reporter_id` -> `sys_user.id`
- `work_order.assignee_id` -> `sys_user.id`
- `work_order.assign_user_id` -> `sys_user.id`
- `work_order_log.work_order_id` -> `work_order.id`
- `work_order_log.operator_id` -> `sys_user.id`

## 4.4 保养相关

- `maintain_template_item.template_id` -> `maintain_template.id`
- `maintain_order.equipment_id` -> `equipment.id`
- `maintain_order.template_id` -> `maintain_template.id`
- `maintain_order.assignee_id` -> `sys_user.id`

## 4.5 备件相关

- `spare_in_record.spare_id` -> `spare_part.id`
- `spare_out_record.spare_id` -> `spare_part.id`
- `spare_out_record.work_order_id` -> `work_order.id`

---

## 5. 各表结构设计

## 5.1 部门表 sys_dept

### 字段说明

| 字段名 | 类型 | 非空 | 默认值 | 说明 |
|---|---|---|---|---|
| id | bigint | 是 | 自增 | 主键 |
| dept_name | varchar(100) | 是 | - | 部门名称 |
| parent_id | bigint | 是 | 0 | 上级部门ID |
| sort_no | int | 否 | 0 | 排序号 |
| leader_name | varchar(64) | 否 | null | 负责人 |
| status | tinyint | 是 | 1 | 1启用 0停用 |
| create_by | varchar(64) | 否 | null | 创建人 |
| create_time | datetime | 否 | CURRENT_TIMESTAMP | 创建时间 |
| update_by | varchar(64) | 否 | null | 修改人 |
| update_time | datetime | 否 | CURRENT_TIMESTAMP | 修改时间 |
| deleted | tinyint | 是 | 0 | 删除标志 |

### SQL 草案

```sql
CREATE TABLE sys_dept (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  dept_name VARCHAR(100) NOT NULL COMMENT '部门名称',
  parent_id BIGINT NOT NULL DEFAULT 0 COMMENT '上级部门ID',
  sort_no INT DEFAULT 0 COMMENT '排序号',
  leader_name VARCHAR(64) DEFAULT NULL COMMENT '负责人',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态 1启用 0停用',
  create_by VARCHAR(64) DEFAULT NULL COMMENT '创建人',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_by VARCHAR(64) DEFAULT NULL COMMENT '修改人',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  deleted TINYINT NOT NULL DEFAULT 0 COMMENT '删除标志'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';
```

---

## 5.2 角色表 sys_role

### 字段说明

| 字段名 | 类型 | 非空 | 默认值 | 说明 |
|---|---|---|---|---|
| id | bigint | 是 | 自增 | 主键 |
| role_name | varchar(100) | 是 | - | 角色名称 |
| role_code | varchar(100) | 是 | - | 角色编码 |
| data_scope | varchar(32) | 否 | SELF | 数据范围 |
| status | tinyint | 是 | 1 | 1启用 0停用 |
| remark | varchar(255) | 否 | null | 备注 |

### SQL 草案

```sql
CREATE TABLE sys_role (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  role_name VARCHAR(100) NOT NULL COMMENT '角色名称',
  role_code VARCHAR(100) NOT NULL COMMENT '角色编码',
  data_scope VARCHAR(32) DEFAULT 'SELF' COMMENT '数据权限范围',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态 1启用 0停用',
  remark VARCHAR(255) DEFAULT NULL COMMENT '备注',
  create_by VARCHAR(64) DEFAULT NULL COMMENT '创建人',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_by VARCHAR(64) DEFAULT NULL COMMENT '修改人',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  deleted TINYINT NOT NULL DEFAULT 0 COMMENT '删除标志',
  UNIQUE KEY uk_role_code (role_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';
```

---

## 5.3 用户表 sys_user

### 字段说明

| 字段名 | 类型 | 非空 | 默认值 | 说明 |
|---|---|---|---|---|
| id | bigint | 是 | 自增 | 主键 |
| username | varchar(100) | 是 | - | 用户名 |
| password | varchar(255) | 是 | - | 密码密文 |
| real_name | varchar(100) | 是 | - | 真实姓名 |
| dept_id | bigint | 否 | null | 部门ID |
| phone | varchar(20) | 否 | null | 手机号 |
| status | tinyint | 是 | 1 | 1启用 0停用 |

### SQL 草案

```sql
CREATE TABLE sys_user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  username VARCHAR(100) NOT NULL COMMENT '用户名',
  password VARCHAR(255) NOT NULL COMMENT '密码密文',
  real_name VARCHAR(100) NOT NULL COMMENT '真实姓名',
  dept_id BIGINT DEFAULT NULL COMMENT '部门ID',
  phone VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态 1启用 0停用',
  create_by VARCHAR(64) DEFAULT NULL COMMENT '创建人',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_by VARCHAR(64) DEFAULT NULL COMMENT '修改人',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  deleted TINYINT NOT NULL DEFAULT 0 COMMENT '删除标志',
  UNIQUE KEY uk_username (username),
  KEY idx_dept_id (dept_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

---

## 5.4 用户角色关联表 sys_user_role

### SQL 草案

```sql
CREATE TABLE sys_user_role (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  role_id BIGINT NOT NULL COMMENT '角色ID',
  UNIQUE KEY uk_user_role (user_id, role_id),
  KEY idx_user_id (user_id),
  KEY idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';
```

---

## 5.5 菜单表 sys_menu

### SQL 草案

```sql
CREATE TABLE sys_menu (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  menu_name VARCHAR(100) NOT NULL COMMENT '菜单名称',
  parent_id BIGINT NOT NULL DEFAULT 0 COMMENT '上级菜单ID',
  path VARCHAR(255) DEFAULT NULL COMMENT '路由地址',
  component VARCHAR(255) DEFAULT NULL COMMENT '组件路径',
  perm_code VARCHAR(100) DEFAULT NULL COMMENT '权限标识',
  menu_type VARCHAR(20) NOT NULL COMMENT '菜单类型 MENU/BUTTON',
  icon VARCHAR(100) DEFAULT NULL COMMENT '图标',
  sort_no INT DEFAULT 0 COMMENT '排序号',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
  create_by VARCHAR(64) DEFAULT NULL COMMENT '创建人',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_by VARCHAR(64) DEFAULT NULL COMMENT '修改人',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  deleted TINYINT NOT NULL DEFAULT 0 COMMENT '删除标志'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单表';
```

---

## 5.6 设备分类表 equipment_category

### SQL 草案

```sql
CREATE TABLE equipment_category (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  category_code VARCHAR(100) NOT NULL COMMENT '分类编码',
  category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
  sort_no INT DEFAULT 0 COMMENT '排序号',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态 1启用 0停用',
  remark VARCHAR(255) DEFAULT NULL COMMENT '备注',
  create_by VARCHAR(64) DEFAULT NULL COMMENT '创建人',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_by VARCHAR(64) DEFAULT NULL COMMENT '修改人',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  deleted TINYINT NOT NULL DEFAULT 0 COMMENT '删除标志',
  UNIQUE KEY uk_category_code (category_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备分类表';
```

---

## 5.7 设备表 equipment

### 字段说明

| 字段名 | 类型 | 说明 |
|---|---|---|
| equipment_code | varchar(100) | 设备编号 |
| equipment_name | varchar(100) | 设备名称 |
| category_id | bigint | 设备分类ID |
| model | varchar(100) | 规格型号 |
| manufacturer | varchar(100) | 制造商 |
| workshop_name | varchar(100) | 所在车间 |
| location | varchar(255) | 存放位置 |
| purchase_date | date | 购置日期 |
| start_use_date | date | 启用日期 |
| status | tinyint | 设备状态 |
| remark | varchar(500) | 备注 |

### SQL 草案

```sql
CREATE TABLE equipment (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  equipment_code VARCHAR(100) NOT NULL COMMENT '设备编号',
  equipment_name VARCHAR(100) NOT NULL COMMENT '设备名称',
  category_id BIGINT NOT NULL COMMENT '分类ID',
  model VARCHAR(100) DEFAULT NULL COMMENT '规格型号',
  manufacturer VARCHAR(100) DEFAULT NULL COMMENT '制造商',
  workshop_name VARCHAR(100) DEFAULT NULL COMMENT '所在车间',
  location VARCHAR(255) DEFAULT NULL COMMENT '存放位置',
  purchase_date DATE DEFAULT NULL COMMENT '购置日期',
  start_use_date DATE DEFAULT NULL COMMENT '启用日期',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '设备状态 1正常 2维修中 3保养中 4停用 5已报废',
  remark VARCHAR(500) DEFAULT NULL COMMENT '备注',
  create_by VARCHAR(64) DEFAULT NULL COMMENT '创建人',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_by VARCHAR(64) DEFAULT NULL COMMENT '修改人',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  deleted TINYINT NOT NULL DEFAULT 0 COMMENT '删除标志',
  UNIQUE KEY uk_equipment_code (equipment_code),
  KEY idx_category_id (category_id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备表';
```

---

## 5.8 工单主表 work_order

### 字段说明

| 字段名 | 类型 | 说明 |
|---|---|---|
| work_order_code | varchar(100) | 工单编号 |
| equipment_id | bigint | 设备ID |
| fault_desc | varchar(500) | 故障描述 |
| fault_level | tinyint | 故障等级 |
| reporter_id | bigint | 报修人ID |
| contact_phone | varchar(20) | 联系方式 |
| assign_user_id | bigint | 派工人ID |
| assignee_id | bigint | 维修人ID |
| assign_time | datetime | 派工时间 |
| accept_time | datetime | 接单时间 |
| start_time | datetime | 开始维修时间 |
| finish_time | datetime | 完工时间 |
| check_time | datetime | 验收时间 |
| repair_remark | varchar(1000) | 维修说明 |
| check_result | tinyint | 验收结果 |
| check_remark | varchar(500) | 验收意见 |
| close_remark | varchar(500) | 关闭原因 |
| status | tinyint | 工单状态 |

### SQL 草案

```sql
CREATE TABLE work_order (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  work_order_code VARCHAR(100) NOT NULL COMMENT '工单编号',
  equipment_id BIGINT NOT NULL COMMENT '设备ID',
  fault_desc VARCHAR(500) NOT NULL COMMENT '故障描述',
  fault_level TINYINT NOT NULL COMMENT '故障等级 1紧急 2一般 3低级',
  reporter_id BIGINT NOT NULL COMMENT '报修人ID',
  contact_phone VARCHAR(20) DEFAULT NULL COMMENT '联系方式',
  assign_user_id BIGINT DEFAULT NULL COMMENT '派工人ID',
  assignee_id BIGINT DEFAULT NULL COMMENT '维修人ID',
  assign_time DATETIME DEFAULT NULL COMMENT '派工时间',
  accept_time DATETIME DEFAULT NULL COMMENT '接单时间',
  start_time DATETIME DEFAULT NULL COMMENT '开始维修时间',
  finish_time DATETIME DEFAULT NULL COMMENT '完工时间',
  check_time DATETIME DEFAULT NULL COMMENT '验收时间',
  repair_remark VARCHAR(1000) DEFAULT NULL COMMENT '维修说明',
  check_result TINYINT DEFAULT NULL COMMENT '验收结果 1通过 0不通过',
  check_remark VARCHAR(500) DEFAULT NULL COMMENT '验收意见',
  close_remark VARCHAR(500) DEFAULT NULL COMMENT '关闭原因',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '工单状态 1待派工 2已派工 3维修中 4待验收 5已完成 6已关闭',
  create_by VARCHAR(64) DEFAULT NULL COMMENT '创建人',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_by VARCHAR(64) DEFAULT NULL COMMENT '修改人',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  deleted TINYINT NOT NULL DEFAULT 0 COMMENT '删除标志',
  UNIQUE KEY uk_work_order_code (work_order_code),
  KEY idx_equipment_id (equipment_id),
  KEY idx_reporter_id (reporter_id),
  KEY idx_assignee_id (assignee_id),
  KEY idx_status (status),
  KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单主表';
```

---

## 5.9 工单流转日志表 work_order_log

### SQL 草案

```sql
CREATE TABLE work_order_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  work_order_id BIGINT NOT NULL COMMENT '工单ID',
  action_type VARCHAR(50) NOT NULL COMMENT '动作类型 REPORT/ASSIGN/ACCEPT/START/FINISH/CHECK/CLOSE',
  action_label VARCHAR(100) NOT NULL COMMENT '动作名称',
  operator_id BIGINT DEFAULT NULL COMMENT '操作人ID',
  operator_name VARCHAR(100) DEFAULT NULL COMMENT '操作人姓名',
  remark VARCHAR(500) DEFAULT NULL COMMENT '备注',
  action_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  KEY idx_work_order_id (work_order_id),
  KEY idx_operator_id (operator_id),
  KEY idx_action_time (action_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单流转日志表';
```

---

## 5.10 保养模板表 maintain_template

### SQL 草案

```sql
CREATE TABLE maintain_template (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  template_name VARCHAR(100) NOT NULL COMMENT '模板名称',
  cycle_type VARCHAR(20) NOT NULL COMMENT '周期类型 DAY/MONTH/QUARTER/YEAR',
  cycle_value INT NOT NULL COMMENT '周期值',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态 1启用 0停用',
  remark VARCHAR(255) DEFAULT NULL COMMENT '备注',
  create_by VARCHAR(64) DEFAULT NULL COMMENT '创建人',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_by VARCHAR(64) DEFAULT NULL COMMENT '修改人',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  deleted TINYINT NOT NULL DEFAULT 0 COMMENT '删除标志'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='保养模板表';
```

---

## 5.11 保养模板明细表 maintain_template_item

### SQL 草案

```sql
CREATE TABLE maintain_template_item (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  template_id BIGINT NOT NULL COMMENT '模板ID',
  item_name VARCHAR(255) NOT NULL COMMENT '保养项目名称',
  sort_no INT DEFAULT 0 COMMENT '排序号',
  KEY idx_template_id (template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='保养模板明细表';
```

---

## 5.12 保养工单表 maintain_order

### SQL 草案

```sql
CREATE TABLE maintain_order (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  maintain_order_code VARCHAR(100) NOT NULL COMMENT '保养工单编号',
  equipment_id BIGINT NOT NULL COMMENT '设备ID',
  template_id BIGINT NOT NULL COMMENT '模板ID',
  assignee_id BIGINT DEFAULT NULL COMMENT '执行人ID',
  plan_date DATE NOT NULL COMMENT '计划日期',
  execute_time DATETIME DEFAULT NULL COMMENT '执行时间',
  finish_time DATETIME DEFAULT NULL COMMENT '完成时间',
  execute_result TINYINT DEFAULT NULL COMMENT '执行结果 1正常 0异常',
  execute_remark VARCHAR(500) DEFAULT NULL COMMENT '执行说明',
  finish_remark VARCHAR(500) DEFAULT NULL COMMENT '完成说明',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态 1待执行 2执行中 3已完成',
  create_by VARCHAR(64) DEFAULT NULL COMMENT '创建人',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_by VARCHAR(64) DEFAULT NULL COMMENT '修改人',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  deleted TINYINT NOT NULL DEFAULT 0 COMMENT '删除标志',
  UNIQUE KEY uk_maintain_order_code (maintain_order_code),
  KEY idx_equipment_id (equipment_id),
  KEY idx_template_id (template_id),
  KEY idx_assignee_id (assignee_id),
  KEY idx_plan_date (plan_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='保养工单表';
```

---

## 5.13 备件表 spare_part

### SQL 草案

```sql
CREATE TABLE spare_part (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  spare_code VARCHAR(100) NOT NULL COMMENT '备件编号',
  spare_name VARCHAR(100) NOT NULL COMMENT '备件名称',
  spec VARCHAR(100) DEFAULT NULL COMMENT '规格型号',
  unit VARCHAR(20) NOT NULL COMMENT '单位',
  stock_qty INT NOT NULL DEFAULT 0 COMMENT '当前库存',
  warning_qty INT NOT NULL DEFAULT 0 COMMENT '预警值',
  price DECIMAL(10,2) DEFAULT NULL COMMENT '参考单价',
  supplier_name VARCHAR(100) DEFAULT NULL COMMENT '供应商名称',
  location VARCHAR(255) DEFAULT NULL COMMENT '存放位置',
  remark VARCHAR(255) DEFAULT NULL COMMENT '备注',
  create_by VARCHAR(64) DEFAULT NULL COMMENT '创建人',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_by VARCHAR(64) DEFAULT NULL COMMENT '修改人',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  deleted TINYINT NOT NULL DEFAULT 0 COMMENT '删除标志',
  UNIQUE KEY uk_spare_code (spare_code),
  KEY idx_stock_qty (stock_qty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='备件表';
```

---

## 5.14 备件入库记录表 spare_in_record

### SQL 草案

```sql
CREATE TABLE spare_in_record (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  spare_id BIGINT NOT NULL COMMENT '备件ID',
  in_qty INT NOT NULL COMMENT '入库数量',
  in_price DECIMAL(10,2) DEFAULT NULL COMMENT '入库单价',
  in_reason VARCHAR(255) DEFAULT NULL COMMENT '入库原因',
  in_time DATETIME NOT NULL COMMENT '入库时间',
  create_by VARCHAR(64) DEFAULT NULL COMMENT '创建人',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  KEY idx_spare_id (spare_id),
  KEY idx_in_time (in_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='备件入库记录表';
```

---

## 5.15 备件出库记录表 spare_out_record

### SQL 草案

```sql
CREATE TABLE spare_out_record (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  spare_id BIGINT NOT NULL COMMENT '备件ID',
  work_order_id BIGINT DEFAULT NULL COMMENT '关联工单ID',
  out_qty INT NOT NULL COMMENT '出库数量',
  out_reason VARCHAR(255) DEFAULT NULL COMMENT '出库原因',
  out_time DATETIME NOT NULL COMMENT '出库时间',
  create_by VARCHAR(64) DEFAULT NULL COMMENT '创建人',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  KEY idx_spare_id (spare_id),
  KEY idx_work_order_id (work_order_id),
  KEY idx_out_time (out_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='备件出库记录表';
```

---

## 6. 推荐索引设计

以下字段建议优先加索引：

### 高频查询索引
- `equipment.equipment_code`
- `equipment.category_id`
- `equipment.status`
- `work_order.work_order_code`
- `work_order.equipment_id`
- `work_order.status`
- `work_order.reporter_id`
- `work_order.assignee_id`
- `maintain_order.maintain_order_code`
- `maintain_order.plan_date`
- `spare_part.spare_code`

### 联调阶段最常用检索字段
- 设备编号
- 工单编号
- 保养工单编号
- 备件编号
- 用户名
- 角色编码

---

## 7. 状态流转与数据约束建议

## 7.1 工单状态流转

建议后端强校验：

- 待派工 -> 已派工
- 已派工 -> 维修中
- 维修中 -> 待验收
- 待验收 -> 已完成
- 任意可关闭状态 -> 已关闭

不建议允许：
- 待派工直接到已完成
- 已完成重新回到维修中
- 已关闭再操作

## 7.2 库存约束

备件出库时必须校验：

```text
stock_qty >= out_qty
```

否则应拒绝出库。

## 7.3 删除约束

不建议直接删除仍被引用的数据：

- 有设备引用的分类，不允许删除
- 有工单引用的设备，不建议删除，可改为停用
- 有用户引用的部门，不建议直接删除
- 有用户绑定的角色，不建议直接删除

---

## 8. 初始数据建议

建议至少准备以下初始化数据：

### 部门
- 设备部
- 维修班
- 一车间
- 二车间
- 仓储部

### 角色
- 超级管理员
- 设备管理员
- 维修班长
- 维修工
- 生产操作员
- 只读用户

### 设备分类
- 数控车床
- 加工中心
- 磨床
- 三坐标测量机
- 空压机
- 叉车

---

## 9. 最小初始化 SQL 示例

```sql
INSERT INTO sys_dept (dept_name, parent_id, sort_no, status) VALUES
('设备部', 0, 1, 1),
('维修班', 1, 1, 1),
('一车间', 0, 2, 1),
('二车间', 0, 3, 1),
('仓储部', 0, 4, 1);

INSERT INTO sys_role (role_name, role_code, data_scope, status) VALUES
('超级管理员', 'SUPER_ADMIN', 'ALL', 1),
('设备管理员', 'EQUIPMENT_ADMIN', 'ALL', 1),
('维修班长', 'MAINTAIN_LEADER', 'DEPT', 1),
('维修工', 'REPAIR_USER', 'SELF', 1),
('生产操作员', 'OPERATOR_USER', 'SELF', 1),
('只读用户', 'READONLY_USER', 'SELF', 1);

INSERT INTO equipment_category (category_code, category_name, sort_no, status) VALUES
('LATHE', '数控车床', 1, 1),
('MILLING', '加工中心', 2, 1),
('GRINDER', '磨床', 3, 1),
('MEASURE', '三坐标测量机', 4, 1),
('COMPRESSOR', '空压机', 5, 1),
('FORKLIFT', '叉车', 6, 1);
```

---

## 10. SpringBoot 实体类命名建议

| 表名 | Java 实体类建议 |
|---|---|
| sys_user | SysUser |
| sys_role | SysRole |
| sys_user_role | SysUserRole |
| sys_dept | SysDept |
| sys_menu | SysMenu |
| equipment_category | EquipmentCategory |
| equipment | Equipment |
| work_order | WorkOrder |
| work_order_log | WorkOrderLog |
| maintain_template | MaintainTemplate |
| maintain_template_item | MaintainTemplateItem |
| maintain_order | MaintainOrder |
| spare_part | SparePart |
| spare_in_record | SpareInRecord |
| spare_out_record | SpareOutRecord |

---

## 11. Mapper / Repository 命名建议

| 实体类 | Mapper/Repository |
|---|---|
| SysUser | SysUserMapper |
| Equipment | EquipmentMapper |
| WorkOrder | WorkOrderMapper |
| MaintainOrder | MaintainOrderMapper |
| SparePart | SparePartMapper |

---

## 12. 下一步最建议继续补的内容

到这里，数据库层已经基本能开工了。

接下来最适合继续补的是这三类内容中的一个：

1. **完整的 MyBatis / JPA 实体字段设计**
2. **后端模块目录结构模板（Controller / Service / Mapper / DTO / VO）**
3. **前端 Vue 页面目录结构 + API 文件拆分模板**

---

## 13. 一句话结论

现在这套材料已经从：

**原型**
→ **页面清单**
→ **接口 JSON**
→ **数据库结构草案**

推进到了真正可开发的层级。

再往下一步，就可以直接进入：
**SpringBoot 后端工程骨架 + Vue 前端目录骨架设计**。
