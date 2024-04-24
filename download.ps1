param([string]$url)
$timestamp = Get-Date -Format "yyyyMMddHHmmssfff"
$filename = $timestamp.Substring($timestamp.Length - 6)
./src-tauri/bin/yt-dlp.exe -f "bestvideo[ext=mp4]" --merge-output-format mp4 --output "videos/input_$filename.mp4" --write-auto-sub --proxy 127.0.0.1:7890 $url
./src-tauri/bin/ffmpeg.exe -i "videos/input_$filename.mp4" -vf "select='not(mod(n\,30))',setpts=N/(30*TB)" "videos/output_$filename.mp4"
