// Canvas 绘图工具

// 绘制高亮边框
export function drawHighlight(canvas, bounds, options = {}) {
    if (!canvas || !bounds) return

    const ctx = canvas.getContext('2d')
    const {
        strokeColor = 'rgba(255, 69, 0, 0.8)',
        fillColor = 'rgba(255, 69, 0, 0.15)',
        lineWidth = 2
    } = options

    ctx.save()

    // 绘制填充
    ctx.fillStyle = fillColor
    ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height)

    // 绘制边框
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = lineWidth
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height)

    // 绘制角标记
    const cornerSize = 8
    ctx.fillStyle = strokeColor

    // 左上角
    ctx.fillRect(bounds.x - 1, bounds.y - 1, cornerSize, lineWidth)
    ctx.fillRect(bounds.x - 1, bounds.y - 1, lineWidth, cornerSize)

    // 右上角
    ctx.fillRect(bounds.x + bounds.width - cornerSize + 1, bounds.y - 1, cornerSize, lineWidth)
    ctx.fillRect(bounds.x + bounds.width - 1, bounds.y - 1, lineWidth, cornerSize)

    // 左下角
    ctx.fillRect(bounds.x - 1, bounds.y + bounds.height - 1, cornerSize, lineWidth)
    ctx.fillRect(bounds.x - 1, bounds.y + bounds.height - cornerSize + 1, lineWidth, cornerSize)

    // 右下角
    ctx.fillRect(bounds.x + bounds.width - cornerSize + 1, bounds.y + bounds.height - 1, cornerSize, lineWidth)
    ctx.fillRect(bounds.x + bounds.width - 1, bounds.y + bounds.height - cornerSize + 1, lineWidth, cornerSize)

    ctx.restore()
}

// 绘制悬停高亮
export function drawHoverHighlight(canvas, bounds) {
    drawHighlight(canvas, bounds, {
        strokeColor: 'rgba(59, 130, 246, 0.8)',
        fillColor: 'rgba(59, 130, 246, 0.1)',
        lineWidth: 1
    })
}

// 清空画布
export function clearCanvas(canvas) {
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}

// 绘制截图
export function drawScreenshot(canvas, imageData) {
    if (!canvas || !imageData) return

    return new Promise((resolve, reject) => {
        const img = new Image()

        img.onload = () => {
            try {
                canvas.width = img.width
                canvas.height = img.height

                const ctx = canvas.getContext('2d')
                ctx.clearRect(0, 0, canvas.width, canvas.height)

                // 直接按原始尺寸绘制,不缩放
                ctx.drawImage(img, 0, 0, img.width, img.height)

                resolve({ width: img.width, height: img.height })
            } catch (error) {
                reject(error)
            }
        }

        img.onerror = (error) => {
            reject(error)
        }

        // 支持 base64 和 URL
        if (imageData.startsWith('data:')) {
            img.src = imageData
        } else if (imageData.startsWith('http')) {
            img.src = imageData
        } else {
            img.src = `data:image/png;base64,${imageData}`
        }
    })
}

// 获取画布上的点击位置对应的实际设备坐标
export function getDeviceCoordinates(canvas, clickX, clickY, deviceWidth, deviceHeight) {
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = deviceWidth / rect.width
    const scaleY = deviceHeight / rect.height

    return {
        x: Math.round(clickX * scaleX),
        y: Math.round(clickY * scaleY)
    }
}

// 获取设备坐标对应的画布坐标
export function getCanvasCoordinates(canvas, deviceX, deviceY, deviceWidth, deviceHeight) {
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = rect.width / deviceWidth
    const scaleY = rect.height / deviceHeight

    return {
        x: deviceX * scaleX,
        y: deviceY * scaleY
    }
}

// 缩放 bounds 到画布坐标系
export function scaleBoundsToCanvas(bounds, canvasWidth, canvasHeight, deviceWidth, deviceHeight) {
    if (!bounds) return null

    const scaleX = canvasWidth / deviceWidth
    const scaleY = canvasHeight / deviceHeight

    return {
        x: bounds.x * scaleX,
        y: bounds.y * scaleY,
        width: bounds.width * scaleX,
        height: bounds.height * scaleY,
        x1: bounds.x1 * scaleX,
        y1: bounds.y1 * scaleY,
        x2: bounds.x2 * scaleX,
        y2: bounds.y2 * scaleY,
        centerX: bounds.centerX * scaleX,
        centerY: bounds.centerY * scaleY
    }
}

// 检查点是否在 bounds 内
export function isPointInBounds(x, y, bounds) {
    if (!bounds) return false

    return (
        x >= bounds.x &&
        x <= bounds.x + bounds.width &&
        y >= bounds.y &&
        y <= bounds.y + bounds.height
    )
}

// 绘制网格（用于调试）
export function drawGrid(canvas, gridSize = 50) {
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    ctx.save()
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)'
    ctx.lineWidth = 1

    // 绘制垂直线
    for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
    }

    // 绘制水平线
    for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
    }

    ctx.restore()
}
