param([string]$url)
$timestamp = Get-Date -Format "yyyyMMddHHmmssfff"
$filename = $timestamp.Substring($timestamp.Length - 6)
$Env:http_proxy = "http://127.0.0.1:7890"; $Env:https_proxy = "http://127.0.0.1:7890"
# 下载视频
./src-tauri/bin/yt-dlp.exe -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]" --merge-output-format mp4 --output "videos/input_$filename.mp4" --proxy 127.0.0.1:7890 $url

# 修改画面尺寸或比例（这里将画面缩小为原来的一半）
./src-tauri/bin/ffmpeg.exe -i "videos/input_$filename.mp4" -vf "scale=iw/2:ih/2" "videos/temp_$filename.mp4"

# 修改帧率
./src-tauri/bin/ffmpeg.exe -i "videos/temp_$filename.mp4" -r 30 "videos/temp2_$filename.mp4"

# 添加噪音
./src-tauri/bin/ffmpeg.exe -i "videos/temp2_$filename.mp4" -vf "noise=alls=10:allf=t" "videos/output_$filename.mp4"

# 删除临时文件
Remove-Item "videos/temp_$filename.mp4"
Remove-Item "videos/temp2_$filename.mp4"
