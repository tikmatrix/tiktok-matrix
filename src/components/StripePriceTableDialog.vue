<template>
  <dialog ref="buy_liscense_dialog" class="modal">
    <div class="modal-box w-11/12 max-w-7xl overflow-y-auto max-h-[90vh] bg-gradient-to-br from-base-100 to-base-200">
      <!-- 优化的关闭按钮 -->
      <form method="dialog">
        <button
          class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 z-10 hover:bg-base-300 transition-all duration-200">
          <font-awesome-icon icon="fas fa-times" class="text-lg" />
        </button>
      </form>

      <div class="modal-body">
        <div class="relative isolate px-4 py-4 w-full">
          <!-- 精简的标题 -->
          <div class="text-center mb-4">
            <h2 class="text-2xl font-bold text-primary mb-1">{{ $t('choosePlan') }}</h2>
            <p class="text-base-content/70 text-sm">{{ $t('selectBestPlanForYou') }}</p>
          </div>
          <!-- 用户信息卡片 -->
          <div class="bg-base-100 rounded-xl shadow-md p-4 mb-4 border border-base-300">
            <div class="flex items-start flex-col w-full gap-3">
              <!-- MID 信息行 -->
              <div class="flex items-center flex-row gap-2 w-full">
                <div class="flex items-center gap-2 min-w-max">
                  <div class="w-1 h-6 bg-primary rounded-full"></div>
                  <label class="font-semibold text-base">{{ $t('mid') }}:</label>
                </div>
                <div class="flex-1 flex items-center gap-2">
                  <input id="mid" type="text" placeholder="mid"
                    class="input input-sm input-bordered flex-1 bg-base-200 text-center font-mono" v-model="license.mid"
                    readonly disabled />
                  <span v-if="!license.mid" class="text-warning text-xs">{{ $t('networkProblem') }}</span>
                  <button @click="copyText(license.mid, $event)"
                    class="btn btn-sm btn-primary hover:btn-primary-focus transition-all duration-200">
                    <font-awesome-icon icon="fas fa-copy" class="mr-1" />
                    {{ $t('copy') }}
                  </button>
                </div>

                <!-- 联系支持链接 -->
                <div class="flex items-center gap-2">
                  <a class="btn btn-outline btn-xs btn-info hover:btn-info transition-all duration-200 flex items-center gap-1"
                    href="https://t.me/tikmatrix" target="_blank">
                    <font-awesome-icon icon="fab fa-telegram" class="text-sm" />
                    {{ $t('telegramSupport') }}
                  </a>
                  <button
                    class="btn btn-outline btn-xs btn-secondary hover:btn-secondary transition-all duration-200 flex items-center gap-1"
                    @click="copyText('support@tikmatrix.com', $event)">
                    <font-awesome-icon icon="fas fa-envelope" class="text-sm" />
                    <span class="hidden sm:inline">support@tikmatrix.com</span>
                    <span class="sm:hidden">Email</span>
                  </button>
                </div>
              </div>


              <!-- 订阅状态显示 -->
              <div class="flex items-center flex-row gap-2 w-full" v-if="license.is_stripe_active == 1">
                <div class="flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <div class="badge badge-success badge-md gap-1 px-3 py-2">
                      <font-awesome-icon icon="fa-solid fa-crown" class="text-yellow-300 text-sm" />
                      <span class="font-medium">{{ license.plan_name }}</span>
                    </div>
                    <button @click="manageStripeSubscription"
                      class="btn btn-primary btn-sm hover:btn-primary-focus transition-all duration-200">
                      <font-awesome-icon icon="fas fa-cog" class="mr-1" />
                      {{ $t('manageSubscription') }}
                    </button>
                    <button @click="showLicenseMigration"
                      class="btn btn-outline btn-warning btn-sm hover:btn-warning transition-all duration-200">
                      <font-awesome-icon icon="fas fa-exchange-alt" class="mr-1 w-3 h-3" />
                      {{ $t('migrateLicense') }}
                    </button>

                    <div class="text-xs" v-if="license.stripe_cancel_at">
                      <div class="badge badge-warning gap-1">
                        <font-awesome-icon icon="fas fa-exclamation-triangle" class="w-3 h-3" />
                        {{ $t('cancelAt', {
                          date: new Date(license.stripe_cancel_at * 1000).toLocaleDateString()
                        }) }}
                      </div>
                    </div>
                    <div class="text-xs" v-else>
                      <div class="badge badge-info gap-1">
                        <font-awesome-icon icon="fas fa-calendar-alt" class="w-3 h-3" />
                        {{ $t('renewAt', { date: new Date(license.stripe_renew_at * 1000).toLocaleDateString() }) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 许可证激活区域 -->
              <div class="flex items-center flex-row gap-2 w-full" v-else>
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <div class="flex items-center gap-2 min-w-max">
                      <div class="w-1 h-6 bg-secondary rounded-full"></div>
                      <label class="font-semibold text-base">{{ $t('licenseCode') }}:</label>
                    </div>
                    <input type="text" placeholder="xxxx-xxxx-xxxx-xxxx" :disabled="license.leftdays > 0"
                      class="input input-sm input-bordered flex-1 font-mono"
                      :class="license.leftdays > 0 ? 'bg-base-200' : 'focus:border-primary'"
                      v-model="license.license_code" />
                    <button @click="activate"
                      class="btn btn-sm btn-success hover:btn-success-focus transition-all duration-200"
                      v-if="license.leftdays <= 0">
                      <font-awesome-icon icon="fas fa-check" class="mr-1" />
                      {{ $t('activate') }}
                    </button>
                    <button @click="copyText(license.license_code, $event)"
                      class="btn btn-sm btn-primary hover:btn-primary-focus transition-all duration-200" v-else>
                      <font-awesome-icon icon="fas fa-copy" class="mr-1" />
                      {{ $t('copy') }}
                    </button>
                  </div>
                  <div class="mt-1 flex items-center justify-between" v-if="license.leftdays > 0">
                    <div class="badge badge-success gap-1">
                      <font-awesome-icon icon="fas fa-calendar-check" class="w-3 h-3" />
                      <span class="text-xs">{{ $t('expiredAt', {
                        date: new Date(new Date().getTime() + license.leftdays * 24 * 60 * 60 *
                          1000).toLocaleDateString()
                      }) }}</span>
                    </div>
                    <!-- License迁移按钮 - 内联显示 -->
                    <button @click="showLicenseMigration" v-if="license.is_stripe_active != 1"
                      class="btn btn-warning btn-xs gap-1 hover:btn-warning-focus transition-all duration-200">
                      <div class="w-3 h-3 rounded-full bg-warning-content/20 flex items-center justify-center">
                        <font-awesome-icon icon="fas fa-exchange-alt" class="w-2 h-2 text-warning-content" />
                      </div>
                      <span class="text-xs">{{ $t('migrateLicense') }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 订单显示区域 -->
          <div
            class="bg-gradient-to-br from-warning/10 to-error/10 rounded-xl shadow-md border border-warning/20 p-4 mb-4"
            v-if="order && order.status == 0">
            <div class="text-center mb-4">
              <h3 class="text-xl font-bold text-warning mb-3">{{ $t('pendingPayment') }}</h3>

              <!-- 突出显示支付信息 -->
              <div class="bg-warning/20 rounded-lg p-3 mb-3 border border-warning/30">
                <div class="flex items-center justify-center gap-4 mb-2">
                  <div class="badge badge-primary badge-lg gap-2">
                    <font-awesome-icon icon="fas fa-network-wired" class="w-4 h-4" />
                    <span class="font-semibold">{{ order.network }}</span>
                  </div>
                  <div class="badge badge-success badge-lg gap-2">
                    <font-awesome-icon icon="fas fa-dollar-sign" class="w-4 h-4" />
                    <span class="font-semibold">{{ order.amount }} USDT</span>
                  </div>
                </div>

                <!-- 修复后的倒计时 -->
                <div class="flex items-center justify-center gap-3">
                  <div class="text-error font-mono text-xl font-bold">
                    {{ formattedTime }}
                  </div>
                  <button @click="closeOrder"
                    class="btn btn-sm btn-outline btn-error hover:btn-error hover:text-white transition-all duration-200 gap-1">
                    <font-awesome-icon icon="fas fa-times-circle" class="w-4 h-4" />
                    {{ $t('closeOrder') }}
                  </button>
                </div>
                <p class="text-xs text-base-content/70 mt-1">{{ $t('paymentTimeRemaining') }}</p>
              </div>
            </div>

            <!-- QR码和地址 -->
            <div class="flex flex-col items-center gap-4">
              <div class="card bg-base-100 shadow-lg">
                <div class="card-body p-3">
                  <img :src="order.qrcode" class="w-48 h-48 mx-auto rounded-lg" />
                </div>
              </div>

              <div class="w-full max-w-xl">
                <label class="label py-1">
                  <span class="label-text font-medium text-sm">{{ $t('depositAddress') }}</span>
                </label>
                <div class="join w-full">
                  <input type="text"
                    class="input input-sm input-bordered join-item flex-1 font-mono bg-base-200 text-center"
                    v-model="order.to_address" readonly disabled />
                  <button @click="copyText(order.to_address, $event)"
                    class="btn btn-sm btn-primary join-item hover:btn-primary-focus transition-all duration-200">
                    <font-awesome-icon icon="fas fa-copy" class="mr-1" />
                    {{ $t('copy') }}
                  </button>
                </div>
              </div>

              <!-- 支付提示 -->
              <div class="space-y-2 w-full max-w-xl">
                <div class="alert alert-error py-2" v-if="order.network != 'STRIPE'">
                  <font-awesome-icon icon="fas fa-exclamation-triangle" class="w-4 h-4" />
                  <span class="text-sm">{{ $t('usdtTip', { network: order.network, amount: order.amount }) }}</span>
                </div>
                <div class="alert alert-error py-2" v-if="order.network == 'STRIPE'">
                  <font-awesome-icon icon="fas fa-exclamation-triangle" class="w-4 h-4" />
                  <span class="text-sm">{{ $t('stripeTip') }}</span>
                </div>
                <div class="alert alert-success py-2">
                  <font-awesome-icon icon="fas fa-check-circle" class="w-4 h-4" />
                  <span class="text-sm">{{ $t('afterPayTip') }}</span>
                </div>
              </div>

              <!-- 进度条 -->
              <div class="w-full max-w-xs">
                <progress class="progress progress-primary w-full" :value="refreshTime" max="10"></progress>
                <p class="text-center text-xs text-base-content/70 mt-1">{{ $t('autoRefreshIn') }} {{ refreshTime }}s
                </p>
              </div>
            </div>
          </div>


          <!-- 定价表 -->
          <div class="mt-4" v-else>
            <div class="tabs tabs-lifted tabs-lg justify-center mb-6 bg-base-200/50 rounded-xl p-2"
              v-if="priceTableInfo && priceTableInfo.plans.length > 0">
              <input type="radio" name="pricing_tabs"
                class="tab [--tab-bg:hsl(var(--p))] [--tab-color:hsl(var(--pc))] text-base font-semibold"
                aria-label="Monthly" checked="checked" />
              <div class="tab-content bg-base-100 backdrop-blur border border-base-300 rounded-xl p-6 shadow-xl">
                <!-- 月度计划标题 -->
                <div class="text-center mb-4">
                  <h3 class="text-xl font-bold text-primary mb-1">{{ $t('monthlyPlans') }}</h3>
                  <p class="text-base-content/70 text-sm">{{ $t('payMonthly') }}</p>
                </div>
                <div class="grid gap-4 w-full"
                  :style="{ 'grid-template-columns': `repeat(${Math.min(priceTableInfo?.plans?.length || 4, 4)}, minmax(0, 1fr))` }">
                  <div v-for="(plan, index) in priceTableInfo.plans" :key="plan.id"
                    class="card bg-gradient-to-br shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border"
                    :class="[
                      index % 4 === 0 ? 'from-primary/15 to-primary/5 border-primary/30' :
                        index % 4 === 1 ? 'from-secondary/15 to-secondary/5 border-secondary/30' :
                          index % 4 === 2 ? 'from-accent/15 to-accent/5 border-accent/30' :
                            'from-info/15 to-info/5 border-info/30',
                      cardStyle.padding
                    ]">
                    <div class="card-body p-4">
                      <!-- 最受欢迎标签 -->
                      <div class="badge badge-secondary absolute -top-3 left-1/2 transform -translate-x-1/2"
                        v-if="index === 1">
                        {{ $t('mostPopular') }}
                      </div>

                      <!-- 计划标题 -->
                      <div class="text-center mb-3">
                        <h3 class="card-title justify-center text-lg mb-2" :class="index % 4 === 0 ? 'text-primary' :
                          index % 4 === 1 ? 'text-secondary' :
                            index % 4 === 2 ? 'text-accent' : 'text-info'">
                          {{ plan.name }}
                        </h3>
                        <div class="flex items-baseline justify-center gap-1 mb-2">
                          <span class="text-2xl font-bold" :class="cardStyle.textSize">
                            ${{ plan.price.month.amount }}
                          </span>
                          <div class="text-base-content/70 text-sm">
                            <span>/ {{ $t('month') }}</span>
                            <span class="block">/ {{ $t('pc') }}</span>
                          </div>
                        </div>
                        <p class="text-base-content/80 text-sm">
                          {{ plan.description[$i18n.locale] }}
                        </p>
                      </div>

                      <!-- 功能列表 -->
                      <ul class="space-y-2 mb-4">
                        <li v-for="feature in plan.includes[$i18n.locale]" :key="feature"
                          class="flex items-center gap-2">
                          <div
                            class="w-4 h-4 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                            <CheckIcon class="w-2.5 h-2.5 text-success" />
                          </div>
                          <span class="text-xs">{{ feature }}</span>
                        </li>
                      </ul>

                      <!-- 按钮区域 -->
                      <div class="space-y-2">
                        <button @click="manageStripeSubscription" v-if="license.is_stripe_active == 1"
                          class="btn btn-success btn-block btn-sm hover:btn-success-focus transition-all duration-200">
                          <font-awesome-icon icon="fas fa-cog" class="mr-1 w-3 h-3" />
                          {{ $t('manageSubscription') }}
                        </button>
                        <button @click="createStripeCheckoutUrl(plan.price.month.id, 'month')" v-else
                          class="btn btn-primary btn-block btn-sm hover:btn-primary-focus transition-all duration-200">
                          <div class="flex items-center justify-center gap-1">
                            <div class="flex -space-x-0.5">
                              <font-awesome-icon icon="fas fa-credit-card" class="text-sm" />
                              <font-awesome-icon icon="fab fa-cc-visa" class="text-sm" />
                              <font-awesome-icon icon="fab fa-cc-mastercard" class="text-sm" />
                            </div>
                            <span>{{ $t('subscribe') }}</span>
                          </div>
                        </button>

                        <!-- USDT支付选项 -->
                        <div v-if="license.is_stripe_active == 0" class="space-y-1">
                          <button @click="createOrder(plan.price.month.amount, plan.id, 'month', 'TRC20')"
                            class="btn btn-outline btn-secondary btn-block btn-xs hover:btn-secondary transition-all duration-200">
                            <svg class="w-3 h-3 mr-1 fill-current" xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 64 64">
                              <path
                                d="M61.55,19.28c-3-2.77-7.15-7-10.53-10l-.2-.14a3.82,3.82,0,0,0-1.11-.62l0,0C41.56,7,3.63-.09,2.89,0a1.4,1.4,0,0,0-.58.22L2.12.37a2.23,2.23,0,0,0-.52.84l-.05.13v.71l0,.11C5.82,14.05,22.68,53,26,62.14c.2.62.58,1.8,1.29,1.86h.16c.38,0,2-2.14,2-2.14S58.41,26.74,61.34,23a9.46,9.46,0,0,0,1-1.48A2.41,2.41,0,0,0,61.55,19.28ZM36.88,23.37,49.24,13.12l7.25,6.68Zm-4.8-.67L10.8,5.26l34.43,6.35ZM34,27.27l21.78-3.51-24.9,30ZM7.91,7,30.3,26,27.06,53.78Z" />
                            </svg>
                            {{ $t('usdttrc20') }}
                          </button>
                          <button @click="createOrder(plan.price.month.amount, plan.id, 'month', 'BEP20')"
                            class="btn btn-outline btn-warning btn-block btn-xs hover:btn-warning transition-all duration-200">
                            <svg class="w-3 h-3 mr-1 fill-current" xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 336.41 337.42">
                              <g>
                                <path d="M168.2.71l41.5,42.5L105.2,147.71l-41.5-41.5Z" />
                                <path d="M231.2,63.71l41.5,42.5L105.2,273.71l-41.5-41.5Z" />
                                <path d="M42.2,126.71l41.5,42.5-41.5,41.5L.7,169.21Z" />
                                <path d="M294.2,126.71l41.5,42.5L168.2,336.71l-41.5-41.5Z" />
                              </g>
                            </svg>
                            {{ $t('usdtbep20') }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 年度计划标签 -->
              <input type="radio" name="pricing_tabs"
                class="tab [--tab-bg:hsl(var(--a))] [--tab-color:hsl(var(--ac))] text-base font-semibold"
                :aria-label="$t('yearlyDiscount', { percent: 30 })" />
              <div class="tab-content bg-base-100 backdrop-blur border border-base-300 rounded-xl p-6 shadow-xl">
                <!-- 年度计划标题 -->
                <div class="text-center mb-4">
                  <h3 class="text-xl font-bold text-accent mb-1">{{ $t('yearlyPlans') }}</h3>
                  <div class="badge badge-success badge-md gap-1 mb-1">
                    <font-awesome-icon icon="fas fa-tag" class="w-3 h-3" />
                    {{ $t('save') }} 30%
                  </div>
                </div>

                <div class="grid gap-4 w-full"
                  :style="{ 'grid-template-columns': `repeat(${Math.min(priceTableInfo?.plans?.length || 4, 4)}, minmax(0, 1fr))` }">
                  <div v-for="(plan, index) in priceTableInfo.plans" :key="plan.id + '_year'"
                    class="card bg-gradient-to-br shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border"
                    :class="[
                      index % 4 === 0 ? 'from-accent/15 to-accent/5 border-accent/30' :
                        index % 4 === 1 ? 'from-warning/15 to-warning/5 border-warning/30' :
                          index % 4 === 2 ? 'from-success/15 to-success/5 border-success/30' :
                            'from-error/15 to-error/5 border-error/30',
                      cardStyle.padding
                    ]">
                    <div class="card-body p-4">
                      <!-- 最受欢迎标签 -->
                      <div class="badge badge-accent absolute -top-3 left-1/2 transform -translate-x-1/2"
                        v-if="index === 1">
                        {{ $t('mostPopular') }}
                      </div>

                      <!-- 计划标题 -->
                      <div class="text-center mb-3">
                        <h3 class="card-title justify-center text-lg mb-2" :class="index % 4 === 0 ? 'text-accent' :
                          index % 4 === 1 ? 'text-warning' :
                            index % 4 === 2 ? 'text-success' : 'text-error'">
                          {{ plan.name }}
                        </h3>
                        <div class="flex items-baseline justify-center gap-1 mb-2">
                          <span class="text-2xl font-bold" :class="cardStyle.textSize">
                            ${{ Math.round(plan.price.year.amount / 12) }}
                          </span>
                          <div class="text-base-content/70 text-sm">
                            <span>/ {{ $t('month') }}</span>
                            <span class="block">/ {{ $t('pc') }}</span>
                          </div>
                        </div>
                        <div class="bg-accent/20 rounded-lg p-2 mb-2">
                          <p class="text-sm font-semibold text-accent">
                            ${{ plan.price.year.amount }} / {{ $t('year') }}
                          </p>
                          <p class="text-xs text-success font-medium">
                            {{ $t('save') }} ${{ Math.round((plan.price.month.amount * 12) - plan.price.year.amount) }}
                          </p>
                        </div>
                        <p class="text-base-content/80 text-sm">
                          {{ plan.description[$i18n.locale] }}
                        </p>
                      </div>

                      <!-- 功能列表 -->
                      <ul class="space-y-2 mb-4">
                        <li v-for="feature in plan.includes[$i18n.locale]" :key="feature"
                          class="flex items-center gap-2">
                          <div
                            class="w-4 h-4 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                            <CheckIcon class="w-2.5 h-2.5 text-success" />
                          </div>
                          <span class="text-xs">{{ feature }}</span>
                        </li>
                      </ul>

                      <!-- 按钮区域 -->
                      <div class="space-y-2">
                        <button @click="manageStripeSubscription" v-if="license.is_stripe_active == 1"
                          class="btn btn-success btn-block btn-sm hover:btn-success-focus transition-all duration-200">
                          <font-awesome-icon icon="fas fa-cog" class="mr-1 w-3 h-3" />
                          {{ $t('manageSubscription') }}
                        </button>
                        <button @click="createStripeCheckoutUrl(plan.price.year.id, 'year')" v-else
                          class="btn btn-accent btn-block btn-sm hover:btn-accent-focus transition-all duration-200">
                          <div class="flex items-center justify-center gap-1">
                            <div class="flex -space-x-0.5">
                              <font-awesome-icon icon="fas fa-credit-card" class="text-sm" />
                              <font-awesome-icon icon="fab fa-cc-visa" class="text-sm" />
                              <font-awesome-icon icon="fab fa-cc-mastercard" class="text-sm" />
                            </div>
                            <span>{{ $t('subscribe') }}</span>
                          </div>
                        </button>

                        <!-- USDT支付选项 -->
                        <div v-if="license.is_stripe_active == 0" class="space-y-1">
                          <button @click="createOrder(plan.price.year.amount, plan.id, 'year', 'TRC20')"
                            class="btn btn-outline btn-secondary btn-block btn-xs hover:btn-secondary transition-all duration-200">
                            <svg class="w-3 h-3 mr-1 fill-current" xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 64 64">
                              <path
                                d="M61.55,19.28c-3-2.77-7.15-7-10.53-10l-.2-.14a3.82,3.82,0,0,0-1.11-.62l0,0C41.56,7,3.63-.09,2.89,0a1.4,1.4,0,0,0-.58.22L2.12.37a2.23,2.23,0,0,0-.52.84l-.05.13v.71l0,.11C5.82,14.05,22.68,53,26,62.14c.2.62.58,1.8,1.29,1.86h.16c.38,0,2-2.14,2-2.14S58.41,26.74,61.34,23a9.46,9.46,0,0,0,1-1.48A2.41,2.41,0,0,0,61.55,19.28ZM36.88,23.37,49.24,13.12l7.25,6.68Zm-4.8-.67L10.8,5.26l34.43,6.35ZM34,27.27l21.78-3.51-24.9,30ZM7.91,7,30.3,26,27.06,53.78Z" />
                            </svg>
                            {{ $t('usdttrc20') }}
                          </button>
                          <button @click="createOrder(plan.price.year.amount, plan.id, 'year', 'BEP20')"
                            class="btn btn-outline btn-warning btn-block btn-xs hover:btn-warning transition-all duration-200">
                            <svg class="w-3 h-3 mr-1 fill-current" xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 336.41 337.42">
                              <g>
                                <path d="M168.2.71l41.5,42.5L105.2,147.71l-41.5-41.5Z" />
                                <path d="M231.2,63.71l41.5,42.5L105.2,273.71l-41.5-41.5Z" />
                                <path d="M42.2,126.71l41.5,42.5-41.5,41.5L.7,169.21Z" />
                                <path d="M294.2,126.71l41.5,42.5L168.2,336.71l-41.5-41.5Z" />
                              </g>
                            </svg>
                            {{ $t('usdtbep20') }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 隐私协议和服务条款 -->
          <div class="bg-base-100 rounded-lg shadow-sm p-3 border border-base-300">
            <div class="flex items-center justify-center">
              <div class="form-control">
                <label class="label cursor-pointer flex items-center gap-2">
                  <input type="checkbox" id="agreePolicy" v-model="agreePolicy"
                    class="checkbox checkbox-primary checkbox-sm" />
                  <span class="label-text text-sm">
                    {{ $t('iAgreeWith') }}
                    <a href="https://tikmatrix.com/privacy-policy" target="_blank"
                      class="link link-primary font-medium hover:link-hover transition-all duration-200">
                      {{ $t('privacyPolicy') }}
                    </a>
                    {{ $t('and') }}
                    <a href="https://tikmatrix.com/terms-of-service" target="_blank"
                      class="link link-primary font-medium hover:link-hover transition-all duration-200">
                      {{ $t('termsOfService') }}
                    </a>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模态框背景 -->
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>

  <!-- 隐私协议提醒对话框 -->
  <dialog ref="agreePolicyDialog" class="modal">
    <div class="modal-box max-w-md bg-gradient-to-br from-warning/10 to-error/10 border border-warning/20">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4">✕</button>
      </form>
      <div class="text-center">
        <div class="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <font-awesome-icon icon="fas fa-exclamation-triangle" class="text-warning text-2xl" />
        </div>
        <h3 class="font-bold text-xl text-warning mb-4">{{ $t('tips') }}</h3>
        <p class="text-base-content/80 mb-6 leading-relaxed">{{ $t('pleaseAgree') }}</p>
        <div class="modal-action justify-center">
          <form method="dialog">
            <button class="btn btn-warning btn-wide hover:btn-warning-focus transition-all duration-200">
              <font-awesome-icon icon="fas fa-check" class="mr-2" />
              {{ $t('confirm') }}
            </button>
          </form>
        </div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button></button>
    </form>
  </dialog>

  <!-- 创建订单加载对话框 -->
  <dialog ref="createOrderLoadingDialog" class="modal">
    <div class="modal-box max-w-sm bg-gradient-to-br from-primary/10 to-secondary/10">
      <div class="text-center">
        <div class="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
        <h3 class="font-bold text-xl text-primary mb-4">{{ $t('creatingOrder') }}</h3>
        <p class="text-base-content/70 mb-6">{{ $t('pleaseWait') }}...</p>
        <div class="modal-action justify-center">
          <form method="dialog">
            <button class="btn btn-primary btn-wide hover:btn-primary-focus transition-all duration-200">
              {{ $t('confirm') }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </dialog>

  <!-- 管理订阅加载对话框 -->
  <dialog ref="manageSubscriptionLoadingDialog" class="modal">
    <div class="modal-box max-w-sm bg-gradient-to-br from-success/10 to-info/10">
      <div class="text-center">
        <div class="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="loading loading-dots loading-lg text-success"></span>
        </div>
        <h3 class="font-bold text-xl text-success mb-4">{{ $t('loadingManagingSubscription') }}</h3>
        <p class="text-base-content/70 mb-6">{{ $t('redirectingToStripe') }}...</p>
        <div class="modal-action justify-center">
          <form method="dialog">
            <button class="btn btn-success btn-wide hover:btn-success-focus transition-all duration-200">
              {{ $t('confirm') }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </dialog>

  <!-- License迁移对话框 -->
  <LicenseMigrationDialog ref="licenseMigrationDialog" :licenseInfo="license"
    @migrationCompleted="handleMigrationCompleted" />
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
import LicenseMigrationDialog from './LicenseMigrationDialog.vue'


confetti.Promise = Bluebird;

export default {
  name: 'BuyLicense',
  components: {
    CheckIcon,
    LicenseMigrationDialog
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
      agreePolicy: localStorage.getItem('agreePolicy') === 'true',
      currentLocale: localStorage.getItem('locale')?.replace(/"/g, '') || 'en',
      priceTableInfo: null
    };

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
    },

    cardStyle() {
      // 根据计划数量动态调整卡片内边距和字体大小
      const plansCount = this.priceTableInfo?.plans?.length || 4;
      if (plansCount <= 3) {
        return { padding: 'p-8', textSize: 'text-5xl' };
      } else if (plansCount === 4) {
        return { padding: 'p-6', textSize: 'text-4xl' };
      } else {
        return { padding: 'p-4', textSize: 'text-3xl' };
      }
    }
  },
  methods: {
    async getStripePriceTableInfo() {
      if (!this.license.mid) {
        return;
      }
      this.$service.get_stripe_price_table_info().then(async (res) => {
        if (res.code != 0) {
          console.log('get stripe price table info failed:', res.data)
          this.order = null
        } else {
          console.log('get stripe price table info:', res.data)
          this.priceTableInfo = JSON.parse(res.data)
        }
      }).catch(async (err) => {
        console.error('get_stripe_price_table_info error:', err)
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('getStripePriceTableInfoErrorMessage'),
          timeout: 2000
        });
      });

    },
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

    async createStripeCheckoutUrl(price_id, plan_interval) {
      if (!this.agreePolicy) {
        this.$refs.agreePolicyDialog.showModal();
        return;
      }
      this.$refs.createOrderLoadingDialog.showModal();
      this.$service.get_stripe_checkout_url({
        price_id: price_id,
        plan_interval: plan_interval
      }).then(async (res) => {
        console.log('createStripeOrder:', JSON.stringify(res))
        if (res.code != 0) {
          await this.$emiter('NOTIFY', {
            type: 'error',
            message: res.data,
            timeout: 2000
          });
        } else {
          console.log('get_stripe_checkout_url:', res.data)
          await open(JSON.parse(res.data))
        }
        this.$refs.createOrderLoadingDialog.close();
      }).catch(async (err) => {
        console.error('get_stripe_checkout_url error:', err)
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('getStripeCheckoutUrlErrorMessage'),
          timeout: 2000
        });
        this.$refs.createOrderLoadingDialog.close();
      });
    },
    async createOrder(price, plan_id, plan_interval, network) {
      this.$refs.createOrderLoadingDialog.showModal();
      // const finalPrice = Number(price * (1 - this.license.affiliate_discount / 100).toFixed(0));
      this.$service.create_order({
        network: network,
        amount: price,
        plan_id: plan_id,
        plan_interval: plan_interval
      }).then(async (res) => {
        console.log('create_order:', res.data)
        if (res.code != 0) {
          await message(res.data)
        } else {
          await this.showOrder(res.data)
        }
        this.$refs.createOrderLoadingDialog.close();
      }).catch(async (err) => {
        console.error('create_order error:', err)
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('createOrderErrorMessage'),
          timeout: 2000
        });
        this.$refs.createOrderLoadingDialog.close();
      });
    },

    async show() {
      await this.$emiter('LICENSE', { reload: true })
      this.currentLocale = localStorage.getItem('locale')?.replace(/"/g, '') || 'en';
      await this.getStripePriceTableInfo()
      this.$refs.buy_liscense_dialog.showModal()
      await this.getOrder()
      // this.$refs.createOrderLoadingDialog.showModal();

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
        this.$refs.manageSubscriptionLoadingDialog.showModal();
        // 获取管理订阅的URL
        this.$service.get_stripe_portal_url().then(async (res) => {
          if (res.code === 0) {
            const portalUrl = JSON.parse(res.data);
            console.log('portalUrl:', portalUrl)
            this.$refs.manageSubscriptionLoadingDialog.close();
            // 打开Stripe订阅管理页面
            await open(portalUrl);
          } else {
            this.$refs.manageSubscriptionLoadingDialog.close();
            await this.$emiter('NOTIFY', {
              type: 'error',
              message: res.data,
              timeout: 2000
            });
          }
        });
      } catch (error) {
        this.$refs.manageSubscriptionLoadingDialog.close();
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('manageSubscriptionErrorMessage'),
          timeout: 2000
        });
      }
    },

    showLicenseMigration() {
      // 检查是否有已激活的license
      if (this.license.leftdays <= 0 && !this.license.is_stripe_active) {
        this.$emiter('NOTIFY', {
          type: 'warning',
          message: this.$t('noActiveLicenseToMigrate'),
          timeout: 3000
        });
        return;
      }

      this.$refs.licenseMigrationDialog.show();
    },

    handleMigrationCompleted() {
      // 迁移完成后的处理
      console.log('License migration completed');
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

<style scoped>
/* 自定义动画和过渡效果 */
.modal-box {
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 悬停效果增强 */
.card:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* 渐变背景动画 */
.bg-gradient-to-br {
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

/* 按钮悬停效果 */
.btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* 输入框焦点效果 */
.input:focus {
  box-shadow: 0 0 0 3px rgba(var(--p), 0.2);
  transform: translateY(-1px);
}

/* 徽章动画 */
.badge {
  animation: pulse 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.8;
  }
}

/* QR码容器样式 */
.card img {
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.card img:hover {
  transform: scale(1.05);
}

/* 功能列表样式 */
.space-y-3>li {
  transition: transform 0.2s ease;
}

.space-y-3>li:hover {
  transform: translateX(4px);
}

/* 加载动画增强 */
.loading {
  animation: spin 1s linear infinite;
}

/* 倒计时数字样式 */
.countdown {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  letter-spacing: 0.1em;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-box {
    margin: 0.5rem;
    max-width: calc(100vw - 1rem);
    max-height: 95vh;
  }

  .grid {
    grid-template-columns: 1fr !important;
    gap: 0.75rem !important;
  }

  .card {
    max-width: 100%;
  }

  /* 移动端进一步压缩间距 */
  .px-4 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  .py-4 {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
}

@media (max-width: 1024px) {
  .grid[style*="repeat(4"] {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .card {
    backdrop-filter: blur(10px);
  }
}

/* 平滑滚动 */
.modal-box {
  scroll-behavior: smooth;
}

/* 高亮效果 */
.link:hover {
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;
}

/* 选中状态增强 */
.checkbox:checked {
  animation: checkboxCheck 0.3s ease-in-out;
}

@keyframes checkboxCheck {
  0% {
    transform: scale(0.8);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

/* Tab切换效果增强 */
.tabs-lifted>.tab {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0.5rem 0.5rem 0 0;
  border: 2px solid transparent;
  font-weight: 600;
  letter-spacing: 0.025em;
}

.tabs-lifted>.tab:checked {
  border-color: hsl(var(--b3));
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.tabs-lifted>.tab:not(:checked):hover {
  background-color: hsl(var(--b2));
  transform: translateY(-1px);
}

/* 增强tab内容区域效果 */
.tab-content {
  transition: all 0.3s ease-in-out;
  border-top: 0;
  margin-top: -1px;
}
</style>