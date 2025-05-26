<template>
  <div
    :class="[big ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1', 'relative  shadow-2xl border-2 ring-1 ring-info ring-opacity-50 rounded-md']">
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

        <div class="flex flex-row flex-1 relative"
          :style="'width:' + (big ? 2 * width : width) + 'px;height:' + (big ? 2 * height : height) + 'px'">
          <div>
            <div class="relative flex-1 object-fill"
              :style="'width:' + (big ? 2 * width : width) + 'px;height:' + (big ? 2 * height : height) + 'px'">
              <canvas class="absolute top-0 left-0 w-full h-full hover:cursor-pointer" ref="canvas"
                @mousedown="mouseDownListener" @mouseup="mouseUpListener" @mouseleave="mouseLeaveListener"
                @mousemove="mouseMoveListener"></canvas>
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
                  <div class="text-info font-bold text-sm">
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
import RightBars from './RightBars.vue';
import { readTextFile, BaseDirectory } from '@tauri-apps/api/fs'
import { writeText } from '@tauri-apps/api/clipboard'
import { h264ParseConfiguration } from '@yume-chan/scrcpy';
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
      default_width: Number(localStorage.getItem('deviceWidth')) || 150,
      default_height: Number(localStorage.getItem('deviceHeight')) || 300,
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
      height: Number(localStorage.getItem('deviceHeight')) || 300,
      width: Number(localStorage.getItem('deviceWidth')) || 150,
      real_width: 0,
      real_height: 0,
      scaled: 1,
      listeners: [],
      touch: false,
      screenResolution: Number(localStorage.getItem('screenResolution')) || 512,
      canvasCtx: null,
      frameQueue: [],
      isRenderingFrame: false,
      configBuffer: undefined,
      i18n: {
        preparing: '',
        running: '',
        ready: ''
      }
    }
  },
  computed: {
    getTaskStatus() {
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
  watch: {
    scaled(newVal) {
      console.log(`scaled: ${newVal}`)
      if (this.real_width == 0 || this.real_height == 0 || newVal == 0) {
        return
      }
      this.width = this.real_width * newVal
      this.height = this.real_height * newVal
      console.log(`newScaled: ${newVal}, width: ${this.width}, height: ${this.height}`)
      this.$emit('sizeChanged', this.width)
    },
    width(newVal) {
      localStorage.setItem('deviceWidth', newVal)
      this.$emit('sizeChanged', newVal)
    },
    height(newVal) {
      localStorage.setItem('deviceHeight', newVal)
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
      if (this.loading) {
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
      if (this.loading) {
        return
      }
      if (!this.touch) {
        return
      }
      this.touch = false
      this.touchSync('u', event)

    },
    mouseDownListener(event) {
      if (this.loading) {
        return
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
        if (this.$refs.canvas) {
          // 确保canvas尺寸与视频帧匹配
          if (this.$refs.canvas.width !== frame.displayWidth ||
            this.$refs.canvas.height !== frame.displayHeight) {
            this.$refs.canvas.width = frame.displayWidth;
            this.$refs.canvas.height = frame.displayHeight;
          }

          this.canvasCtx.drawImage(frame, 0, 0);
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
            croppedWidth,
            croppedHeight,
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
        this.initializeWebCodecs();
      }
    },

    async connect() {
      const wsPort = await readTextFile('wsport.txt', { dir: BaseDirectory.AppData });
      const wsUrl = `ws://127.0.0.1:${wsPort}`
      this.scrcpy = new WebSocket(wsUrl)
      this.scrcpy.binaryType = 'arraybuffer'
      this.scrcpy.onopen = () => {
        console.log(`${this.no}-${this.device.serial}-${this.big ? 'big' : 'small'} onopen`)
        let max_size = this.big ? 1024 : this.screenResolution
        this.scrcpy.send(`${this.device.serial}`)
        // max size
        this.scrcpy.send(max_size)
        // control
        this.scrcpy.send('true')
        // fps
        this.scrcpy.send(this.big ? 30 : 15)
      }
      this.scrcpy.onclose = () => {
        this.loading = true
        console.log(`${this.no}-${this.device.serial}-${this.big ? 'big' : 'small'} onclose`)
      }
      this.scrcpy.onerror = () => {
        this.loading = true
        console.error(`${this.no}-${this.device.serial}-${this.big ? 'big' : 'small'} onerror`)
        // 关闭解码器
        if (this.videoDecoder) {
          this.videoDecoder.close();
          this.videoDecoder = null;
        }
      }
      this.scrcpy.onmessage = message => {
        this.loading = false
        if (this.message_index < 2) {
          switch (this.message_index) {
            case 0:
              this.name = message.data.replace(/[\x00]+$/g, '');
              // limit max length 5, other with ...
              const max_length = this.big ? 10 : 6
              if (this.name.length > max_length) {
                this.name = this.name.substring(0, max_length) + '...'
              }
              break
            case 1:
              if (this.big || this.width != this.default_width) {
                this.message_index += 1
                return;
              }
              this.real_width = message.data.split('x')[0]
              this.real_height = message.data.split('x')[1]
              this.scaled = this.height / this.real_height
              console.log(`${this.no}-${this.device.serial} real_width: ${this.real_width}, real_height: ${this.real_height}, scaled: ${this.scaled}`)

              break
          }
          this.message_index += 1
          return
        }

        // 使用WebCodecs处理视频数据
        this.processH264Data(message.data);
      }
    },
    syncDisplay() {
      this.loading = true
      // 初始化WebCodecs
      this.initializeWebCodecs();
      this.connect();
    },
    closeScrcpy() {
      if (this.scrcpy) {
        try {
          // 检查连接状态
          if (this.scrcpy.readyState === WebSocket.OPEN || this.scrcpy.readyState === WebSocket.CONNECTING) {
            // 发送关闭帧
            this.scrcpy.send(new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
            console.log(`${this.no}-${this.device.serial}-${this.big ? 'big' : 'small'} send close frame`)
          }

          // 清空事件处理器
          this.scrcpy.onerror = null;
          this.scrcpy.onmessage = null;
          this.scrcpy.onclose = null;
          this.scrcpy.onopen = null;
          console.log(`${this.no}-${this.device.serial}-${this.big ? 'big' : 'small'} close end`)


        } catch (error) {
          console.error(`关闭 WebSocket 连接时出错: ${error}`);
          // 确保即使出错也能清理资源
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
            message: this.$t('copySuccess'),
            timeout: 2000
          });
        })
    }
  },
  async mounted() {
    this.i18n.preparing = this.$t('preparing');
    this.i18n.running = this.$t('running');
    this.i18n.ready = this.$t('ready');
    this.big = this.bigSize;

    this.listeners.push(await this.$listen('closeDevice', (e) => {
      if (this.big) {
        const bigScreen = localStorage.getItem('bigScreen') || 'standard'
        if (bigScreen === 'standard') {
          this.closeScrcpy();
          this.closeDecoder();
          return;
        }
      }
      if (e.payload.serial === this.device.serial) {
        this.closeScrcpy();
        this.closeDecoder();
        this.big = false;
        this.operating = false
        this.syncDisplay();
      }
    }))
    this.listeners.push(await this.$listen('openDevice', (e) => {
      if (e.payload.serial === this.device.serial) {
        const bigScreen = localStorage.getItem('bigScreen') || 'standard'
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
        const bigScreen = localStorage.getItem('bigScreen') || 'standard'
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
      console.log('refreshDevice', e.payload)
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
        console.log(`${this.no}-${this.device.serial} hidden`)
        this.visible = false
      } else {
        console.log(`${this.no}-${this.device.serial} visible`)
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
