<template>
  <div class="relative">
    <div class="flex justify-center items-center">
      <div class="flex flex-col">
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

        <div
          class="flex flex-row flex-1 relative shadow-2xl border-2 ring-2 ring-info ring-opacity-50 rounded-lg overflow-visible"
          :style="'width:' + width + 'px;height:' + height + 'px'">
          <div class="relative flex-1 object-fill" :style="'width:' + width + 'px;height:' + height + 'px'">
            <canvas
              class="absolute top-0 left-0 w-full h-full hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
              ref="canvas" @mousedown="mouseDownListener" @mouseup="mouseUpListener" @mouseleave="mouseLeaveListener"
              @mousemove="mouseMoveListener" tabindex="0" @keydown="keyDownListener" @keyup="keyUpListener"></canvas>

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
        </div>
      </div>
      <RightBars v-if="big" :serial="device.serial" :real_serial="device.real_serial" />
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
export default {
  name: 'Device',
  components: {
    RightBars,
  },
  props: {
    bigSize: {
      type: Boolean,
      default: false
    },
    // central resolution overrides (optional)
    resolutionSmall: {
      type: Number,
      default: undefined,
    },
    resolutionBig: {
      type: Number,
      default: undefined,
    },
    // Centralized display mode passed from parent (ManageDevices)
    bigScreenMode: {
      type: String,
      default: 'standard'
    },
    // Centralized hibernate casting flag passed from parent
    hibernateCastingEnabled: {
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
    gridCardHeight: {
      type: Number,
      default: 250
    },

  },
  data() {
    return {
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
      height: 250,
      width: 250 * 9 / 16,
      real_width: 0,
      real_height: 0,
      listeners: [],
      touch: false,
      canvasCtx: null,
      frameQueue: [],
      isRenderingFrame: false,
      configBuffer: undefined,
      videoStarted: false,
      hibernateSent: false,
      // WebSocket retry mechanism
      scrcpyReconnectAttempts: 0,
      scrcpyMaxRetries: 5,
      scrcpyReconnectTimer: null,
      scrcpyShouldReconnect: false,
      scrcpyConnectionTimeout: 15000, // 15 seconds
      scrcpyConnectionTimer: null,
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
    }
  },
  async created() {
    this.height = await this.calculateDeviceHeight()
    this.width = this.height / (16 / 9)
  },

  methods: {
    getDeviceIdentifier() {
      return this.device?.real_serial || this.device?.serial || null;
    },


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
      // Clean up existing decoder before creating a new one
      if (this.videoDecoder) {
        try {
          if (this.videoDecoder.state !== 'closed') {
            this.videoDecoder.close();
          }
        } catch (e) {
          console.warn(`${this.no}-${this.device.serial} Error closing existing videoDecoder:`, e);
        }
        this.videoDecoder = null;
      }

      if (!this.canvasCtx) {
        // Check if canvas ref exists before trying to get context
        if (!this.$refs.canvas) {
          console.warn(`${this.no} Canvas ref not available yet, will retry later`);
          return;
        }
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
        console.log(`${this.no}-${this.device.serial} videoDecoder initialized`)


      } catch (e) {
        console.error(`${this.no}Error initializing VideoDecoder:`, e);
      }
    },

    processFrameQueue() {
      if (this.isRenderingFrame || this.frameQueue.length === 0) return;

      this.isRenderingFrame = true;
      const frame = this.frameQueue.shift();

      if (frame) {
        if (this.$refs.canvas && this.canvasCtx) {
          // 确保canvas尺寸与视频帧匹配
          if (this.$refs.canvas.width !== frame.displayWidth ||
            this.$refs.canvas.height !== frame.displayHeight) {
            this.$refs.canvas.width = frame.displayWidth;
            this.$refs.canvas.height = frame.displayHeight;
          }

          this.canvasCtx.drawImage(frame, 0, 0);
          if (!this.videoStarted) {
            this.videoStarted = true
          }
        } else {
          console.warn(`${this.no}-${this.device.serial} Canvas or context not available, skipping frame`);
        }
        frame.close(); // 重要：使用完毕后释放资源
      }

      this.isRenderingFrame = false;

      // 如果队列中还有帧，继续处理
      if (this.frameQueue.length > 0) {
        requestAnimationFrame(() => this.processFrameQueue());
      }
    },

    // send a screen mode message via scrcpy websocket (if available)
    sendScreenMode(mode) {
      try {
        if (this.scrcpy && this.scrcpy.readyState === WebSocket.OPEN) {
          const payload = JSON.stringify({ type: 'screen', mode });
          this.scrcpy.send(payload);
          console.log(`${this.no}-${this.device.serial} sent screen mode:`, payload);
        } else {
          console.warn(`${this.no}-${this.device.serial} scrcpy not ready, cannot send screen mode`);
        }
      } catch (err) {
        console.error(`${this.no}-${this.device.serial} failed to send screen mode`, err);
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
        // Ensure videoDecoder is initialized before processing
        if (!this.videoDecoder || this.videoDecoder.state === 'closed') {
          console.log(`${this.no}-${this.device.serial} videoDecoder not ready, reinitializing...`);
          this.initializeWebCodecs();
          if (!this.videoDecoder) {
            console.error(`${this.no}-${this.device.serial} Failed to initialize videoDecoder`);
            return;
          }
        }

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
          console.log(`${this.no}-${this.device.serial} configure`)
          return
        }

        if (this.configBuffer !== undefined) {
          h264Data = new Uint8Array([...this.configBuffer, ...h264Data])
          this.configBuffer = undefined
        }
        if (this.videoDecoder.state === 'configured') {
          //check queue length
          if (this.frameQueue.length > 5 && !isIDR) {
            console.log(`${this.no}-${this.device.serial} frameQueue is full(${this.frameQueue.length}), skip`)
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
            console.log(`${this.no}-${this.device.serial} videoDecoder is closed, loading`)
            this.loading = true
          }
        }
      } catch (e) {
        console.error(`${this.no}解码H.264数据出错:`, e);
        // Reset decoder on error to ensure clean state
        if (this.videoDecoder) {
          try {
            if (this.videoDecoder.state !== 'closed') {
              this.videoDecoder.close();
            }
          } catch (closeError) {
            console.warn(`${this.no}-${this.device.serial} Error closing videoDecoder in catch:`, closeError);
          }
          this.videoDecoder = null;
        }
        this.initializeWebCodecs();
      }
    },

    clearScrcpyReconnectTimer() {
      if (this.scrcpyReconnectTimer) {
        clearTimeout(this.scrcpyReconnectTimer);
        this.scrcpyReconnectTimer = null;
      }
    },

    clearScrcpyConnectionTimer() {
      if (this.scrcpyConnectionTimer) {
        clearTimeout(this.scrcpyConnectionTimer);
        this.scrcpyConnectionTimer = null;
      }
    },

    getScrcpyReconnectDelay() {
      // Exponential backoff with jitter
      const baseDelay = 2000;
      const maxDelay = 20000;
      const exponentialDelay = baseDelay * Math.pow(2, this.scrcpyReconnectAttempts);
      const jitter = Math.random() * 1000;
      return Math.min(maxDelay, exponentialDelay + jitter);
    },

    scheduleScrcpyReconnect() {
      if (!this.scrcpyShouldReconnect || this.scrcpyReconnectTimer) {
        return;
      }

      // Check if max retries exceeded
      if (this.scrcpyReconnectAttempts >= this.scrcpyMaxRetries) {
        console.error(`${this.no}-${this.device.serial} Scrcpy max retries (${this.scrcpyMaxRetries}) exceeded, stopping reconnection`);
        this.scrcpyShouldReconnect = false;
        this.scrcpyReconnectAttempts = 0;
        this.loading = true;
        return;
      }

      const delay = this.getScrcpyReconnectDelay();
      console.log(`${this.no}-${this.device.serial} Scrcpy reconnect scheduled in ${delay}ms (attempt ${this.scrcpyReconnectAttempts + 1}/${this.scrcpyMaxRetries})`);

      this.scrcpyReconnectTimer = setTimeout(async () => {
        this.scrcpyReconnectTimer = null;
        this.scrcpyReconnectAttempts += 1;
        await this.connect();
      }, delay);
    },

    closeWebSocketConnection(ws, clearHandlersFirst = false) {
      if (!ws) return;

      try {
        if (clearHandlersFirst) {
          // Clear handlers before closing (prevents callbacks during reconnection)
          ws.onopen = null;
          ws.onmessage = null;
          ws.onclose = null;
          ws.onerror = null;
        }

        // Close the WebSocket connection
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          // Only send close frame if connection is fully open
          if (ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
              console.log(`${this.no}-${this.device.serial}-${this.big ? 'big' : 'small'} send close frame`);
            } catch (e) {
              console.error(`${this.no}-${this.device.serial} Failed to send close frame:`, e);
            }
          }
          ws.close();
        }

        if (!clearHandlersFirst) {
          // Clear handlers after closing (allows close callback to execute)
          ws.onerror = null;
          ws.onmessage = null;
          ws.onclose = null;
          ws.onopen = null;
        }
      } catch (error) {
        console.error(`${this.no}-${this.device.serial} Error closing WebSocket:`, error);
      }
    },

    cleanupScrcpy(stopReconnect = false) {
      if (stopReconnect) {
        this.scrcpyShouldReconnect = false;
        this.scrcpyReconnectAttempts = 0;
        this.clearScrcpyReconnectTimer();
      }
      this.clearScrcpyConnectionTimer();

      if (this.scrcpy) {
        // Store reference to avoid race conditions
        const ws = this.scrcpy;
        this.scrcpy = null;
        // Close with handlers cleared after (allows close callback)
        this.closeWebSocketConnection(ws, false);
      }
    },

    async connect() {
      // Reset state for fresh connection
      this.message_index = 0;
      this.hibernateSent = false;
      this.configBuffer = undefined;
      this.loading = true;

      // Clean up any existing connection without stopping reconnect
      // Preserve the reconnect flag that was set in syncDisplay
      if (this.scrcpy) {
        this.clearScrcpyConnectionTimer();
        const oldScrcpy = this.scrcpy;
        this.scrcpy = null;
        // Close with handlers cleared first (prevents callbacks during reconnection)
        this.closeWebSocketConnection(oldScrcpy, true);
      }

      // Ensure videoDecoder is initialized (using nextTick to ensure canvas is ready)
      this.$nextTick(() => {
        if (!this.videoDecoder || this.videoDecoder.state === 'closed') {
          this.initializeWebCodecs();
        }
      });

      try {
        const wsPort = await readTextFile('wsport.txt', { dir: BaseDirectory.AppData });
        const wsUrl = `ws://localhost:${wsPort}`;

        console.log(`${this.no}-${this.device.serial} Creating scrcpy WebSocket connection`);
        this.scrcpy = new WebSocket(wsUrl);
        this.scrcpy.binaryType = 'arraybuffer';

        // Set connection timeout
        this.scrcpyConnectionTimer = setTimeout(() => {
          if (this.scrcpy && this.scrcpy.readyState === WebSocket.CONNECTING) {
            console.warn(`${this.no}-${this.device.serial} Scrcpy connection timeout`);
            this.scrcpy.close();
          }
        }, this.scrcpyConnectionTimeout);

      } catch (error) {
        console.error(`${this.no}-${this.device.serial} Failed to create scrcpy WebSocket:`, error);
        if (this.scrcpyShouldReconnect) {
          this.scheduleScrcpyReconnect();
        }
        return;
      }

      this.scrcpy.onopen = async (event) => {
        console.log(`${this.no}-${this.device.serial}-${this.big ? 'big' : 'small'} WebSocket opened successfully`);
        this.clearScrcpyConnectionTimer();

        // Reset retry counter on successful connection
        this.scrcpyReconnectAttempts = 0;
        this.clearScrcpyReconnectTimer();

        // Use event.target to get the WebSocket that fired the event, avoiding race conditions
        const ws = event.target;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          console.warn(`${this.no}-${this.device.serial} WebSocket onopen fired but connection is not valid`);
          return;
        }

        // Double check this WebSocket is still the current one
        if (ws !== this.scrcpy) {
          console.warn(`${this.no}-${this.device.serial} WebSocket onopen fired for stale connection, ignoring`);
          return;
        }

        let max_size = this.big ? this.resolutionBig : this.resolutionSmall;


        ws.send(`${this.device.serial}`);
        // max size 
        ws.send(max_size);
        // control
        ws.send('true');
        // fps
        ws.send(this.big ? 30 : 15);
      }

      this.scrcpy.onclose = () => {
        console.log(`${this.no}-${this.device.serial} WebSocket closed`, event?.code, event?.reason);
        this.clearScrcpyConnectionTimer();
        this.loading = true;
        this.videoStarted = false;
        this.scrcpy = null;

        // Clean up videoDecoder on close to ensure fresh state on reconnect
        if (this.videoDecoder) {
          try {
            if (this.videoDecoder.state !== 'closed') {
              this.videoDecoder.close();
            }
          } catch (e) {
            console.warn(`${this.no}-${this.device.serial} Error closing videoDecoder:`, e);
          }
          this.videoDecoder = null;
        }

        if (this.scrcpyShouldReconnect) {
          this.scheduleScrcpyReconnect();
        }
      }

      this.scrcpy.onerror = (error) => {
        console.error(`${this.no}-${this.device.serial}-${this.big ? 'big' : 'small'} WebSocket error`, error);
        this.clearScrcpyConnectionTimer();
        this.loading = true;
        this.videoStarted = false;

        // 关闭解码器
        if (this.videoDecoder) {
          this.videoDecoder.close();
          this.videoDecoder = null;
        }

        // Close connection to trigger reconnect via onclose
        if (this.scrcpy && this.scrcpy.readyState !== WebSocket.CLOSING && this.scrcpy.readyState !== WebSocket.CLOSED) {
          this.scrcpy.close();
        }
      }

      this.scrcpy.onmessage = async message => {
        if (this.message_index >= 2 && typeof message.data === 'string') {
          console.log('scrcpy string message ignored', message.data)
          return
        }
        if (this.message_index < 2) {
          console.log(`receive init message index: ${this.message_index}, data: ${message.data}, time: ${new Date().toISOString()}`)
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
              // Check if message.data is a string before calling split
              if (typeof message.data !== 'string') {
                console.warn(`${this.no}-${this.device.serial} expected string resolution info, got ${typeof message.data}`)
                return;
              }
              const [widthStr, heightStr] = message.data.split('x')
              const parsedWidth = Number(widthStr)
              const parsedHeight = Number(heightStr)
              if (Number.isFinite(parsedWidth) && Number.isFinite(parsedHeight) && parsedHeight !== 0) {
                this.real_width = parsedWidth
                this.real_height = parsedHeight
                const aspectRatio = this.real_height / this.real_width
                this.height = await this.calculateDeviceHeight()
                this.width = this.height / aspectRatio
                console.log(`${this.no}-${this.device.serial} real_width: ${this.real_width}, real_height: ${this.real_height}, width: ${this.width}, height: ${this.height}`)

              } else {
                console.warn(`${this.no}-${this.device.serial} received invalid resolution info: ${message.data}`)
              }
              break
            }
          }
          this.message_index += 1
          // Mark scrcpy as ready after handshake completes
          if (this.message_index >= 2) {
            console.log(`${this.no}-${this.device.serial} scrcpy handshake complete, ready for interaction`)
          }
          return
        }
        this.loading = false
        // After handshake and when first real frames arrive, send hibernate/screen mode based on stored setting
        try {
          if (!this.hibernateSent && this.message_index >= 2) {
            // use centralized setting provided by parent
            const enabled = String(this.hibernateCastingEnabled) === 'true' || this.hibernateCastingEnabled === true;
            const mode = enabled ? 'off' : 'on';
            this.sendScreenMode(mode);
            this.hibernateSent = true;
          }
        } catch (err) {
          console.warn(`${this.no}-${this.device.serial} failed to send initial hibernate mode`, err);
        }

        // 使用WebCodecs处理视频数据
        this.processH264Data(message.data);
      }
    },
    //计算设备高度
    async calculateDeviceHeight() {
      if (this.big) {
        const bigScreen = this.bigScreenMode || 'standard'
        if (bigScreen === 'standard') {
          // min 50% of screen height; max 90% of screen height
          const screenHeight = window.innerHeight;
          return Math.min(Math.max(screenHeight * 0.5, this.gridCardHeight * 2), screenHeight * 0.8);
        } else if (bigScreen === 'docked') {
          return this.gridCardHeight * 2
        }
      }
      return this.gridCardHeight
    },
    async syncDisplay() {
      this.loading = true;
      this.videoStarted = false;
      this.message_index = 0;
      this.height = await this.calculateDeviceHeight()
      this.width = this.height / (16 / 9)
      // Enable automatic reconnection
      this.scrcpyShouldReconnect = true;
      this.scrcpyReconnectAttempts = 0;
      this.clearScrcpyReconnectTimer();

      // 初始化WebCodecs - use nextTick to ensure DOM is ready
      this.$nextTick(() => {
        this.initializeWebCodecs();
      });
      this.connect();
    },
    closeScrcpy() {
      this.videoStarted = false;
      this.message_index = 0;

      // Stop automatic reconnection and cleanup
      this.cleanupScrcpy(true);
      console.log(`${this.no}-${this.device.serial}-${this.big ? 'big' : 'small'} scrcpy closed`);
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
        const bigScreen = this.bigScreenMode || 'standard'
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
        await this.syncDisplay();
      }
    }))
    this.listeners.push(await this.$listen('openDevice', async (e) => {
      if (e.payload.serial === this.device.serial) {
        const bigScreen = this.bigScreenMode || 'standard'
        if (bigScreen === 'standard') {
          this.closeScrcpy();
          this.closeDecoder();
          this.operating = true
        } else if (bigScreen === 'docked') {
          this.closeScrcpy();
          this.closeDecoder();
          this.big = true;
          await this.syncDisplay();

        } else {
          console.warn(`Unknown bigScreen mode: ${bigScreen}`);
        }
      }
      if (e.payload.serial !== this.device.serial && this.operating) {
        const bigScreen = this.bigScreenMode || 'standard'
        if (bigScreen === 'standard') {
          this.closeScrcpy();
          this.closeDecoder();
          this.big = false;
          this.operating = false
          await this.syncDisplay();
        }
      } else if (e.payload.serial !== this.device.serial && this.big) {
        const bigScreen = this.bigScreenMode || 'standard'
        if (bigScreen === 'docked') {
          this.closeScrcpy();
          this.closeDecoder();
          this.big = false;
          await this.syncDisplay();
        }
      }
    }))
    this.listeners.push(await this.$listen('syncEventData', (e) => {
      if (!e.payload.devices.includes(this.device.real_serial)) {
        return
      }
      // Check WebSocket exists and is in OPEN state before sending
      if (this.scrcpy && this.scrcpy.readyState === WebSocket.OPEN) {
        this.scrcpy.send(e.payload.data)
      }
    }))

    this.listeners.push(await this.$listen('screenScaled', async (e) => {
      console.log(`${this.no}-${this.device.serial} received screenScaled event:`, e.payload)
      if (e.payload.size && this.real_height > 0 && this.real_width > 0) {
        const aspectRatio = this.real_height / this.real_width
        this.height = await this.calculateDeviceHeight()
        this.width = this.height / aspectRatio
        console.log(`${this.no}-${this.device.serial} screenScaled to width: ${this.width}, height: ${this.height}, aspectRatio: ${aspectRatio}`)
      } else {
        console.warn(`${this.no}-${this.device.serial} screenScaled event missing targetWidth or invalid real dimensions, this.real_width: ${this.real_width}, this.real_height: ${this.real_height}`)
      }
    }))
    // Listen to small screen resolution changes and apply only to small view
    this.listeners.push(await this.$listen('screenResolutionSmall', async (e) => {
      try {
        const newRes = e.payload?.resolution;
        if (!newRes) return;
        if (!this.big) {
          // Will be picked up in connect() via getItem or this change
          this.closeScrcpy();
          this.closeDecoder();
          await this.syncDisplay();
        }
      } catch (err) {
        console.warn(`${this.no}-${this.device.serial} failed to handle screenResolutionSmall`, err);
      }
    }))

    // Listen to big screen resolution changes and apply only to big view
    this.listeners.push(await this.$listen('screenResolutionBig', async (e) => {
      try {
        const newRes = e.payload?.resolution;
        if (!newRes) return;
        if (this.big) {
          // Will be picked up in connect() via getItem or this change
          this.closeScrcpy();
          this.closeDecoder();
          await this.syncDisplay();
        }
      } catch (err) {
        console.warn(`${this.no}-${this.device.serial} failed to handle screenResolutionBig`, err);
      }
    }))

    // listen for hibernateCastingChanged event and forward to device via scrcpy websocket
    this.listeners.push(await this.$listen('hibernateCastingChanged', async (e) => {
      try {
        const enabled = Boolean(e?.payload?.enabled);
        const mode = enabled ? 'off' : 'on';
        this.sendScreenMode(mode);
      } catch (err) {
        console.warn(`${this.no}-${this.device.serial} failed to handle hibernateCastingChanged`, err);
      }
    }))

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log(`${this.no}-${this.device.serial} hidden`)
        this.visible = false
      } else {
        console.log(`${this.no}-${this.device.serial} visible`)
        this.visible = true
      }
    })

    document.addEventListener('copy', async () => {
      if (this.big) {
        await this.copyFromPhone()
      }
    })

    await this.syncDisplay()
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
