# ✅ 分发商包追踪系统 - 最终检查清单

## 📋 部署前检查

### 1. 数据库 (tikmatrix-admin-pro)

- [ ] 执行 `sql/distributor.sql` 创建表

  ```bash
  wrangler d1 execute tikmatrix --file=./sql/distributor.sql --remote
  ```

- [ ] 验证表已创建

  ```bash
  wrangler d1 execute tikmatrix --command="SELECT name FROM sqlite_master WHERE type='table' AND name IN ('distributors', 'distributor_installs', 'stripe_orders');" --remote
  ```

### 2. 后端 API (tikmatrix-admin-pro)

- [ ] 部署 Cloudflare Workers

  ```bash
  cd tikmatrix-admin-pro
  wrangler deploy
  ```

- [ ] 测试客户端 API

  ```bash
  curl -X POST https://your-domain.com/private/report_distributor_install \
    -H "Content-Type: application/json" \
    -H "X-Machine-Id: TEST123" \
    -H "X-App-Id: TikMatrix" \
    -d '{"distributor_code":"OFFICIAL","app_version":"1.0.0","os_version":"Windows 10"}'
  ```

- [ ] 测试管理后台 API

  ```bash
  curl -X GET https://your-domain.com/prod-api/distributor/list?page=1&limit=10 \
    -H "Authorization: Bearer YOUR_TOKEN"
  ```

### 3. 客户端 (tiktok-matrix)

- [ ] 验证 Rust 代码编译

  ```bash
  cd tiktok-matrix/src-tauri
  cargo check
  ```

- [ ] 本地测试(官方版本)

  ```bash
  cd tiktok-matrix
  npm run start
  ```

- [ ] 本地测试(分发商版本)

  ```powershell
  $env:DISTRIBUTOR_CODE="TEST001"
  npm run start
  ```

- [ ] 检查浏览器控制台日志
  - 应该看到 "Distributor code: TEST001"
  - 应该看到 "Distributor report result: ..."

### 4. GitHub Actions (tiktok-matrix)

- [ ] 验证 workflow 文件存在

  ```bash
  ls .github/workflows/build-distributor.yml
  ```

- [ ] 测试触发构建
  - 进入 GitHub Actions
  - 手动运行 "Build Distributor Package"
  - 输入测试分发商代码: `TEST001`
  - 选择平台: `windows`
  - 检查构建是否成功
  - 下载并验证安装包

### 5. 管理后台前端 (tikmatrix-admin-pro)

- [ ] 检查路由配置

  ```bash
  grep -n "path: '/distributor'" src/router/index.js
  ```

- [ ] 启动开发服务器

  ```bash
  npm run dev
  ```

- [ ] 访问页面并测试
  - [ ] `/distributor/list` - 分发商列表
  - [ ] `/distributor/installs` - 安装记录
  - [ ] `/distributor/stats` - 统计报表

---

## 🧪 功能测试清单

### 测试场景 1: 创建分发商

- [ ] 访问 `/distributor/list`
- [ ] 点击 "Add Distributor"
- [ ] 填写信息:
  - Code: `TEST001`
  - Name: `Test Distributor`
  - Email: `test@tikmatrix.com`
- [ ] 点击 Confirm
- [ ] 验证列表中显示新分发商

### 测试场景 2: 构建分发商包

- [ ] 进入 GitHub → Actions
- [ ] 选择 "Build Distributor Package"
- [ ] 运行 workflow:
  - Distributor Code: `TEST001`
  - Platform: `windows`
- [ ] 等待构建完成
- [ ] 下载 Artifacts
- [ ] 验证文件名包含 `TEST001`

### 测试场景 3: 安装和上报

- [ ] 安装构建的测试包
- [ ] 首次启动应用
- [ ] 检查浏览器控制台
- [ ] 验证上报成功
- [ ] 访问 `/distributor/installs`
- [ ] 搜索 `TEST001`
- [ ] 验证有新记录

### 测试场景 4: Stripe 购买追踪

- [ ] 使用测试设备进行 Stripe 购买
- [ ] 等待 Webhook 触发
- [ ] 检查 `stripe_orders` 表
- [ ] 访问 `/distributor/installs`
- [ ] 验证 "Purchased" 状态更新
- [ ] 验证 Revenue 金额正确

### 测试场景 5: 统计报表

- [ ] 访问 `/distributor/stats`
- [ ] 验证卡片数据显示
- [ ] 检查分发商排行榜
- [ ] 查看应用统计
- [ ] 查看国家分布
- [ ] 查看趋势图

---

## 🔒 安全检查

- [ ] API 端点有权限验证
- [ ] 分发商代码只能创建一次
- [ ] 设备只能绑定一次
- [ ] Stripe Webhook 有签名验证
- [ ] 敏感信息不暴露在前端

---

## 📊 数据验证

### 数据库检查

```sql
-- 检查分发商表
SELECT * FROM distributors LIMIT 10;

-- 检查安装记录表
SELECT * FROM distributor_installs LIMIT 10;

-- 检查 Stripe 订单表
SELECT * FROM stripe_orders LIMIT 10;

-- 统计查询
SELECT 
  distributor_code,
  COUNT(*) as total_installs,
  SUM(CASE WHEN is_purchased = 1 THEN 1 ELSE 0 END) as purchased_count
FROM distributor_installs
GROUP BY distributor_code;
```

---

## 🚀 生产部署检查

### 环境变量

- [ ] `STRIPE_SECRET_KEY` 已配置
- [ ] `STRIPE_WEBHOOK_SECRET` 已配置
- [ ] `D1_TIKMATRIX` 数据库已绑定
- [ ] API 域名已配置

### DNS 和域名

- [ ] API 域名解析正确
- [ ] SSL 证书有效
- [ ] CORS 配置正确

### 监控和日志

- [ ] Cloudflare 日志可查看
- [ ] 错误告警已配置
- [ ] API 调用次数监控

---

## 📝 文档检查

- [ ] `DISTRIBUTOR_SYSTEM.md` - 技术文档
- [ ] `IMPLEMENTATION_SUMMARY.md` - 实施总结
- [ ] `ADMIN_PANEL_GUIDE.md` - 管理后台使用指南
- [ ] README 已更新(如需要)

---

## 👥 培训和交接

- [ ] 管理员培训完成
- [ ] 操作手册已提供
- [ ] 常见问题已记录
- [ ] 技术支持联系方式已提供

---

## 🎯 上线准备

### 必须完成 ⭐⭐⭐

- [ ] 数据库已部署
- [ ] 后端 API 已部署
- [ ] 测试通过

### 建议完成 ⭐⭐

- [ ] GitHub Actions 测试
- [ ] 管理后台前端已上线
- [ ] 文档已提供

### 可选 ⭐

- [ ] 监控告警配置
- [ ] 性能优化
- [ ] 备份策略

---

## 🐛 回滚方案

如果出现问题:

### 数据库回滚

```sql
-- 删除新表(谨慎!)
DROP TABLE IF EXISTS distributor_installs;
DROP TABLE IF EXISTS distributors;
DROP TABLE IF EXISTS stripe_orders;
```

### 代码回滚

```bash
# 客户端
cd tiktok-matrix
git revert HEAD

# 后端
cd tikmatrix-admin-pro
git revert HEAD
wrangler deploy
```

---

## ✅ 最终确认

**签署人**: _______________  
**日期**: _______________  
**状态**: [ ] 通过测试,可以上线  

---

## 📞 紧急联系

- **开发团队**: <tech@tikmatrix.com>
- **技术文档**: `/docs/DISTRIBUTOR_SYSTEM.md`
- **问题反馈**: GitHub Issues

---

**检查清单版本**: v1.0  
**最后更新**: 2025-10-03
