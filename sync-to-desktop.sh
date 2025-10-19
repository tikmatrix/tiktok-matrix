#!/bin/bash
# =====================================================
# 🔁 sync-to-desktop.sh — 从 WSL 增量同步当前项目到 Windows 桌面
# 自动识别项目名，无需手动修改路径
# =====================================================

# 获取当前项目目录名（例如 tiktok-matrix）
PROJECT_NAME=$(basename "$(pwd)")

# 生成 Windows 桌面目标路径
WIN_PATH="C:\\Users\\Administrator\\Desktop\\$PROJECT_NAME"

echo "🚀 正在增量同步 [$PROJECT_NAME] 到 Windows 桌面..."

# /E   : 复制所有子目录（包括空的）
# /XO  : 跳过比目标新的文件
# /XC  : 忽略内容相同的文件
# /XN  : 忽略目标较新的文件
# /XF  : 忽略特定文件
# /XD  : 忽略特定文件夹
# /NFL /NDL /NJH /NJS : 静默模式，不显示冗余输出
/mnt/c/Windows/System32/robocopy.exe "$(pwd)" "$WIN_PATH" /E /XO /XC /XN /XF node_modules /XD .git /NFL /NDL /NJH /NJS > /dev/null

if [ $? -ge 8 ]; then
  echo "❌ 同步失败，请检查 robocopy 是否可用。"
  exit 1
fi

echo "✅ [$PROJECT_NAME] 增量同步完成：$(pwd) → $WIN_PATH"

