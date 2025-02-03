<template>
  <div class="w-full">
    <Pagination :items="filter_tasks" :searchKeys="['id', 'device_index']" @refresh="get_tasks">
      <template v-slot:buttons>
        <MyButton @click="retry_all_failed" label="retryAllFaied" />
        <MyButton @click="clearAll" label="clearAll" />
        <select v-model="searchStatus" class="select select-sm select-bordered max-w-xs ml-2">
          <option value="">{{ $t('allStatus') }}</option>
          <option value="0">{{ $t('waiting') }}</option>
          <option value="1">{{ $t('execing') }}</option>
          <option value="2">{{ $t('success') }}</option>
          <option value="3">{{ $t('failed') }}</option>
        </select>
      </template>
      <template v-slot:default="slotProps">
        <div class="overflow-x-auto">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>{{ $t('id') }}</th>
                <th>{{ $t('scriptName') }}</th>
                <th>{{ $t('scriptArgs') }}</th>
                <th>{{ $t('startTime') }}</th>
                <th>{{ $t('status') }}</th>
                <th>{{ $t('remark') }}</th>
                <th>{{ $t('device') }}</th>
                <th>{{ $t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(task, index) in slotProps.items" :key="index">
                <td>{{ task.id }}</td>
                <td><span class="badge badge-ghost badge-sm">{{ task.script_name }}</span></td>
                <td>
                  <span class="badge badge-ghost badge-sm">{{ task.script_args }}</span>
                </td>
                <td>
                  <span class="badge badge-ghost badge-sm">{{ task.start_time }}</span>
                </td>
                <td>
                  <div class="badge badge-neutral badge-sm" v-if="task.status == '0'">{{ $t('waiting') }}</div>
                  <div class="badge badge-primary badge-sm" v-else-if="task.status == '1'">{{ $t('execing') }}</div>
                  <div class="badge badge-success badge-sm" v-else-if="task.status == '2'">{{ $t('success') }}</div>
                  <div class="badge badge-error badge-sm" v-else-if="task.status == '3'">{{ $t('failed') }}</div>
                </td>
                <td><span class="badge badge-ghost badge-sm">{{ task.remark }}</span></td>
                <td>
                  <a class="link link-primary" @click="show_device(task.serial)" v-if="task.device_index">{{
                    task.device_index }}</a>
                  <span v-else class="text text-red-500">{{ $t('offline') }}</span>
                </td>
                <td>
                  <div class="space-x-4">
                    <button class="btn-sm bg-blue-500 hover:bg-blue-700 text-white rounded" @click="retry(task)">{{
                      $t('retry') }}</button>
                    <button class="btn-sm bg-red-500 hover:bg-red-700 text-white rounded" @click="deleteTask(task)">{{
                      $t('delete') }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </Pagination>


  </div>
</template>
<script>
import Modal from '../Modal.vue'
import MyButton from '../Button.vue'
import Pagination from '../Pagination.vue'
import { inject } from 'vue'
import { ask } from '@tauri-apps/api/dialog';

export default {
  name: 'app',
  components: {
    Modal,
    MyButton,
    Pagination
  },
  setup() {
    const devices = inject('devices')
    return { devices: devices.list }
  },
  data() {
    return {
      tasks: [],
      currentDevice: null,
      searchStatus: ''
    }
  },
  computed: {
    filter_tasks() {
      let tasks = this.tasks
      if (this.searchStatus) {
        tasks = tasks.filter(task => task.status == this.searchStatus)
      }
      return tasks
    }
  },
  methods: {
    async clearAll() {
      const yes = await ask(this.$t('confirmClearAll'), this.$t('confirm'));
      if (yes) {
        this.$service
          .delete_all_tasks()
          .then(() => {
            this.get_tasks()
          })
          .catch(err => {
            console.log(err)
          })
      }
    },

    show_device(serial) {
      let mydevice = this.devices.find(d => d.serial === serial)
      this.$emitter.emit('openDevice', mydevice)
    },
    get_tasks() {
      this.currentTask = null
      this.$service
        .get_tasks()
        .then(res => {
          this.tasks = res.data
          this.tasks.forEach(task => {
            task.device_index = this.devices.find(device => device.serial === task.serial || device.real_serial === task.serial)?.key
          })
        })
        .catch(err => {
          console.log(err)
        })
    },

    retry(task) {
      this.$service
        .update_task({
          id: task.id,
          status: 0,
        })
        .then(() => {
          this.get_tasks()
        })
        .catch(err => {
          console.log(err)
        })
    },
    deleteTask(task) {
      this.$service
        .delete_task({
          id: task.id
        })
        .then(res => {
          console.log(res)
          this.get_tasks()
        })
        .catch(err => {
          console.log(err)
        })
    },

    retry_all_failed() {
      this.$service
        .retry_all_failed_tasks()
        .then(() => {
          this.get_tasks()
        })
        .catch(err => {
          console.log(err)
        })
    }
  },
  mounted() {
    this.get_tasks()
  }
}
</script>
