<template>
  <div class="w-full">
    <Pagination :items="filter_jobs" :searchKeys="['device', 'id', 'username', 'target_username', 'device_index']"
      @refresh="get_scrape_jobs">
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
                <th>{{ $t('progress') }}</th>
                <th>{{ $t('device') }}</th>
                <th>{{ $t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(scrape_job, index) in slotProps.items" :key="index">
                <td>{{ scrape_job.id }}</td>
                <td>{{ scrape_job.start_time }}</td>
                <td>
                  <div class="badge badge-neutral" v-if="scrape_job.status == '0'">{{ $t('waiting') }}</div>
                  <div class="badge badge-primary" v-else-if="scrape_job.status == '1'">{{ $t('execing') }}</div>
                  <div class="badge badge-success" v-else-if="scrape_job.status == '2'">{{ $t('success') }}</div>
                  <div class="badge badge-error" v-else-if="scrape_job.status == '3'">{{ $t('failed') }}</div>
                </td>
                <!-- <td>{{ scrape_job.remark }}</td> -->

                <td>
                  <a class="link link-primary" :href="`https://www.tiktok.com/${scrape_job.target_username}`"
                    target="_blank">{{
                      scrape_job.target_username }}</a>
                </td>

                <td>
                  <span class="text text-green-500 font-bold">{{ scrape_job.current }}</span>
                  /
                  <span class="text text-green-800 font-bold">{{ scrape_job.total }}</span>
                </td>
                <td>
                  <a class="cursor-pointer underline text-blue-500" @click="show_device(scrape_job.device)"
                    v-if="scrape_job.device_index">{{
                      scrape_job.device_index }}</a>
                  <span v-else class="text text-red-500">{{ $t('offline') }}</span>
                </td>
                <td>
                  <div class="space-x-4">
                    <button class="btn-sm bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      @click="retry(scrape_job)">{{ $t('retry') }}</button>
                    <button class="btn-sm bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      @click="deleteJob(scrape_job)">
                      {{ $t('delete') }}
                    </button>
                    <button class="btn-sm bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      @click="open_dir('download')">{{ $t('open') }}</button>

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
import { invoke } from "@tauri-apps/api/tauri";
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
    open_dir(name) {
      invoke("open_dir", {
        name
      });
    },
    async clearAll() {
      const yes = await ask(this.$t('confirmClearAll'), this.$t('confirm'));
      if (yes) {
        this.$service
          .delete_all_scrape_jobs()
          .then(() => {
            this.get_scrape_jobs()
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
    get_scrape_jobs() {
      this.currentJob = null
      this.$service
        .get_scrape_jobs()
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

    retry(scrape_job) {
      this.$service
        .update_scrape_job({
          id: scrape_job.id,
          status: 0,
          scrape_type: scrape_job.scrape_type
        })
        .then(() => {
          this.get_scrape_jobs()
        })
        .catch(err => {
          console.log(err)
        })
    },
    deleteJob(scrape_job) {
      this.$service
        .delete_scrape_job({
          id: scrape_job.id
        })
        .then(res => {
          console.log(res)
          this.get_scrape_jobs()
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
          this.jobs.forEach(scrape_job => {
            if (scrape_job.group_id === 0) {
              scrape_job.group_name = this.$t('defaultGroup')
              return
            }
            scrape_job.group_name = this.groups.find(group => group.id === scrape_job.group_id).name
          })
        })
        .catch(err => {
          console.log(err)
        })
    },
    retry_all_failed() {
      this.$service
        .retry_all_failed_scrape_job()
        .then(() => {
          this.get_scrape_jobs()
        })
        .catch(err => {
          console.log(err)
        })
    }
  },
  mounted() {
    this.get_scrape_jobs()
  }
}
</script>
