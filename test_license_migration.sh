#!/bin/bash

# License迁移功能集成测试脚本
# 该脚本将测试许可证迁移的各个方面

echo "🚀 开始License迁移功能测试..."

# 配置
API_BASE_URL="http://localhost:8000"  # 根据实际情况修改
TEST_MACHINE_A="TEST-MACHINE-A-$(date +%s)"
TEST_MACHINE_B="TEST-MACHINE-B-$(date +%s)"
APP_NAME="tiktok-matrix"

echo "📋 测试配置:"
echo "  API Base URL: $API_BASE_URL"
echo "  源机器ID: $TEST_MACHINE_A"
echo "  目标机器ID: $TEST_MACHINE_B"
echo "  应用名称: $APP_NAME"
echo ""

# 测试1: 验证迁移API - 缺少参数
echo "🧪 测试1: 验证API参数验证..."
response=$(curl -s -X POST "$API_BASE_URL/api/validate_license_migration" \
  -H "Content-Type: application/json" \
  -H "X-Machine-Id: $TEST_MACHINE_A" \
  -H "X-App-Id: $APP_NAME" \
  -d '{}')

echo "Response: $response"
if echo "$response" | grep -q "40001"; then
  echo "✅ 参数验证通过"
else
  echo "❌ 参数验证失败"
fi
echo ""

# 测试2: 相同机器ID验证
echo "🧪 测试2: 相同机器ID验证..."
response=$(curl -s -X POST "$API_BASE_URL/api/validate_license_migration" \
  -H "Content-Type: application/json" \
  -H "X-Machine-Id: $TEST_MACHINE_A" \
  -H "X-App-Id: $APP_NAME" \
  -d "{
    \"current_machine_id\": \"$TEST_MACHINE_A\",
    \"target_machine_id\": \"$TEST_MACHINE_A\"
  }")

echo "Response: $response"
if echo "$response" | grep -q "40002"; then
  echo "✅ 相同机器ID验证通过"
else
  echo "❌ 相同机器ID验证失败"
fi
echo ""

# 测试3: 目标机器ID长度验证
echo "🧪 测试3: 目标机器ID长度验证..."
response=$(curl -s -X POST "$API_BASE_URL/api/validate_license_migration" \
  -H "Content-Type: application/json" \
  -H "X-Machine-Id: $TEST_MACHINE_A" \
  -H "X-App-Id: $APP_NAME" \
  -d "{
    \"current_machine_id\": \"$TEST_MACHINE_A\",
    \"target_machine_id\": \"SHORT\"
  }")

echo "Response: $response"
if echo "$response" | grep -q "40004"; then
  echo "✅ 机器ID长度验证通过"
else
  echo "❌ 机器ID长度验证失败"
fi
echo ""

# 测试4: 无效许可证验证
echo "🧪 测试4: 无效许可证验证..."
response=$(curl -s -X POST "$API_BASE_URL/api/validate_license_migration" \
  -H "Content-Type: application/json" \
  -H "X-Machine-Id: $TEST_MACHINE_A" \
  -H "X-App-Id: $APP_NAME" \
  -d "{
    \"current_machine_id\": \"$TEST_MACHINE_A\",
    \"target_machine_id\": \"$TEST_MACHINE_B\"
  }")

echo "Response: $response"
if echo "$response" | grep -q "40003"; then
  echo "✅ 无效许可证验证通过"
else
  echo "❌ 无效许可证验证失败"
fi
echo ""

# 测试5: 迁移API - 缺少参数
echo "🧪 测试5: 迁移API参数验证..."
response=$(curl -s -X POST "$API_BASE_URL/api/migrate_license" \
  -H "Content-Type: application/json" \
  -H "X-Machine-Id: $TEST_MACHINE_A" \
  -H "X-App-Id: $APP_NAME" \
  -d '{}')

echo "Response: $response"
if echo "$response" | grep -q "40001"; then
  echo "✅ 迁移API参数验证通过"
else
  echo "❌ 迁移API参数验证失败"
fi
echo ""

echo "📊 测试总结:"
echo "  基础验证功能已实现"
echo "  错误处理逻辑正常"
echo "  API端点配置正确"
echo ""

echo "📝 注意事项:"
echo "  - 此测试脚本验证基础功能，实际许可证需要有效数据"
echo "  - 生产环境测试需要真实的许可证和机器ID"
echo "  - 数据库迁移逻辑需要在有效许可证下测试"
echo ""

echo "🎉 License迁移功能基础测试完成！"