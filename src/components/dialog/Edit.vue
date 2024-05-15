<template>
  <div class="bg-base-100 flex flex-col items-start p-4 min-h-96">
    <div class="grid grid-cols-3 w-full items-center gap-2 mb-2">
      <label class="font-bold text-right col-span-1">{{ $t('conditions') }}:</label>
      <input class="border-2 border-gray-300 p-2 rounded col-span-2" v-model="mywatcher.conditions" />
    </div>
    <div class="grid grid-cols-3 w-full items-center gap-2 mb-2">
      <label class="font-bold text-right col-span-1">{{ $t('action') }}:</label>
      <div class="col-span-2 flex items-center gap-4">
        <div class="flex items-center">
          <input type="radio" id="click" value="click" v-model="mywatcher.action" class="form-radio text-blue-500 h-4 w-4" />
          <label for="click" class="ml-2">{{ $t('click') }}</label>
        </div>
        <div class="flex items-center">
          <input type="radio" id="back" value="back" v-model="mywatcher.action" class="form-radio text-blue-500 h-4 w-4" />
          <label for="back" class="ml-2">{{ $t('back') }}</label>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 w-full items-center gap-2 mb-2">
      <label class="font-bold text-right col-span-1">{{ $t('status') }}:</label>
      <input type="checkbox" class="toggle toggle-accent" v-model="mywatcher.status" true-value="1" false-value="0" />
    </div>

    <!-- other fields... -->
    <div class="mt-4 w-full flex justify-end">
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" @click="update">
        {{ $t('update') }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    watcher: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      mywatcher: {}
    }
  },
  methods: {
    update() {
      this.$emit('update', this.mywatcher)
    }
  },
  mounted() {
    this.mywatcher = this.watcher
  }
}
</script>
