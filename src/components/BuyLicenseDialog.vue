<template>
  <dialog ref="buy_liscense_dialog" class="modal">
    <div class="modal-box w-11/12 max-w-5xl overflow-hidden">

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
              <input id="mid" type="text" placeholder="mid" class="input input-md input-bordered ring-1"
                v-model="license.mid" readonly disabled />
              <span v-if="!license.mid">{{ $t('networkProblem') }}</span>
              <button @click="copyText(license.mid, $event)" class=" btn btn-md btn-primary  rounded-l-none">
                {{ $t('copy') }}
              </button>
              <a class="link link-primary text-md flex items-center gap-1 min-w-max" href="https://wa.me/6588387587"
                target="_blank">
                <font-awesome-icon icon="fab fa-whatsapp" class="h-5 w-5" />
                WhatsApp Support
              </a>
              <!-- <a class="link link-primary text-md flex items-center gap-1 min-w-max" href="https://t.me/tikmatrix"
                target="_blank">
                <font-awesome-icon icon="fab fa-telegram" class="h-5 w-5" />
                {{ $t('telegramSupport') }}
              </a> -->
              <a class="link link-primary text-md flex items-center gap-1 min-w-max"
                @click="copyText('admin@tikzenx.com', $event)" target="_blank">
                <font-awesome-icon icon="fas fa-envelope" class="h-5 w-5" />
                admin@tikzenx.com
              </a>
            </div>
            <!-- 显示管理Stripe订阅按钮 -->
            <div class="flex items-center flex-row gap-2 w-full" v-if="license.is_stripe_active == 1">
              <button @click="manageStripeSubscription" class="btn btn-wide btn-primary whitespace-nowrap">
                <!-- 支付卡图标集合 -->
                <div class="flex -space-x-2 overflow-hidden">
                  <!-- 银行卡图标 -->
                  <font-awesome-icon icon="fas fa-credit-card" class="h-6 w-6" />
                  <!-- Visa图标 -->
                  <font-awesome-icon icon="fab fa-cc-visa" class="h-6 w-6" />
                  <!-- Mastercard图标 -->
                  <font-awesome-icon icon="fab fa-cc-mastercard" class="h-6 w-6" />
                  <!-- American Express -->
                  <font-awesome-icon icon="fab fa-cc-amex" class="h-6 w-6" />
                </div>
                {{ $t('manageSubscription') }}
              </button>
              <label class="text-sm text-warning" v-if="license.stripe_cancel_at">{{ $t('cancelAt', {
                date: new Date(license.stripe_cancel_at *
                  1000).toLocaleDateString()
              }) }}</label>
              <label class="text-sm text-warning" v-else>{{ $t('renewAt', {
                date: new Date(license.stripe_renew_at *
                  1000).toLocaleDateString()
              }) }}</label>
            </div>
            <div class="flex items-center flex-row gap-2 w-full" v-else>
              <label class="font-bold w-28">{{ $t('licenseCode') }}: </label>
              <input type="text" placeholder="xxxx-xxxx-xxxx-xxxx" :disabled="license.leftdays > 0"
                class="input input-md input-bordered ring-1" v-model="license.license_code" />
              <button @click="activate" class="btn btn-md btn-primary rounded-l-none" v-if="license.leftdays <= 0">
                {{ $t('activate') }}
              </button>
              <button @click="copyText(license.license_code, $event)" class="btn btn-md btn-primary rounded-l-none"
                v-else>
                {{ $t('copy') }}
              </button>
              <label class="text-sm text-warning" v-if="license.leftdays > 0">{{ $t('expiredAt', {
                date: new Date(new Date().getTime() + license.leftdays * 24 * 60 * 60 * 1000).toLocaleDateString()
              }) }}</label>

              <!-- <div class="relative grow">
                <input type="text" :placeholder="$t('affiliateCode')" :disabled="license.affiliate_discount > 0"
                  class="input input-md w-full input-bordered ring-1 pr-20" v-model="license.affiliate_code" />
                <span v-if="license.affiliate_discount > 0"
                  class="absolute right-24 top-1/2 -translate-y-1/2 badge badge-success">
                  -{{ license.affiliate_discount }}%
                </span>
                <button @click="applyAffiliateCode" v-if="license.affiliate_discount == 0"
                  class="absolute right-0 top-0 btn btn-md btn-primary h-full rounded-l-none">
                  {{ $t('apply') }}
                </button>
                <button @click="copyText(license.affiliate_code, $event)"
                  class="absolute right-0 top-0 btn btn-md btn-primary h-full rounded-l-none" v-else>
                  {{ $t('copy') }}
                </button>
              </div> -->
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
              <input type="text" class="input input-md grow input-bordered ring-1" v-model="order.to_address" readonly
                disabled />
              <button @click="copyText(order.to_address, $event)" class="btn btn-md btn-primary">
                {{ $t('copy') }}
              </button>
            </div>
            <label class="text-error font-bold mt-2" v-if="order.network != 'STRIPE'">
              {{ $t('usdtTip', { network: order.network, amount: order.amount }) }}
            </label>
            <label class="text-error font-bold mt-2" v-if="order.network == 'STRIPE'">
              {{ $t('stripeTip') }}
            </label>
            <label class="text-success font-bold mt-2">{{ $t('afterPayTip') }}</label>
            <div class="flex items-center justify-center flex-row w-full">
              <progress class="progress progress-primary" :value="refreshTime" max="10"></progress>
            </div>

          </div>

          <div class="mx-auto mt-2 grid  grid-cols-3 items-center gap-y-6 w-full gap-x-2"
            v-else-if="license.is_stripe_active == 0">
            <!-- 试用 -->
            <div class="relative bg-primary shadow-2xl rounded-3xl p-8 ring-1 ring-info ring-opacity-50">
              <h3 class="text-primary-content font-semibold">
                {{ $t('trial') }}
              </h3>
              <p class="mt-4 flex items-baseline gap-x-2">

                <span class="text-primary-content text-5xl font-semibold tracking-tight">
                  {{ license.trial_price }}
                </span>
                <span class=" text-primary-content">7 {{ $t('days') }}</span>
              </p>
              <p class="text-primary-content mt-6 text-base/7">
                {{ $t('trialDescription') }}
              </p>
              <ul role="list" class="mt-8 space-y-3 text-md/6 text-primary-content">
                <li class="flex gap-x-3">
                  <CheckIcon class="text-primary-content h-6 w-5 flex-none" aria-hidden="true" />
                  {{ $t('unlimitedDevices') }}
                </li>
                <li class="flex gap-x-3">
                  <CheckIcon class="text-primary-content h-6 w-5 flex-none" aria-hidden="true" />
                  {{ $t('allFeatures') }}
                </li>
                <li class="flex gap-x-3">
                  <CheckIcon class="text-primary-content h-6 w-5 flex-none" aria-hidden="true" />
                  {{ $t('customerSupport') }}
                </li>
              </ul>
              <button @click="createTrialOrderStripe"
                class="btn btn-wide btn-primary ring-1 flex flex-row items-center justify-center cursor-pointer mt-2 rounded-md px-1 py-2 text-center text-md font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">
                <!-- 支付卡图标集合 -->
                <div class="flex -space-x-4 overflow-hidden">
                  <!-- 银行卡图标 -->
                  <font-awesome-icon icon="fas fa-credit-card" class="h-10 w-10 text-primary-content" />
                  <!-- Visa图标 -->
                  <font-awesome-icon icon="fab fa-cc-visa" class="h-10 w-10 text-primary-content" />
                  <!-- Mastercard图标 -->
                  <font-awesome-icon icon="fab fa-cc-mastercard" class="h-10 w-10 text-primary-content" />
                  <!-- American Express -->
                  <font-awesome-icon icon="fab fa-cc-amex" class="h-10 w-10 text-primary-content" />
                </div>
                {{ $t('startTrial') }}
              </button>


            </div>
            <!-- 按月付费 -->
            <div class="relative bg-neutral shadow-2xl rounded-3xl p-8 ring-1 ring-info ring-opacity-50">
              <h3 class="text-accent font-semibold">
                {{ $t('monthly') }}
              </h3>
              <p class="mt-4 flex items-baseline gap-x-2">
                <!-- <template v-if="license.affiliate_discount > 0">
                  <span class="text-accent/50 text-2xl line-through">$99</span>
                  <span class="text-accent text-5xl font-semibold tracking-tight">
                    ${{ (99 * (1 - license.affiliate_discount / 100)).toFixed(0) }}
                  </span>
                </template> -->
                <span class="text-accent text-5xl font-semibold tracking-tight">
                  {{ license.month_price }}
                </span>
                <span class=" text-accent">/ {{ $t('month') }}</span>
              </p>
              <p class="text-neutral-content mt-6 text-base/7">
                {{ $t('monthlyDescription') }}
              </p>
              <ul role="list" class="mt-8 space-y-3 text-md/6 text-neutral-content">
                <li class="flex gap-x-3">
                  <CheckIcon class="text-accent h-6 w-5 flex-none" aria-hidden="true" />
                  {{ $t('unlimitedDevices') }}
                </li>
                <li class="flex gap-x-3">
                  <CheckIcon class="text-accent h-6 w-5 flex-none" aria-hidden="true" />
                  {{ $t('allFeatures') }}
                </li>
                <li class="flex gap-x-3">
                  <CheckIcon class="text-accent h-6 w-5 flex-none" aria-hidden="true" />
                  {{ $t('customerSupport') }}
                </li>
              </ul>
              <button @click="createMonthOrderStripe"
                class="btn btn-wide btn-primary ring-1 flex flex-row items-center justify-center cursor-pointer mt-2 rounded-md px-1 py-2 text-center text-md font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">
                <!-- 支付卡图标集合 -->
                <div class="flex -space-x-4 overflow-hidden">
                  <!-- 银行卡图标 -->
                  <font-awesome-icon icon="fas fa-credit-card" class="h-10 w-10 text-primary-content" />
                  <!-- Visa图标 -->
                  <font-awesome-icon icon="fab fa-cc-visa" class="h-10 w-10 text-primary-content" />
                  <!-- Mastercard图标 -->
                  <font-awesome-icon icon="fab fa-cc-mastercard" class="h-10 w-10 text-primary-content" />
                  <!-- American Express -->
                  <font-awesome-icon icon="fab fa-cc-amex" class="h-10 w-10 text-primary-content" />
                </div>
                {{ $t('card') }}
              </button>
              <button @click="createMonthOrderTrc20"
                class="btn btn-wide btn-secondary ring-1 flex flex-row items-center justify-center cursor-pointer mt-2 rounded-md px-3.5 py-2.5 text-center text-md font-semibold">
                <!-- tron network icon -->
                <svg class="fill-current text-secondary-content h-6 w-6" xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 64 64">
                  <g id="tron">
                    <path class="cls-1"
                      d="M61.55,19.28c-3-2.77-7.15-7-10.53-10l-.2-.14a3.82,3.82,0,0,0-1.11-.62l0,0C41.56,7,3.63-.09,2.89,0a1.4,1.4,0,0,0-.58.22L2.12.37a2.23,2.23,0,0,0-.52.84l-.05.13v.71l0,.11C5.82,14.05,22.68,53,26,62.14c.2.62.58,1.8,1.29,1.86h.16c.38,0,2-2.14,2-2.14S58.41,26.74,61.34,23a9.46,9.46,0,0,0,1-1.48A2.41,2.41,0,0,0,61.55,19.28ZM36.88,23.37,49.24,13.12l7.25,6.68Zm-4.8-.67L10.8,5.26l34.43,6.35ZM34,27.27l21.78-3.51-24.9,30ZM7.91,7,30.3,26,27.06,53.78Z" />
                  </g>
                </svg>
                {{ $t('usdttrc20') }}
              </button>
              <button @click="createMonthOrderBep20"
                class="btn btn-wide btn-success ring-1 flex flex-row items-center justify-center cursor-pointer mt-2  rounded-md px-1 py-2 text-center text-md font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">
                <!-- bsc network icon -->

                <svg class="fill-current text-secondary-content h-6 w-6" xmlns="http://www.w3.org/2000/svg"
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
                {{ $t('usdtbep20') }}
              </button>

            </div>
            <!-- 按年付费 -->
            <div class="relative bg-success shadow-2xl rounded-3xl p-8 ring-1 ring-info ring-opacity-50">
              <h3 class="text-success-content font-semibold">
                {{ $t('yearly') }}
              </h3>
              <p class="mt-4 flex items-baseline gap-x-2">
                <!-- <template v-if="license.affiliate_discount > 0">
                  <span class="text-success-content/50 text-2xl line-through">$599</span>
                  <span class="text-success-content text-5xl font-semibold tracking-tight">
                    ${{ (599 * (1 - license.affiliate_discount / 100)).toFixed(0) }}
                  </span>
                </template> -->
                <span class="text-success-content text-5xl font-semibold tracking-tight">
                  {{ license.year_price }}
                </span>
                <span class=" text-success-content">/ {{ $t('year') }}</span>
              </p>
              <p class="text-success-content mt-6 text-base/7">
                {{ $t('yearlyDescription') }}
              </p>
              <ul role="list" class="mt-8 space-y-3 text-md/6 text-success-content">
                <li class="flex gap-x-3">
                  <CheckIcon class="text-success-content h-6 w-5 flex-none" aria-hidden="true" />
                  {{ $t('unlimitedDevices') }}
                </li>
                <li class="flex gap-x-3">
                  <CheckIcon class="text-success-content h-6 w-5 flex-none" aria-hidden="true" />
                  {{ $t('allFeatures') }}
                </li>
                <li class="flex gap-x-3">
                  <CheckIcon class="text-success-content h-6 w-5 flex-none" aria-hidden="true" />
                  {{ $t('customerSupport') }}
                </li>
              </ul>
              <button @click="createYearOrderStripe"
                class="btn btn-wide btn-primary ring-1 flex flex-row items-center justify-center cursor-pointer mt-2 rounded-md px-1 py-2 text-center text-md font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">
                <!-- 支付卡图标集合 -->
                <div class="flex -space-x-4 overflow-hidden">
                  <!-- 银行卡图标 -->
                  <font-awesome-icon icon="fas fa-credit-card" class="h-10 w-10 text-primary-content" />
                  <!-- Visa图标 -->
                  <font-awesome-icon icon="fab fa-cc-visa" class="h-10 w-10 text-primary-content" />
                  <!-- Mastercard图标 -->
                  <font-awesome-icon icon="fab fa-cc-mastercard" class="h-10 w-10 text-primary-content" />
                  <!-- American Express -->
                  <font-awesome-icon icon="fab fa-cc-amex" class="h-10 w-10 text-primary-content" />
                </div>
                {{ $t('card') }}
              </button>
              <button @click="createYearOrderTrc20"
                class="btn btn-wide btn-secondary ring-1 flex flex-row items-center justify-center cursor-pointer mt-2 rounded-md px-3.5 py-2.5 text-center text-md font-semibold">
                <!-- tron network icon -->
                <svg class="fill-current text-secondary-content h-6 w-6" xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 64 64">
                  <g id="tron">
                    <path class="cls-1"
                      d="M61.55,19.28c-3-2.77-7.15-7-10.53-10l-.2-.14a3.82,3.82,0,0,0-1.11-.62l0,0C41.56,7,3.63-.09,2.89,0a1.4,1.4,0,0,0-.58.22L2.12.37a2.23,2.23,0,0,0-.52.84l-.05.13v.71l0,.11C5.82,14.05,22.68,53,26,62.14c.2.62.58,1.8,1.29,1.86h.16c.38,0,2-2.14,2-2.14S58.41,26.74,61.34,23a9.46,9.46,0,0,0,1-1.48A2.41,2.41,0,0,0,61.55,19.28ZM36.88,23.37,49.24,13.12l7.25,6.68Zm-4.8-.67L10.8,5.26l34.43,6.35ZM34,27.27l21.78-3.51-24.9,30ZM7.91,7,30.3,26,27.06,53.78Z" />
                  </g>
                </svg>
                {{ $t('usdttrc20') }}
              </button>
              <button @click="createYearOrderBep20"
                class="btn btn-wide btn-success ring-1 flex flex-row items-center justify-center cursor-pointer mt-2  rounded-md px-1 py-2 text-center text-md font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">
                <!-- bsc network icon -->

                <svg class="fill-current text-secondary-content h-6 w-6" xmlns="http://www.w3.org/2000/svg"
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
                {{ $t('usdtbep20') }}
              </button>

            </div>
          </div>
          <!-- 新增：隐私协议和服务条款链接 -->
          <div class="flex justify-center items-center gap-2 mt-4">
            <input type="checkbox" id="agreePolicy" v-model="agreePolicy" class="checkbox checkbox-primary" />
            <label for="agreePolicy" class="cursor-pointer select-none">
              {{ $t('iAgreeWith') }}
              <a href="https://tikzenx.com/privacy-policy" target="_blank" class="link link-primary mx-1">
                {{ $t('privacyPolicy') }}
              </a>
              {{ $t('and') }}
              <a href="https://tikzenx.com/terms-of-service" target="_blank" class="link link-primary mx-1">
                {{ $t('termsOfService') }}
              </a>
            </label>
          </div>
        </div>


      </div>

    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
  <!-- 新增：同意隐私协议和服务条款链接询问弹窗 -->
  <dialog ref="agreePolicyDialog" class="modal">
    <form method="dialog" class="modal-box">
      <h3 class="font-bold text-lg">{{ $t('tips') }}</h3>
      <p class="py-4">{{ $t('pleaseAgree') }}</p>
      <div class="modal-action">
        <button type="submit" class="btn">{{ $t('confirm') }}</button>
      </div>
    </form>
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

  data() {
    return {
      remainingTime: 0,
      order: null,
      interval: null,
      refreshTime: 10,
      agreePolicy: localStorage.getItem('agreePolicy') === 'true'
    }
  },
  watch: {
    agreePolicy(newVal) {
      localStorage.setItem('agreePolicy', newVal);
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
    async activate(event) {
      event.target.innerText = this.$t('activating')
      event.target.disabled = true
      this.$service.activate_license({
        'license_code': this.license.license_code,
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
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('activateLicenseErrorMessage'),
          timeout: 2000
        });
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
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('closeOrderErrorMessage'),
          timeout: 2000
        });
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
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('getOrderErrorMessage'),
          timeout: 2000
        });
      });

    },
    async showOrder(order) {
      //parse json
      this.order = JSON.parse(order)
      console.log('showOrder:', this.order)
      if (this.order.status != 0) {
        console.log('order status is not 0')
        return;
      }

      console.log('start to get qrcode')

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
      await this.createOrder(99, 'month', 'TRC20', event)
    },
    async createMonthOrderBep20(event) {
      await this.createOrder(99, 'month', 'BEP20', event)
    },
    async createYearOrderTrc20(event) {
      await this.createOrder(599, 'year', 'TRC20', event)
    },
    async createYearOrderBep20(event) {
      await this.createOrder(599, 'year', 'BEP20', event)
    },
    async createTrialOrderStripe(event) {
      await this.createStripeOrder(99, 'month', true, event)
    },
    async createMonthOrderStripe(event) {
      await this.createStripeOrder(99, 'month', false, event)
    },
    async createYearOrderStripe(event) {
      await this.createStripeOrder(599, 'year', false, event)
    },
    async createStripeOrder(price, plan, trial, event) {
      if (!this.agreePolicy) {
        this.$refs.agreePolicyDialog.showModal();
        return;
      }
      event.target.disabled = true
      this.$service.get_stripe_checkout_url({
        price: price,
        plan: plan,
        trial: trial
      }).then(async (res) => {
        event.target.disabled = false
        console.log('createStripeOrder:', JSON.stringify(res))
        if (res.code != 0) {
          await this.$emiter('NOTIFY', {
            type: 'error',
            message: res.data,
            timeout: 2000
          });
        } else {
          console.log('get_stripe_checkout_url:', res.data)
          event.target.disabled = false
          await open(JSON.parse(res.data))
        }
      }).catch(async (err) => {
        event.target.disabled = false
        console.error('get_stripe_checkout_url error:', err)
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('getStripeCheckoutUrlErrorMessage'),
          timeout: 2000
        });
      });
    },
    async createOrder(price, plan, network, event) {
      event.target.disabled = true
      const finalPrice = Number(price * (1 - this.license.affiliate_discount / 100).toFixed(0));
      this.$service.create_order({
        network: network,
        amount: finalPrice,
        plan: plan
      }).then(async (res) => {
        console.log('create_order:', res.data)
        event.target.disabled = false
        if (res.code != 0) {
          await message(res.data)
        } else {
          await this.showOrder(res.data)
        }
      }).catch(async (err) => {
        console.error('create_order error:', err)
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('createOrderErrorMessage'),
          timeout: 2000
        });
      });
    },

    async show() {
      await this.$emiter('LICENSE', { reload: true })
      this.$refs.buy_liscense_dialog.showModal()
      await this.getOrder()
    },
    async copyText(text, event) {
      await writeText(text)
      await this.$emiter('NOTIFY', {
        type: 'success',
        message: this.$t('copied'),
        timeout: 2000
      });
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
          await this.$emiter('NOTIFY', {
            type: 'error',
            message: res.data,
            timeout: 2000
          });
        }
      } catch (err) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('verifyInviteCodeError'),
        });
      }
      event.target.innerText = this.$t('apply')
      event.target.disabled = false
    },

    async manageStripeSubscription() {
      try {
        // 获取管理订阅的URL
        this.$service.get_stripe_portal_url().then(async (res) => {
          if (res.code === 0) {
            const portalUrl = JSON.parse(res.data);
            console.log('portalUrl:', portalUrl)
            // 打开Stripe订阅管理页面
            await open(portalUrl);
          } else {
            await this.$emiter('NOTIFY', {
              type: 'error',
              message: res.data,
              timeout: 2000
            });
          }
        });
      } catch (error) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('manageSubscriptionErrorMessage'),
          timeout: 2000
        });
      }
    },
  },
  async mounted() {
    await this.$listen('STRIPE_PAYMENT_SUCCESS', async (e) => {
      console.log('STRIPE_PAYMENT_SUCCESS:', e)
      await this.$emiter('LICENSE', { reload: true })
      await this.paymentSuccess()
      await message(this.$t('paymentSuccess'))
    })
    await this.$listen('STRIPE_PAYMENT_CANCEL', async (e) => {
      console.log('STRIPE_PAYMENT_CANCEL:', e)
    })
  }
}
</script>
