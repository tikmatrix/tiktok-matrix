$urlList = @(
    "https://www.youtube.com/shorts/12dgpud4KNs",
    "https://www.youtube.com/shorts/XJ7yMgaZjfc", 
    "https://www.youtube.com/shorts/UqJRuXcIM94", 
    "https://www.youtube.com/shorts/k2XhkYxKd9E"
)
function DownloadVideo {
    param([string]$url)
    $timestamp = Get-Date -Format "yyyyMMddHHmmssfff"
    $filename = $timestamp.Substring($timestamp.Length - 6)
    $userdir = [Environment]::GetFolderPath("User")
    
    # 下载视频
    ./src-tauri/bin/yt-dlp.exe -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]" --merge-output-format mp4 --output "$userdir/Videos/input_$filename.mp4" --proxy 127.0.0.1:7890 $url
    # 修改画面尺寸或比例（这里将画面缩小为原来的一半）
    ./src-tauri/bin/ffmpeg.exe -i "$userdir/Videos/input_$filename.mp4" -vf "scale=iw/2:ih/2" "$userdir/Videos/temp_$filename.mp4"
    
    # 修改帧率
    ./src-tauri/bin/ffmpeg.exe -i "$userdir/Videos/temp_$filename.mp4" -r 30 "$userdir/Videos/temp2_$filename.mp4"
    
    # 添加噪音
    ./src-tauri/bin/ffmpeg.exe -i "$userdir/Videos/temp2_$filename.mp4" -vf "noise=alls=10:allf=t" "$userdir/Videos/output_$filename.mp4"
    
    # 删除临时文件
    Remove-Item "$userdir/Videos/temp_$filename.mp4"
    Remove-Item "$userdir/Videos/temp2_$filename.mp4"
}

foreach ($url in $urlList) {
    DownloadVideo $url
}

