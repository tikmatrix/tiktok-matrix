<template>
  <div class="relative  shadow-2xl border-2 ring-1 ring-info ring-opacity-50 rounded-md">
    <div class="flex justify-center items-center">
      <div class="flex flex-col">
        <div class="flex flex-row drag bg-base-300">
          <div class="flex flex-1 items-center">
            <div class="flex-1">
              <span class="font-bold bg-secondary pl-2 pr-2 rounded-md ml-2" v-if="big">
                {{ no }}
              </span>
              <span class="text-xs text-primary font-bold ml-2">
                {{ $t('task') }}:
              </span>
              <span class="text-xs text-success font-bold" v-if="device.task_status == 1">
                {{ $t('running') }}
              </span>
              <span class="text-xs text-info font-bold" v-if="device.task_status != 1">
                {{ $t('idle') }}
              </span>
            </div>
            <span class="mr-2 text-sm font-bold" v-if="big">{{ name }} </span>
            <span class="text-xs font-sans font-bold mr-1">{{ device.connect_type == 0 ? 'USB' : 'TCP' }}</span>
            <span class="text-xs font-sans" v-if="big">FPS: {{ fps.toFixed(0) }}</span>
          </div>
          <button
            class="btn bg-transparent hover:bg-transparent hover:text-error text-gray-700 float-right border-0 p-4"
            @click="$emiter('closeDevice', this.device)" v-if="big">
            <font-awesome-icon icon="fa fa-times" class="h-4 w-4" />
          </button>

        </div>

        <div class="flex flex-row flex-1 ">
          <div>
            <div class="relative flex-1 object-fill" :style="'width:' + width + 'px;height:' + height + 'px'">
              <video class="absolute top-0 left-0 w-full h-full hover:cursor-pointer" ref="display" autoplay muted
                @mousedown="mouseDownListener" @mouseup="mouseUpListener" @mouseleave="mouseLeaveListener"
                @mousemove="mouseMoveListener"></video>
              <div @click="$emiter('openDevice', this.device)"
                class="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center" v-if="!big">
                <div class="bg-base-content p-2 rounded-md text-center opacity-70">
                  <div class="font-bold text-primary-content text-xl">
                    {{ no }}
                  </div>
                  <div class="text-primary-content font-bold">
                    {{ name }}
                  </div>
                </div>
              </div>
              <div
                class="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-gradient-to-tr from-secondary/30 to-neutral/30 opacity-90"
                v-if="loading">
                <font-awesome-icon icon="fa-solid fa-hourglass-end" class="h-6 w-6 text-primary rotate" />
              </div>
              <div
                class="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-base-300 opacity-90"
                v-if="operating">
                <font-awesome-icon icon="fa fa-hand-pointer" class="h-6 w-6 text-primary" />
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
import JMuxer from 'jmuxer'
import RightBars from './RightBars.vue';
import { readTextFile, BaseDirectory } from '@tauri-apps/api/fs'
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
    big: {
      type: Boolean,
      default: false
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
      rotation: 0,
      fps: 0,
      periodImageCount: 0,
      timer_task_status: null,
      jmuxer: null,
      scrcpy: null,
      loading: true,
      operating: false,
      input_dialog_title: '',
      input_dialog_text: '',
      input_callback: null,
      message_index: 0,
      name: 'Loading...',
      width: this.big ? 320 : 120,
      height: this.big ? 580 : 250,
      connect_count: 0,
      min_index: localStorage.getItem('min_index') || 0,
    }
  },
  methods: {
    updateIndex() {
      this.min_index = this.min_index - 1
      this.$service.index({ serial: this.device.real_serial, index: this.min_index }).then(res => {
        this.device.index = this.min_index
      })
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
    async connect() {
      const wsPort = await readTextFile('wsport.txt', { dir: BaseDirectory.AppData });
      const wsUrl = `ws://127.0.0.1:${wsPort}`
      this.scrcpy = new WebSocket(wsUrl)
      this.scrcpy.binaryType = 'arraybuffer'
      this.scrcpy.onopen = () => {
        // console.log('onopen,big:', this.big, 'operating:', this.operating, 'index:', this.device.index)
        let max_size = this.big ? 1080 : 540
        this.scrcpy.send(`${this.device.serial}`)
        // max size
        this.scrcpy.send(max_size)
        // control
        this.scrcpy.send(this.big ? 'false' : 'true')
        //fps
        this.scrcpy.send(this.big ? 30 : 15)

      }
      this.scrcpy.onclose = () => {
        this.loading = true
        console.log('onclose,big:', this.big, 'operating:', this.operating, 'index:', this.device.index)
        // if (!this.operating) {
        //   this.connect()
        // }
      }
      this.scrcpy.onerror = () => {
        this.loading = true
        console.log('onerror,big:', this.big, 'operating:', this.operating, 'index:', this.device.index)

      }
      this.scrcpy.onmessage = message => {
        // if (!this.jmuxer) {
        //   // console.log('jmuxer is null,big:', this.big, 'operating:', this.operating, 'index:', this.device.index, 'scrcpy:', this.scrcpy)
        //   this.closeScrcpy()
        //   return
        // }
        if (this.loading) {
          this.loading = false
        }
        if (this.message_index < 2) {
          // console.log(message)
          switch (this.message_index) {
            case 0:
              this.name = message.data.replace(/[\x00]+$/g, '');
              // limit max length 5, other with ...
              // if (!this.big && this.name.length > 3) {
              //   this.name = this.name.substring(0, 3) + '...'
              // } else if (this.big && this.name.length > 10) {
              //   this.name = this.name.substring(0, 10) + '...'
              // }

              break
            case 1:
              this.width = message.data.split('x')[0]
              this.height = message.data.split('x')[1]
              // console.log(this.width, this.height)
              if (this.big) {
                let scaled = 580 / this.height;
                // console.log(scaled)
                this.width = this.width * scaled
                this.height = 580
              } else {
                let scaled = 250 / this.height;
                // console.log(scaled)
                this.width = this.width * scaled
                this.height = 250
                // console.log(this.width, this.height)
              }
              break
          }
          this.message_index += 1
          return
        }
        // if (document.hidden) {
        //   return
        // }
        //read video
        this.periodImageCount += 1
        this.jmuxer.feed({
          video: new Uint8Array(message.data)
        })

      }
    },
    syncDisplay() {
      this.connect_count += 1

      this.loading = true
      if (this.$refs.display == null) {
        console.log('display is null,big:', this.big, 'operating:', this.operating, 'index:', this.device.index)
      }
      this.jmuxer = new JMuxer({
        node: this.$refs.display,
        mode: 'video',
        flushingTime: 1,
        maxDelay: 0,
        // fps: this.big ? 30 : 15,
        debug: false,
        onError: function () {
          console.log('onError')
          if (/Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) {
            this.jmuxer.reset()
          }
        }
      })
      // console.log('jmuxer init,big:', this.big, 'operating:', this.operating, 'index:', this.device.index)
      this.connect()
    },
    closeScrcpy() {
      if (this.scrcpy) {
        this.scrcpy.close()
        this.scrcpy.onerror = null
        this.scrcpy.onmessage = null
        this.scrcpy.onclose = null
        this.scrcpy.onopen = null
        this.scrcpy = null
      }
    },
    closeJmuxer() {
      if (this.jmuxer) {
        this.jmuxer.destroy()
        this.jmuxer = null
      }
    },


  },
  async mounted() {
    // console.log('miniremote mounted,big:', this.big, 'operating:', this.operating, 'index:', this.device.index)
    if (!this.big) {
      await this.$listen('closeDevice', (e) => {
        if (e.payload.serial === this.device.serial) {
          this.operating = false
          this.$refs.display.play();
        }
      });
      await this.$listen('openDevice', (e) => {
        if (e.payload.serial === this.device.serial) {
          this.operating = true
          this.$refs.display.play();
        }
        if (e.payload.serial !== this.device.serial && this.operating) {
          this.operating = false
        }
      });
      await this.$listen('syncEventData', (e) => {
        if (!e.payload.devices.includes(this.device.real_serial)) {
          return
        }
        if (this.scrcpy) {
          this.scrcpy.send(e.payload.data)
        }
      });
      // 获取视频元素
      var video = this.$refs.display;

      // 添加播放事件监听器
      video.addEventListener('play', () => {
        // console.log('Video started playing.currentTime: ' + video.currentTime);
        //set progress to newest
        video.currentTime = 999999
        video.playbackRate = 2;
      });

      // 添加暂停事件监听器
      video.addEventListener('pause', () => {
        // console.log('Video paused');
      });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          // this.closeScrcpy()
          // this.closeJmuxer()
        } else {
          // this.syncDisplay()
          // if (this.jmuxer) {
          // this.jmuxer.reset()
          // }
        }
      })
    } else {
      this.timer_task_status = setInterval(() => {
        this.fps = this.periodImageCount / 0.5
        this.periodImageCount = 0
      }, 1000)
    }
    this.syncDisplay()
    await this.$listen('refreshDevice', (e) => {
      console.log('refreshDevice', e.payload)
      this.syncDisplay()
    });

  },
  unmounted() {
    this.closeScrcpy()
    this.closeJmuxer()
    clearInterval(this.timer_task_status)
    this.timer_task_status = null
    clearInterval(this.timer_video)
    this.timer_video = null
  },

}
</script>
