#!/bin/bash
# =====================================================
# 🔁 sync-to-desktop.sh — 从 WSL 增量同步当前目录到 Windows 桌面
# 自动识别项目名 + 自动读取 .gitignore 忽略规则
# 仅忽略目录（含.的视为文件，不排除）
# 改进：使用 /E /XO 确保修改后的文件能正确同步
# =====================================================

PROJECT_NAME=$(basename "$(pwd)")
WIN_PATH="C:\\Users\\Administrator\\Desktop\\$PROJECT_NAME"

echo "🚀 正在增量同步 [$PROJECT_NAME] 到 Windows 桌面..."

IGNORE_FILE=".gitignore"
EXCLUDES=()

if [ -f "$IGNORE_FILE" ]; then
  echo "📄 检测到 .gitignore，自动加载忽略规则..."
  while IFS= read -r line; do
    [[ -z "$line" || "$line" =~ ^# ]] && continue
    line=$(echo "$line" | xargs)
    # 含有 "." 的规则一般是文件或通配符，跳过
    if [[ "$line" == *.* ]]; then
      continue
    fi
    # 转换为 Windows 路径分隔符
    line=$(echo "$line" | sed 's:/:\\:g')
    EXCLUDES+=("/XD" "$line")
  done < "$IGNORE_FILE"
else
  echo "⚠️  未找到 .gitignore，使用默认忽略规则。"
  EXCLUDES=(/XD .git node_modules target dist build)
fi

# -----------------------------------------------------
# 🪄 组装 robocopy 命令
# -----------------------------------------------------
CMD=(
  /mnt/c/Windows/System32/robocopy.exe
  "$(pwd)"
  "$WIN_PATH"
  /E /XO
  "${EXCLUDES[@]}"
  /NFL /NDL /NJH /NJS
)

# -----------------------------------------------------
# ▶️ 执行同步
# -----------------------------------------------------
"${CMD[@]}" > /dev/null 2>&1
RC=$?

if [ $RC -ge 8 ]; then
  echo "❌ 同步失败 (退出码: $RC)"
  echo ""
  echo "🔍 请手动执行以下命令查看详细错误："
  echo ""
  printf '%q ' "${CMD[@]}"
  echo ""
  exit 1
fi

echo "✅ [$PROJECT_NAME] 增量同步完成：$(pwd) → $WIN_PATH"
