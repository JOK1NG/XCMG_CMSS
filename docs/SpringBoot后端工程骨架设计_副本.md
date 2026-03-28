# CMMS SpringBoot 后端工程骨架设计
## Controller / Service / Mapper / Entity / DTO / VO / Enum / Common 目录与代码模板

## 1. 文档目的

本文档用于将前面的原型、接口、数据库设计，继续落地为一套可直接开始编码的 SpringBoot 后端工程骨架方案。

这份文档重点解决 4 个问题：

- 项目目录怎么组织
- 每一层分别放什么
- 核心模块如何拆分
- 代码模板怎么起步

适用技术假设：

- Spring Boot 3.x
- Maven
- MyBatis-Plus 或 MyBatis
- MySQL 8.x
- JWT 登录认证
- RESTful API 风格
- 前后端分离（Vue + SpringBoot）

---

## 2. 推荐工程目录结构

```text
cmms-server
├─ src/main/java/com/example/cmms
│  ├─ CmmsApplication.java
│  ├─ common
│  │  ├─ api
│  │  │  ├─ Result.java
│  │  │  ├─ PageResult.java
│  │  │  └─ ResultCode.java
│  │  ├─ config
│  │  │  ├─ CorsConfig.java
│  │  │  ├─ JacksonConfig.java
│  │  │  ├─ MybatisConfig.java
│  │  │  └─ SwaggerConfig.java
│  │  ├─ constant
│  │  │  ├─ SecurityConstants.java
│  │  │  ├─ CommonConstants.java
│  │  │  └─ CacheConstants.java
│  │  ├─ exception
│  │  │  ├─ BusinessException.java
│  │  │  ├─ GlobalExceptionHandler.java
│  │  │  └─ UnauthorizedException.java
│  │  ├─ security
│  │  │  ├─ JwtTokenProvider.java
│  │  │  ├─ JwtAuthenticationFilter.java
│  │  │  ├─ LoginUser.java
│  │  │  └─ SecurityUtils.java
│  │  ├─ util
│  │  │  ├─ BeanCopyUtils.java
│  │  │  ├─ DateTimeUtils.java
│  │  │  ├─ IdGeneratorUtils.java
│  │  │  └─ UserContextUtils.java
│  │  └─ validation
│  │     ├─ CreateGroup.java
│  │     └─ UpdateGroup.java
│  ├─ modules
│  │  ├─ auth
│  │  │  ├─ controller
│  │  │  ├─ dto
│  │  │  ├─ service
│  │  │  └─ vo
│  │  ├─ system
│  │  │  ├─ controller
│  │  │  ├─ dto
│  │  │  ├─ entity
│  │  │  ├─ mapper
│  │  │  ├─ service
│  │  │  ├─ service/impl
│  │  │  ├─ vo
│  │  │  └─ enumtype
│  │  ├─ equipment
│  │  │  ├─ controller
│  │  │  ├─ dto
│  │  │  ├─ entity
│  │  │  ├─ mapper
│  │  │  ├─ service
│  │  │  ├─ service/impl
│  │  │  ├─ vo
│  │  │  └─ enumtype
│  │  ├─ workorder
│  │  │  ├─ controller
│  │  │  ├─ dto
│  │  │  ├─ entity
│  │  │  ├─ mapper
│  │  │  ├─ service
│  │  │  ├─ service/impl
│  │  │  ├─ vo
│  │  │  └─ enumtype
│  │  ├─ maintain
│  │  │  ├─ controller
│  │  │  ├─ dto
│  │  │  ├─ entity
│  │  │  ├─ mapper
│  │  │  ├─ service
│  │  │  ├─ service/impl
│  │  │  ├─ vo
│  │  │  └─ enumtype
│  │  └─ spare
│  │     ├─ controller
│  │     ├─ dto
│  │     ├─ entity
│  │     ├─ mapper
│  │     ├─ service
│  │     ├─ service/impl
│  │     ├─ vo
│  │     └─ enumtype
│  └─ infra
│     ├─ log
│     │  ├─ OperateLogService.java
│     │  └─ OperateLogServiceImpl.java
│     └─ persistence
│        └─ BaseEntity.java
├─ src/main/resources
│  ├─ application.yml
│  ├─ application-dev.yml
│  ├─ mapper
│  │  ├─ system
│  │  ├─ equipment
│  │  ├─ workorder
│  │  ├─ maintain
│  │  └─ spare
│  └─ db
│     ├─ schema.sql
│     └─ data.sql
└─ pom.xml
```

---

## 3. 分层职责说明

## 3.1 controller 层
职责：

- 接收前端请求
- 参数校验
- 调用 service
- 返回统一结果

不要在 controller 里做：

- 复杂业务判断
- 多表事务处理
- 数据库操作

---

## 3.2 service 层
职责：

- 核心业务逻辑
- 状态流转判断
- 事务管理
- 调用 mapper
- 封装返回 VO

service 是整个项目最关键的一层。

---

## 3.3 mapper 层
职责：

- 数据库 CRUD
- 自定义 SQL 查询
- 分页查询
- 联表查询

如果你用 MyBatis-Plus，简单 CRUD 可以走 BaseMapper；
复杂场景仍建议自己写 SQL。

---

## 3.4 entity 层
职责：

- 与数据库表一一对应
- 只保存数据库字段
- 不放页面级展示逻辑

entity 不是给前端直接返回的对象。

---

## 3.5 dto 层
职责：

- 接收入参
- 表单提交参数
- 查询条件参数
- 动作类参数（如派工、验收、出入库）

DTO = 前端传给后端的数据模型。

---

## 3.6 vo 层
职责：

- 返回给前端的数据模型
- 列表展示对象
- 详情页展示对象
- 下拉框选项对象

VO = 后端返回给前端的数据模型。

---

## 3.7 enumtype 层
职责：

- 状态枚举
- 类型枚举
- 统一 label/value 映射

例如：
- EquipmentStatusEnum
- WorkOrderStatusEnum
- FaultLevelEnum

---

## 3.8 common 层
职责：

- 通用返回结构
- 全局异常
- JWT 工具
- 配置类
- 通用工具类
- 常量类

---

## 4. 推荐模块拆分

## 4.1 auth 模块
负责：

- 登录
- 当前用户
- 当前菜单权限
- token 解析

建议类：

- `AuthController`
- `AuthService`
- `LoginDto`
- `LoginVo`
- `CurrentUserVo`

---

## 4.2 system 模块
负责：

- 用户管理
- 角色管理
- 部门管理
- 菜单管理
- 操作日志

建议类：

- `UserController`
- `RoleController`
- `DeptController`
- `MenuController`
- `OperateLogController`

---

## 4.3 equipment 模块
负责：

- 设备台账
- 设备分类
- 设备详情
- 设备状态维护

建议类：

- `EquipmentController`
- `EquipmentCategoryController`
- `EquipmentService`
- `EquipmentCategoryService`

---

## 4.4 workorder 模块
负责：

- 发起报修
- 工单分页查询
- 派工
- 接单
- 开始维修
- 完工
- 验收
- 关闭工单
- 工单流转日志

建议类：

- `WorkOrderController`
- `WorkOrderService`
- `WorkOrderLogService`

---

## 4.5 maintain 模块
负责：

- 保养模板
- 保养工单
- 执行保养
- 完成保养

建议类：

- `MaintainTemplateController`
- `MaintainOrderController`
- `MaintainTemplateService`
- `MaintainOrderService`

---

## 4.6 spare 模块
负责：

- 备件档案
- 库存预警
- 入库
- 出库
- 入出库记录

建议类：

- `SparePartController`
- `SpareStockController`
- `SparePartService`
- `SpareStockService`

---

## 5. BaseEntity 设计建议

```java
package com.example.cmms.infra.persistence;

import java.time.LocalDateTime;

public class BaseEntity {

    private Long id;
    private String createBy;
    private LocalDateTime createTime;
    private String updateBy;
    private LocalDateTime updateTime;
    private Integer deleted;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCreateBy() {
        return createBy;
    }

    public void setCreateBy(String createBy) {
        this.createBy = createBy;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public String getUpdateBy() {
        return updateBy;
    }

    public void setUpdateBy(String updateBy) {
        this.updateBy = updateBy;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }

    public Integer getDeleted() {
        return deleted;
    }

    public void setDeleted(Integer deleted) {
        this.deleted = deleted;
    }
}
```

---

## 6. common 层模板

## 6.1 Result.java

```java
package com.example.cmms.common.api;

public class Result<T> {

    private Integer code;
    private String msg;
    private T data;

    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMsg("success");
        result.setData(data);
        return result;
    }

    public static <T> Result<T> success(String msg, T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMsg(msg);
        result.setData(data);
        return result;
    }

    public static <T> Result<T> fail(Integer code, String msg) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMsg(msg);
        result.setData(null);
        return result;
    }

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
```

---

## 6.2 PageResult.java

```java
package com.example.cmms.common.api;

import java.util.List;

public class PageResult<T> {

    private List<T> list;
    private Long total;
    private Integer pageNum;
    private Integer pageSize;

    public PageResult() {
    }

    public PageResult(List<T> list, Long total, Integer pageNum, Integer pageSize) {
        this.list = list;
        this.total = total;
        this.pageNum = pageNum;
        this.pageSize = pageSize;
    }

    public List<T> getList() {
        return list;
    }

    public void setList(List<T> list) {
        this.list = list;
    }

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
    }

    public Integer getPageNum() {
        return pageNum;
    }

    public void setPageNum(Integer pageNum) {
        this.pageNum = pageNum;
    }

    public Integer getPageSize() {
        return pageSize;
    }

    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
    }
}
```

---

## 6.3 BusinessException.java

```java
package com.example.cmms.common.exception;

public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
```

---

## 6.4 GlobalExceptionHandler.java

```java
package com.example.cmms.common.exception;

import com.example.cmms.common.api.Result;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException e) {
        return Result.fail(500, e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValidException(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldError() != null
                ? e.getBindingResult().getFieldError().getDefaultMessage()
                : "参数校验失败";
        return Result.fail(400, msg);
    }

    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e) {
        return Result.fail(500, "系统异常");
    }
}
```

---

## 7. equipment 模块模板

## 7.1 entity/Equipment.java

```java
package com.example.cmms.modules.equipment.entity;

import com.example.cmms.infra.persistence.BaseEntity;
import java.time.LocalDate;

public class Equipment extends BaseEntity {

    private String equipmentCode;
    private String equipmentName;
    private Long categoryId;
    private String model;
    private String manufacturer;
    private String workshopName;
    private String location;
    private LocalDate purchaseDate;
    private LocalDate startUseDate;
    private Integer status;
    private String remark;

    public String getEquipmentCode() {
        return equipmentCode;
    }

    public void setEquipmentCode(String equipmentCode) {
        this.equipmentCode = equipmentCode;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getWorkshopName() {
        return workshopName;
    }

    public void setWorkshopName(String workshopName) {
        this.workshopName = workshopName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public LocalDate getStartUseDate() {
        return startUseDate;
    }

    public void setStartUseDate(LocalDate startUseDate) {
        this.startUseDate = startUseDate;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }
}
```

---

## 7.2 dto/EquipmentSaveDto.java

```java
package com.example.cmms.modules.equipment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class EquipmentSaveDto {

    @NotBlank(message = "设备编号不能为空")
    private String equipmentCode;

    @NotBlank(message = "设备名称不能为空")
    private String equipmentName;

    @NotNull(message = "设备分类不能为空")
    private Long categoryId;

    private String model;
    private String manufacturer;
    private String workshopName;
    private String location;
    private LocalDate purchaseDate;
    private LocalDate startUseDate;

    @NotNull(message = "设备状态不能为空")
    private Integer status;

    private String remark;

    public String getEquipmentCode() {
        return equipmentCode;
    }

    public void setEquipmentCode(String equipmentCode) {
        this.equipmentCode = equipmentCode;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getWorkshopName() {
        return workshopName;
    }

    public void setWorkshopName(String workshopName) {
        this.workshopName = workshopName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public LocalDate getStartUseDate() {
        return startUseDate;
    }

    public void setStartUseDate(LocalDate startUseDate) {
        this.startUseDate = startUseDate;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }
}
```

---

## 7.3 dto/EquipmentQueryDto.java

```java
package com.example.cmms.modules.equipment.dto;

public class EquipmentQueryDto {

    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String keyword;
    private Long categoryId;
    private Integer status;

    public Integer getPageNum() {
        return pageNum;
    }

    public void setPageNum(Integer pageNum) {
        this.pageNum = pageNum;
    }

    public Integer getPageSize() {
        return pageSize;
    }

    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
    }

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }
}
```

---

## 7.4 vo/EquipmentListVo.java

```java
package com.example.cmms.modules.equipment.vo;

import java.time.LocalDate;

public class EquipmentListVo {

    private Long id;
    private String equipmentCode;
    private String equipmentName;
    private Long categoryId;
    private String categoryName;
    private String model;
    private String workshopName;
    private Integer status;
    private String statusLabel;
    private LocalDate purchaseDate;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEquipmentCode() {
        return equipmentCode;
    }

    public void setEquipmentCode(String equipmentCode) {
        this.equipmentCode = equipmentCode;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getWorkshopName() {
        return workshopName;
    }

    public void setWorkshopName(String workshopName) {
        this.workshopName = workshopName;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getStatusLabel() {
        return statusLabel;
    }

    public void setStatusLabel(String statusLabel) {
        this.statusLabel = statusLabel;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }
}
```

---

## 7.5 mapper/EquipmentMapper.java

```java
package com.example.cmms.modules.equipment.mapper;

import com.example.cmms.modules.equipment.dto.EquipmentQueryDto;
import com.example.cmms.modules.equipment.entity.Equipment;
import com.example.cmms.modules.equipment.vo.EquipmentListVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EquipmentMapper {

    int insert(Equipment equipment);

    int updateById(Equipment equipment);

    Equipment selectById(@Param("id") Long id);

    Equipment selectByCode(@Param("equipmentCode") String equipmentCode);

    List<EquipmentListVo> selectPage(@Param("query") EquipmentQueryDto query);

    Long selectPageCount(@Param("query") EquipmentQueryDto query);

    int deleteById(@Param("id") Long id);
}
```

---

## 7.6 service/EquipmentService.java

```java
package com.example.cmms.modules.equipment.service;

import com.example.cmms.common.api.PageResult;
import com.example.cmms.modules.equipment.dto.EquipmentQueryDto;
import com.example.cmms.modules.equipment.dto.EquipmentSaveDto;
import com.example.cmms.modules.equipment.vo.EquipmentListVo;

public interface EquipmentService {

    PageResult<EquipmentListVo> page(EquipmentQueryDto queryDto);

    Long save(EquipmentSaveDto dto);

    void update(Long id, EquipmentSaveDto dto);

    void remove(Long id);
}
```

---

## 7.7 service/impl/EquipmentServiceImpl.java

```java
package com.example.cmms.modules.equipment.service.impl;

import com.example.cmms.common.api.PageResult;
import com.example.cmms.common.exception.BusinessException;
import com.example.cmms.modules.equipment.dto.EquipmentQueryDto;
import com.example.cmms.modules.equipment.dto.EquipmentSaveDto;
import com.example.cmms.modules.equipment.entity.Equipment;
import com.example.cmms.modules.equipment.mapper.EquipmentMapper;
import com.example.cmms.modules.equipment.service.EquipmentService;
import com.example.cmms.modules.equipment.vo.EquipmentListVo;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EquipmentServiceImpl implements EquipmentService {

    private final EquipmentMapper equipmentMapper;

    public EquipmentServiceImpl(EquipmentMapper equipmentMapper) {
        this.equipmentMapper = equipmentMapper;
    }

    @Override
    public PageResult<EquipmentListVo> page(EquipmentQueryDto queryDto) {
        List<EquipmentListVo> list = equipmentMapper.selectPage(queryDto);
        Long total = equipmentMapper.selectPageCount(queryDto);
        return new PageResult<>(list, total, queryDto.getPageNum(), queryDto.getPageSize());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long save(EquipmentSaveDto dto) {
        Equipment exist = equipmentMapper.selectByCode(dto.getEquipmentCode());
        if (exist != null) {
            throw new BusinessException("设备编号已存在");
        }
        Equipment equipment = new Equipment();
        BeanUtils.copyProperties(dto, equipment);
        equipmentMapper.insert(equipment);
        return equipment.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, EquipmentSaveDto dto) {
        Equipment equipment = equipmentMapper.selectById(id);
        if (equipment == null) {
            throw new BusinessException("设备不存在");
        }
        BeanUtils.copyProperties(dto, equipment);
        equipment.setId(id);
        equipmentMapper.updateById(equipment);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void remove(Long id) {
        Equipment equipment = equipmentMapper.selectById(id);
        if (equipment == null) {
            throw new BusinessException("设备不存在");
        }
        equipmentMapper.deleteById(id);
    }
}
```

---

## 7.8 controller/EquipmentController.java

```java
package com.example.cmms.modules.equipment.controller;

import com.example.cmms.common.api.PageResult;
import com.example.cmms.common.api.Result;
import com.example.cmms.modules.equipment.dto.EquipmentQueryDto;
import com.example.cmms.modules.equipment.dto.EquipmentSaveDto;
import com.example.cmms.modules.equipment.service.EquipmentService;
import com.example.cmms.modules.equipment.vo.EquipmentListVo;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    private final EquipmentService equipmentService;

    public EquipmentController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    @GetMapping("/page")
    public Result<PageResult<EquipmentListVo>> page(EquipmentQueryDto queryDto) {
        return Result.success(equipmentService.page(queryDto));
    }

    @PostMapping
    public Result<Long> save(@RequestBody @Valid EquipmentSaveDto dto) {
        return Result.success("新增成功", equipmentService.save(dto));
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody @Valid EquipmentSaveDto dto) {
        equipmentService.update(id, dto);
        return Result.success("修改成功", null);
    }

    @DeleteMapping("/{id}")
    public Result<Void> remove(@PathVariable Long id) {
        equipmentService.remove(id);
        return Result.success("删除成功", null);
    }
}
```

---

## 8. workorder 模块骨架建议

## 8.1 核心 DTO

建议至少准备这些 DTO：

- `WorkOrderQueryDto`
- `WorkOrderReportDto`
- `WorkOrderAssignDto`
- `WorkOrderStartDto`
- `WorkOrderFinishDto`
- `WorkOrderCheckDto`
- `WorkOrderCloseDto`

## 8.2 核心 VO

建议至少准备这些 VO：

- `WorkOrderListVo`
- `WorkOrderDetailVo`
- `WorkOrderLogVo`

## 8.3 核心 Service 方法

```java
PageResult<WorkOrderListVo> page(WorkOrderQueryDto dto);

Long report(WorkOrderReportDto dto);

void assign(Long id, WorkOrderAssignDto dto);

void accept(Long id);

void start(Long id, WorkOrderStartDto dto);

void finish(Long id, WorkOrderFinishDto dto);

void check(Long id, WorkOrderCheckDto dto);

void close(Long id, WorkOrderCloseDto dto);

WorkOrderDetailVo detail(Long id);
```

## 8.4 关键业务规则

`WorkOrderServiceImpl` 里必须重点处理：

- 工单状态流转合法性
- 派工后才能接单
- 接单后才能开始维修
- 维修中才能提交完工
- 待验收才能验收
- 使用备件时自动扣减库存并写出库记录
- 每一步操作都写 `work_order_log`

---

## 9. spare 模块骨架建议

## 9.1 核心 DTO

- `SparePartSaveDto`
- `SparePartQueryDto`
- `SpareInStockDto`
- `SpareOutStockDto`

## 9.2 核心 Service 方法

```java
PageResult<SparePartListVo> page(SparePartQueryDto dto);

Long save(SparePartSaveDto dto);

void update(Long id, SparePartSaveDto dto);

void inStock(SpareInStockDto dto);

void outStock(SpareOutStockDto dto);

List<SpareWarningVo> warningList();
```

## 9.3 关键业务规则

- 出库前校验库存
- 出库后更新 `spare_part.stock_qty`
- 写入 `spare_out_record`
- 低于预警值时返回预警状态

---

## 10. auth 模块骨架建议

## 10.1 AuthController 推荐接口

```java
POST /api/auth/login
GET /api/auth/me
GET /api/auth/menus
```

## 10.2 LoginDto

```java
package com.example.cmms.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginDto {

    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
```

## 10.3 AuthService 推荐方法

```java
LoginVo login(LoginDto dto);

CurrentUserVo currentUser();

List<MenuVo> currentMenus();
```

---

## 11. 枚举类建议

## 11.1 EquipmentStatusEnum.java

```java
package com.example.cmms.modules.equipment.enumtype;

public enum EquipmentStatusEnum {

    NORMAL(1, "正常"),
    REPAIRING(2, "维修中"),
    MAINTAINING(3, "保养中"),
    DISABLED(4, "停用"),
    SCRAPPED(5, "已报废");

    private final Integer value;
    private final String label;

    EquipmentStatusEnum(Integer value, String label) {
        this.value = value;
        this.label = label;
    }

    public Integer getValue() {
        return value;
    }

    public String getLabel() {
        return label;
    }

    public static String getLabelByValue(Integer value) {
        for (EquipmentStatusEnum item : values()) {
            if (item.value.equals(value)) {
                return item.label;
            }
        }
        return "";
    }
}
```

---

## 11.2 WorkOrderStatusEnum.java

```java
package com.example.cmms.modules.workorder.enumtype;

public enum WorkOrderStatusEnum {

    TO_ASSIGN(1, "待派工"),
    ASSIGNED(2, "已派工"),
    REPAIRING(3, "维修中"),
    TO_CHECK(4, "待验收"),
    FINISHED(5, "已完成"),
    CLOSED(6, "已关闭");

    private final Integer value;
    private final String label;

    WorkOrderStatusEnum(Integer value, String label) {
        this.value = value;
        this.label = label;
    }

    public Integer getValue() {
        return value;
    }

    public String getLabel() {
        return label;
    }
}
```

---

## 12. Mapper XML 目录建议

建议 XML 文件按模块分开：

```text
resources/mapper
├─ equipment
│  ├─ EquipmentMapper.xml
│  └─ EquipmentCategoryMapper.xml
├─ workorder
│  ├─ WorkOrderMapper.xml
│  └─ WorkOrderLogMapper.xml
├─ maintain
│  ├─ MaintainOrderMapper.xml
│  └─ MaintainTemplateMapper.xml
├─ spare
│  ├─ SparePartMapper.xml
│  ├─ SpareInRecordMapper.xml
│  └─ SpareOutRecordMapper.xml
└─ system
   ├─ SysUserMapper.xml
   ├─ SysRoleMapper.xml
   ├─ SysDeptMapper.xml
   └─ SysMenuMapper.xml
```

---

## 13. application.yml 最小模板

```yaml
server:
  port: 8080

spring:
  application:
    name: cmms-server
  datasource:
    url: jdbc:mysql://localhost:3306/cmms?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver

mybatis:
  mapper-locations: classpath*:mapper/**/*.xml
  type-aliases-package: com.example.cmms.modules

logging:
  level:
    com.example.cmms: debug
```

---

## 14. Maven 依赖建议

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
        <version>3.0.3</version>
    </dependency>

    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>

    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>

    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>

    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>

    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>

    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.5.0</version>
    </dependency>
</dependencies>
```

---

## 15. 推荐开发顺序

最稳的后端开发顺序：

### 第一阶段
- common
- auth
- system 基础能力
- 统一返回结构
- 全局异常
- JWT 登录

### 第二阶段
- equipment
- equipment_category

### 第三阶段
- work_order
- work_order_log

### 第四阶段
- spare_part
- spare_in_record
- spare_out_record

### 第五阶段
- maintain_template
- maintain_order

### 第六阶段
- dashboard 聚合查询
- operate_log
- 报表导出

---

## 16. 当前最建议你接着做的下一步

到这一步，后端骨架已经能指导正式开工了。

接下来最合适继续往下落的，有两条路线：

### 路线 A：继续写代码模板
直接补成：
- `WorkOrderController`
- `WorkOrderService`
- `WorkOrderServiceImpl`
- `WorkOrderMapper`
- `WorkOrderMapper.xml`

### 路线 B：补完整工程结构文档
直接整理成：
- 每个模块的接口责任表
- 每个 DTO / VO 清单
- 每个 Service 方法清单
- 每个 Mapper SQL 清单

---

## 17. 一句话结论

现在这套材料已经从“产品设计文档”进入到“后端可施工蓝图”阶段了。

再往下最顺的一步，就是把 **工单模块** 直接写成一套完整代码模板，因为它是整个 CMMS 里最核心、最能带动其他模块联动的部分。
