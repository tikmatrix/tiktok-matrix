# License迁移API文档

## API概述

License迁移功能包含两个主要的API接口：

1. `validate_license_migration` - 验证迁移条件
2. `migrate_license` - 执行实际迁移

## 1. 验证迁移API

### 接口地址

```
POST /api/validate_license_migration
```

### 请求参数

```json
{
  "current_machine_id": "string",     // 当前机器ID
  "target_machine_id": "string",      // 目标机器ID
  "validate_only": true               // 仅验证标志
}
```

### 响应格式

```json
{
  "code": 20000,
  "data": {
    "valid": true,
    "message": "Migration validation passed",
    "license_info": {
      "license_code": "XXXX-XXXX-XXXX-XXXX",
      "days_remaining": 30,
      "is_stripe_active": false,
      "app": "tiktok-matrix"
    }
  }
}
```

### 验证规则

1. **参数验证**
   - `current_machine_id` 和 `target_machine_id` 不能为空
   - 两个机器ID不能相同
   - 目标机器ID长度至少10个字符

2. **许可证验证**
   - 验证当前机器是否有有效的许可证
   - 检查许可证是否已过期（除非是Stripe订阅）
   - 确认目标机器没有现有的许可证

3. **格式验证**
   - 机器ID只能包含字母、数字、连字符和下划线
   - 符合正则表达式：`/^[A-Za-z0-9\-_]{10,}$/`

4. **频率限制**
   - 检查30天内是否已经进行过迁移
   - 防止频繁迁移操作

### 错误码说明

| 错误码 | 说明 |
|--------|------|
| 40001 | 缺少必需参数 |
| 40002 | 不能迁移到相同机器 |
| 40003 | 当前机器没有有效许可证 |
| 40004 | 目标机器ID长度不足 |
| 40005 | 当前许可证已过期 |
| 40006 | 目标机器已有激活许可证 |
| 40007 | 机器ID格式无效 |
| 40008 | 最近已迁移过，请等待30天 |
| 50000 | 服务器内部错误 |

## 2. 执行迁移API

### 接口地址

```
POST /api/migrate_license
```

### 请求参数

```json
{
  "current_machine_id": "string",     // 当前机器ID
  "target_machine_id": "string"       // 目标机器ID
}
```

### 响应格式

```json
{
  "code": 20000,
  "data": {
    "message": "License migration completed successfully",
    "current_machine_id": "MACHINE-ID-1",
    "target_machine_id": "MACHINE-ID-2", 
    "migration_time": "2024-09-14T10:30:00.000Z",
    "license_code": "XXXX-XXXX-XXXX-XXXX"
  }
}
```

### 迁移流程

1. **重新验证** - 调用验证API确保条件仍然满足
2. **数据库更新** - 根据用户类型进行不同的迁移策略：
   - `license` - 更新许可证的机器ID绑定
   - `users` - Stripe订阅用户：复制订阅字段到目标机器，清空源机器；License用户：无需更新
   - `affiliate_bind` - 更新推广绑定机器ID（如果存在）
3. **日志记录** - 在 `license_migration_log` 表中记录迁移历史
4. **响应结果** - 返回迁移成功信息

### 数据库表结构

#### license_migration_log表

```sql
CREATE TABLE license_migration_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_mid TEXT NOT NULL,           -- 源机器ID
    target_mid TEXT NOT NULL,           -- 目标机器ID  
    license_code TEXT NOT NULL,         -- 被迁移的license代码
    app TEXT NOT NULL,                  -- 应用名称
    created_at TEXT NOT NULL,           -- 迁移时间
    status INTEGER DEFAULT 1,           -- 迁移状态 1=成功 0=失败
    notes TEXT                          -- 备注信息
);
```

## 3. 前端集成

### 服务调用示例

```javascript
// 验证迁移
const validateResponse = await this.$service.validate_license_migration({
    current_machine_id: this.currentMachineId,
    target_machine_id: this.targetMachineId
});

// 执行迁移
const migrateResponse = await this.$service.migrate_license({
    current_machine_id: this.currentMachineId,
    target_machine_id: this.targetMachineId
});
```

### 状态管理

- 验证状态：`isValidating`
- 迁移状态：`isMigrating`  
- 验证结果：`machineIdValidationResult`
- 确认状态：`confirmMigration`

## 4. 安全考虑

1. **双重验证** - 执行迁移前重新验证条件
2. **事务处理** - 确保数据一致性
3. **日志记录** - 完整的操作审计
4. **频率限制** - 防止恶意频繁迁移
5. **格式验证** - 严格的输入验证

## 5. 监控和日志

- 所有迁移操作都会记录在 `license_migration_log` 表中
- 包含源机器、目标机器、时间戳等信息
- 可用于审计和问题追踪

## 6. 错误处理

- 详细的错误码和消息
- 用户友好的错误提示
- 完整的错误日志记录
