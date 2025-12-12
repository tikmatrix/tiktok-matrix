<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box bg-base-300 max-w-2xl">
      <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-desktop" class="h-5 w-5 text-primary" />
        {{ $t('screenCastSettings') }}
      </h3>
      <p class="text-sm text-base-content/70 mb-4">{{ $t('screenCastSettingsDesc') }}</p>
      
      <div class="space-y-6">
        <!-- Screen Resolution Settings -->
        <div class="bg-base-200/70 rounded-xl p-4 border border-base-300/60">
          <div class="flex items-center gap-2 mb-3">
            <font-awesome-icon icon="fa-solid fa-tv" class="h-4 w-4 text-primary" />
            <h4 class="font-semibold">{{ $t('adjustResolution') }}</h4>
          </div>
          
          <div class="flex flex-col gap-4">
            <div class="flex flex-wrap gap-2">
              <button class="btn btn-md" :class="{ 'btn-active btn-primary': resolution === 256 }"
                @click="setResolution(256)">
                {{ $t('lowResolution') }} (256px)
              </button>
              <button class="btn btn-md" :class="{ 'btn-active btn-primary': resolution === 512 }"
                @click="setResolution(512)">
                {{ $t('highResolution') }} (512px)
              </button>
              <button class="btn btn-md" :class="{ 'btn-active btn-primary': resolution === 720 }"
                @click="setResolution(720)">
                {{ $t('ultraResolution') }} (720px)
              </button>
              <button class="btn btn-md" :class="{ 'btn-active btn-primary': resolution === 1080 }"
                @click="setResolution(1080)">
                {{ $t('fullHD') }} (1080px)
              </button>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('customResolution') }}</span>
              </label>
              <div class="flex items-center gap-2">
                <input type="number" v-model="customResolution" min="128" max="1920" step="16"
                  class="input input-bordered input-md w-24" />
                <span>px</span>
                <button @click="setResolution(Number(customResolution))" class="btn btn-md btn-primary"
                  :disabled="!isValidResolution">
                  {{ $t('apply') }}
                </button>
              </div>
            </div>

            <div class="text-sm text-base-content/70">
              <p>{{ $t('resolutionNote') }}</p>
            </div>
          </div>
        </div>

        <!-- Screen Size Control -->
        <div class="bg-base-200/70 rounded-xl p-4 border border-base-300/60">
          <div class="flex items-center gap-2 mb-3">
            <font-awesome-icon icon="fa-solid fa-expand-arrows-alt" class="h-4 w-4 text-primary" />
            <h4 class="font-semibold">{{ $t('screenSize') }}</h4>
          </div>
          
          <div class="flex items-center gap-3">
            <button class="btn btn-md btn-ghost btn-circle" :title="$t('screenScaledNote')"
              @click="handleScale('minus')">
              <font-awesome-icon icon="fa-solid fa-minus" class="h-3 w-3" />
            </button>
            <div
              class="px-4 py-2 text-md font-semibold rounded-lg bg-base-100 border border-base-300 text-base-content min-w-[80px] text-center">
              {{ screenSizeDisplay }}
            </div>
            <button class="btn btn-md btn-ghost btn-circle" :title="$t('screenScaledNote')"
              @click="handleScale('plus')">
              <font-awesome-icon icon="fa-solid fa-plus" class="h-3 w-3" />
            </button>
            <div class="tooltip tooltip-bottom" :data-tip="$t('screenScaledNote')">
              <font-awesome-icon icon="fa-solid fa-circle-info" class="h-4 w-4 text-info" />
            </div>
          </div>
        </div>

        <!-- Hibernation Casting -->
        <div class="bg-base-200/70 rounded-xl p-4 border border-base-300/60">
          <div class="flex items-center gap-2 mb-3">
            <font-awesome-icon icon="fa-solid fa-power-off" class="h-4 w-4 text-primary" />
            <h4 class="font-semibold">{{ $t('screenOff') }}</h4>
          </div>
          
          <button class="btn btn-md btn-primary" @click="enableScreenOff">
            <font-awesome-icon icon="fa-solid fa-power-off" class="h-3 w-3" />
            {{ $t('screenOff') }}
          </button>
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
      resolution: 512,
      customResolution: 512,
    }
  },
  computed: {
    isValidResolution() {
      const res = Number(this.customResolution);
      return !isNaN(res) && res >= 128 && res <= 1920;
    },
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
    async setResolution(value) {
      this.resolution = value;
      this.customResolution = value;
      await setItem('screenResolution', value);
      await this.$emiter('screenResolution', { resolution: value });
      await this.$emiter('NOTIFY', {
        type: 'success',
        message: this.$t('resolutionUpdated') || 'Resolution updated',
        timeout: 2000
      });
    },
    async handleScale(action) {
      await this.$emiter('screenScaleAction', { action });
    },
    async enableScreenOff() {
      await this.$emiter('send_screen_mode', 'off');
      await this.$emiter('NOTIFY', {
        type: 'success',
        message: this.$t('commandSendSuccess'),
        timeout: 2000
      });
    }
  },
  async mounted() {
    const storedResolution = await getItem('screenResolution');
    if (storedResolution) {
      const parsed = Number(storedResolution);
      if (!Number.isNaN(parsed)) {
        this.resolution = parsed;
        this.customResolution = parsed;
      }
    }
  }
}
</script>
