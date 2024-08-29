<template>
  <div class="flex flex-col items-start p-12 w-full">
    <div class="flex items-center flex-row gap-2 max-w-lg w-full">
      <span class="font-bold">{{ $t('uid') }}: </span>
      <input id="uid" type="text" placeholder="uid" class="input input-sm grow input-bordered" v-model="license.uid"
        readonly disabled />
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
    <div class="flex items-center flex-row gap-2 max-w-lg w-full">
      <span class="font-bold">{{ $t('network') }}: </span>
      <select class="select select-sm select-bordered" v-model="current_network">
        <option>TRC20</option>
        <option>ERC20</option>
        <option>Arbitrum One</option>
        <option>Avalanche C-Chain</option>
        <option>Optimism</option>
        <option>Polygon</option>
        <option>Solana</option>
        <option>TON</option>
        <option>X Layer</option>
      </select>
      <label class="label-text-alt text-green-500 font-bold">{{ $t('networkTips') }}</label>
    </div>

    <div class="flex items-center flex-col w-full">
      <div class="flex items-center flex-row gap-2 max-w-lg w-full">
        <div class="flex items-center flex-col w-full">
          <label class="font-bold">USDT-{{ payinfo.network }}</label>
          <img :src="payinfo.qrcode" class="w-40 h-40" />
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

      <div class="flex items-center flex-row gap-2 w-full">
        <label class="font-bold text-right col-span-1">{{ $t('address') }}:</label>
        <input type="text" class="input input-sm grow input-bordered" v-model="payinfo.address" readonly disabled />
        <MyButton @click="copy_address" label="copy" />

      </div>
      <label class="label-text-alt text-red-500 font-bold">{{ $t('usdtTip') }}</label>
    </div>
  </div>

</template>
<script>
import MyButton from '../Button.vue'
import { writeText } from '@tauri-apps/api/clipboard';
import qrcode_trc20 from '../../assets/usdt-trc20.png'
import qrcode_eth from '../../assets/usdt-eth.png'
import qrcode_solana from '../../assets/usdt-solana.png'
import qrcode_ton from '../../assets/usdt-ton.png'

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
      payList: [
        {
          network: 'TRC20',
          address: 'TDe4ZmkDBPYHVqWpX6jWjf3j45JdipB7Lx',
          qrcode: qrcode_trc20,
        },
        {
          network: 'ERC20',
          address: '0x92aa115fe8057d8603e80d7a0ecbf05b05e88c9b',
          qrcode: qrcode_eth,
        },
        {
          network: 'Arbitrum One',
          address: '0x92aa115fe8057d8603e80d7a0ecbf05b05e88c9b',
          qrcode: qrcode_eth,
        },
        {
          network: 'Avalanche C-Chain',
          address: '0x92aa115fe8057d8603e80d7a0ecbf05b05e88c9b',
          qrcode: qrcode_eth,
        },
        {
          network: 'Optimism',
          address: '0x92aa115fe8057d8603e80d7a0ecbf05b05e88c9b',
          qrcode: qrcode_eth,
        },
        {
          network: 'Polygon',
          address: '0x92aa115fe8057d8603e80d7a0ecbf05b05e88c9b',
          qrcode: qrcode_eth,
        },
        {
          network: 'Solana',
          address: '38nEy7LkxLQRG3eQrpkcVww95bXPnUpVKSh4AqWggGFD',
          qrcode: qrcode_solana,
        },
        {
          network: 'TON',
          address: 'EQD5vcDeRhwaLgAvralVC7sJXI-fc2aNcMUXqcx-BQ-OWnOZ',
          comment: '8947406',
          qrcode: qrcode_ton,
        },
        {
          network: 'X Layer',
          address: '0x92aa115fe8057d8603e80d7a0ecbf05b05e88c9b',
          qrcode: qrcode_eth,
        },
      ],
      current_network: 'TRC20',

    }
  },
  computed: {
    payinfo() {
      return this.payList.find(item => item.network === this.current_network)
    }
  },
  methods: {
    // change_network() {
    //   alert(this.payinfo.network + ' ' + this.payinfo.address)
    //   this.payinfo = this.payList.find(item => item.network === this.payinfo.network)
    //   alert(this.payinfo.network + ' ' + this.payinfo.address)
    // },
    async copy_address() {
      await writeText(this.payinfo.address)
      this.$emitter.emit('showToast', this.$t('copySuccess'))
    },
    async copyuid() {
      await writeText(this.license.uid)
      this.$emitter.emit('showToast', this.$t('copySuccess'))
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
