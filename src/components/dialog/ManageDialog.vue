<template>
  <div class="w-full">
    <Pagination :items="watchers" :searchKeys="['conditions']" @refresh="get_watchers">
      <template v-slot:buttons>
        <MyButton @click="add_watcher" label="add" icon="fa fa-add" />
      </template>
      <template v-slot:default="slotProps">
        <div class="overflow-x-auto">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>{{ $t('id') }}</th>
                <th>{{ $t('conditions') }}</th>
                <th>{{ $t('action') }}</th>
                <th>{{ $t('status') }}</th>
                <th>{{ $t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(watcher, index) in slotProps.items" :key="index">
                <td>{{ watcher.id }}</td>
                <td>{{ watcher.conditions }}</td>
                <td>{{ watcher.action }}</td>
                <td>{{ parseInt(watcher.status) === 0 ? $t('disable') : $t('enable') }}</td>
                <td>
                  <div class="space-x-4">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      @click="editWatcher(watcher)">{{ $t('edit') }}</button>
                    <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      @click="deleteWatcher(watcher)">
                      {{ $t('delete') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </Pagination>

    <Modal :show="currentWatcher" @close="currentWatcher = null">
      <Edit :watcher="currentWatcher" @update="updateWatcher" />
    </Modal>
    <Modal :show="showAddWatcher" @close="showAddWatcher = false">
      <Add @add="addWatcher" />
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
      watchers: [],
      currentWatcher: null,
      showAddWatcher: false
    }
  },
  methods: {
    get_watchers() {
      this.$service
        .get_watchers()
        .then(res => {
          this.watchers = res.data
        })
        .catch(err => {
          console.log(err)
        })
    },

    add_watcher() {
      this.showAddWatcher = true
    },
    addWatcher(watcher) {
      this.$service
        .add_watcher({
          conditions: watcher.conditions,
          action: watcher.action,
          status: watcher.status
        })
        .then(() => {
          this.showAddWatcher = false
          this.get_watchers()
        })
        .catch(err => {
          console.log(err)
        })
    },
    editWatcher(watcher) {
      this.currentWatcher = watcher
    },
    updateWatcher(watcher) {
      this.$service
        .update_account({
          id: watcher.id,
          conditions: watcher.conditions,
          action: watcher.action,
          status: watcher.status
        })
        .then(res => {
          console.log(res)
          this.currentWatcher = null
          this.get_watchers()
        })
        .catch(err => {
          console.log(err)
        })
    },
    deleteWatcher(watcher) {
      this.$service
        .delete_watcher({
          id: watcher.id
        })
        .then(res => {
          console.log(res)
          this.get_watchers()
        })
        .catch(err => {
          console.log(err)
        })
    }
  },
  mounted() {
    this.get_watchers()
  }
}
</script>
