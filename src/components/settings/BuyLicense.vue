<template>
  <dialog ref="buy_liscense_dialog" class="modal">
    <div class="modal-box w-11/12 max-w-5xl overflow-hidden">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <div class="modal-body">
        <div class="relative isolate px-6 py-6 w-full">
          <div class="absolute inset-x-0 -z-10 transform-gpu overflow-hidden px-36 blur-3xl" aria-hidden="true">
            <div
              class="mx-auto aspect-1155/678 w-[72.1875rem] bg-gradient-to-tr from-secondary to-neutral opacity-30 h-96"
              style="clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);"></div>
          </div>
          <div class="flex items-start flex-col w-full gap-3">
            <div class="flex items-center flex-row gap-2 w-full">
              <label class="font-bold w-28">{{ $t('mid') }}: </label>
              <div class="relative grow">
                <input id="mid" type="text" placeholder="mid" class="input input-sm w-full input-bordered ring-1 pr-20"
                  v-model="license.mid" readonly disabled />
                <button @click="copyText(license.mid, $event)"
                  class="absolute right-0 top-0 btn btn-sm btn-primary h-full rounded-l-none">
                  {{ $t('copy') }}
                </button>
              </div>
              <a class="link link-primary text-md flex items-center gap-1 min-w-max"
                href="https://t.me/+iGhozoBfAbI5YmE1" target="_blank">
                <font-awesome-icon icon="fab fa-telegram" class="h-5 w-5" />
                {{ $t('telegramCustom') }}
              </a>
            </div>

            <div class="flex items-center flex-row gap-2 w-full">
              <label class="font-bold w-28">{{ $t('licenseCode') }}: </label>
              <div class="relative grow">
                <input type="text" placeholder="xxxx-xxxx-xxxx-xxxx" :disabled="license.leftdays > 0"
                  class="input input-sm w-full input-bordered ring-1 pr-20" v-model="license.license" />
                <button @click="activate" class="absolute right-0 top-0 btn btn-sm btn-primary h-full rounded-l-none"
                  v-if="license.leftdays <= 0">
                  {{ $t('activate') }}
                </button>
                <button @click="copyText(license.license, $event)"
                  class="absolute right-0 top-0 btn btn-sm btn-primary h-full rounded-l-none" v-else>
                  {{ $t('copy') }}
                </button>
              </div>
              <div class="relative grow">
                <input type="text" :placeholder="$t('affiliateCode')" :disabled="license.affiliate_discount > 0"
                  class="input input-sm w-full input-bordered ring-1 pr-20" v-model="license.affiliate_code" />
                <span v-if="license.affiliate_discount > 0"
                  class="absolute right-24 top-1/2 -translate-y-1/2 badge badge-success">
                  -{{ license.affiliate_discount }}%
                </span>
                <button @click="applyAffiliateCode" v-if="license.affiliate_discount == 0"
                  class="absolute right-0 top-0 btn btn-sm btn-primary h-full rounded-l-none">
                  {{ $t('apply') }}
                </button>
                <button @click="copyText(license.affiliate_code, $event)"
                  class="absolute right-0 top-0 btn btn-sm btn-primary h-full rounded-l-none" v-else>
                  {{ $t('copy') }}
                </button>
              </div>
            </div>


          </div>
          <div class="flex items-center flex-col w-full rounded-lg p-4" v-if="order && order.status == 0">
            <div class="flex items-center justify-center flex-row w-full">
              <div class="flex-1"></div>
              <a class="link link-secondary text-md" @click="closeOrder">
                {{ $t('closeOrder') }} - {{ formattedTime }}
                <font-awesome-icon icon="fas fa-times" class="text-gray-500 h-4 w-4" />
              </a>

            </div>
            <label class="font-bold">{{ $t('depositNetwork') }}: {{ order.network }}</label>
            <img :src="order.qrcode" class="w-50 h-50" />
            <div class="flex items-center flex-row gap-2 w-full mt-2">
              <label class="font-bold text-right col-span-1">{{ $t('depositAddress') }}:</label>
              <input type="text" class="input input-sm grow input-bordered ring-1" v-model="order.to_address" readonly
                disabled />
              <button @click="copyText(order.to_address, $event)" class="btn btn-sm btn-primary">
                {{ $t('copy') }}
              </button>
            </div>
            <label class="text-error font-bold mt-2">{{ $t('usdtTip', {
              network: order.network, amount: order.amount
            }) }}</label>
            <label class="text-success font-bold mt-2">{{ $t('afterPayTip') }}</label>
            <div class="flex items-center justify-center flex-row w-full">
              <progress class="progress progress-primary" :value="refreshTime" max="10"></progress>
            </div>

          </div>
          <div class="mx-auto mt-2 grid  grid-cols-3 items-center gap-y-6 w-full" v-else>
            <div v-for="(tier, tierIdx) in tiers" :key="tier.id"
              :class="[tier.featured ? 'relative bg-neutral shadow-2xl' : 'bg-base-100', 'rounded-3xl p-8 ring-1 ring-info ring-opacity-50']">
              <h3 :id="tier.id" :class="[tier.featured ? 'text-accent' : 'text-primary', 'text-base/7 font-semibold']">
                {{ $t(tier.name) }}
              </h3>
              <p class="mt-4 flex items-baseline gap-x-2">
                <template v-if="license.affiliate_discount > 0 && tier.price != '$0'">
                  <span :class="[tier.featured ? 'text-accent/50' : 'text-primary/50', 'text-2xl line-through']">{{
                    tier.price }}</span>
                  <span
                    :class="[tier.featured ? 'text-accent' : 'text-primary', 'text-5xl font-semibold tracking-tight']">
                    ${{ (tier.price.replace('$', '') * (1 - license.affiliate_discount / 100)).toFixed(0) }}
                  </span>
                </template>
                <span v-else
                  :class="[tier.featured ? 'text-accent' : 'text-primary', 'text-5xl font-semibold tracking-tight']">
                  {{ tier.price }}
                </span>
                <span :class="[tier.featured ? 'text-accent' : 'text-primary']">/ {{ $t(tier.duration) }}</span>
              </p>
              <p :class="[tier.featured ? 'text-neutral-content' : 'text-base-content', 'mt-6 text-base/7']">
                {{ $t(tier.description) }}
              </p>
              <ul role="list"
                :class="[tier.featured ? 'text-neutral-content' : 'text-base-content', 'mt-8 space-y-3 text-sm/6']">
                <li v-for="feature in tier.features" :key="feature" class="flex gap-x-3">
                  <CheckIcon :class="[tier.featured ? 'text-accent' : 'text-primary', 'h-6 w-5 flex-none']"
                    aria-hidden="true" />
                  {{ $t(feature) }}
                </li>
              </ul>
              <button @click="tier.onclicks[0]" :aria-describedby="tier.id"
                :class="[tier.featured ? 'btn-primary text-primary-content shadow-xs' :
                  'btn-accent text-accent-content shadow-xs',
                  'btn btn-wide ring-1 flex flex-row items-center justify-center cursor-pointer mt-8 rounded-md px-3.5 py-2.5 text-center text-sm font-semibold']">
                <!-- github icon -->
                <font-awesome-icon v-if="tier.name === 'free'" icon="fab fa-github" class="h-6 w-6" />

                <!-- tron network icon -->
                <svg class="fill-current text-error h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"
                  v-else>
                  <g id="tron">
                    <path class="cls-1"
                      d="M61.55,19.28c-3-2.77-7.15-7-10.53-10l-.2-.14a3.82,3.82,0,0,0-1.11-.62l0,0C41.56,7,3.63-.09,2.89,0a1.4,1.4,0,0,0-.58.22L2.12.37a2.23,2.23,0,0,0-.52.84l-.05.13v.71l0,.11C5.82,14.05,22.68,53,26,62.14c.2.62.58,1.8,1.29,1.86h.16c.38,0,2-2.14,2-2.14S58.41,26.74,61.34,23a9.46,9.46,0,0,0,1-1.48A2.41,2.41,0,0,0,61.55,19.28ZM36.88,23.37,49.24,13.12l7.25,6.68Zm-4.8-.67L10.8,5.26l34.43,6.35ZM34,27.27l21.78-3.51-24.9,30ZM7.91,7,30.3,26,27.06,53.78Z" />
                  </g>
                </svg>
                {{ $t(tier.buttons[0]) }}
              </button>
              <button @click="tier.onclicks[1]" :aria-describedby="tier.id" v-if="tier.buttons[1]"
                :class="[tier.featured ? 'btn-secondary text-secondary-content shadow-xs' :
                  'btn-neutral text-neutral-content shadow-xs',
                  'btn btn-wide ring-1 flex flex-row items-center justify-center cursor-pointer mt-2  rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2']">
                <!-- bsc network icon -->

                <svg class="fill-current text-orange-300 h-6 w-6" xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 336.41 337.42">
                  <g id="Layer_2" data-name="Layer 2">
                    <g id="Layer_1-2" data-name="Layer 1">
                      <path class="cls-1" d="M168.2.71l41.5,42.5L105.2,147.71l-41.5-41.5Z" />
                      <path class="cls-1" d="M231.2,63.71l41.5,42.5L105.2,273.71l-41.5-41.5Z" />
                      <path class="cls-1" d="M42.2,126.71l41.5,42.5-41.5,41.5L.7,169.21Z" />
                      <path class="cls-1" d="M294.2,126.71l41.5,42.5L168.2,336.71l-41.5-41.5Z" />
                    </g>
                  </g>
                </svg>
                {{ $t(tier.buttons[1]) }}
              </button>
            </div>
          </div>
        </div>


      </div>
    </div>
  </dialog>
</template>
<script>
import { writeText } from '@tauri-apps/api/clipboard';
import { message } from '@tauri-apps/api/dialog';
import { readTextFile, exists } from '@tauri-apps/api/fs';
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
  computed: {

  },
  data() {
    return {
      tiers: [
        {
          name: 'free',
          id: 'tier-free',
          price: '$0',
          duration: 'forever',
          description: "freeDescription",
          features: [
            'freeLimited',
            'allFeatures',
          ],
          featured: false,
          buttons: [(this.license.github_starred == 1) ? 'authorized' : 'startWithGithub'],
          onclicks: [this.startGitHubAuth]
        },
        {
          name: 'monthly',
          id: 'tier-monthly',
          price: '$99',
          duration: 'month',
          description: 'monthlyDescription',
          features: [
            'unlimitedDevices',
            'allFeatures',
            'customerSupport',
          ],
          featured: true,
          buttons: ['usdttrc20', 'usdtbep20'],
          onclicks: [this.createMonthOrderTrc20, this.createMonthOrderBep20]
        },
        {
          name: 'yearly',
          id: 'tier-yearly',
          price: '$599',
          duration: 'year',
          description: 'yearlyDescription',
          features: [
            'unlimitedDevices',
            'allFeatures',
            'customerSupport',
          ],
          featured: false,
          buttons: ['usdttrc20', 'usdtbep20'],
          onclicks: [this.createYearOrderTrc20, this.createYearOrderBep20]
        },
      ],
      remainingTime: 0,
      order: null,
      interval: null,
      refreshTime: 10,
    }
  },
  watch: {
    'license.github_starred': {
      handler: function (val) {
        console.log('github_starred:', val)
        this.tiers[0].buttons[0] = (val == 1) ? 'authorized' : 'startWithGithub'
      },
      deep: true
    },

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
        await this.$emiter('showToast', this.$t('githubAuthErrorMessage'));
      }
    },

    async activate(event) {
      event.target.innerText = this.$t('activating')
      event.target.disabled = true
      this.$service.activate_license({
        'license_code': this.license.license,
      }).then(async (res) => {
        console.log(`activate_license: ${JSON.stringify(res)}`);
        event.target.innerText = this.$t('activate')
        event.target.disabled = false
        if (res.code === 0) {
          const license = JSON.parse(res.data);
          if (license.leftdays > 0) {
            await this.$emiter('LICENSE', { reload: true })
            this.paymentSuccess()
            await message(this.$t('activateSuccess'))
          } else {
            await message(this.$t('invalidLicense'))
          }
          return;
        } else {
          await message(res.data)
        }
      }).catch(async (err) => {
        event.target.innerText = this.$t('activate')
        event.target.disabled = false
        console.error('activate license error:', err)
        await this.$emiter('showToast', this.$t('activateLicenseErrorMessage'))
      });

    },
    async closeOrder() {

      this.$service.close_order({
      }).then(async (res) => {
        console.log(`close_order: ${JSON.stringify(res)}`);
        clearInterval(this.interval);
        this.order = null;
      }).catch(async (err) => {
        console.error('close_order error:', err)
        await this.$emiter('showToast', this.$t('closeOrderErrorMessage'))
      });

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
      if (!this.license.mid) {
        return;
      }
      this.$service.get_order().then(async (res) => {
        if (res.code != 0) {
          console.log('get order failed:', res.data)
          this.order = null
        } else {
          console.log('get order:', res.data)
          if (refresh_status) {
            if (JSON.parse(res.data).status == 1) {
              await this.$emiter('LICENSE', { reload: true })
              await this.paymentSuccess()
              await message(this.$t('paymentSuccess'))
              return;
            }
            return;
          }

          await this.showOrder(res.data)
        }
      }).catch(async (err) => {
        console.error('get_order error:', err)
        await this.$emiter('showToast', this.$t('getOrderErrorMessage'))
      });

    },
    async showOrder(order) {
      console.log('showOrder:', order)
      //parse json
      this.order = JSON.parse(order)
      if (this.order.status != 0) {
        return;
      }
      if (this.interval) {
        clearInterval(this.interval);
      }
      this.order.qrcode = await QRCode.toDataURL(this.order.to_address);
      const expireAt = new Date(this.order.expire_at).getTime();
      const now = new Date().getTime();
      this.remainingTime = Math.floor((expireAt - now) / 1000);
      this.interval = setInterval(async () => {
        if (this.remainingTime > 0) {
          this.remainingTime--;
          this.refreshTime--;
          if (this.refreshTime == 0) {
            console.log('refresh order status')
            await this.getOrder(true)
            this.refreshTime = 10;
          }
        } else {
          clearInterval(this.interval);
          this.order = null;
        }
      }, 1000);
    },
    async createMonthOrderTrc20(event) {
      await this.createOrder(99, 'monthly', 'TRC20', event)
    },
    async createMonthOrderBep20(event) {
      await this.createOrder(99, 'monthly', 'BEP20', event)
    },
    async createYearOrderTrc20(event) {
      await this.createOrder(599, 'yearly', 'TRC20', event)
    },
    async createYearOrderBep20(event) {
      await this.createOrder(599, 'yearly', 'BEP20', event)
    },
    async createOrder(price, plan, network, event) {
      event.target.innerText = this.$t('fetching')
      event.target.disabled = true
      const finalPrice = Number(price * (1 - this.license.affiliate_discount / 100).toFixed(0));
      this.$service.create_order({
        network: network,
        amount: finalPrice,
        plan: plan
      }).then(async (res) => {
        console.log(`create_order: ${JSON.stringify(res)}`);
        event.target.innerText = this.$t('pay')
        event.target.disabled = false
        if (res.code != 0) {
          await message(res.data)
        } else {
          await this.showOrder(res.data)
        }
      }).catch(async (err) => {
        console.error('create_order error:', err)
        await this.$emiter('showToast', this.$t('createOrderErrorMessage'))
      });


    },
    async show() {
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
    async applyAffiliateCode(event) {
      event.target.innerText = this.$t('fetching')
      event.target.disabled = true
      try {
        const res = await this.$service.bind_affiliate({
          code: this.license.affiliate_code
        });
        if (res.code === 0) {
          const affiliate = JSON.parse(res.data);
          this.license.affiliate_discount = affiliate.discount;
          event.target.innerText = this.$t('applied')
          return;
        } else {
          await this.$emiter('showToast', res.data);
        }
      } catch (err) {
        await this.$emiter('showToast', this.$t('verifyInviteCodeError'));
      }
      event.target.innerText = this.$t('apply')
      event.target.disabled = false
    },
  },
  async mounted() {

  }
}
</script>
