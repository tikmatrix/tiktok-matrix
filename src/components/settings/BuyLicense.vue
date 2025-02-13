<template>
  <dialog ref="buy_liscense_dialog" class="modal">
    <div class="modal-box w-11/12 max-w-5xl">
      <!-- <h3 class="font-bold text-lg">{{ $t('activate') }}</h3> -->
      <div class="modal-body">
        <div class="relative isolate bg-white px-6 py-6 w-full">
          <div class="flex items-start flex-col w-full">
            <div class="flex items-center flex-row gap-2 w-full">
              <label class="font-bold p-2">{{ $t('uid') }}: </label>
              <input id="uid" type="text" placeholder="uid" class="input input-sm grow input-bordered"
                v-model="license.uid" readonly disabled />
              <button @click="copyText(license.uid, $event)" class="btn btn-sm btn-primary">{{ $t('copy') }}</button>
              <a class="link link-primary text-xs float-right flex items-center  pb-2"
                href="https://t.me/+iGhozoBfAbI5YmE1" target="_blank">
                <font-awesome-icon icon="fab fa-telegram" class="text-blue-500 h-4 w-4" />
                {{ $t('telegramCustom') }}
              </a>
            </div>
            <div class="flex items-center flex-row gap-2 w-full">
              <label class="font-bold p-2">{{ $t('licenseCode') }}: </label>
              <input type="text" placeholder="xxxx-xxxx-xxxx-xxxx" class="input input-sm grow input-bordered"
                v-model="licenseCode" />
              <button @click="activate" class="btn btn-sm btn-primary">
                {{ $t('activate') }}</button>
              <label class="text-md p-2 pr-4 font-bold text-green-500" v-if="license.leftdays">
                <font-awesome-icon icon="fa fa-check-circle" class="text-green-500 h-4 w-4" />
                {{ $t('licensedDays') }}:
                <label class="text-green-500 font-bold mr-2">{{ license.leftdays }}</label>
              </label>
              <label class="text-md p-2 pr-4 font-bold text-red-500" v-else>
                <font-awesome-icon icon="fa fa-exclamation-circle mr-2" class="text-red-500 h-4 w-4" />
                {{ $t('unlicensed') }}
              </label>
              <button @click="reload" class="btn btn-sm btn-primary">{{ $t('refresh') }}</button>
            </div>
          </div>
          <div class="flex items-center flex-col w-full bg-green-100 rounded-lg p-4" v-if="order && order.status == 0">
            <div class="flex items-center justify-center flex-row w-full">
              <div class="flex-1"></div>
              <a class="link link-secondary text-md" @click="closeOrder">
                {{ $t('closeOrder') }} - {{ formattedTime }}
                <font-awesome-icon icon="fas fa-times" class="text-gray-500 h-4 w-4" />
              </a>

            </div>
            <label class="font-bold">{{ $t('depositNetwork') }}: USDT-TRC20</label>
            <img :src="order.qrcode" class="w-50 h-50" />
            <div class="flex items-center flex-row gap-2 w-full mt-2">
              <label class="font-bold text-right col-span-1">{{ $t('depositAddress') }}:</label>
              <input type="text" class="input input-sm grow input-bordered" v-model="order.to_address" readonly
                disabled />
              <button @click="copyText(order.to_address, $event)" class="btn btn-sm btn-primary">
                {{ $t('copy') }}
              </button>
            </div>
            <label class="text-red-500 font-bold mt-2">{{ $t('usdtTip', { amount: selectedPrice }) }}</label>
            <label class="text-green-500 font-bold mt-2">{{ $t('afterPayTip') }}</label>
            <div class="flex items-center justify-center flex-row w-full">
              <progress class="progress progress-primary" :value="refreshTime" max="10"></progress>
            </div>

          </div>
          <div class="mx-auto mt-2 grid  grid-cols-3 items-center gap-y-6 w-full" v-else>
            <div v-for="(tier, tierIdx) in tiers" :key="tier.id"
              :class="[tier.featured ? 'relative bg-gray-900 shadow-2xl' : 'bg-white/60', tier.featured ? '' : tierIdx === 0 ? 'rounded-t-3xl' : '', 'rounded-3xl p-8 ring-1 ring-gray-900/10']">
              <h3 :id="tier.id"
                :class="[tier.featured ? 'text-indigo-400' : 'text-indigo-600', 'text-base/7 font-semibold']">
                {{ $t(tier.name) }}
              </h3>
              <p class="mt-4 flex items-baseline gap-x-2">
                <span
                  :class="[tier.featured ? 'text-white' : 'text-gray-900', 'text-5xl font-semibold tracking-tight']">{{
                    tier.priceMonthly }}</span>
                <span :class="[tier.featured ? 'text-gray-400' : 'text-gray-500', 'text-base']">/
                  {{ $t(tier.duration) }}
                </span>
              </p>
              <p :class="[tier.featured ? 'text-gray-300' : 'text-gray-600', 'mt-6 text-base/7']">
                {{ $t(tier.description) }}
              </p>
              <ul role="list" :class="[tier.featured ? 'text-gray-300' : 'text-gray-600', 'mt-8 space-y-3 text-sm/6']">
                <li v-for="feature in tier.features" :key="feature" class="flex gap-x-3">
                  <CheckIcon :class="[tier.featured ? 'text-indigo-400' : 'text-indigo-600', 'h-6 w-5 flex-none']"
                    aria-hidden="true" />
                  {{ $t(feature) }}
                </li>
              </ul>
              <a @click="tier.onclick" :aria-describedby="tier.id"
                :class="[tier.featured ? 'bg-indigo-500 text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-indigo-500' :
                  'text-indigo-600 ring-1 ring-indigo-200 ring-inset hover:ring-indigo-300 hover:bg-indigo-300 focus-visible:outline-indigo-600',
                  'mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2']">
                {{ $t(tier.label) }}
              </a>
            </div>
          </div>
        </div>

        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-primary" @click="close">
              {{ $t('close') }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </dialog>
</template>
<script>
import { writeText } from '@tauri-apps/api/clipboard';
import { fetch, Body, ResponseType } from '@tauri-apps/api/http';
import { emit } from '@tauri-apps/api/event';
import { message } from '@tauri-apps/api/dialog';
import { readTextFile } from '@tauri-apps/api/fs';
import { BaseDirectory } from '@tauri-apps/api/fs';
import { open } from '@tauri-apps/api/shell';
import QRCode from 'qrcode';
import Bluebird from 'bluebird';
import confetti from 'canvas-confetti';
import { CheckIcon } from '@heroicons/vue/20/solid'

confetti.Promise = Bluebird;

export default {
  name: 'BuyLicense',
  components: {
    CheckIcon
  },
  props: {
    license: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      tiers: [
        {
          name: 'free',
          id: 'tier-free',
          priceMonthly: '$0',
          duration: 'forever',
          description: "freeDescription",
          features: [
            'freeLimited',
            'allFeatures',
          ],
          featured: false,
          label: this.license.github_authorized ? 'authorized' : 'startWithGithub',
          onclick: this.startGitHubAuth
        },
        {
          name: 'monthly',
          id: 'tier-monthly',
          priceMonthly: '$99',
          duration: 'month',
          description: 'monthlyDescription',
          features: [
            'unlimitedDevices',
            'allFeatures',
            'customerSupport',
          ],
          featured: true,
          label: 'pay',
          onclick: this.createMonthOrder
        },
        {
          name: 'yearly',
          id: 'tier-yearly',
          priceMonthly: '$599',
          duration: 'year',
          description: 'yearlyDescription',
          features: [
            'unlimitedDevices',
            'allFeatures',
            'customerSupport',
          ],
          featured: false,
          label: 'pay',
          onclick: this.createYearOrder
        },
      ],
      licenseCode: '',
      remainingTime: 0,
      order: null,
      interval: null,
      refreshTime: 10,
      selectedPrice: 0
    }
  },
  watch: {
    'license.github_authorized': {
      handler: function (val) {
        console.log('github_authorized:', val)
        this.tiers[0].label = val ? 'authorized' : 'startWithGithub'
      },
      deep: true
    },
    'license.key': {
      handler: function (val) {
        console.log('license key:', val)
        this.licenseCode = val
      },
      deep: true
    }
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor((this.remainingTime % 3600) / 60).toString().padStart(2, '0');
      const seconds = (this.remainingTime % 60).toString().padStart(2, '0');
      return `${minutes}:${seconds}`;
    }
  },
  methods: {
    async startGitHubAuth() {
      try {
        // 打开GitHub授权页面
        const port = await readTextFile('port.txt', { dir: BaseDirectory.AppData });
        const apiUrl = 'http://127.0.0.1:' + port;
        await open(`https://github.com/login/oauth/authorize?client_id=Ov23lign745XEd3b71WI&redirect_uri=${apiUrl}/github_auth_callback&scope=user%20public_repo`);
      } catch (error) {
        console.error('GitHub认证错误:', error);
        this.$emitter.emit('showToast', this.$t('githubAuthErrorMessage'));
      }
    },
    async reload(event) {
      await emit('LICENSE', { reload: true })
      if (event) {
        event.target.innerText = this.$t('fetching')
        event.target.disabled = true
        setTimeout(() => {
          event.target.innerText = this.$t('refresh')
          event.target.disabled = false
        }, 1000)
      }
    },
    async activate(event) {
      event.target.innerText = this.$t('activating')
      event.target.disabled = true
      const response = await fetch(`https://pro.api.tikmatrix.com/front-api/verify`, {
        method: 'POST',
        timeout: 10,
        contentType: 'application/json',
        responseType: ResponseType.JSON,
        body: Body.json({
          mid: this.license.uid,
          app: 'TikMatrix',
          license: this.licenseCode,
        }),
      });
      console.log('response:', response)
      event.target.innerText = this.$t('activate')
      event.target.disabled = false
      if (response.ok) {
        const data = response.data
        console.log(`license leftdays: ${data.data.leftdays}, key: ${data.data.license}`)
        if (data.data.leftdays > 0) {
          await emit('LICENSE', { reload: true })
          this.paymentSuccess()
          await message(this.$t('activateSuccess'))
          return;
        } else {
          await message('invalid license')
          await emit('LICENSE', { reload: true })
        }
      } else {
        await message('verify failed')
        await emit('LICENSE', { reload: true })
      }

      event.target.innerText = this.$t('activate')
      event.target.disabled = false
    },
    async closeOrder() {
      clearInterval(this.interval);
      this.order = null;
      const response = await fetch(`https://pro.api.tikmatrix.com/front-api/close_order`, {
        method: 'POST',
        timeout: 10,
        contentType: 'application/json',
        responseType: ResponseType.JSON,
        body: Body.json({
          mid: this.license.uid,
          app: 'TikMatrix',
        }),
      });
      console.log('response:', response)
    },
    async paymentSuccess() {
      this.close()
      var count = 1000;
      var defaults = {
        origin: { y: 0.7 }
      };

      function fire(particleRatio, opts) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    },
    async close() {
      clearInterval(this.interval);
      this.order = null;
      this.$refs.buy_liscense_dialog.close();
    },
    async getOrder(refresh_status = false) {
      if (!this.license.uid) {
        return;
      }
      const response = await fetch(`https://pro.api.tikmatrix.com/front-api/get_order`, {
        method: 'POST',
        timeout: 10,
        contentType: 'application/json',
        responseType: ResponseType.JSON,
        body: Body.json({
          mid: this.license.uid,
          app: 'TikMatrix',
        }),
      });
      console.log('response:', response)
      if (response.ok) {
        const data = response.data
        if (data.code != 20000) {
          console.log('get order failed:', data.message)
          this.order = null
        } else {
          console.log('refresh_status:', refresh_status)
          if (refresh_status) {
            if (data.data.status == 1) {
              await emit('LICENSE', { reload: true })
              await this.paymentSuccess()
              await message(this.$t('paymentSuccess'))
              return;
            }
            return;
          }

          if (data.data.status == 0) {

            await this.showOrder(data.data)
          }
        }
      } else {
        await message('get order failed')
      }
    },
    async showOrder(order) {
      this.order = order
      if (this.interval) {
        clearInterval(this.interval);
      }
      this.order.qrcode = await QRCode.toDataURL(this.order.to_address);
      const expireAt = new Date(this.order.expire_at).getTime();
      const now = new Date().getTime();
      this.remainingTime = Math.floor((expireAt - now) / 1000);
      this.interval = setInterval(() => {
        if (this.remainingTime > 0) {
          this.remainingTime--;
          this.refreshTime--;
          if (this.refreshTime == 0) {
            console.log('refresh order status')
            this.getOrder(true)
            this.refreshTime = 10;
          }
        } else {
          clearInterval(this.interval);
          this.order = null;
        }
      }, 1000);
    },
    async createMonthOrder(event) {
      await this.createOrder(99, event)
    },
    async createYearOrder(event) {
      await this.createOrder(599, event)
    },
    async createOrder(price, event) {
      console.log('price:', price)
      this.selectedPrice = price
      event.target.innerText = this.$t('fetching')
      event.target.disabled = true
      const response = await fetch(`https://pro.api.tikmatrix.com/front-api/create_order`, {
        method: 'POST',
        timeout: 10,
        contentType: 'application/json',
        responseType: ResponseType.JSON,
        body: Body.json({
          mid: this.license.uid,
          app: 'TikMatrix',
        }),
      });
      console.log('response:', response)
      event.target.innerText = this.$t('pay')
      event.target.disabled = false
      if (response.ok) {
        const data = response.data
        if (data.code != 20000) {
          await message(data.message)
        } else {
          await this.showOrder(data.data)
        }
      } else {
        await message('create order failed')
      }
    },
    async show() {
      this.licenseCode = this.license.key
      this.$refs.buy_liscense_dialog.showModal()
      console.log('license:', this.license)
      await this.getOrder()
    },
    async copyText(text, event) {
      await writeText(text)
      event.target.innerText = this.$t('copied')
      event.target.classList.add('btn-success')
      setTimeout(() => {
        event.target.innerText = this.$t('copy')
        event.target.classList.remove('btn-success')
      }, 1000)
    },
  },
  async mounted() {

  }
}
</script>
