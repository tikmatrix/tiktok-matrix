<template>
  <div class="w-full">
    <Pagination :items="musics" :searchKeys="['release_name', 'artist_name']" @refresh="get_musics">
      <template v-slot:buttons>
        <MyButton @click="add_music" label="add" icon="fa fa-add" />
      </template>
      <template v-slot:default="slotProps">
        <div class="overflow-x-auto">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>{{ $t('id') }}</th>
                <th>{{ $t('artistName') }}</th>
                <th>{{ $t('releaseName') }}</th>
                <th>{{ $t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(music, index) in slotProps.items" :key="index">
                <td>{{ music.id }}</td>
                <td>{{ music.artist_name }}</td>
                <td>{{ music.release_name }}</td>
                <td>
                  <div class="space-x-4">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      @click="editmusic(music)">{{ $t('edit') }}</button>
                    <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      @click="deletemusic(music)">{{ $t('delete') }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </Pagination>
    <input id="upload_material_input" type="file" v-on:change="on_upload_material" multiple hidden />
    <Modal :show="showEditMusic" @close="showEditMusic = false">
      <Edit :music="currentMusic" @update="updateMusic" />
    </Modal>
    <Modal :show="showAddMusic" @close="showAddMusic = false">
      <Add @add="addmusic" />
    </Modal>
  </div>
</template>
<script>
import Modal from '../Modal.vue'
import MyButton from '../Button.vue'
import Edit from './Edit.vue'
import Add from './Add.vue'
import Pagination from '../Pagination.vue'

export default {
  name: 'app',
  components: {
    Modal,
    MyButton,
    Edit,
    Add,
    Pagination
  },
  data() {
    return {
      musics: [],
      currentMusic: null,
      showAddMusic: false,
      showEditMusic: false
    }
  },
  methods: {
    get_musics() {
      this.showEditMusic = false
      this.showAddMusic = false
      this.currentMusic = null
      this.$service
        .get_musics()
        .then(res => {
          console.log(res)
          this.musics = res.data
        })
        .catch(err => {
          console.log(err)
        })
    },
    add_music() {
      this.showAddMusic = true
    },
    addmusic(music) {
      this.$service
        .add_music({
          release_name: music.release_name,
          artist_name: music.artist_name
        })
        .then(res => {
          console.log(res)
          this.showAddMusic = false
          this.get_musics()
        })
        .catch(err => {
          console.log(err)
        })
    },
    editmusic(music) {
      this.showEditMusic = true
      this.currentMusic = music
    },
    updateMusic(music) {
      this.$service
        .update_music({
          id: music.id,
          release_name: music.release_name,
          artist_name: music.artist_name
        })
        .then(res => {
          console.log(res)
          this.get_musics()
        })
        .catch(err => {
          console.log(err)
        })
    },
    deletemusic(music) {
      this.$service
        .delete_music({
          id: music.id
        })
        .then(res => {
          console.log(res)
          this.get_musics()
        })
        .catch(err => {
          console.log(err)
        })
    }
  },
  mounted() {
    this.get_musics()
  }
}
</script>
