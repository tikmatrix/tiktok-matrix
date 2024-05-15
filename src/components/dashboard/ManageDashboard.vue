<template>
  <div class="flex flex-col items-start w-full">
    <h1 class="text-2xl mb-6">{{ $t('dashboard') }}</h1>
    <!-- <div tabindex="0" class="collapse collapse-arrow border border-base-300 bg-base-200">
      <div class="collapse-title text-xl font-medium">
        {{ $t('quickStart') }}
      </div>
      <div class="collapse-content">
        <ul class="steps">
          <li class="step step-primary">{{ $t('step.step1') }}</li>
          <li class="step step-primary">{{ $t('step.step2') }}</li>
          <li class="step step-primary">{{ $t('step.step3') }}</li>
          <li class="step step-primary">{{ $t('step.step4') }}</li>
          <li class="step step-primary">{{ $t('step.step5') }}</li>
          <li class="step step-primary">{{ $t('step.step6') }}</li>
          <li class="step step-primary">{{ $t('step.step7') }}</li>
        </ul>
      </div>
    </div> -->

    <div class="divider">{{ $t('overview') }}</div>
    <div class="stats shadow">
      <div class="stat">
        <div class="stat-figure text-secondary">
          <font-awesome-icon :icon="['fas', 'mobile-alt']" />
        </div>
        <div class="stat-title">{{ $t('deviceCount') }}</div>
        <CountUp class="stat-value" :end="device_count" />
      </div>
      <div class="stat">
        <div class="stat-figure text-secondary">
          <font-awesome-icon :icon="['fas', 'users']" />
        </div>
        <div class="stat-title">{{ $t('accountCount') }}</div>
        <CountUp class="stat-value" :end="account_count" />
      </div>
      <div class="stat">
        <div class="stat-figure text-secondary">
          <font-awesome-icon :icon="['fas', 'robot']" />
        </div>
        <div class="stat-title">{{ $t('trainJobCount') }}</div>
        <CountUp class="stat-value" :end="train_job_count" />
        <div class="stat-desc">{{ $t('successRate') }} {{ train_job_sucess_rate * 100 }}%</div>
      </div>
      <div class="stat">
        <div class="stat-figure text-secondary">
          <font-awesome-icon :icon="['fas', 'robot']" />
        </div>
        <div class="stat-title">{{ $t('publishJobCount') }}</div>
        <CountUp class="stat-value" :end="publish_job_count" />
        <div class="stat-desc">{{ $t('successRate') }} {{ publish_job_sucess_rate * 100 }}%</div>
      </div>
      <!-- <div class="stat">
        <div class="stat-figure text-secondary">
          <font-awesome-icon :icon="['fas', 'robot']" />
        </div>
        <div class="stat-title">{{ $t('commentJobCount') }}</div>
        <CountUp class="stat-value" :end="comment_job_count" />
        <div class="stat-desc">{{ $t('successRate') }} {{ comment_job_sucess_rate * 100 }}%</div>
      </div> -->
    </div>
    <div class="divider">{{ $t('overview') }}</div>
    <div class="stats shadow">
      <div class="stat">
        <div class="stat-figure text-primary">
          <font-awesome-icon :icon="['fas', 'cogs']" />
        </div>
        <div class="stat-title">{{ $t('trainJobQueue') }}</div>
        <CountUp class="stat-value" :end="train_job_queue" />
        <div class="stat-desc">{{ running_train_job_count }} {{ $t('isRunning') }}</div>
      </div>
      <div class="stat">
        <div class="stat-figure text-primary">
          <font-awesome-icon :icon="['fas', 'cogs']" />
        </div>
        <div class="stat-title">{{ $t('publishJobQueue') }}</div>
        <CountUp class="stat-value" :end="publish_job_queue" />
        <div class="stat-desc">{{ running_publish_job_count }} {{ $t('isRunning') }}</div>
      </div>
      <!-- <div class="stat">
        <div class="stat-figure text-primary">
          <font-awesome-icon :icon="['fas', 'cogs']" />
        </div>
        <div class="stat-title">{{ $t('commentJobQueue') }}</div>
        <CountUp class="stat-value" :end="comment_job_queue" />
        <div class="stat-desc">{{ running_comment_job_count }} {{ $t('isRunning') }}</div>
      </div> -->
    </div>
    <div class="divider">{{ $t('matrixGroup') }}</div>
    <div class="stats bg-primary text-primary-content carousel carousel-center rounded-box max-w-full">
      <div v-for="group in groups" :key="group.id">
        <div class="stat carousel-item">
          <div class="stat-value">{{ group.name }}</div>
          <div class="stat-title text-primary-content">{{ $t('accountCount') }}: {{ group.account_count }}</div>
          <div class="stat-actions">
            <button class="btn btn-sm btn-success" @click="addMaterial(group)">{{ $t('addMaterial') }}:{{
              group.unused_material_count }}</button>
          </div>
        </div>
        <div class="divider lg:divider-horizontal"></div>
      </div>
    </div>
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
import CountUp from '../Countup.vue'

export default {
  name: 'app',
  components: {
    CountUp
  },
  data() {
    return {
      device_count: 0,
      account_count: 0,
      train_job_count: 0,
      train_job_sucess_rate: 0,
      running_train_job_count: 0,
      publish_job_count: 0,
      publish_job_sucess_rate: 0,
      running_publish_job_count: 0,
      train_job_queue: 0,
      publish_job_queue: 0,
      comment_job_count: 0,
      comment_job_sucess_rate: 0,
      running_comment_job_count: 0,
      comment_job_queue: 0,
      groups: [],
      currentGroup: null,
      uploading_id: null,
      upload_progress: 10,
      max_upload_progress: 100
    }
  },
  methods: {
    count_online_device() {
      this.$service
        .count_online_device()
        .then(res => {
          this.device_count = res.data
        })
        .catch(err => {
          console.log(err)
        })
    },
    count_all_account() {
      this.$service
        .count_all_account()
        .then(res => {
          this.account_count = res.data
        })
        .catch(err => {
          console.log(err)
        })
    },
    count_train_job_by_status() {
      this.$service
        .count_train_job_by_status()
        .then(res => {
          const status_count_list = res.data
          const { all_count, failed_count, queue_count, running_count } = status_count_list.reduce(
            (acc, item) => {
              acc.all_count += item.count
              if (item.status === 3) {
                acc.failed_count = item.count
              }
              if (item.status === 2) {
                acc.success_count = item.count
              }
              if (item.status === 1) {
                acc.running_count = item.count
              }
              if (item.status === 0) {
                acc.queue_count = item.count
              }
              return acc
            },
            { all_count: 0, success_count: 0, failed_count: 0, queue_count: 0, running_count: 0 }
          )

          this.train_job_count = all_count
          this.train_job_sucess_rate = (1 - failed_count / all_count).toFixed(4)
          this.train_job_queue = queue_count
          this.running_train_job_count = running_count
        })
        .catch(err => {
          console.log(err)
        })
    },
    count_publish_job_by_status() {
      this.$service
        .count_publish_job_by_status()
        .then(res => {
          const status_count_list = res.data
          const { all_count, failed_count, queue_count, running_count } = status_count_list.reduce(
            (acc, item) => {
              acc.all_count += item.count
              if (item.status === 3) {
                acc.failed_count = item.count
              }
              if (item.status === 2) {
                acc.success_count = item.count
              }
              if (item.status === 1) {
                acc.running_count = item.count
              }
              if (item.status === 0) {
                acc.queue_count = item.count
              }
              return acc
            },
            { all_count: 0, success_count: 0, failed_count: 0, queue_count: 0, running_count: 0 }
          )

          this.publish_job_count = all_count
          this.publish_job_sucess_rate = (1 - failed_count / all_count).toFixed(4)
          this.publish_job_queue = queue_count
          this.running_publish_job_count = running_count
        })
        .catch(err => {
          console.log(err)
        })
    },
    count_comment_job_by_status() {
      this.$service
        .count_comment_job_by_status()
        .then(res => {
          const status_count_list = res.data
          const { all_count, failed_count, queue_count, running_count } = status_count_list.reduce(
            (acc, item) => {
              acc.all_count += item.count
              if (item.status === 3) {
                acc.failed_count = item.count
              }
              if (item.status === 2) {
                acc.success_count = item.count
              }
              if (item.status === 1) {
                acc.running_count = item.count
              }
              if (item.status === 0) {
                acc.queue_count = item.count
              }
              return acc
            },
            { all_count: 0, success_count: 0, failed_count: 0, queue_count: 0, running_count: 0 }
          )

          this.comment_job_count = all_count
          this.comment_job_sucess_rate = (1 - failed_count / all_count).toFixed(4)
          this.comment_job_queue = queue_count
          this.running_comment_job_count = running_count
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
          for (let i = 0; i < this.groups.length; i++) {
            this.get_unused_material_count(this.groups[i])
            this.count_account_by_group_id(this.groups[i])
          }
        })
        .catch(err => {
          console.log(err)
        })
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
    },
    count_account_by_group_id(group) {
      this.$service
        .count_account_by_group_id({
          group_id: group.id
        })
        .then(res => {
          group.account_count = res.data
        })
        .catch(err => {
          console.log(err)
        })
    },
    addMaterial(group) {
      this.currentGroup = group
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
    }
  },
  mounted() {
    this.count_online_device()
    this.count_all_account()
    this.count_train_job_by_status()
    this.count_publish_job_by_status()
    this.count_comment_job_by_status()
    this.get_groups()
  }
}
</script>
