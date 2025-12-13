<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box bg-base-300 max-w-3xl">
      <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-desktop" class="h-5 w-5 text-primary" />
        {{ $t('screenCastSettings') }}
      </h3>
      <p class="text-sm text-base-content/70 mb-4">{{ $t('screenCastSettingsDesc') }}</p>

      <div class="space-y-6">
        <!-- Screen Resolution Settings: Small and Big -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Small Screen Resolution -->
          <div class="bg-base-200/70 rounded-xl p-4 border border-base-300/60">
            <div class="flex items-center gap-2 mb-3">
              <font-awesome-icon icon="fa-solid fa-tv" class="h-4 w-4 text-primary" />
              <h4 class="font-semibold">{{ $t('smallScreenResolution') }}</h4>
            </div>

            <div class="flex flex-col gap-4">
              <div class="grid grid-cols-2 gap-2">
                <button class="btn btn-md" :class="{ 'btn-active btn-primary': resolutionSmall === 240 }"
                  @click="setSmallResolution(240)">
                  {{ $t('veryLowResolution') }} (240)
                </button>
                <button class="btn btn-md" :class="{ 'btn-active btn-primary': resolutionSmall === 360 }"
                  @click="setSmallResolution(360)">
                  {{ $t('ultraLowResolution') }} (360)
                </button>
                <button class="btn btn-md" :class="{ 'btn-active btn-primary': resolutionSmall === 480 }"
                  @click="setSmallResolution(480)">
                  {{ $t('lowResolution') }} (480)
                </button>
                <button class="btn btn-md" :class="{ 'btn-active btn-primary': resolutionSmall === 720 }"
                  @click="setSmallResolution(720)">
                  {{ $t('standardResolution') }} (720)
                </button>
              </div>

              <div class="text-sm text-base-content/70">
                <p>{{ $t('resolutionNote') }}</p>
              </div>
            </div>
          </div>

          <!-- Big Screen Resolution -->
          <div class="bg-base-200/70 rounded-xl p-4 border border-base-300/60">
            <div class="flex items-center gap-2 mb-3">
              <font-awesome-icon icon="fa-solid fa-desktop" class="h-4 w-4 text-primary" />
              <h4 class="font-semibold">{{ $t('bigScreenResolution') }}</h4>
            </div>

            <div class="flex flex-col gap-4">
              <div class="grid grid-cols-2 gap-2">
                <button class="btn btn-md" :class="{ 'btn-active btn-primary': resolutionBig === 360 }"
                  @click="setBigResolution(360)">
                  {{ $t('ultraLowResolution') }} (360)
                </button>
                <button class="btn btn-md" :class="{ 'btn-active btn-primary': resolutionBig === 480 }"
                  @click="setBigResolution(480)">
                  {{ $t('lowResolution') }} (480)
                </button>
                <button class="btn btn-md" :class="{ 'btn-active btn-primary': resolutionBig === 720 }"
                  @click="setBigResolution(720)">
                  {{ $t('standardResolution') }} (720)
                </button>
                <button class="btn btn-md" :class="{ 'btn-active btn-primary': resolutionBig === 1080 }"
                  @click="setBigResolution(1080)">
                  {{ $t('highResolution') }} (1080)
                </button>
              </div>

              <div class="text-sm text-base-content/70">
                <p>{{ $t('resolutionNoteBig') || $t('resolutionNote') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Screen Size Control -->
        <div class="bg-base-200/70 rounded-xl p-4 border border-base-300/60">
          <div class="flex items-center gap-2 mb-3">
            <font-awesome-icon icon="fa-solid fa-up-down-left-right" class="h-4 w-4 text-primary" />
            <h4 class="font-semibold">{{ $t('screenSize') }}</h4>
          </div>

          <div class="flex items-center gap-3">
            <button class="btn btn-md btn-ghost btn-circle" :title="$t('screenScaledNote')"
              @click="handleScale('minus')">
              <font-awesome-icon icon="fa-solid fa-minus" class="h-3 w-3" />
            </button>
            <div
              class="px-4 py-2 text-md font-semibold rounded-lg bg-base-100 border border-base-300 text-base-content min-w-20 text-center">
              {{ screenSizeDisplay }}
            </div>
            <button class="btn btn-md btn-ghost btn-circle" :title="$t('screenScaledNote')"
              @click="handleScale('plus')">
              <font-awesome-icon icon="fa-solid fa-plus" class="h-3 w-3" />
            </button>
            <div class="text-sm text-base-content/70 ml-2">
              {{ $t('screenScaledNote') }}
            </div>
          </div>
        </div>

        <!-- Big screen mode -->
        <div class="bg-base-200/70 rounded-xl p-4 border border-base-300/60">
          <div class="flex items-center gap-2 mb-3">
            <font-awesome-icon icon="fa-solid fa-border-all" class="h-4 w-4 text-primary" />
            <h4 class="font-semibold">{{ $t('bigScreen') }}</h4>
          </div>

          <div class="flex items-center gap-3">
            <label class="flex items-center cursor-pointer">
              <input type="radio" value="standard" v-model="bigScreenMode" class="radio radio-primary radio-md mr-2"
                @change="setBigScreenMode('standard')">
              <span class="text-md">{{ $t('standardWindow') }}</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input type="radio" value="docked" v-model="bigScreenMode" class="radio radio-primary radio-md mr-2"
                @change="setBigScreenMode('docked')">
              <span class="text-md">{{ $t('dockedWindow') }}</span>
            </label>
            <div class="text-sm text-base-content/70 ml-2">
              {{ $t('bigScreenNote') || $t('bigScreen') }}
            </div>
          </div>
        </div>

        <!-- Hibernation Casting -->
        <div class="bg-base-200/70 rounded-xl p-4 border border-base-300/60">
          <div class="flex items-center gap-2 mb-3">
            <font-awesome-icon icon="fa-solid fa-power-off" class="h-4 w-4 text-primary" />
            <h4 class="font-semibold">{{ $t('hibernateCasting') }}</h4>
          </div>

          <div class="flex items-center gap-4">
            <label class="flex items-center gap-3">
              <input type="checkbox" class="toggle toggle-md" v-model="hibernateCasting" @change="toggleHibernation" />
              <span class="font-medium">{{ hibernateCasting ? $t('enabled') : $t('disabled') }}</span>
            </label>
            <div class="text-sm text-base-content/70">{{ $t('hibernateCastingNote') }}</div>
          </div>
        </div>
      </div>

      <div class="modal-action mt-6">
        <button class="btn btn-md" @click="close">{{ $t('close') }}</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="close">close</button>
    </form>
  </dialog>
</template>

<script>
import { getItem, setItem } from '@/utils/storage.js';

export default {
  name: 'ScreenCastSettings',
  props: {
    gridCardHeight: {
      type: Number,
      default: 150
    }
  },
  data() {
    return {
      resolutionSmall: 480,
      resolutionBig: 1080,
      hibernateCasting: false,
      bigScreenMode: 'standard',
    }
  },
  computed: {
    screenSizeDisplay() {
      return Math.round(this.gridCardHeight || 0);
    }
  },
  methods: {
    show() {
      this.$refs.dialog.showModal();
    },
    close() {
      this.$refs.dialog.close();
    },
    // Small screen resolution setter 
    async setSmallResolution(value) {
      this.resolutionSmall = value;
      await setItem('screenResolutionSmall', value);
      await this.$emiter('screenResolutionSmall', { resolution: value });
      await this.$emiter('NOTIFY', {
        type: 'success',
        message: this.$t('resolutionUpdated') || 'Resolution updated',
        timeout: 2000
      });
    },

    // Big screen resolution setter — emits a new event
    async setBigResolution(value) {
      this.resolutionBig = value;
      await setItem('screenResolutionBig', value);
      await this.$emiter('screenResolutionBig', { resolution: value });
      await this.$emiter('NOTIFY', {
        type: 'success',
        message: this.$t('resolutionUpdated') || 'Resolution updated',
        timeout: 2000
      });
    },
    async toggleHibernation() {
      try {
        await setItem('hibernateCasting', this.hibernateCasting ? 'true' : 'false');
        // emit a local event so other parts can react if needed
        await this.$emiter('hibernateCastingChanged', { enabled: this.hibernateCasting });
        await this.$emiter('NOTIFY', {
          type: 'success',
          message: this.hibernateCasting ? this.$t('hibernateCastingEnabled') : this.$t('hibernateCastingDisabled'),
          timeout: 2000,
        });
      } catch (err) {
        console.error('Failed to save hibernate setting', err);
      }
    },
    // Big screen mode setter
    async setBigScreenMode(value) {
      try {
        this.bigScreenMode = value;
        await setItem('bigScreen', value);
        await this.$emiter('bigScreen', { mode: value });
        await this.$emiter('NOTIFY', {
          type: 'success',
          message: this.$t('bigScreenUpdated') || 'Big screen mode updated',
          timeout: 2000
        });
      } catch (err) {
        console.error('Failed to set bigScreen mode', err);
      }
    },
    async handleScale(action) {
      await this.$emiter('screenScaleAction', { action });
    },

  },
  async mounted() {
    try {
      const storedSmall = await getItem('screenResolutionSmall');
      if (storedSmall !== null && storedSmall !== undefined) {
        const parsedSmall = Number(storedSmall);
        if (!Number.isNaN(parsedSmall)) {
          this.resolutionSmall = parsedSmall;
        }
      }
    } catch (err) {
      this.resolutionSmall = 480;
    }

    // Load big-screen resolution (default keep 1080 if not set)
    try {
      const storedBig = await getItem('screenResolutionBig');
      if (storedBig !== null && storedBig !== undefined) {
        const parsedBig = Number(storedBig);
        if (!Number.isNaN(parsedBig)) {
          this.resolutionBig = parsedBig;
        }
      }
    } catch (err) {
      this.resolutionBig = 1080;
    }
    // load hibernation casting setting
    try {
      const storedHibernate = await getItem('hibernateCasting');
      if (storedHibernate !== null && storedHibernate !== undefined) {
        this.hibernateCasting = String(storedHibernate) === 'true' || storedHibernate === true;
      }
    } catch (err) {
      console.warn('Failed to load hibernateCasting setting', err);
    }
    // load big screen mode setting
    try {
      const storedBig = await getItem('bigScreen');
      if (storedBig !== null && storedBig !== undefined) {
        const parsed = String(storedBig).replace(/"/g, '')
        if (parsed === 'standard' || parsed === 'docked') {
          this.bigScreenMode = parsed
        }
      }
    } catch (err) {
      console.warn('Failed to load bigScreen setting', err);
    }
  }
}
</script>
