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
    <div class="flex items-center flex-col w-full">
      <div class="flex items-center flex-row gap-2 max-w-lg w-full">
        <div class="flex items-center flex-col w-full">
          <label class="font-bold">USDT-TRC20</label>
          <img src="../../assets/usdt.png" class="w-40 h-40" />
        </div>
        <div class="flex items-start flex-col w-full">
          <label class="font-bold p-4">{{ $t('price') }}</label>
          <label class="font-light text-sm pb-2">$0 / {{ $t('freeTrial') }}</label>
          <label class="font-dark text-sm pb-2">$99 / {{ $t('computer') }} / {{ $t('month') }}</label>
          <label class="font-dark text-sm pb-2">$599 / {{ $t('computer') }} / {{ $t('year') }}</label>
          <a class="link link-primary text-xs float-right flex items-center  pb-2" href="https://t.me/tikmatrixcom"
            target="_blank">
            <font-awesome-icon icon="fab fa-telegram" class="text-blue-500 h-4 w-4" />
            {{ $t('telegramCustom') }}
          </a>
        </div>
      </div>

      <div class="flex items-center flex-row gap-2 max-w-lg w-full">
        <input id="usdt" type="text" placeholder="usdt" class="input input-sm grow input-bordered" v-model="usdt"
          readonly />
        <MyButton @click="copyusdt" label="copy" />

      </div>
      <label class="label-text-alt text-red-500 font-bold">{{ $t('usdtTip') }}</label>
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
        left_days: 0,
      },
      usdt: 'TDe4ZmkDBPYHVqWpX6jWjf3j45JdipB7Lx'
    }
  },
  methods: {
    copyusdt() {
      //copy uid to clipboard
      var input = document.getElementById("usdt");
      input.select(); // 选择文本
      input.setSelectionRange(0, 99999); // 对于移动设备，确保能选择文本

      try {
        var successful = document.execCommand('copy'); // 执行复制操作
        this.$emitter.emit('showToast', this.$t('copySuccess'))
      } catch (err) {
        console.log('Unable to copy', err);
      }
    },
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
