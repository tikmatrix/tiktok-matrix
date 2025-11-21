<template>
  <div
    :class="[big ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1', 'relative shadow-2xl border-2 ring-1 ring-info ring-opacity-50 rounded-md overflow-hidden']">
    <div class="flex justify-center items-center w-full h-full">
      <div class="flex flex-col w-full h-full">
        <div class="flex flex-row drag bg-base-300 p-2" v-if="big">
          <div class="flex flex-1 items-center gap-2">
            <div class="flex-1 flex items-center gap-2">
              <span class="font-bold bg-secondary px-3 py-1 rounded-lg text-secondary-content">
                {{ no }}
              </span>
              <div :class="['status animate-bounce', getTaskStatusColor]"></div>
              <span class="px-2 py-0.5 rounded-md font-bold" :class="[getTaskStatusTextColor, getScaledFontSize]">
                {{ getTaskStatus }}
              </span>
            </div>

          </div>
          <button class="btn btn-ghost btn-md hover:text-error" @click="$emiter('closeDevice', this.device)">
            <font-awesome-icon icon="fa fa-times" class="h-6 w-6" />
          </button>
        </div>

        <div class="flex flex-row flex-1 relative overflow-hidden" :style="containerStyle">
          <div class="relative flex-1 object-fill w-full" :style="innerContainerStyle">
            <canvas
              class="absolute top-0 left-0 w-full h-full hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
              ref="canvas" @mousedown="mouseDownListener" @mouseup="mouseUpListener" @mouseleave="mouseLeaveListener"
              @mousemove="mouseMoveListener" tabindex="0" @keydown="keyDownListener" @keyup="keyUpListener"></canvas>
            <img v-if="firstFrameImageUrl && !videoStarted" :src="firstFrameImageUrl"
              class="absolute top-0 left-0 w-full h-full object-contain pointer-events-none select-none"
              alt="first frame preview" />
            <!-- Connecting overlay when first frame is shown but scrcpy is not ready -->
            <div
              class="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center backdrop-blur-[2px] pointer-events-none"
              v-if="firstFrameImageUrl && !videoStarted && this.big">

            </div>
            <div @click="$emiter('openDevice', this.device)"
              class="absolute top-0 left-0 w-full h-full flex flex-col justify-top items-top" v-if="!big">
              <div class="bg-transparent p-2 rounded-md text-center">
                <div :class="['status animate-bounce', getTaskStatusColor]"></div>
                <span class="px-2 py-0.5 rounded-md font-bold" :class="[getTaskStatusTextColor, getScaledFontSize]">
                  {{ getTaskStatus }}
                </span>
                <div class="font-bold text-info text-md">
                  {{ no }} - {{ device.connect_type == 0 ? 'USB' : 'TCP' }}
                </div>
                <div class="text-info font-bold text-md">
                  {{ name }}
                </div>
              </div>
            </div>
            <div class="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-base-300"
              v-if="loading">
              <font-awesome-icon icon="fa-solid fa-hourglass-end" class="w-24 h-24 text-primary rotate" />
              <span class="text-primary font-bold">{{ $t('loading') }}</span>
            </div>
            <div class="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-base-300"
              v-if="operating">
              <font-awesome-icon icon="fa fa-hand-pointer" class="w-24 h-24 text-primary" />
              <span class="text-primary font-bold">{{ $t('operating') }}</span>
            </div>
          </div>
          <RightBars v-if="big" :serial="device.serial" :real_serial="device.real_serial" />
        </div>

      </div>
    </div>


  </div>

</template>

<style>
/* 添加动画效果 */
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  50% {
    transform: rotate(360deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 应用动画效果到图标 */
.rotate {
  animation: rotate 3s linear infinite;
  /* 5秒钟完成一次旋转，无限循环 */
}
</style>
<script>
/* global VideoDecoder, EncodedVideoChunk */
import RightBars from './RightBars.vue';
import { readTextFile, BaseDirectory } from '@tauri-apps/api/fs'
import { writeText } from '@tauri-apps/api/clipboard'
import { h264ParseConfiguration } from '@yume-chan/scrcpy';
import { getItem, setItem } from '@/utils/persistentStorage.js';
const FIRST_FRAME_PREFIX = 'FIRST_FRAME_BASE64:';
export default {
  name: 'Miniremote',
  components: {
    RightBars,
  },
  props: {
    bigSize: {
      type: Boolean,
      default: false
    },
    no: {
      type: Number,
      default: 1
    },
    device: {
      type: Object,
      default: () => {
        return {}
      }
    },

  },
  data() {
    return {
      // Display size constants
      default_width: 150,
      default_height: 300,
      // Default device dimensions (portrait phone)
      DEFAULT_DEVICE_WIDTH: 1080,
      DEFAULT_DEVICE_HEIGHT: 1920,
      // Standard mode big screen target width
      STANDARD_MODE_TARGET_WIDTH: 450,
      big: false,
      visible: true,
      rotation: 0,
      videoDecoder: null,
      scrcpy: null,
      loading: true,
      operating: false,
      input_dialog_title: '',
      input_dialog_text: '',
      input_callback: null,
      message_index: 0,
      name: 'Loading...',
      height: 300,
      width: 150,
      real_width: 0,
      real_height: 0,
      scaled: 1,
      listeners: [],
      touch: false,
      screenResolution: 512,
      canvasCtx: null,
      frameQueue: [],
      isRenderingFrame: false,
      configBuffer: undefined,
      firstFrameRendered: false,
      firstFrameImageUrl: null,
      videoStarted: false,
      isUpdatingDimensions: false,
      lastEmittedWidth: 150,
      i18n: {
        preparing: '',
        running: '',
        ready: '',
        loading: '',
        connecting: ''
      }
    }
  },
  computed: {
    getTaskStatus() {
      if (this.loading) {
        return this.i18n.loading
      }
      if (this.firstFrameImageUrl && !this.videoStarted && this.big) {
        return this.i18n.connecting
      }
      if (this.device.task_status == -1) {
        return this.i18n.preparing
      }
      if (this.device.task_status == 1) {
        return this.i18n.running
      }
      if (this.device.task_status == 0 || this.device.task_status == 2 || this.device.task_status == 3) {
        return this.i18n.ready
      }
      return this.i18n.preparing
    },

    getScaledFontSize() {
      if (this.big) return 'text-md';
      if (this.width <= 100) return 'text-[0.6rem]';
      if (this.width <= 150) return 'text-[0.7rem]';
      if (this.width <= 200) return 'text-[0.8rem]';
      if (this.width <= 250) return 'text-md';
      return 'text-md';
    },
    getTaskStatusColor() {
      if (this.loading) {
        return 'status-success'
      }
      if (this.firstFrameImageUrl && !this.videoStarted && this.big) {
        return 'status-success'
      }
      if (this.device.task_status == -1) {
        return 'status-warning'
      }
      if (this.device.task_status == 1) {
        return 'status-success'
      }
      if (this.device.task_status == 0 || this.device.task_status == 2 || this.device.task_status == 3) {
        return 'status-info'
      }
      return 'status-warning'
    },
    getTaskStatusTextColor() {
      if (this.loading) {
        return 'text-success'
      }
      if (this.firstFrameImageUrl && !this.videoStarted && this.big) {
        return 'text-success'
      }
      if (this.device.task_status == -1) {
        return 'text-warning'
      }
      if (this.device.task_status == 1) {
        return 'text-success'
      }
      if (this.device.task_status == 0 || this.device.task_status == 2 || this.device.task_status == 3) {
        return 'text-info'
      }
      return 'text-warning'
    },

    // Computed styles for container sizing
    containerStyle() {
      if (this.big) {
        // bigSize prop is true only for standard mode (floating window)
        // For standard mode, provide explicit dimensions
        // For docked mode, let grid layout control the size
        if (this.bigSize) {
          // Standard mode: Calculate appropriate dimensions for floating window
          const deviceWidth = this.real_width || this.DEFAULT_DEVICE_WIDTH;
          const deviceHeight = this.real_height || this.DEFAULT_DEVICE_HEIGHT;
          
          // Validate dimensions to prevent division by zero
          if (deviceWidth <= 0 || deviceHeight <= 0) {
            console.warn('Invalid device dimensions, using defaults');
            return `width: ${this.STANDARD_MODE_TARGET_WIDTH}px; height: ${Math.round(this.STANDARD_MODE_TARGET_WIDTH * (this.DEFAULT_DEVICE_HEIGHT / this.DEFAULT_DEVICE_WIDTH))}px;`;
          }
          
          const aspectRatio = deviceHeight / deviceWidth;
          
          // Set a reasonable display size (larger than small screen)
          const targetWidth = this.STANDARD_MODE_TARGET_WIDTH;
          const calculatedHeight = Math.round(targetWidth * aspectRatio);
          
          return `width: ${targetWidth}px; height: ${calculatedHeight}px;`;
        }
        // Docked mode: Let it fill the grid cells naturally
        return undefined;
      }
      return undefined;
    },

    innerContainerStyle() {
      if (this.big) {
        // For big screen, maintain exact dimensions to match container
        return 'width: 100%; height: 100%;';
      }
      return 'aspect-ratio: 9/16';
    }
  },
  async created() {
    const [storedWidth, storedHeight, storedResolution] = await Promise.all([
      getItem('deviceWidth'),
      getItem('deviceHeight'),
      getItem('screenResolution')
    ]);

    const parseNumber = (value, fallback) => {
      if (value === null || value === undefined) {
        return fallback;
      }
      const parsed = Number(String(value).replace(/"/g, ''));
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    const width = parseNumber(storedWidth, this.default_width);
    const height = parseNumber(storedHeight, this.default_height);
    const resolution = parseNumber(storedResolution, this.screenResolution);

    this.default_width = width;
    this.default_height = height;
    this.width = width;
    this.height = height;
    this.lastEmittedWidth = width;
    this.screenResolution = resolution;
  },
  watch: {
    scaled(newVal) {
      // console.debug(`scaled: ${newVal}`)
      if (this.real_width == 0 || this.real_height == 0 || newVal == 0) {
        return
      }
      // Prevent circular updates
      if (this.isUpdatingDimensions) {
        return
      }
      this.isUpdatingDimensions = true
      this.width = this.real_width * newVal
      this.height = this.real_height * newVal

      // Only emit if width changed significantly (more than 1px to avoid floating point noise)
      if (Math.abs(this.width - this.lastEmittedWidth) > 1) {
        this.lastEmittedWidth = this.width
      }
      this.isUpdatingDimensions = false
    },
    async width(newVal) {
      // Prevent circular updates
      if (this.isUpdatingDimensions) {
        return
      }
      await setItem('deviceWidth', newVal)
      // Only emit if width changed significantly
      if (Math.abs(newVal - this.lastEmittedWidth) > 1) {
        this.lastEmittedWidth = newVal
      }
    },
    async height(newVal) {
      // Prevent circular updates during dimension updates
      if (this.isUpdatingDimensions) {
        return
      }
      await setItem('deviceHeight', newVal)
    }
  },
  methods: {
    coords(boundingW, boundingH, relX, relY, rotation) {
      var w, h, x, y
      switch (rotation) {
        case 0:
          w = boundingW
          h = boundingH
          x = relX
          y = relY
          break
        case 90:
          w = boundingH
          h = boundingW
          x = boundingH - relY
          y = relX
          break
        case 180:
          w = boundingW
          h = boundingH
          x = boundingW - relX
          y = boundingH - relY
          break
        case 270:
          w = boundingH
          h = boundingW
          x = relY
          y = boundingW - relX
          break
      }
      return { x, y, w, h }
    },
    async touchSync(operation, event) {
      if (!this.big) {
        return
      }
      if (!this.videoStarted) {
        return
      }
      var e = event
      if (e.originalEvent) {
        e = e.originalEvent
      }
      e.preventDefault()
      let x = e.offsetX,
        y = e.offsetY
      let w = e.target.clientWidth,
        h = e.target.clientHeight
      let scaled = this.coords(w, h, x, y, this.rotation)

      let data = JSON.stringify({
        type: 'touch',
        operation: operation, // u, d, c, w
        x: (scaled.x / scaled.w).toFixed(2),
        y: (scaled.y / scaled.h).toFixed(2),
      });
      await this.$emiter('eventData', data)
    },
    mouseMoveListener(event) {
      if (this.loading || !this.videoStarted) {
        return
      }
      if (!this.touch) {
        return
      }
      this.touchSync('m', event)
    },
    async mouseUpListener(event) {
      if (!this.touch) {
        return
      }
      this.touch = false
      if (!this.big) {
        return
      }
      this.touchSync('u', event)
    },
    mouseLeaveListener(event) {
      if (this.loading || !this.videoStarted) {
        return
      }
      if (!this.touch) {
        return
      }
      this.touch = false
      this.touchSync('u', event)

    }, async keyDownListener(event) {
      if (!this.big || !this.videoStarted) {
        return
      }

      // 忽略Command/Meta键，避免干扰输入法
      if (event.code === 'MetaLeft' || event.code === 'MetaRight') {
        event.preventDefault()
        return
      }

      // 允许复制和粘贴快捷键通过，不阻止其默认行为
      if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === 'v' || event.key.toLowerCase() === 'c')) {
        return
      }

      event.preventDefault()

      // 映射特殊按键
      let keyCode = this.mapKeyToAndroid(event.code, event.key)
      if (keyCode) {
        let data = JSON.stringify({
          type: 'keycode',
          operation: 'd',
          keycode: keyCode
        })
        await this.$emiter('eventData', data)
      } else if (this.isInputableKey(event)) {
        // 处理可输入的字符（包括标点符号）
        let data = JSON.stringify({
          type: 'text',
          text: event.key
        })
        await this.$emiter('eventData', data)
      }
    }, async keyUpListener(event) {
      if (!this.big || !this.videoStarted) {
        return
      }

      // 忽略Command/Meta键，避免干扰输入法
      if (event.code === 'MetaLeft' || event.code === 'MetaRight') {
        event.preventDefault()
        return
      }

      // 允许复制和粘贴快捷键通过，不阻止其默认行为
      if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === 'v' || event.key.toLowerCase() === 'c')) {
        return
      }

      event.preventDefault()

      // 只处理特殊按键的释放事件
      let keyCode = this.mapKeyToAndroid(event.code, event.key)
      if (keyCode) {
        let data = JSON.stringify({
          type: 'keycode',
          operation: 'u',
          keycode: keyCode
        })
        await this.$emiter('eventData', data)
      }
    },
    base64ToUint8Array(base64Data) {
      try {
        const binaryString = window.atob(base64Data)
        const len = binaryString.length
        const bytes = new Uint8Array(len)
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        return bytes
      } catch (error) {
        console.error(`${this.no}-${this.device.serial} convert base64 failed:`, error)
        return null
      }
    },
    async blobToImageSource(blob) {
      if ('createImageBitmap' in window) {
        return await createImageBitmap(blob)
      }
      return await new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          URL.revokeObjectURL(img.src)
          resolve(img)
        }
        img.onerror = err => {
          URL.revokeObjectURL(img.src)
          reject(err)
        }
        img.src = URL.createObjectURL(blob)
      })
    },
    drawFirstFrameImage(image) {
      const canvas = this.$refs.canvas
      if (!canvas) {
        return
      }
      if (!this.canvasCtx) {
        this.canvasCtx = canvas.getContext('2d')
      }
      const width = image.width || image.naturalWidth || this.real_width || this.width
      const height = image.height || image.naturalHeight || this.real_height || this.height
      if (!width || !height || !this.canvasCtx) {
        return
      }
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      if (this.real_width === 0 || this.real_height === 0) {
        this.real_width = width
        this.real_height = height
      }
      this.canvasCtx.drawImage(image, 0, 0, canvas.width, canvas.height)
      if (typeof image.close === 'function') {
        image.close()
      }
      this.firstFrameRendered = true
    },
    async renderFirstFramePreview(base64Data) {
      if (this.firstFrameRendered) {
        return
      }
      try {
        this.firstFrameImageUrl = `data:image/png;base64,${base64Data}`
        this.videoStarted = false
        this.loading = false
        const bytes = this.base64ToUint8Array(base64Data)
        if (!bytes) {
          this.firstFrameImageUrl = null
          return
        }
        const blob = new Blob([bytes], { type: 'image/png' })
        const image = await this.blobToImageSource(blob)
        this.drawFirstFrameImage(image)
      } catch (error) {
        this.firstFrameImageUrl = null
        console.error(`${this.no}-${this.device.serial} render first frame failed:`, error)
      }
    },
    mapKeyToAndroid(code, key) {
      // 映射键盘按键到Android键码
      const keyMap = {
        'Enter': 'KEYCODE_ENTER',
        'Backspace': 'KEYCODE_DEL',
        'Delete': 'KEYCODE_FORWARD_DEL',
        'ArrowUp': 'KEYCODE_DPAD_UP',
        'ArrowDown': 'KEYCODE_DPAD_DOWN',
        'ArrowLeft': 'KEYCODE_DPAD_LEFT',
        'ArrowRight': 'KEYCODE_DPAD_RIGHT',
        'Home': 'KEYCODE_HOME',
        'End': 'KEYCODE_MOVE_END',
        'PageUp': 'KEYCODE_PAGE_UP',
        'PageDown': 'KEYCODE_PAGE_DOWN',
        'Tab': 'KEYCODE_TAB',
        'Escape': 'KEYCODE_ESCAPE',
        'Space': 'KEYCODE_SPACE',
        'ShiftLeft': 'KEYCODE_SHIFT_LEFT',
        'ShiftRight': 'KEYCODE_SHIFT_RIGHT',
        'ControlLeft': 'KEYCODE_CTRL_LEFT',
        'ControlRight': 'KEYCODE_CTRL_RIGHT',
        'AltLeft': 'KEYCODE_ALT_LEFT',
        'AltRight': 'KEYCODE_ALT_RIGHT',
        // 移除Meta键映射，避免干扰输入法
        // 'MetaLeft': 'KEYCODE_META_LEFT',
        // 'MetaRight': 'KEYCODE_META_RIGHT',
        'CapsLock': 'KEYCODE_CAPS_LOCK',
        'F1': 'KEYCODE_F1',
        'F2': 'KEYCODE_F2',
        'F3': 'KEYCODE_F3',
        'F4': 'KEYCODE_F4',
        'F5': 'KEYCODE_F5',
        'F6': 'KEYCODE_F6',
        'F7': 'KEYCODE_F7',
        'F8': 'KEYCODE_F8',
        'F9': 'KEYCODE_F9',
        'F10': 'KEYCODE_F10',
        'F11': 'KEYCODE_F11',
        'F12': 'KEYCODE_F12'
      }

      return keyMap[code] || keyMap[key]
    },
    isInputableKey(event) {
      // 排除修饰键组合（除了Shift，因为Shift+字符是正常输入）
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return false
      }

      // 单个字符（字母、数字、标点符号）
      if (event.key.length === 1) {
        return true
      }

      // 支持常用的标点符号和特殊字符按键
      const inputableKeys = [
        'Comma',      // ,
        'Period',     // .
        'Semicolon',  // ;
        'Quote',      // '
        'BracketLeft', // [
        'BracketRight', // ]
        'Backquote',  // `
        'Slash',      // /
        'Backslash',  // \
        'Minus',      // -
        'Equal'       // =
      ]

      return inputableKeys.includes(event.code)
    },
    mouseDownListener(event) {
      if (this.loading || !this.videoStarted) {
        return
      }
      // 让canvas获得焦点以接收键盘事件
      if (this.big && this.$refs.canvas) {
        this.$refs.canvas.focus()
      }
      this.touch = true
      this.touchSync('d', event)
    },
    initializeWebCodecs() {
      if (!this.canvasCtx) {
        this.canvasCtx = this.$refs.canvas.getContext('2d');
      }
      try {
        this.videoDecoder = new VideoDecoder({
          output: (frame) => {
            this.frameQueue.push(frame);
            this.processFrameQueue();
          },
          error: (error) => {
            console.error(`${this.no}Error VideoDecoder:`, error, `code: ${error.code}`);
          },
        });
        // console.debug(`${this.no}-${this.device.serial} videoDecoder initialized`)


      } catch (e) {
        console.error(`${this.no}Error initializing VideoDecoder:`, e);
      }
    },

    processFrameQueue() {
      if (this.isRenderingFrame || this.frameQueue.length === 0) return;

      this.isRenderingFrame = true;
      const frame = this.frameQueue.shift();

      if (frame) {
        if (this.$refs.canvas) {
          // 确保canvas尺寸与视频帧匹配
          if (this.$refs.canvas.width !== frame.displayWidth ||
            this.$refs.canvas.height !== frame.displayHeight) {
            this.$refs.canvas.width = frame.displayWidth;
            this.$refs.canvas.height = frame.displayHeight;
          }

          this.canvasCtx.drawImage(frame, 0, 0);
          if (!this.videoStarted) {
            this.videoStarted = true
            this.firstFrameImageUrl = null
          }
        }
        frame.close(); // 重要：使用完毕后释放资源
      }

      this.isRenderingFrame = false;

      // 如果队列中还有帧，继续处理
      if (this.frameQueue.length > 0) {
        requestAnimationFrame(() => this.processFrameQueue());
      }
    },

    hexTwoDigits(value) {
      return value.toString(16).toUpperCase().padStart(2, "0");
    },
    processH264Data(data) {
      //       [. . . . . . . .|. . . .]. . . . . . . . . . . . . . . ...
      //      <-------------> <-----> <-----------------------------...
      //            PTS        packet        raw packet
      //                        size
      //      <--------------------->
      //            frame header

      // The most significant bits of the PTS are used for packet flags:

      //      byte 7   byte 6   byte 5   byte 4   byte 3   byte 2   byte 1   byte 0
      //     CK...... ........ ........ ........ ........ ........ ........ ........
      //     ^^<------------------------------------------------------------------->
      //     ||                                PTS
      //     | `- key frame
      //      `-- config packet
      try {
        // 处理完整的帧数据(包含12字节头部)
        let fullData = new Uint8Array(data);
        if (!fullData || fullData.length < 4) {
          return;
        }
        const pts = BigInt(fullData[0]) << 56n | BigInt(fullData[1]) << 48n | BigInt(fullData[2]) << 40n | BigInt(fullData[3]) << 32n |
          BigInt(fullData[4]) << 24n | BigInt(fullData[5]) << 16n | BigInt(fullData[6]) << 8n | BigInt(fullData[7])

        // 检查最高位是否为1（配置包标记）
        const isConfig = (pts & (1n << 63n)) !== 0n
        // 检查次高位是否为1（关键帧标记）
        const isIDR = (pts & (1n << 62n)) !== 0n
        let h264Data = fullData.slice(12);
        if (isConfig) {
          // 跳过前8个字节的 PTS 数据，只处理 H.264 数据
          const {
            profileIndex,
            constraintSet,
            levelIndex,
          } = h264ParseConfiguration(h264Data);
          //todo: resize
          const codec =
            "avc1." +
            this.hexTwoDigits(profileIndex) +
            this.hexTwoDigits(constraintSet) +
            this.hexTwoDigits(levelIndex);
          this.configBuffer = fullData
          this.videoDecoder.configure({
            codec: codec,
            optimizeForLatency: true,
          });
          // console.debug(`${this.no}-${this.device.serial} configure`)
          return
        }

        if (this.configBuffer !== undefined) {
          h264Data = new Uint8Array([...this.configBuffer, ...h264Data])
          this.configBuffer = undefined
        }
        if (this.videoDecoder.state === 'configured') {
          //check queue length
          if (this.frameQueue.length > 5 && !isIDR) {
            console.debug(`${this.no}-${this.device.serial} frameQueue is full(${this.frameQueue.length}), skip`)
            return
          }
          const chunk = new EncodedVideoChunk({
            type: isIDR ? 'key' : 'delta',
            timestamp: 0,
            data: h264Data
          });
          this.videoDecoder.decode(chunk);
        } else {
          if (this.videoDecoder.state === 'closed' && !this.loading) {
            console.debug(`${this.no}-${this.device.serial} videoDecoder is closed, loading`)
            this.loading = true
          }
        }
      } catch (e) {
        console.error(`${this.no}解码H.264数据出错:`, e);
        this.initializeWebCodecs();
      }
    },

    async connect() {
      const wsPort = await readTextFile('wsport.txt', { dir: BaseDirectory.AppData });
      const wsUrl = `ws://localhost:${wsPort}`
      this.scrcpy = new WebSocket(wsUrl)
      this.scrcpy.binaryType = 'arraybuffer'
      this.scrcpy.onopen = () => {
        // console.debug(`${this.no}-${this.device.serial}-${this.big ? 'big' : 'small'} onopen`)
        let max_size = this.big ? 1024 : this.screenResolution
        this.scrcpy.send(`${this.device.serial}`)
        // max size
        this.scrcpy.send(max_size)
        // control
        this.scrcpy.send('true')
        // fps
        this.scrcpy.send(this.big ? 30 : 15)
        // capabilities
        this.scrcpy.send(JSON.stringify({
          type: 'capabilities',
          firstFramePreview: true
        }))
      }
      this.scrcpy.onclose = (event) => {
        this.loading = true
        this.videoStarted = false
        console.log('ws close', event?.code, event?.reason)
      }
      this.scrcpy.onerror = () => {
        this.loading = true
        this.videoStarted = false
        console.error(`${this.no}-${this.device.serial}-${this.big ? 'big' : 'small'} onerror`)
        // 关闭解码器
        if (this.videoDecoder) {
          this.videoDecoder.close();
          this.videoDecoder = null;
        }
      }
      this.scrcpy.onmessage = message => {
        if (this.message_index >= 2 && typeof message.data === 'string') {
          if (message.data.startsWith(FIRST_FRAME_PREFIX)) {
            console.debug(`${this.no}-${this.device.serial} receive first frame preview, time: ${new Date().toISOString()}`)
            this.renderFirstFramePreview(message.data.slice(FIRST_FRAME_PREFIX.length))
          } else {
            console.debug('scrcpy string message ignored', message.data)
          }
          return
        }
        if (this.message_index < 2) {
          console.debug(`receive init message index: ${this.message_index}, data: ${message.data}, time: ${new Date().toISOString()}`)
          switch (this.message_index) {
            case 0: {
              this.name = message.data;
              while (this.name.endsWith('\u0000')) {
                this.name = this.name.slice(0, -1);
              }
              // limit max length 5, other with ...
              const max_length = this.big ? 10 : 6
              if (this.name.length > max_length) {
                this.name = `${this.name.substring(0, max_length)}...`
              }
              break
            }
            case 1: {
              if (this.big || this.width != this.default_width) {
                this.message_index += 1
                console.debug(`${this.no}-${this.device.serial} scrcpy handshake complete, ready for interaction`)
                return;
              }
              const [widthStr, heightStr] = message.data.split('x')
              this.real_width = widthStr
              this.real_height = heightStr
              this.scaled = this.height / this.real_height
              // console.debug(`${this.no}-${this.device.serial} real_width: ${this.real_width}, real_height: ${this.real_height}, scaled: ${this.scaled}`)

              break
            }
          }
          this.message_index += 1
          // Mark scrcpy as ready after handshake completes
          if (this.message_index >= 2) {
            console.debug(`${this.no}-${this.device.serial} scrcpy handshake complete, ready for interaction`)
          }
          return
        }
        this.loading = false
        // 使用WebCodecs处理视频数据
        this.processH264Data(message.data);
      }
    },
    syncDisplay() {
      this.loading = true
      this.firstFrameRendered = false
      this.firstFrameImageUrl = null
      this.videoStarted = false
      this.message_index = 0
      // 初始化WebCodecs
      this.initializeWebCodecs();
      this.connect();
    },
    closeScrcpy() {
      this.firstFrameRendered = false
      this.firstFrameImageUrl = null
      this.videoStarted = false
      this.message_index = 0
      if (this.scrcpy) {
        try {
          // Only send close frame if connection is fully open
          if (this.scrcpy.readyState === WebSocket.OPEN) {
            // Send close frame
            this.scrcpy.send(new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
            // console.debug(`${this.no}-${this.device.serial}-${this.big ? 'big' : 'small'} send close frame`)
          }

          // Clear event handlers
          this.scrcpy.onerror = null;
          this.scrcpy.onmessage = null;
          this.scrcpy.onclose = null;
          this.scrcpy.onopen = null;

          // Close the WebSocket connection
          if (this.scrcpy.readyState === WebSocket.OPEN || this.scrcpy.readyState === WebSocket.CONNECTING) {
            this.scrcpy.close();
          }
          // console.debug(`${this.no}-${this.device.serial}-${this.big ? 'big' : 'small'} close end`)


        } catch (error) {
          console.error(`Error closing WebSocket connection: ${error}`);
          // Ensure resources are cleaned up even if error occurs
          this.scrcpy = null;
          this.message_index = 0;
        }
      }
    },
    closeDecoder() {
      if (this.videoDecoder) {
        if (this.videoDecoder.state === 'closed') {
          this.videoDecoder = null;
        } else {
          this.videoDecoder.close();
        }
      }

      // 清空帧队列
      while (this.frameQueue.length > 0) {
        const frame = this.frameQueue.shift();
        if (frame) frame.close();
      }
    },
    async copyFromPhone() {
      if (!document.hasFocus()) {
        return
      }
      if (!this.visible) {
        return
      }

      // 检查是否有对话框打开
      const activeDialog = document.querySelector('dialog.modal[open]');
      if (activeDialog) {
        return;
      }

      this.$service
        .read_clipboard({
          serial: this.device.real_serial
        })
        .then(async res => {
          if (!res.data) {
            return
          }
          await writeText(res.data)
          await this.$emiter('NOTIFY', {
            type: 'success',
            message: 'Copy Success!',
            timeout: 2000
          });
        })
    }
  },
  async mounted() {
    this.i18n.preparing = this.$t('preparing');
    this.i18n.running = this.$t('running');
    this.i18n.ready = this.$t('ready');
    this.i18n.loading = this.$t('loading');
    this.i18n.connecting = this.$t('connecting');
    this.big = this.bigSize;

    this.listeners.push(await this.$listen('closeDevice', async (e) => {
      if (this.big) {
        const bigScreen = await getItem('bigScreen') || 'standard'
        if (bigScreen === 'standard') {
          this.closeScrcpy();
          this.closeDecoder();
          // 清除焦点
          if (this.$refs.canvas) {
            this.$refs.canvas.blur();
          }
          return;
        }
      }
      if (e.payload.serial === this.device.serial) {
        this.closeScrcpy();
        this.closeDecoder();
        this.big = false;
        this.operating = false
        // 清除焦点
        if (this.$refs.canvas) {
          this.$refs.canvas.blur();
        }
        this.syncDisplay();
      }
    }))
    this.listeners.push(await this.$listen('openDevice', async (e) => {
      if (e.payload.serial === this.device.serial) {
        const bigScreen = await getItem('bigScreen') || 'standard'
        if (bigScreen === 'standard') {
          this.closeScrcpy();
          this.closeDecoder();
          this.operating = true
          return
        }
        this.closeScrcpy();
        this.closeDecoder();
        this.big = true;
        this.syncDisplay();
      }
      if (e.payload.serial !== this.device.serial && this.operating) {
        const bigScreen = await getItem('bigScreen') || 'standard'
        if (bigScreen === 'standard') {
          this.closeScrcpy();
          this.closeDecoder();
          this.big = false;
          this.operating = false
          this.syncDisplay();
        }
      }
    }))
    this.listeners.push(await this.$listen('syncEventData', (e) => {
      if (!e.payload.devices.includes(this.device.real_serial)) {
        return
      }
      if (this.scrcpy) {
        this.scrcpy.send(e.payload.data)
      }
    }))
    this.listeners.push(await this.$listen('refreshDevice', (e) => {
      console.debug('refreshDevice', e.payload)
      this.closeScrcpy()
      this.closeDecoder()
      this.syncDisplay()
    }))
    this.listeners.push(await this.$listen('screenScaled', (e) => {
      if (e.payload.action === 'plus') {
        this.width = this.width * 1.1
        this.height = this.height * 1.1
      } else if (e.payload.action === 'minus') {
        this.width = this.width * 0.9
        this.height = this.height * 0.9
      }
    }))
    this.listeners.push(await this.$listen('screenResolution', (e) => {
      this.screenResolution = e.payload.resolution;
      this.closeScrcpy();
      this.closeDecoder();
      this.syncDisplay();
    }))

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.debug(`${this.no}-${this.device.serial} hidden`)
        this.visible = false
      } else {
        console.debug(`${this.no}-${this.device.serial} visible`)
        this.visible = true
      }
    })

    document.addEventListener('copy', () => {
      if (this.big) {
        this.copyFromPhone()
      }
    })

    this.syncDisplay()
  },
  async unmounted() {
    this.closeScrcpy()
    this.closeDecoder()
    this.listeners.forEach(listener => {
      listener()
    })
  },

}
</script>
