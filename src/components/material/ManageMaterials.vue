<template>
  <div class="w-full">
    <Pagination :items="materials" :searchKeys="['name']" @refresh="get_materials">
      <template v-slot:buttons>
        <MyButton @click="selectVideos" label="upload" icon="fa fa-add" />
        <MyButton @click="$refs.add_video_dialog.showModal()" label="capture" icon="fa fa-add" />
      </template>
      <template v-slot:default="slotProps">
        <div class="overflow-x-auto">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>{{ $t('id') }}</th>
                <th>{{ $t('source') }}</th>
                <th>{{ $t('status') }}</th>
                <th>{{ $t('preview') }}</th>
                <th>{{ $t('md5') }}</th>
                <th>{{ $t('createTime') }}</th>
                <th>{{ $t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(material, index) in slotProps.items" :key="index">
                <td>{{ material.id }}</td>
                <td>{{ $t(`${material.source}`) }}</td>
                <td>
                  <div class="badge badge-success" v-if="material.used == '0'">{{ $t('unused') }}</div>
                  <div class="badge badge-error" v-else>{{ $t('used') }}</div>
                </td>
                <td @click="show_material(material)">
                  <div class="cursor-pointer border rounded items-center text-center flex align-middle">
                    <template v-if="material.name.endsWith('.mp4') || material.name.endsWith('.webm')">
                      <video :src="`${$config.apiUrl}/${material.name}`"
                        class="w-[100px] h-[100px] max-w-none flex-1"></video>
                    </template>
                    <template v-else>
                      <img :src="`${$config.apiUrl}/${material.name}`" class="w-[100px] h-[100px] max-w-none flex-1" />
                    </template>
                  </div>
                </td>
                <td>
                  <span class="text-sm">{{ material.md5 }}</span>
                </td>
                <td>{{ material.create_time }}</td>
                <td>
                  <!-- <button class="btn btn-sm btn-success" @click="show_fission_video_dialog(material)">{{ $t('fission')
                    }}</button> -->
                  <button class="bg-red-500 hover:bg-red-700 text-white btn btn-sm" @click="delete_material(material)">
                    {{ $t('delete') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </Pagination>

    <dialog ref="detail_modal" class="modal">
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <Detail :material="currentMaterial" v-if="currentMaterial && $refs.detail_modal.open" />
      </div>
    </dialog>
    <dialog id="confirm_modal" class="modal">
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="font-bold text-lg">{{ $t('confirmClearAll') }}</h3>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-primary" @click="delete_all">{{ $t('confirm') }}</button>
          </form>
        </div>
      </div>
    </dialog>
  </div>
  <!-- upload progress dialog -->
  <dialog ref="upload_dialog" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <!-- <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button> -->
      </form>
      <h3 class="font-bold text-lg">Upload Progress</h3>
      <div class="py-4">
        <progress class="progress progress-success w-full" :value="upload_progress"
          :max="max_upload_progress"></progress>
      </div>
    </div>
  </dialog>
  <!-- add video dialog -->
  <dialog ref="add_video_dialog" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg">{{ $t('capture') }}</h3>
      <a class="link link-primary link-sm" href="https://doc.tikmatrix.com/blog/download-video-supported-sites"
        target="_blank">{{ $t('supportedSites') }}</a>
      <label class="input input-sm flex items-center gap-2 my-4">
        {{ $t('proxy') }}:
        <input type="text" class="grow" placeholder="127.0.0.1:7890" v-model="download_proxy" />
      </label>
      <label class="input input-sm flex items-center gap-2 my-4">
        {{ $t('videoUrl') }}:
        <input type="text" class="grow" placeholder="https://www.tiktok.com/@tikmatrix6931/video/7369856283689880878"
          v-model="new_video_url" />
      </label>
      <button class="btn btn-primary btn-sm" @click="capture">{{ $t('capture') }}</button>
      <div class="py-4">
        <p class="text-sm">{{ downloadOutput }}</p>
      </div>
      <div class="modal-action">

      </div>
    </div>
  </dialog>
  <!-- fission video dialog -->
  <dialog ref="fission_video_dialog" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg">{{ $t('fission') }}</h3>
      <div class="flex flex-row">
        <div class="form-control">
          <label class="cursor-pointer label">
            <span class="label-text">{{ $t('dynamicScale') }}</span>
            <input type="checkbox" checked="checked" class="checkbox checkbox-success" v-model="dynamic_scale" />
          </label>
        </div>
        <div class="form-control">
          <label class="cursor-pointer label">
            <span class="label-text">{{ $t('smartFrameCut') }}</span>
            <input type="checkbox" checked="checked" class="checkbox checkbox-success" v-model="smart_frame_cut" />
          </label>
        </div>
        <div class="form-control">
          <label class="cursor-pointer label">
            <span class="label-text">{{ $t('adjustFrameRate') }}</span>
            <input type="checkbox" checked="checked" class="checkbox checkbox-success" v-model="adjust_frame_rate" />
          </label>
        </div>
        <div class="form-control">
          <label class="cursor-pointer label">
            <span class="label-text">{{ $t('adjustBitRate') }}</span>
            <input type="checkbox" checked="checked" class="checkbox checkbox-success" v-model="adjust_bit_rate" />
          </label>
        </div>
      </div>

      <button class="btn btn-primary btn-sm" @click="fission">{{ $t('fission') }}</button>
      <div class="py-4">
        <p class="text-sm">{{ fissionOutput }}</p>
      </div>
      <div class="modal-action">

      </div>
    </div>
  </dialog>
</template>
<script>
import Detail from './Detail.vue'
import MyButton from '../Button.vue'
import Pagination from '../Pagination.vue'
import * as util from '../../utils'
import { open } from '@tauri-apps/api/dialog';
export default {
  name: 'app',
  components: {
    Detail,
    MyButton,
    Pagination
  },
  props: {
    group: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      materials: [],
      currentMaterial: null,
      upload_progress: 10,
      max_upload_progress: 100,
      new_video_url: null,
      downloadOutput: null,
      download_proxy: util.getData('download_proxy') || '',
      fissionOutput: null,
      dynamic_scale: true,
      smart_frame_cut: true,
      adjust_frame_rate: true,
      adjust_bit_rate: true
    }
  },
  methods: {
    async selectVideos() {
      const filePath = await open({
        multiple: true, // 是否允许多选文件
        directory: false, // 是否选择目录
        filters: [ // 文件过滤器
          { name: 'Video Files', extensions: ['mp4', 'jpg', 'png'] },
        ]
      });

      console.log('Selected file path:', filePath);
      // 将 filePath 用于其他操作
      this.$service
        .upload_videos({
          files: filePath,
          group_id: this.group.id,
          source: 'upload'
        })
        .then(() => {
          this.get_materials()
        })

    },
    fission() {

      let events = new EventSource(`{this.$config.wsUrl}/api/video/output`);
      events.onmessage = (event) => {
        if (event.data === "connected" || event.data === "ping") {
          return
        }
        this.fissionOutput = event.data
      }
      events.onerror = (event) => {
        console.log(event)
      }
      events.addEventListener("error", (event) => {
        console.log(event)
      })
      events.addEventListener("finish", (event) => {
        console.log(event)
      })
      this.$service.fission_video({
        group_id: this.group.id,
        id: this.currentMaterial.id,
        dynamic_scale: this.dynamic_scale,
        smart_frame_cut: this.smart_frame_cut,
        adjust_frame_rate: this.adjust_frame_rate,
        adjust_bit_rate: this.adjust_bit_rate
      }).then(res => {
        this.get_materials()
      })
    },
    show_fission_video_dialog(material) {
      this.currentMaterial = material
      this.$refs.fission_video_dialog.showModal()
      this.fissionOutput = null
    },
    capture() {
      this.downloadOutput = null
      if (this.new_video_url) {
        if (this.download_proxy) {
          util.setData('download_proxy', this.download_proxy)
        }
        let events = new EventSource("http://127.0.0.1:8090/api/video/output");
        events.onmessage = (event) => {
          if (event.data === "connected" || event.data === "ping") {
            return
          }
          this.downloadOutput = event.data
        }
        events.onerror = (event) => {
          console.log(event)
        }
        events.addEventListener("error", (event) => {
          console.log(event)
        })
        events.addEventListener("finish", (event) => {
          console.log(event)
        })
        this.$service
          .capture_video({ url: this.new_video_url, group_id: this.group.id, proxy: this.download_proxy })
          .then(res => {
            // this.$refs.add_video_dialog.close()
            this.get_materials()
          })
          .catch(err => {
            console.log(err)
          })
      }
    },

    delete_all() {
      this.$service
        .delete_all_materials()
        .then(() => {
          this.get_materials()
        })
        .catch(err => {
          console.log(err)
        })
    },
    get_materials() {
      this.currentMaterial = null
      this.$service
        .get_materials({
          group_id: this.group.id
        })
        .then(res => {
          this.materials = res.data
        })
        .catch(err => {
          console.log(err)
        })
    },
    show_material(material) {
      console.log(material)
      this.currentMaterial = material
      this.$refs.detail_modal.showModal()
      //listener
      this.$refs.detail_modal.addEventListener('close', () => {
        this.currentMaterial = null
      })
    },
    delete_material(material) {
      this.$service
        .delete_material({
          id: material.id
        })
        .then(() => {
          this.get_materials()
        })
        .catch(err => {
          console.log(err)
        })
    },

  },
  mounted() {
    this.get_materials()
  }
}
</script>
