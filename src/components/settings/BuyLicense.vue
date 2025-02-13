<template>
  <dialog ref="buy_liscense_dialog" class="modal">
    <div class="modal-box w-11/12 max-w-5xl">
      <h3 class="font-bold text-lg">{{ $t('activate') }}</h3>
      <div class="modal-body">

        <div class="flex flex-col items-start p-12 w-full">
          <!-- GitHub认证部分 -->
          <div class="flex flex-col items-start w-full mb-6">
            <h2 class="text-xl font-bold mb-4">{{ $t('freeTrial') }}</h2>
            <div v-if="!license.github_authorized" class="flex items-center flex-row gap-2 w-full">
              <span class="font-bold">{{ $t('githubAuthStatus') }}: </span>
              <span class="text-red-500">{{ $t('notAuthorized') }}</span>
              <a class="link link-primary text-xs flex items-center" @click="startGitHubAuth">
                <font-awesome-icon icon="fab fa-github" class="text-gray-500 h-4 w-4" />
                {{ $t('authorizeWithGithub') }}
              </a>
              <button @click="reload" class="btn btn-sm btn-primary">{{ $t('refresh') }}</button>
            </div>
            <div v-else class="flex items-center flex-row gap-2 w-full">
              <span class="font-bold">{{ $t('githubAuthStatus') }}: </span>
              <span class="text-green-500">{{ $t('authorized') }}</span>
            </div>
          </div>
          <div class="flex items-center flex-row gap-2 w-full">
            <div class="flex items-start flex-col w-full">
              <label class="font-bold p-2">{{ $t('uid') }}: </label>
              <div class="flex items-center flex-row gap-2 w-full">
                <input id="uid" type="text" placeholder="uid" class="input input-sm grow input-bordered"
                  v-model="license.uid" readonly disabled />
                <button @click="copyText(license.uid, $event)" class="btn btn-sm btn-primary">{{ $t('copy') }}</button>
              </div>
              <label class="font-bold p-2">{{ $t('licenseCode') }}: </label>
              <div class="flex items-center flex-row gap-2 w-full">
                <input type="text" placeholder="xxxx-xxxx-xxxx-xxxx" class="input input-sm grow input-bordered"
                  v-model="licenseCode" />
                <button @click="activate" class="btn btn-sm btn-primary">
                  {{ $t('activate') }}</button>
              </div>
              <label class="font-bold">{{ $t('price') }}:</label>
              <label class="font-light text-sm pb-2 mt-4">$0 / {{ $t('freeTrial') }}</label>
              <label class="font-dark text-sm pb-2">$99 / {{ $t('computer') }} / {{ $t('month') }}</label>
              <label class="font-dark text-sm pb-2">$599 / {{ $t('computer') }} / {{ $t('year') }}</label>
              <a class="link link-primary text-xs float-right flex items-center  pb-2"
                href="https://t.me/+iGhozoBfAbI5YmE1" target="_blank">
                <font-awesome-icon icon="fab fa-telegram" class="text-blue-500 h-4 w-4" />
                {{ $t('telegramCustom') }}
              </a>
              <label class="text-md p-2 pr-4 font-bold text-green-500" v-if="license.leftdays">
                <font-awesome-icon icon="fa fa-check-circle" class="text-green-500 h-4 w-4" />
                {{ $t('licensedDays') }}:
                <label class="text-green-500 font-bold mr-2">{{ license.leftdays }}</label>
              </label>
              <label class="text-md p-2 pr-4 font-bold text-red-500" v-else>
                <font-awesome-icon icon="fa fa-exclamation-circle mr-2" class="text-red-500 h-4 w-4" />
                {{ $t('unlicensed') }}
              </label>
            </div>
            <div class="flex items-center flex-col w-full bg-green-100 rounded-lg p-4"
              v-if="order && order.status == 0">
              <div class="flex items-center justify-center flex-row w-full">
                <label class="text-lg font-bold text-secondary flex-1 justify-center text-center">{{ $t('remainingTime')
                  }}: {{
                    formattedTime
                  }}</label>
                <a class="link link-secondary text-md" @click="closeOrder">
                  <font-awesome-icon icon="fas fa-times" class="text-gray-500 h-4 w-4" />
                  {{ $t('closeOrder') }}
                </a>

              </div>

              <label class="font-bold">{{ $t('depositNetwork') }}: USDT-TRC20</label>

              <img :src="order.qrcode" class="w-40 h-40" />
              <label class="font-bold text-right col-span-1">{{ $t('depositAddress') }}:</label>
              <div class="flex items-center flex-row gap-2 w-full mt-2">
                <input type="text" class="input input-sm grow input-bordered" v-model="order.to_address" readonly
                  disabled />
                <button @click="copyText(order.to_address, $event)" class="btn btn-sm btn-primary">
                  {{ $t('copy') }}
                </button>
              </div>
              <label class="label-text-alt text-red-500 font-bold mt-2">{{ $t('usdtTip') }}</label>
              <label class="label-text-alt text-green-500 font-bold mt-2">{{ $t('afterPayTip') }}</label>
              <div class="flex items-center justify-center flex-row w-full">
                <progress class="progress progress-primary" :value="refreshTime" max="10"></progress>
              </div>

            </div>
            <div v-else class="flex items-center flex-col w-full bg-green-100 rounded-lg p-12">
              <div class="flex flex-grow  w-full text-center justify-center items-center">
                <label class="text-lg font-bold text-green-500">{{ $t('payTips') }}</label>
              </div>
              <button @click="createOrder"
                class="btn btn-primary px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
                {{ $t('pay') }}
              </button>
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

confetti.Promise = Bluebird;
export default {
  name: 'BuyLicense',
  components: {
  },
  props: {
    license: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      licenseCode: '',
      remainingTime: 0,
      order: null,
      interval: null,
      refreshTime: 10,
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
      if (response.ok) {
        const data = response.data
        console.log(`license leftdays: ${data.data.leftdays}, key: ${data.data.license}`)
        if (data.data.leftdays > 0) {
          localStorage.setItem('license', data.data.license)
          await emit('LICENSE', { reload: true })
          this.paymentSuccess()
          await message(this.$t('activateSuccess'))
          return;
        } else {
          await message('invalid license')
          localStorage.setItem('license', '')
          await emit('LICENSE', { reload: true })
        }
      } else {
        await message('verify failed')
        localStorage.setItem('license', '')
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
    async createOrder(event) {
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
      this.licenseCode = localStorage.getItem('license') || ''
      this.$refs.buy_liscense_dialog.showModal()
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
