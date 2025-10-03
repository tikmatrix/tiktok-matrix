# 分发商包追踪系统 - 部署和使用指南

## 📋 系统概述

这是一个独立于现有 `affiliate` 系统的推广员包分发追踪系统,用于追踪不同分发商渠道的安装量和转化情况。

## 🗂️ 系统架构

### 数据库表结构

- **`stripe_orders`** - Stripe订阅订单记录
- **`distributors`** - 分发商信息
- **`distributor_installs`** - 安装记录(一机一绑)

### 后端 API

- **客户端 API**: `/private/report_distributor_install` - 上报安装
- **管理后台 API**: `/prod-api/distributor/*` - 管理接口

### 客户端

- 编译时嵌入分发商代码
- 首次启动自动上报
- 本地存储防止重复上报

---

## 🚀 部署步骤

### 1. 数据库初始化

```bash
cd tikmatrix-admin-pro
wrangler d1 execute tikmatrix --file=./sql/distributor.sql --remote
```

验证表是否创建成功:

```bash
wrangler d1 execute tikmatrix --command="SELECT name FROM sqlite_master WHERE type='table' AND name IN ('distributors', 'distributor_installs', 'stripe_orders');" --remote
```

### 2. 部署后端 API (Cloudflare Workers)

```bash
cd tikmatrix-admin-pro
npm run deploy
# 或
wrangler deploy
```

### 3. 测试 API 接口

创建测试分发商:

```bash
curl -X POST https://your-domain.com/prod-api/distributor/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "distributor_code": "DIST001",
    "name": "Test Distributor",
    "contact_email": "test@example.com"
  }'
```

---

## 📦 构建分发商专属安装包

### 使用 GitHub Actions (推荐)

1. 进入 tiktok-matrix 仓库的 **Actions** 页面
2. 选择 **Build Distributor Package** workflow
3. 点击 **Run workflow**
4. 填写参数:
   - **Distributor Code**: `DIST001` (分发商代码)
   - **Platform**: 选择 `windows`, `macos` 或 `both`
5. 等待构建完成
6. 下载 **Artifacts** 中的安装包

### 本地构建 (备选)

**Windows:**

```powershell
$env:DISTRIBUTOR_CODE="DIST001"
cd tiktok-matrix
npm install
npm run build
cd src-tauri
cargo tauri build
```

**macOS:**

```bash
export DISTRIBUTOR_CODE="DIST001"
cd tiktok-matrix
npm install
npm run build
chmod +x ./build.sh
./build.sh
```

构建产物位置:

- Windows: `src-tauri/target/release/bundle/msi/`
- macOS: `src-tauri/target/release/bundle/dmg/`

---

## 🎯 分发流程

### 1. 创建分发商

在管理后台或使用 API 创建:

```javascript
{
  "distributor_code": "DIST001",
  "name": "John's Distribution",
  "contact_email": "john@example.com",
  "contact_telegram": "@johndoe",
  "notes": "Promoted on YouTube"
}
```

### 2. 构建专属安装包

使用 GitHub Actions 为该分发商构建专属包,分发商代码会在编译时嵌入。

### 3. 分发安装包

将构建的安装包发送给分发商,他们分发给用户。

### 4. 自动追踪

用户首次启动软件时:

1. 客户端读取嵌入的分发商代码
2. 自动上报到后端
3. 记录安装信息(IP、国家、城市、设备ID等)
4. 一台设备只能绑定一次

### 5. 购买追踪

当用户购买时:

- Stripe Webhook 自动更新 `distributor_installs` 表
- 标记 `is_purchased = 1`
- 累加 `total_purchase_amount`

---

## 📊 管理后台功能

### 分发商列表 (`/distributor/list`)

- 查看所有分发商
- 创建/编辑分发商
- 启用/禁用分发商
- 查看统计数据

### 安装记录 (`/distributor/installs`)

- 查看所有安装记录
- 按分发商筛选
- 按时间范围筛选
- 查看地理分布
- 导出数据

### 统计报表 (`/distributor/stats`)

- 总体统计(安装数、购买数、转化率、总收益)
- 分发商排行榜
- 按应用统计
- 按国家统计
- 安装趋势图

---

## 🔍 API 使用示例

### 创建分发商

```javascript
POST /prod-api/distributor/create
{
  "distributor_code": "DIST001",
  "name": "John's Distribution",
  "contact_email": "john@example.com"
}
```

### 获取分发商列表

```javascript
GET /prod-api/distributor/list?page=1&limit=20&keyword=john
```

### 获取安装记录

```javascript
GET /prod-api/distributor/installs?distributor_code=DIST001&page=1&limit=20
```

### 获取统计数据

```javascript
GET /prod-api/distributor/stats?distributor_code=DIST001
```

---

## 🛡️ 安全机制

1. **一机一绑**: 每台设备(machine_id)只能绑定一次
2. **编译时注入**: 分发商代码在编译时嵌入,无法运行时修改
3. **后端验证**: 验证分发商代码有效性
4. **本地缓存**: 防止重复上报
5. **IP记录**: 记录安装IP用于审计

---

## 🐛 故障排查

### 问题1: 构建失败

- 检查 `DISTRIBUTOR_CODE` 环境变量是否设置
- 查看 GitHub Actions 日志
- 确保 Rust 和 Node.js 版本正确

### 问题2: 上报失败

- 检查网络连接
- 查看浏览器控制台错误
- 验证 API 端点是否正确

### 问题3: 无法查看统计

- 确认数据库表已创建
- 检查 API 权限
- 查看后端日志

---

## 📈 数据分析

### 关键指标

- **总安装数**: `distributor_installs` 表记录数
- **购买转化率**: `(is_purchased=1 数量 / 总安装数) * 100%`
- **总收益**: `SUM(total_purchase_amount)`
- **活跃安装数**: 最近30天有活动的安装数

### SQL 查询示例

```sql
-- 查看某分发商的统计
SELECT 
  distributor_code,
  COUNT(*) as total_installs,
  SUM(CASE WHEN is_purchased = 1 THEN 1 ELSE 0 END) as purchased_count,
  SUM(total_purchase_amount) as total_revenue
FROM distributor_installs
WHERE distributor_code = 'DIST001'
GROUP BY distributor_code;

-- 按国家统计
SELECT 
  country,
  COUNT(*) as install_count,
  SUM(CASE WHEN is_purchased = 1 THEN 1 ELSE 0 END) as purchased_count
FROM distributor_installs
WHERE country != ''
GROUP BY country
ORDER BY install_count DESC
LIMIT 10;
```

---

## 🔄 与现有 Affiliate 系统的区别

| 特性 | Affiliate (优惠码) | Distributor (包分发) |
|------|-------------------|---------------------|
| 绑定方式 | 用户手动输入 | 自动绑定(编译时) |
| 用途 | 折扣优惠 | 渠道追踪 |
| 表名 | `affiliate`, `affiliate_bind` | `distributors`, `distributor_installs` |
| API | `/private/bind_affiliate` | `/private/report_distributor_install` |
| 可修改性 | 用户可更换 | 不可更改(一机一绑) |

**两个系统完全独立,互不影响!**

---

## 📞 技术支持

如有问题,请联系:

- 技术团队邮箱: <tech@tikmatrix.com>
- 开发文档: <https://doc.tikmatrix.com>

---

## ✅ 部署检查清单

- [ ] 数据库表已创建
- [ ] 后端 API 已部署
- [ ] 测试分发商已创建
- [ ] GitHub Actions workflow 已添加
- [ ] 客户端代码已更新
- [ ] 本地测试通过
- [ ] 生产环境测试通过
- [ ] 管理后台页面已添加(可选)

---

**版本**: v1.0  
**最后更新**: 2025-10-03
