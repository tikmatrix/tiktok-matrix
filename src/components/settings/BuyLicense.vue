<template>
  <div class="flex flex-col items-start p-12 w-full">
    <div class="flex items-center flex-row gap-2 max-w-lg w-full">
      <span class="font-bold">{{ $t('uid') }}: </span>
      <input id="uid" type="text" placeholder="uid" class="input input-sm grow input-bordered" v-model="license.uid"
        readonly />
      <MyButton @click="copyuid" label="copy" />
    </div>
    <div class="flex items-center flex-row gap-2 max-w-lg w-full">
      <span class="font-bold">{{ $t('license') }}: </span>
      <input type="text" placeholder="license key" class="input input-sm grow input-bordered" v-model="license.key" />
      <MyButton @click="add_license" label="save" :showLoading="loading" />
    </div>

    <div class="label">
      <label class="label-text-alt text-red-500 font-bold" v-if="license.status != 'pass'">{{ license.status
        }}</label>
      <label class="label-text-alt" v-if="license.status == 'pass'">
        Left:
        <label class="text-green-500 font-bold">{{ license.left_days }}</label> days.
      </label>
    </div>
  </div>
</template>
<script>
import MyButton from '../Button.vue'
export default {
  name: 'app',
  components: {
    MyButton
  },
  data() {
    return {
      loading: true,
      license: {
        uid: '',
        key: '',
        status: '',
        left_days: 0
      },
    }
  },
  methods: {
    copyuid() {
      //copy uid to clipboard
      var input = document.getElementById("uid");
      input.select(); // 选择文本
      input.setSelectionRange(0, 99999); // 对于移动设备，确保能选择文本

      try {
        var successful = document.execCommand('copy'); // 执行复制操作
        this.$emitter.emit('showToast', this.$t('copySuccess'))
      } catch (err) {
        console.log('Unable to copy', err);
      }

    },
    get_license() {
      this.$service.get_license().then(res => {
        this.license = res.data
        this.loading = false
      })
    },
    add_license() {
      this.loading = true
      this.$service
        .add_license({
          key: this.license.key
        })
        .then(res => {
          this.license = res.data
          this.loading = false
        })
    }
  },
  mounted() {
    this.get_license()
  }
}
</script>
