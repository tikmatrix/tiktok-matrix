<template>
  <div class="w-full">
    <Pagination :items="materials" :searchKeys="['name']" @refresh="get_materials">
      <template v-slot:buttons>
        <MyButton @click="selectMaterials" label="upload" icon="fa fa-add" />
      </template>
      <template v-slot:default="slotProps">
        <div class="overflow-x-auto">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>{{ $t('id') }}</th>
                <th>{{ $t('status') }}</th>
                <th>{{ $t('preview') }}</th>
                <th>{{ $t('sort') }}</th>
                <th>{{ $t('title') }}</th>
                <th>{{ $t('md5') }}</th>
                <th>{{ $t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(material, index) in slotProps.items" :key="index">
                <td>{{ material.id }}</td>
                <td>
                  <div class="badge badge-success" v-if="material.used == '0'">{{ $t('unused') }}</div>
                  <div class="badge badge-error" v-else>{{ $t('used') }}</div>
                </td>
                <td @click="show_material(material)">
                  <div class="cursor-pointer border rounded items-center text-center flex align-middle">
                    <template v-if="material.name.endsWith('.mp4') || material.name.endsWith('.webm')">
                      <video :src="material.name" class="w-[100px] h-[100px] max-w-none flex-1"></video>
                    </template>
                    <template v-else>
                      <img :src="material.name" class="w-[100px] h-[100px] max-w-none flex-1" />
                    </template>
                  </div>
                </td>
                <td>
                  <span class="text-sm">{{ material.no }}</span>
                </td>
                <td>
                  <span class="text-sm">{{ material.title ? material.title.substring(0, 10) + (material.title.length >
                    10 ? '...' : '')
                    + (material.title.length > 20 ? '...' : '') : '' }}</span>
                </td>
                <td>
                  <span class="text-xs">{{ material.md5.substring(0,
                    4) + '...' + material.md5.substring(material.md5.length - 4) }}</span>
                </td>
                <td>
                  <button class="btn btn-sm btn-success" @click="showEditTitle(material)">{{ $t('editTitle')
                    }}</button>
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
        <Detail :material="currentMaterial" />
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

  <dialog ref="edit_title_dialog" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg">{{ $t('editTitle') }}</h3>
      <label class="input input-bordered flex items-center gap-2 my-4">
        <input type="text" class="grow" placeholder="" v-model="currentMaterial.title"
          @keyup.enter="editTitle(currentMaterial)" />
      </label>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn btn-primary" @click="editTitle(currentMaterial)">{{ $t('save') }}</button>
        </form>
      </div>
    </div>
  </dialog>
</template>
<script>
import Detail from './Detail.vue'
import MyButton from '../Button.vue'
import Pagination from '../Pagination.vue'
import { open } from '@tauri-apps/api/dialog';
import { appDataDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
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
      currentMaterial: {
        name: '',
        title: ''
      },
      upload_progress: 10,
      max_upload_progress: 100,
    }
  },
  methods: {

    showEditTitle(material) {
      this.currentMaterial = material
      this.$refs.edit_title_dialog.showModal()
    },
    editTitle(material) {
      this.$service
        .edit_title({
          id: material.id,
          title: material.title
        })
        .then(() => {
          this.$refs.edit_title_dialog.close()
          this.get_materials()
        })
    },
    async selectMaterials() {
      const content_type = this.group.content_type;
      const image_count = this.group.image_count;
      let filters = [];
      if (content_type == 0) {
        filters = [ // 视频
          { name: 'Video Files', extensions: ['mp4'] },
        ]
      } else if (content_type == 1) {
        filters = [ // 图片
          { name: 'Image Files', extensions: ['jpg', 'png'] },
        ]
      }
      const filePath = await open({
        multiple: true, // 是否允许多选文件
        directory: false, // 是否选择目录
        filters: filters
      });

      this.$service
        .upload_videos({
          files: filePath,
          group_id: this.group.id
        })
        .then(() => {
          this.get_materials()
        })

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
    async get_materials() {
      this.$service
        .get_materials({
          group_id: this.group.id
        })
        .then(async res => {
          this.materials = res.data
          let work_path = await appDataDir();
          for (let i = 0; i < this.materials.length; i++) {
            this.materials[i].name = convertFileSrc(await join(work_path, "upload", this.materials[i].name));
          }
        })

    },
    show_material(material) {
      this.currentMaterial = material
      this.$refs.detail_modal.showModal()
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
  async mounted() {
    this.get_materials()
  }
}
</script>
