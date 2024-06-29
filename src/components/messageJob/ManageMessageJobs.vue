<template>
  <div class="w-full">
    <Pagination :items="filter_jobs" :searchKeys="['device', 'id', 'username', 'target_username', 'device_index']"
      @refresh="get_message_jobs">
      <template v-slot:buttons>
        <MyButton @click="retry_all_failed" label="retryAllFaied" />
        <MyButton onclick="confirm_modal.showModal()" label="clearAll" />
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
                <th>{{ $t('startTime') }}</th>
                <th>{{ $t('status') }}</th>
                <th>{{ $t('remark') }}</th>
                <th>{{ $t('targetUsername') }}</th>
                <th>{{ $t('username') }}</th>
                <th>{{ $t('device') }}</th>
                <th>{{ $t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(message_job, index) in slotProps.items" :key="index">
                <td>{{ message_job.id }}</td>
                <td>{{ message_job.start_time }}</td>
                <td>
                  <div class="badge badge-neutral" v-if="message_job.status == '0'">{{ $t('waiting') }}</div>
                  <div class="badge badge-primary" v-else-if="message_job.status == '1'">{{ $t('execing') }}</div>
                  <div class="badge badge-success" v-else-if="message_job.status == '2'">{{ $t('success') }}</div>
                  <div class="badge badge-error" v-else-if="message_job.status == '3'">{{ $t('failed') }}</div>
                </td>
                <td>{{ message_job.remark }}</td>
                <td>
                  <a class="link link-primary" :href="`https://www.tiktok.com/${message_job.username}`"
                    target="_blank">{{
                      message_job.target_username }}</a>
                </td>
                <td>
                  <a class="link link-primary" :href="`https://www.tiktok.com/${message_job.username}`"
                    target="_blank">{{
                      message_job.username }}</a>
                </td>
                <td>
                  <a class="cursor-pointer underline text-blue-500"
                    @click="show_device(message_job.device_index, message_job.device)">{{
                      message_job.device_index }}</a>
                </td>
                <td>
                  <div class="space-x-4">
                    <button class="btn-sm bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      @click="retry(message_job)">{{ $t('retry') }}</button>
                    <button class="btn-sm bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      @click="deleteJob(message_job)">
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
</template>
<script>
import Modal from '../Modal.vue'
import MyButton from '../Button.vue'
import Pagination from '../Pagination.vue'
import { inject } from 'vue'
export default {
  name: 'app',
  components: {
    MyButton,
    Modal,
    Pagination
  },
  setup() {
    const devices = inject('devices')
    return { devices: devices.list }
  },
  data() {
    return {
      jobs: [],
      groups: [],
      searchStatus: '',
    }
  },
  computed: {
    filter_jobs() {
      return this.jobs.filter(job => {
        if (this.searchStatus) {
          return job.status == this.searchStatus
        }
        return true
      })
    }
  },
  methods: {
    delete_all() {
      this.$service
        .delete_all_message_jobs()
        .then(() => {
          this.get_message_jobs()
        })
        .catch(err => {
          console.log(err)
        })
    },

    show_device(index, serial) {
      let mydevice = this.devices.find(d => d.serial === serial)
      mydevice.index = index - 1
      this.$emitter.emit('openDevice', mydevice)
    },
    get_message_jobs() {
      this.currentJob = null
      this.$service
        .get_message_jobs()
        .then(res => {
          this.jobs = res.data
          this.jobs.forEach(job => {
            let device_index = this.devices.findIndex(device => device.serial === job.device)
            job.device_index = device_index + 1
          })
          this.get_groups()
        })
        .catch(err => {
          console.log(err)
        })
    },

    retry(message_job) {
      this.$service
        .update_message_job({
          id: message_job.id,
          status: 0,
          message_type: message_job.message_type
        })
        .then(() => {
          this.get_message_jobs()
        })
        .catch(err => {
          console.log(err)
        })
    },
    deleteJob(message_job) {
      this.$service
        .delete_message_job({
          id: message_job.id
        })
        .then(res => {
          console.log(res)
          this.get_message_jobs()
        })
        .catch(err => {
          console.log(err)
        })
    },
    get_groups() {
      this.$service
        .get_groups()
        .then(res => {
          this.groups = res.data
          this.jobs.forEach(message_job => {
            if (message_job.group_id === 0) {
              message_job.group_name = this.$t('defaultGroup')
              return
            }
            message_job.group_name = this.groups.find(group => group.id === message_job.group_id).name
          })
        })
        .catch(err => {
          console.log(err)
        })
    },
    retry_all_failed() {
      this.$service
        .retry_all_failed_message_job()
        .then(() => {
          this.get_message_jobs()
        })
        .catch(err => {
          console.log(err)
        })
    }
  },
  mounted() {
    this.get_message_jobs()
  }
}
</script>
