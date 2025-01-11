<template>
  <div class="w-full">
    <Pagination :items="filter_jobs" :searchKeys="['device', 'id', 'username', 'target_username', 'device_index']"
      @refresh="get_follow_jobs">
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
                <th>{{ $t('startTime') }}</th>
                <th>{{ $t('status') }}</th>
                <!-- <th>{{ $t('remark') }}</th> -->
                <th>{{ $t('targetUsername') }}</th>
                <th>{{ $t('username') }}</th>
                <th>{{ $t('device') }}</th>
                <th>{{ $t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(follow_job, index) in slotProps.items" :key="index">
                <td>{{ follow_job.id }}</td>
                <td>{{ follow_job.start_time }}</td>
                <td>
                  <div class="badge badge-neutral" v-if="follow_job.status == '0'">{{ $t('waiting') }}</div>
                  <div class="badge badge-primary" v-else-if="follow_job.status == '1'">{{ $t('execing') }}</div>
                  <div class="badge badge-success" v-else-if="follow_job.status == '2'">{{ $t('success') }}</div>
                  <div class="badge badge-error" v-else-if="follow_job.status == '3'">{{ $t('failed') }}</div>
                </td>
                <!-- <td>{{ follow_job.remark }}</td> -->
                <td>
                  <a class="link link-primary" :href="target_username" target="_blank">{{
                    follow_job.target_username.slice(follow_job.target_username.indexOf('@')) }}</a>
                </td>
                <td>
                  <a class="link link-primary" :href="`https://www.tiktok.com/${follow_job.username}`"
                    target="_blank">{{
                      follow_job.username }}</a>
                </td>
                <td>
                  <a class="cursor-pointer underline text-blue-500" @click="show_device(follow_job.device)"
                    v-if="follow_job.device_index">{{
                      follow_job.device_index }}</a>
                  <span v-else class="text text-red-500">{{ $t('offline') }}</span>
                </td>
                <td>
                  <div class="space-x-4">
                    <button class="btn-sm bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      @click="retry(follow_job)">{{ $t('retry') }}</button>
                    <button class="btn-sm bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      @click="deleteJob(follow_job)">
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
    async clearAll() {
      const yes = await ask(this.$t('confirmClearAll'), this.$t('confirm'));
      if (yes) {
        this.$service
          .delete_all_follow_jobs()
          .then(() => {
            this.get_follow_jobs()
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
    get_follow_jobs() {
      this.currentJob = null
      this.$service
        .get_follow_jobs()
        .then(res => {
          this.jobs = res.data
          this.jobs.forEach(job => {
            job.device_index = this.devices.find(device => device.serial === job.device || device.real_serial === job.device)?.index
          })
          this.get_groups()
        })
        .catch(err => {
          console.log(err)
        })
    },

    retry(follow_job) {
      this.$service
        .update_follow_job({
          id: follow_job.id,
          status: 0,
          follow_type: follow_job.follow_type
        })
        .then(() => {
          this.get_follow_jobs()
        })
        .catch(err => {
          console.log(err)
        })
    },
    deleteJob(follow_job) {
      this.$service
        .delete_follow_job({
          id: follow_job.id
        })
        .then(res => {
          console.log(res)
          this.get_follow_jobs()
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
          this.jobs.forEach(follow_job => {
            if (follow_job.group_id === 0) {
              follow_job.group_name = this.$t('defaultGroup')
              return
            }
            follow_job.group_name = this.groups.find(group => group.id === follow_job.group_id).name
          })
        })
        .catch(err => {
          console.log(err)
        })
    },
    retry_all_failed() {
      this.$service
        .retry_all_failed_follow_job()
        .then(() => {
          this.get_follow_jobs()
        })
        .catch(err => {
          console.log(err)
        })
    }
  },
  mounted() {
    this.get_follow_jobs()
  }
}
</script>
