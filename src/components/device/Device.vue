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
              <!-- <button class="btn btn-sm  bg-base-200 hover:bg-base-100 hover:text-red-500 text-red-700 border-0"
                v-if="big && task_status == 'RUNNING'" @click="stop_task">
                <font-awesome-icon icon="fa fa-stop" class="h-4 w-4" />{{ $t('stop') }}</button> -->
            </div>
            <div class="justify-center items-center text-center" v-if="big">
              <span class="text-xs mr-2 font-bold">{{ device.serial }} </span>
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
          <!-- <LeftBars v-if="big" :device="device" /> -->
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
            <!-- <BottomBar v-if="big" @send_keycode="send_keycode" /> -->
          </div>
          <RightBars v-if="big" />
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
import VideoConverter from 'h264-converter';
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
      converter: null,
      scrcpy: null,
      loading: true,
      operating: false,
      task_status: 'IDLE',
      input_dialog_title: '',
      input_dialog_text: '',
      input_callback: null,
      timer_video: null
    }
  },
  methods: {

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
        // console.log('onopen,big:', this.big, 'operating:', this.operating, 'index:', this.index)
        let max_size = this.big ? 1080 : 600
        this.scrcpy.send(`${this.device.serial}`)
        // max size
        this.scrcpy.send(max_size)
        // control
        this.scrcpy.send('true')

      }
      this.scrcpy.onclose = () => {
        this.loading = true
        // console.log('onclose,big:', this.big, 'operating:', this.operating, 'index:', this.index)
        // if (!this.operating) {
        //   this.connect()
        // }
      }
      this.scrcpy.onerror = () => {
        this.loading = true
        console.log(this.index, ':onerror')

      }
      this.scrcpy.onmessage = message => {
        if (!this.converter) {
          console.log('converter is null,big:', this.big, 'operating:', this.operating, 'index:', this.index, 'scrcpy:', this.scrcpy)
          this.closeScrcpy()
          return
        }
        if (this.loading) {
          this.loading = false
        }
        this.periodImageCount += 1
        let value = new Uint8Array(message.data);
        console.log(value);
        this.converter.appendRawData(value);
        // this.converter.appendRawData(message.data);
        // this.converter.play();
      }
    },
    syncDisplay() {
      // setup
      this.converter = new VideoConverter(this.$refs.display, 30, 6);
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
    closeconverter() {
      if (this.converter) {
        this.converter = null
      }
    }
  },
  mounted() {
    // console.log('miniremote mounted,big:', this.big, 'operating:', this.operating, 'index:', this.index)
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
          this.closeScrcpy()
          this.closeconverter()
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


    if (this.big) {
      this.timer_task_status = setInterval(() => {
        this.get_task_status()
      }, 1000)
      this.timer_fps = setInterval(() => {
        this.fps = this.periodImageCount / 0.5
        this.periodImageCount = 0
      }, 500)
    }
    this.timer_video = setInterval(() => {
      if (this.loading) {
        this.connect()
      }
    }, 5000)
  },
  unmounted() {
    this.closeScrcpy()
    this.closeconverter()
    clearInterval(this.timer_fps)
    this.timer_fps = null
    clearInterval(this.timer_task_status)
    this.timer_task_status = null
    clearInterval(this.timer_video)
    this.timer_video = null
  }
}
</script>
