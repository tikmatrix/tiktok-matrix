<template>
  <div class="w-full">
    <Pagination :items="filter_jobs" :searchKeys="['device', 'id', 'username', 'post_url', 'device_index']"
      @refresh="get_share_jobs">
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
                <th>{{ $t('postUrl') }}</th>
                <th>{{ $t('username') }}</th>
                <th>{{ $t('device') }}</th>
                <th>{{ $t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(share_job, index) in slotProps.items" :key="index">
                <td>{{ share_job.id }}</td>
                <td>{{ share_job.start_time }}</td>
                <td>
                  <div class="badge badge-neutral" v-if="share_job.status == '0'">{{ $t('waiting') }}</div>
                  <div class="badge badge-primary" v-else-if="share_job.status == '1'">{{ $t('execing') }}</div>
                  <div class="badge badge-success" v-else-if="share_job.status == '2'">{{ $t('success') }}</div>
                  <div class="badge badge-error" v-else-if="share_job.status == '3'">{{ $t('failed') }}</div>
                </td>
                <!-- <td>{{ share_job.remark }}</td> -->
                <td>
                  <a class="link link-primary" :href="post_url" target="_blank">{{
                    share_job.post_url.slice(share_job.post_url.indexOf('@')) }}</a>
                </td>
                <td>
                  <a class="link link-primary" :href="`https://www.tiktok.com/${share_job.username}`" target="_blank">{{
                    share_job.username }}</a>
                </td>
                <td>
                  <a class="cursor-pointer underline text-blue-500" @click="show_device(share_job.device)"
                    v-if="share_job.device_index">{{
                      share_job.device_index }}</a>
                  <span v-else class="text text-red-500">{{ $t('offline') }}</span>
                </td>
                <td>
                  <div class="space-x-4">
                    <button class="btn-sm bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      @click="retry(share_job)">{{ $t('retry') }}</button>
                    <button class="btn-sm bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      @click="deleteJob(share_job)">
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
          .delete_all_share_jobs()
          .then(() => {
            this.get_share_jobs()
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
    get_share_jobs() {
      this.currentJob = null
      this.$service
        .get_share_jobs()
        .then(res => {
          this.jobs = res.data
          this.jobs.forEach(job => {
            job.device_index = this.devices.find(device => device.serial === job.device)?.index
          })
          this.get_groups()
        })
        .catch(err => {
          console.log(err)
        })
    },

    retry(share_job) {
      this.$service
        .update_share_job({
          id: share_job.id,
          status: 0,
          share_type: share_job.share_type
        })
        .then(() => {
          this.get_share_jobs()
        })
        .catch(err => {
          console.log(err)
        })
    },
    deleteJob(share_job) {
      this.$service
        .delete_share_job({
          id: share_job.id
        })
        .then(res => {
          console.log(res)
          this.get_share_jobs()
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
          this.jobs.forEach(share_job => {
            if (share_job.group_id === 0) {
              share_job.group_name = this.$t('defaultGroup')
              return
            }
            share_job.group_name = this.groups.find(group => group.id === share_job.group_id).name
          })
        })
        .catch(err => {
          console.log(err)
        })
    },
    retry_all_failed() {
      this.$service
        .retry_all_failed_share_job()
        .then(() => {
          this.get_share_jobs()
        })
        .catch(err => {
          console.log(err)
        })
    }
  },
  mounted() {
    this.get_share_jobs()
  }
}
</script>
