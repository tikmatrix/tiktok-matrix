<template>
  <div class="w-full">
    <Pagination :items="materials" :searchKeys="['name']" @refresh="get_materials">
      <template v-slot:buttons>
        <!-- <MyButton onclick="confirm_modal.showModal()" label="clearAll" /> -->
        <MyButton @click="add_material" label="add" icon="fa fa-add" />
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
                <th>{{ $t('createTime') }}</th>
                <th>{{ $t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(material, index) in slotProps.items" :key="index">
                <td>{{ material.id }}</td>
                <td>{{ material.source }}</td>
                <td>
                  <div class="badge badge-success" v-if="material.used == '0'">{{ $t('unused') }}</div>
                  <div class="badge badge-error" v-else>{{ $t('used') }}</div>
                </td>
                <td @click="show_material(material)">
                  <div class="cursor-pointer">
                    <template v-if="material.name.endsWith('.mp4') || material.name.endsWith('.webm')">
                      <video :src="`${$config.apiUrl}/${material.name}`" class="w-[100px] h-[100px] max-w-none"></video>
                    </template>
                    <template v-else>
                      <img :src="`${$config.apiUrl}/${material.name}`" class="w-[100px] h-[100px] max-w-none" />
                    </template>
                  </div>
                </td>
                <td>{{ material.create_time }}</td>
                <td>
                  <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    @click="delete_material(material)">
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
      <div class="modal-box w-10/12 max-w-4xl">
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
        <h3 class="font-bold text-lg">Confirm Clear All?</h3>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-primary" @click="delete_all">Confirm</button>
          </form>
        </div>
      </div>
    </dialog>
  </div>
  <input ref="upload_material_input" type="file" v-on:change="on_upload_material" multiple hidden />
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
</template>
<script>
import Detail from './Detail.vue'
import MyButton from '../Button.vue'
import Pagination from '../Pagination.vue'
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
      max_upload_progress: 100
    }
  },
  methods: {
    add_material() {
      this.$refs.upload_material_input.click()
    },

    on_upload_material(e) {
      const totalFiles = e.target.files.length
      let index = 0
      this.upload_progress = index
      this.max_upload_progress = totalFiles
      this.$refs.upload_dialog.showModal()
      const uploadBatch = () => {
        const formData = new FormData()
        formData.append('group_id', this.group.id)
        formData.append('source', 'upload')
        let count = 0
        for (let i = 0; i < 10 && index < totalFiles; i++, index++) {
          formData.append('files', e.target.files[index])
          count++
        }
        this.$service
          .upload_material(formData)
          .then(() => {
            this.upload_progress = index
            if (index < totalFiles) {
              uploadBatch() // Upload next batch
            } else {
              this.$refs.upload_material_input.value = ''
              this.$refs.upload_dialog.close()
              this.get_materials()
            }
          })
          .catch(err => {
            console.log(err)
            index -= count
          })
      }

      uploadBatch() // Start uploading
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
