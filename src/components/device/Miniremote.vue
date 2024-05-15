<template>
  <div class="relative  shadow-2xl border-2 border-solid border-black indicator">
    <div class="flex justify-center items-center">
      <div class="flex flex-col">
        <div class="flex flex-row drag  bg-base-300">
          <div class="flex flex-1  justify-center items-center text-center pr-1 pl-1">
            <div class="flex-1 justify-center items-center text-center">
              <span class="text-xs font-bold bg-blue-300 pl-2 pr-2 rounded-md">{{ index + 1 }}</span>
              <span :class="'text-xs' + (task_status == 'RUNNING' ? ' text-green-500' : ' text-red-500')" v-if="big"> -
                {{
                  $t(task_status) }}</span>
              <button class="btn btn-sm  bg-base-200 hover:bg-base-100 hover:text-red-500 text-red-700 border-0"
                v-if="big && task_status == 'RUNNING'" @click="stop_task">
                <font-awesome-icon icon="fa fa-stop" class="h-4 w-4" />{{ $t('stop') }}</button>
            </div>
            <div class="justify-center items-center text-center">
              <span class="text-xs mr-2 font-bold" v-if="big">{{ device.serial }} </span>
              <span class="text-xs font-sans">FPS: {{ fps.toFixed(0) }}</span>
            </div>
          </div>
          <button
            class="btn bg-transparent hover:bg-transparent hover:text-red-500 text-gray-700 float-right border-0 p-4"
            @click="$emitter.emit('closeDevice', this.device)" v-if="big">
            <font-awesome-icon icon="fa fa-times" class="h-4 w-4" />
          </button>
          <span
            class="bg-transparent hover:bg-transparent hover:text-red-500 text-gray-700 float-right border-0 pl-1 pr-1 pt-0 pb-0 cursor-pointer tooltip"
            :data-tip="$t('hideTips')" @click="$emitter.emit('hideDevice', this.device)" v-if="!big">
            <font-awesome-icon icon="fa fa-eye" class="h-4 w-4" />
          </span>
        </div>

        <div class="flex flex-row flex-1 ">
          <LeftBars v-if="big" :device="device" />
          <div>
            <div :class="'relative flex-1 object-fill' + (big ? ' w-[320px] h-[580px]' : ' w-[110px] h-[200px]')">
              <video class="absolute top-0 left-0 w-full h-full" ref="display" autoplay
                poster="../../assets/preview.jpg" muted @mousedown="mouseDownListener" @mouseup="mouseUpListener"
                @mouseleave="mouseLeaveListener" @mousemove="mouseMoveListener"></video>
              <div class="absolute top-0 left-0 w-full h-full bg-base-200 flex justify-center items-center"
                v-if="loading">
                <font-awesome-icon icon="fa-solid fa-hourglass-end" class="h-6 w-6 text-blue-500 rotate" />
              </div>
              <div class="absolute top-0 left-0 w-full h-full bg-base-200 flex justify-center items-center"
                v-if="operating">
                <font-awesome-icon icon="fa fa-hand-pointer" class="h-6 w-6 text-blue-500" />
              </div>

            </div>
            <BottomBar v-if="big" @send_keycode="send_keycode" />
          </div>
          <RightBars v-if="big"  />
        </div>

      </div>
    </div>
    <!-- <div v-if="!big && !loading && !operating"
      class="indicator-item indicator-center indicator-middle badge badge-lg badge-neutral bg-opacity-50 font-bold">
      <span>{{ index + 1 }}</span>
    </div> -->

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
    index: {
      type: Number,
      default: 0
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
      timer_fps: null,
      timer_task_status: null,
      jmuxer: null,
      scrcpy: null,
      loading: true,
      operating: false,
      task_status: 'IDLE',
      input_dialog_title: '',
      input_dialog_text: '',
      input_callback: null
    }
  },
  methods: {
    send_keycode(keycode) {
      this.$emitter.emit('eventData', JSON.stringify({
        type: 'keycode',//type=keycode
        operation: 'd',//operation=down
        keycode,
      }));
      setTimeout(() => {
        this.$emitter.emit('eventData', JSON.stringify({
          type: 'keycode',//type=keycode
          operation: 'u',//operation=up
          keycode,
        }));
      }, 100);
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
    stop_task() {
      this.$service
        .stop_task({
          serial: this.device.serial
        })
        .then(res => {
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
        mydevice.index = this.index
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
      this.scrcpy = new WebSocket(import.meta.env.VITE_WS_URL)
      this.scrcpy.binaryType = 'arraybuffer'
      this.scrcpy.onopen = () => {
        console.log('onopen,big:', this.big, 'operating:', this.operating, 'index:', this.index)
        let max_size = this.big ? 1080 : 480
        this.scrcpy.send(`${this.device.serial}`)
        // max size
        this.scrcpy.send(max_size)
        // control
        this.scrcpy.send('true')

      }
      this.scrcpy.onclose = () => {
        this.loading = true
        // this.jmuxer.reset()
        console.log('onclose,big:', this.big, 'operating:', this.operating, 'index:', this.index)
        //sleep 1s
        // setTimeout(() => {
        //   this.connect()
        // })
      }
      this.scrcpy.onerror = () => {
        this.loading = true
        // this.jmuxer.reset()
        console.log(this.index, ':onerror')
        // setTimeout(() => {
        //   this.connect()
        // })
      }
      this.scrcpy.onmessage = message => {
        if (!this.jmuxer) {
          console.log('jmuxer is null,big:', this.big, 'operating:', this.operating, 'index:', this.index, 'scrcpy:', this.scrcpy)
          return
        }
        if (this.loading) {
          this.loading = false
        }
        this.periodImageCount += 1
        this.jmuxer.feed({
          video: new Uint8Array(message.data)
        })
      }
    },
    syncDisplay() {
      if (import.meta.env.VITE_APP_MOCK === 'true') {
        setTimeout(() => {
          this.loading = false
        }, 3000)
        return
      }
      this.loading = true
      this.jmuxer = new JMuxer({
        node: this.$refs.display,
        mode: 'video',
        flushingTime: 1,
        maxDelay: 100,
        // fps: 50,
        debug: false,
        onError: function () {
          console.log('onError')
          if (/Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) {
            this.jmuxer.reset()
          }
        }
      })
      console.log('jmuxer init,big:', this.big, 'operating:', this.operating, 'index:', this.index)
      this.connect()
      // 播放事件
      let video=this.$refs.display
      video.addEventListener('play', function () {
        console.log('视频开始播放');
        console.log(video.currentTime, video.duration);
        // 视频进度快进到结尾
        video.currentTime = 999999;

      });

      // 暂停事件
      video.addEventListener('pause', function () {
        console.log('视频暂停播放');
        // 在这里执行你想要的操作
      });
      // this.$refs.display.play();
    }
  },
  mounted() {
    console.log('miniremote mounted,big:', this.big, 'operating:', this.operating, 'index:', this.index)
    if (!this.big) {
      this.$emitter.on('closeDevice', (device) => {
        if (device.serial === this.device.serial) {
          this.syncDisplay()
          this.operating = false
        }
      });
      this.$emitter.on('openDevice', (device) => {
        if (device.serial === this.device.serial) {
          this.operating = true
          if (this.scrcpy) {
            this.scrcpy.close()
            this.scrcpy = null
          }
          if (this.jmuxer) {
            this.jmuxer.destroy()
            this.jmuxer = null
          }
        }
        if (device.serial !== this.device.serial && this.operating) {
          this.syncDisplay()
          this.operating = false
        }
      });
    }

    this.syncDisplay()
    this.$emitter.on('syncEventData', (data) => {
      // console.log("receive syncEventData: ", data.devices)
      if (!data.devices.includes(this.device.serial)) {
        return
      }
      if (this.scrcpy) {
        this.scrcpy.send(data.data)
      }
    });

    this.timer_fps = setInterval(() => {
      this.fps = this.periodImageCount / 0.5
      this.periodImageCount = 0
    }, 500)
    if (this.big) {
      this.timer_task_status = setInterval(() => {
        this.get_task_status()
      }, 1000)
    }
  },
  unmounted() {
    console.log('miniremote unmounted,big:', this.big, 'operating:', this.operating, 'index:', this.index)
    if (this.scrcpy) {
      console.log('scrcpy close,big:', this.big, 'operating:', this.operating, 'index:', this.index)
      this.scrcpy.close()
      this.scrcpy = null
    }
    if (this.jmuxer) {
      console.log('jmuxer close,big:', this.big, 'operating:', this.operating, 'index:', this.index)
      this.jmuxer.destroy()
      this.jmuxer = null
    }
    clearInterval(this.timer_fps)
    this.timer_fps = null
    clearInterval(this.timer_task_status)
    this.timer_task_status = null
  }
}
</script>
