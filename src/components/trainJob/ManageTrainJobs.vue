<template>
  <div class="w-full">
    <Pagination :items="filter_jobs" :searchKeys="['device', 'id', 'account', 'device_index']"
      @refresh="get_train_jobs">
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
                <th>{{ $t('username') }}</th>
                <th>{{ $t('device') }}</th>
                <th>{{ $t('group') }}</th>
                <th>{{ $t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(train_job, index) in slotProps.items" :key="index">
                <td>{{ train_job.id }}</td>
                <td>{{ train_job.start_time }}</td>
                <td>
                  <div class="badge badge-neutral" v-if="train_job.status == '0'">{{ $t('waiting') }}</div>
                  <div class="badge badge-primary" v-else-if="train_job.status == '1'">{{ $t('execing') }}</div>
                  <div class="badge badge-success" v-else-if="train_job.status == '2'">{{ $t('success') }}</div>
                  <div class="badge badge-error" v-else-if="train_job.status == '3'">{{ $t('failed') }}</div>
                </td>
                <td>{{ train_job.remark }}</td>
                <td>
                  <a class="link link-primary" :href="`https://www.tiktok.com/${train_job.username}`" target="_blank">{{
                    train_job.username }}</a>
                </td>
                <td>
                  <a class="link link-primary"
                    @click="show_device(train_job.device_index, train_job.device)">{{ train_job.device_index }} - {{
                      train_job.device }}</a>
                </td>
                <td>{{ train_job.group_name || 'N/A' }}</td>
                <td>
                  <div class="space-x-4">
                    <button class="btn-sm bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      @click="retry(train_job)">{{ $t('retry') }}</button>
                    <button class="btn-sm bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      @click="deleteJob(train_job)">{{ $t('delete') }}</button>
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
        <h3 class="font-bold text-lg">Confirm Clear All?</h3>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-primary" @click="delete_all">Confirm</button>
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
      jobs: [],
      groups: [],
      currentDevice: null,
      searchStatus: ''
    }
  },
  computed: {
    filter_jobs() {
      let jobs = this.jobs
      if (this.searchStatus) {
        jobs = jobs.filter(job => job.status == this.searchStatus)
      }
      return jobs
    }
  },
  methods: {
    delete_all() {
      this.$service
        .delete_all_train_jobs()
        .then(() => {
          this.get_train_jobs()
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
    get_train_jobs() {
      this.currentJob = null
      this.$service
        .get_train_jobs()
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

    retry(train_job) {
      this.$service
        .update_train_job({
          id: train_job.id,
          status: 0
        })
        .then(() => {
          this.get_train_jobs()
        })
        .catch(err => {
          console.log(err)
        })
    },
    deleteJob(train_job) {
      this.$service
        .delete_train_job({
          id: train_job.id
        })
        .then(res => {
          console.log(res)
          this.get_train_jobs()
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
          this.jobs.forEach(train_job => {
            if (train_job.group_id === 0) {
              train_job.group_name = this.$t('defaultGroup')
              return
            }
            train_job.group_name = this.groups.find(group => group.id === train_job.group_id).name
          })
        })
        .catch(err => {
          console.log(err)
        })
    },
    retry_all_failed() {
      this.$service
        .retry_all_failed_train_job()
        .then(() => {
          this.get_train_jobs()
        })
        .catch(err => {
          console.log(err)
        })
    }
  },
  mounted() {
    this.get_train_jobs()
  }
}
</script>
