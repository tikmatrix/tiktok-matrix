<template>
  <div class="relative  shadow-2xl border-2 border-solid border-black indicator">
    <div class="flex justify-center items-center">
      <div class="flex flex-col">
        <div class="flex flex-row drag  bg-base-300">
          <div class="flex flex-1 justify-center items-center text-center">
            <div class="flex-1 justify-center items-center text-center">
              <details ref="edit_index_input" class="dropdown dropdown-top">
                <summary class="btn btn-xs bg-transparent hover:bg-transparent border-0">
                  <span class="text-xs font-bold bg-blue-300 pl-1 pr-1 rounded-md">
                    {{ device.index }}
                    <font-awesome-icon icon="fa-solid fa-edit" class="text-blue-500 cursor-pointer"></font-awesome-icon>
                  </span>
                </summary>
                <input
                  class="input input-sm input-bordered border-2 dropdown-content z-10 shadow bg-white w-20 border-green-500"
                  v-model="device.index" type="number" @keyup.enter="updateIndex"
                  @focus="(event) => event.target.select()" @blur="updateIndex" />
              </details>

              <span :class="'text-xs' + (task_status == 'RUNNING' ? ' text-green-500' : ' text-red-500')" v-if="big"> -
                {{
                  $t(task_status) }}</span>
            </div>
            <div class="justify-center items-center text-center">
              <span :class="'mr-2 ' + (big ? 'text-sm font-bold' : 'text-xs')">{{ name }} </span>
              <span class="text-xs font-sans" v-if="big">FPS: {{ fps.toFixed(0) }}</span>
            </div>
          </div>
          <button
            class="btn bg-transparent hover:bg-transparent hover:text-red-500 text-gray-700 float-right border-0 p-4"
            @click="$emitter.emit('closeDevice', this.device)" v-if="big">
            <font-awesome-icon icon="fa fa-times" class="h-4 w-4" />
          </button>
          <!-- <span
            class="bg-transparent hover:bg-transparent hover:text-red-500 text-gray-700 float-right border-0 pl-1 pr-1 pt-0 pb-0 cursor-pointer tooltip"
            :data-tip="$t('hideTips')" @click="$emitter.emit('hideDevice', this.device)" v-if="!big">
            <font-awesome-icon icon="fa fa-eye" class="h-4 w-4" />
          </span> -->
        </div>

        <div class="flex flex-row flex-1 ">
          <!-- <LeftBars v-if="big" :device="device" /> -->
          <div>
            <div class="relative flex-1 object-fill" :style="'width:' + width + 'px;height:' + height + 'px'">
              <video class="absolute top-0 left-0 w-full h-full" ref="display" autoplay
                poster="../../assets/preview.jpg" muted @mousedown="mouseDownListener" @mouseup="mouseUpListener"
                @mouseleave="mouseLeaveListener" @mousemove="mouseMoveListener"></video>
              <div class="absolute top-0 left-0 w-full h-full bg-base-200 flex justify-center items-center"
                v-if="loading">
                <font-awesome-icon icon="fa-solid fa-hourglass-end" class="h-6 w-6 text-blue-500 rotate" />
              </div>
              <div
                class="absolute top-0 left-0 w-full h-full bg-base-200 flex flex-col justify-center items-center opacity-90"
                v-if="operating">
                <font-awesome-icon icon="fa fa-hand-pointer" class="h-6 w-6 text-blue-500" />
                <span class="text-blue-500 font-bold">{{ $t('operating') }}</span>
              </div>

            </div>
            <!-- <BottomBar v-if="big" @send_keycode="send_keycode" /> -->
          </div>
          <RightBars v-if="big" :serial="device.serial" />
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
import LeftBars from './LeftBars.vue';
import RightBars from './RightBars.vue';
import BottomBar from './BottomBar.vue';
import { height } from '@fortawesome/free-brands-svg-icons/fa42Group';
export default {
  name: 'Miniremote',
  components: {
    LeftBars,
    RightBars,
    BottomBar
  },
  props: {
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
      task_status: 'IDLE',
      input_dialog_title: '',
      input_dialog_text: '',
      input_callback: null,
      message_index: 0,
      name: 'UNKNOWN',
      width: this.big ? 320 : 120,
      height: this.big ? 580 : 250,
      connect_count: 0,
    }
  },
  methods: {
    updateIndex() {
      this.$refs.edit_index_input.removeAttribute('open')
      this.$service.index({ serial: this.device.serial, index: this.device.index }).then(res => {
        this.$emitter.emit('showToast', this.$t('indexUpdated'))
      })
    },
    get_task_status() {
      this.$service
        .get_task_status({
          serial: this.device.serial
        })
        .then(res => {
          this.task_status = res.data
        })
        .catch(err => {
          console.log(err)
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
    touchSync(operation, event) {
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
      this.$emitter.emit('eventData', data)
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
    mouseUpListener(event) {
      if (!this.touch) {
        return
      }
      this.touch = false
      if (!this.big) {
        // console.log("open device: ",this.device)
        let mydevice = this.device
        this.$emitter.emit('openDevice', mydevice)

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
    connect() {
      this.scrcpy = new WebSocket(this.$config.wsUrl)
      this.scrcpy.binaryType = 'arraybuffer'
      this.scrcpy.onopen = () => {
        console.log('onopen,big:', this.big, 'operating:', this.operating, 'index:', this.device.index)
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
              if (!this.big && this.name.length > 5) {
                this.name = this.name.substring(0, 5) + '...'
              } else if (this.big && this.name.length > 10) {
                this.name = this.name.substring(0, 10) + '...'
              }

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
    }
  },
  mounted() {
    // console.log('miniremote mounted,big:', this.big, 'operating:', this.operating, 'index:', this.device.index)
    if (!this.big) {
      this.$emitter.on('closeDevice', (device) => {
        if (device.serial === this.device.serial) {
          this.operating = false
          this.$refs.display.play();
        }
      });
      this.$emitter.on('openDevice', (device) => {
        if (device.serial === this.device.serial) {
          this.operating = true
          this.$refs.display.play();
        }
        if (device.serial !== this.device.serial && this.operating) {
          this.operating = false
        }
      });
      this.$emitter.on('syncEventData', (data) => {
        if (!data.devices.includes(this.device.serial)) {
          return
        }
        if (this.scrcpy) {
          this.scrcpy.send(data.data)
        }
      });
      // 获取视频元素
      var video = this.$refs.display;

      // 添加播放事件监听器
      video.addEventListener('play', () => {
        console.log('Video started playing.currentTime: ' + video.currentTime);
        //set progress to newest
        video.currentTime = 999999
        video.playbackRate = 2;
      });

      // 添加暂停事件监听器
      video.addEventListener('pause', () => {
        console.log('Video paused');
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
        this.get_task_status()
        this.fps = this.periodImageCount / 0.5
        this.periodImageCount = 0
      }, 1000)
    }
    this.syncDisplay()
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
