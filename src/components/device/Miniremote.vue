<template>
  <div
    :class="[big ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1', 'relative  shadow-2xl border-2 ring-1 ring-info ring-opacity-50 rounded-md']">
    <div class="flex justify-center items-center">
      <div class="flex flex-col">
        <div class="flex flex-row drag bg-base-300 p-2">
          <div class="flex flex-1 items-center gap-2">
            <div class="flex-1 flex items-center gap-2">
              <span class="font-bold bg-secondary px-3 py-1 rounded-lg text-secondary-content" v-if="big">
                {{ no }}
              </span>
              <div :class="['status animate-bounce', getTaskStatusColor]"></div>
              <span class="px-2 py-0.5 rounded-md font-bold" :class="[getTaskStatusTextColor, getScaledFontSize]">
                {{ getTaskStatus }}
              </span>
            </div>

          </div>
          <button class="btn btn-ghost btn-md hover:text-error" @click="$emiter('closeDevice', this.device)" v-if="big">
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
                  <div class="font-bold text-info text-md">
                    {{ no }} - {{ device.connect_type == 0 ? 'USB' : 'TCP' }}
                  </div>
                  <div class="text-info font-bold text-sm">
                    {{ name }}
                  </div>
                </div>
              </div>
              <div
                class="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-gradient-to-tr from-secondary/30 to-neutral/30 opacity-100"
                v-if="loading">
                <font-awesome-icon icon="fa-solid fa-hourglass-end" class="w-24 h-24 text-primary rotate" />
              </div>
              <div
                class="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-base-300 opacity-90"
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
import { os } from '@tauri-apps/api';
import NALU from 'h264-converter';
export default {
  name: 'Miniremote',
  components: {
    RightBars,
  },
  props: {
    no: {
      type: Number,
      default: 1
    },
    // big: {
    //   type: Boolean,
    //   default: false
    // },
    device: {
      type: Object,
      default: () => {
        return {}
      }
    },

  },
  data() {
    return {
      default_width: 150,
      default_height: 300,
      big: false,
      visible: true,
      rotation: 0,
      videoDecoder: null,
      hadIDR: false,
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
      screenScaled: (Number(localStorage.getItem('screenScaled')) || 100) / 100,
      screenResolution: Number(localStorage.getItem('screenResolution')) || 512,
      canvasCtx: null,
      frameQueue: [],
      isRenderingFrame: false,
      buffer: new Uint8Array(),
      bufferedPPS: false,
      bufferedSPS: false,
    }
  },
  computed: {
    getTaskStatus() {
      if (this.device.task_status == -1) {
        return this.getTranslation('preparing')
      }
      if (this.device.task_status == 1) {
        return this.getTranslation('running')
      }
      if (this.device.task_status == 0 || this.device.task_status == 2 || this.device.task_status == 3) {
        return this.getTranslation('ready')
      }
      return this.getTranslation('preparing')
    },

    getScaledFontSize() {
      if (this.big) return 'text-md';
      if (this.screenScaled <= 0.65) return 'text-[0.6rem]';
      if (this.screenScaled <= 0.75) return 'text-[0.7rem]';
      if (this.screenScaled <= 0.85) return 'text-[0.8rem]';
      if (this.screenScaled <= 1) return 'text-md';
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
      console.log('device.task_status:', this.device.task_status)
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
      console.log(`scaled: ${newVal}, screenScaled: ${this.screenScaled}`)
      if (this.real_width == 0 || this.real_height == 0 || this.screenScaled == 0 || newVal == 0) {
        return
      }
      const newScaled = newVal * this.screenScaled
      this.width = this.real_width * newScaled
      this.height = this.real_height * newScaled
      console.log(`newScaled: ${newScaled}, width: ${this.width}, height: ${this.height}`)
    },
    screenScaled(newVal) {
      if (this.real_width == 0 || this.real_height == 0 || this.screenScaled == 0 || newVal == 0) {
        return
      }
      const newScaled = this.scaled * newVal
      this.width = this.real_width * newScaled
      this.height = this.real_height * newScaled
    },
    width(newVal) {
      this.$emit('sizeChanged', newVal)
    }
  },
  methods: {
    getTranslation(key) {
      return this.$t(key)
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
      if (!this.$refs.canvas) return;

      this.canvasCtx = this.$refs.canvas.getContext('2d');
      this.keyFrameReceived = false;

      if (this.videoDecoder) {
        this.videoDecoder.close();
        this.videoDecoder = null;
      }

      try {
        this.videoDecoder = new VideoDecoder({
          output: (frame) => {
            this.frameQueue.push(frame);
            this.processFrameQueue();
          },
          error: (error) => {
            console.error(error, `code: ${error.code}`);
          },
        });

        // 支持的编解码器配置
        const config = {
          codec: 'avc1.42001E', // 高级H.264配置：High Profile, Level 4.0
          optimizeForLatency: true,
        };
        console.log('config:', config)
        this.videoDecoder.configure(config);
        console.log("VideoDecoder configured successfully");
      } catch (e) {
        console.error("Error initializing VideoDecoder:", e);
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
    processH264Data(data) {
      try {
        // 处理完整的帧数据(包含12字节头部)
        const fullData = new Uint8Array(data);
        if (!fullData || fullData.length < 4) {
          return;
        }
        const type = data[4] & 31;
        const isIDR = type === NALU.IDR;

        if (type === NALU.SPS) {
          console.log('收到SPS')
          const { codec, width, height } = WebCodecsPlayer.parseSPS(data.subarray(4));
          console.log('codec:', codec, 'width:', width, 'height:', height)
          this.scaleCanvas(width, height);
          const config = {
            codec,
            optimizeForLatency: true,
          }
          this.videoDecoder.configure(config);
          this.bufferedSPS = true;
          this.addToBuffer(data);
          this.hadIDR = false;
          return;
        } else if (type === NALU.PPS) {
          console.log('收到PPS')
          this.bufferedPPS = true;
          this.addToBuffer(data);
          return;
        } else if (type === NALU.SEI) {
          console.log('收到SEI')
          // Workaround for lonely SEI from ws-qvh
          if (!this.bufferedSPS || !this.bufferedPPS) {
            return;
          }
        }
        const array = this.addToBuffer(data);
        if (array && this.videoDecoder.state === 'configured' && !this.hadIDR && isIDR) {
          this.buffer = undefined;
          this.bufferedPPS = false;
          this.bufferedSPS = false;
          console.log("收到关键帧");
          const chunk = new EncodedVideoChunk({
            type: 'key',
            timestamp: 0,
            data: array.buffer
          });

          this.videoDecoder.decode(chunk);
        } else {
          console.log("收到非关键帧");
        }


      } catch (e) {
        console.error("解码H.264数据出错:", e);
      }
    },
    addToBuffer(data) {
      let array;
      if (this.buffer) {
        array = new Uint8Array(this.buffer.byteLength + data.byteLength);
        array.set(new Uint8Array(this.buffer));
        array.set(new Uint8Array(data), this.buffer.byteLength);
      } else {
        array = data;
      }
      this.buffer = array.buffer;
      return array;
    },
    async connect() {
      console.log('connect');
      const wsPort = await readTextFile('wsport.txt', { dir: BaseDirectory.AppData });
      const wsUrl = `ws://127.0.0.1:${wsPort}`
      this.scrcpy = new WebSocket(wsUrl)
      this.scrcpy.binaryType = 'arraybuffer'
      this.scrcpy.onopen = () => {
        console.log('onopen')
        let max_size = this.big ? 1024 : this.screenResolution
        this.scrcpy.send(`${this.device.serial}`)
        // max size
        this.scrcpy.send(max_size)
        // control
        this.scrcpy.send('true')
        // fps
        this.scrcpy.send(120)
      }
      this.scrcpy.onclose = () => {
        this.loading = true
        console.log('onclose,big:', this.big, 'operating:', this.operating, 'index:', this.device.index)
        // 关闭解码器
        if (this.videoDecoder) {
          this.videoDecoder.close();
          this.videoDecoder = null;
        }
      }
      this.scrcpy.onerror = () => {
        this.loading = true
        console.error('WebSocket error occurred')
        console.log('onerror,big:', this.big, 'operating:', this.operating, 'index:', this.device.index)
        // 关闭解码器
        if (this.videoDecoder) {
          this.videoDecoder.close();
          this.videoDecoder = null;
        }
      }
      this.scrcpy.onmessage = message => {
        this.loading = false
        if (this.message_index < 2) {
          console.log(message)
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
              console.log('message.data:', message.data)
              this.real_width = message.data.split('x')[0]
              this.real_height = message.data.split('x')[1]
              this.scaled = this.height / this.real_height
              console.log(`height: ${this.height},real_width: ${this.real_width}, real_height: ${this.real_height}, scaled: ${this.scaled}`)

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
      console.log('syncDisplay');
      this.loading = true
      this.keyFrameReceived = false;

      // 初始化WebCodecs
      this.initializeWebCodecs();
      this.connect();
    },
    closeScrcpy() {
      if (this.scrcpy) {
        this.scrcpy.close()
        this.scrcpy.onerror = null
        this.scrcpy.onmessage = null
        this.scrcpy.onclose = null
        this.scrcpy.onopen = null
        this.scrcpy = null
        this.message_index = 0
      }
    },
    closeDecoder() {
      if (this.videoDecoder) {
        this.videoDecoder.close();
        this.videoDecoder = null;
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
    this.listeners.push(await this.$listen('closeDevice', (e) => {
      if (e.payload.serial === this.device.serial) {
        this.big = false;
        this.closeScrcpy();
        this.closeDecoder();
        this.syncDisplay();
      }
    }))
    this.listeners.push(await this.$listen('openDevice', (e) => {
      if (e.payload.serial === this.device.serial) {
        this.big = true;
        this.closeScrcpy();
        this.closeDecoder();
        this.syncDisplay();
      }
      if (e.payload.serial !== this.device.serial && this.operating) {
        this.operating = false
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
      this.screenScaled = e.payload.scaled
    }))
    this.listeners.push(await this.$listen('screenResolution', (e) => {
      this.screenResolution = e.payload.resolution;
      this.closeScrcpy();
      this.closeDecoder();
      this.syncDisplay();
    }))

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log(`device${this.no}-${this.device.serial} hidden`)
      } else {
        console.log(`device${this.no}-${this.device.serial} visible`)
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
