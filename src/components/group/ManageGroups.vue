<template>
  <div class="w-full">
    <Pagination :items="groups" :searchKeys="['name']" @refresh="get_groups">
      <template v-slot:buttons>
        <MyButton @click="add_group" label="add" icon="fa fa-add" />
      </template>
      <template v-slot:default="slotProps">
        <div class="overflow-x-auto">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>{{ $t('id') }}</th>
                <th>{{ $t('name') }}</th>
                <th>{{ $t('autoTrain') }}</th>
                <th>{{ $t('autoPublish') }}</th>
                <th>{{ $t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(group, index) in slotProps.items" :key="index">
                <td>{{ group.id }}</td>
                <td>{{ group.name }}</td>
                <td>
                  <div class="badge badge-success" v-if="group.auto_train == '1'">{{ $t('enable') }}</div>
                  <div class="badge badge-error" v-else>{{ $t('disable') }}</div>
                </td>
                <td>
                  <div class="badge badge-success" v-if="group.auto_publish == '1'">{{ $t('enable') }}</div>
                  <div class="badge badge-error" v-else>{{ $t('disable') }}</div>
                </td>

                <td>
                  <div class="space-x-4">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      @click="editgroup(group)">{{ $t('edit') }}</button>
                    <button class="btn btn-sm btn-success" @click="addMaterial(group)">{{ $t('addMaterial') }}:{{
                      group.unused_material_count }}</button>
                    <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      @click="deletegroup(group)">{{ $t('delete') }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </Pagination>

    <Modal :show="showMoal" @close="showMoal = false">
      <Add :group="currentGroup || defaultGroup" @update="updateGroup" @add="addgroup" />
    </Modal>
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
  </div>
  <input ref="upload_material_input" type="file" v-on:change="on_upload_material" multiple hidden />
</template>
<script>
import Modal from '../Modal.vue'
import MyButton from '../Button.vue'
import Add from './EditGroup.vue'
import Pagination from '../Pagination.vue'

export default {
  name: 'app',
  components: {
    Modal,
    MyButton,
    Add,
    Pagination
  },
  data() {
    return {
      groups: [],
      currentGroup: null,
      showMoal: false,
      defaultGroup: {
        name: '',
        auto_train: 0,
        train_start_time: '00:00',
        auto_publish: 0,
        publish_start_time: '00:00',
        publish_type: 1,
        title: '',
        product_link: '',
        floow_probable: 50,
        like_probable: 50,
        collect_probable: 50,
        train_duration: 300
      },
      uploading_id: null,
      upload_progress: 10,
      max_upload_progress: 100
    }
  },

  methods: {
    uploading(id) {
      return this.uploading_id == id
    },
    get_groups() {
      this.showMoal = false
      this.currentGroup = null
      this.$service
        .get_groups()
        .then(res => {
          this.groups = res.data
          for (let i = 0; i < this.groups.length; i++) {
            this.get_unused_material_count(this.groups[i])
          }
        })
        .catch(err => {
          console.log(err)
        })
    },
    add_group() {
      this.showMoal = true
    },
    addgroup(group) {
      this.$service
        .add_group({
          name: group.name,
          auto_train: Number(group.auto_train),
          auto_publish: Number(group.auto_publish),
          publish_start_time: group.publish_start_time,
          train_start_time: group.train_start_time,
          title: group.title,
          publish_type: Number(group.publish_type),
          product_link: group.product_link,
          floow_probable: Number(group.floow_probable),
          like_probable: Number(group.like_probable),
          collect_probable: Number(group.collect_probable),
          train_duration: Number(group.train_duration),
          topic: group.topic
        })
        .then(() => {
          this.showMoal = false
          this.get_groups()
        })
        .catch(err => {
          console.log(err)
        })
    },
    editgroup(group) {
      this.showMoal = true
      this.currentGroup = group
    },
    updateGroup(group) {
      this.$service
        .update_group({
          id: group.id,
          name: group.name,
          auto_train: Number(group.auto_train),
          auto_publish: Number(group.auto_publish),
          publish_start_time: group.publish_start_time,
          train_start_time: group.train_start_time,
          title: group.title,
          publish_type: Number(group.publish_type),
          product_link: group.product_link,
          floow_probable: Number(group.floow_probable),
          like_probable: Number(group.like_probable),
          collect_probable: Number(group.collect_probable),
          train_duration: Number(group.train_duration),
          topic: group.topic
        })
        .then(() => {
          this.get_groups()
        })
        .catch(err => {
          console.log(err)
        })
    },
    deletegroup(group) {
      this.$service
        .delete_group({
          id: group.id
        })
        .then(() => {
          this.get_groups()
        })
        .catch(err => {
          console.log(err)
        })
    },

    addMaterial(group) {
      this.currentGroup = group
      console.log(this.$refs.upload_material_input)
      this.$refs.upload_material_input.click()
    },
    on_upload_material(e) {
      this.uploading_id = this.currentGroup.id
      const totalFiles = e.target.files.length
      let index = 0
      this.upload_progress = index
      this.max_upload_progress = totalFiles
      this.$refs.upload_dialog.showModal()
      const uploadBatch = () => {
        const formData = new FormData()
        formData.append('group_id', this.currentGroup.id)
        let count = 0
        for (let i = 0; i < 10 && index < totalFiles; i++, index++) {
          formData.append('files', e.target.files[index])
          this.currentGroup.unused_material_count++
          count++
        }
        this.$service
          .upload_material(formData)
          .then(() => {
            this.upload_progress = index
            if (index < totalFiles) {
              uploadBatch() // Upload next batch
            } else {
              this.uploading_id = null // Finish uploading
              this.$refs.upload_material_input.value = ''
              this.$refs.upload_dialog.close()
            }
          })
          .catch(err => {
            console.log(err)
            this.uploading_id = null
            index -= count
          })
      }

      uploadBatch() // Start uploading
    },

    get_unused_material_count(group) {
      this.$service
        .get_material_count({
          group_id: group.id,
          used: 0
        })
        .then(res => {
          group.unused_material_count = res.data
        })
        .catch(err => {
          console.log(err)
        })
    }
  },
  mounted() {
    this.get_groups()
  }
}
</script>
