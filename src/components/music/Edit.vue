<template>
  <div class="bg-base-100 flex flex-col items-start p-4">
    <div class="grid grid-cols-3 w-full items-center gap-2 mb-2">
      <label class="font-bold text-right col-span-1">{{ $t('artistName') }}</label>
      <input class="border-2 border-gray-300 p-2 rounded col-span-2" v-model="mymusic.artist_name" />
    </div>
    <div class="grid grid-cols-3 w-full items-center gap-2 mb-2">
      <label class="font-bold text-right col-span-1">{{ $t('releaseName') }}</label>
      <input class="border-2 border-gray-300 p-2 rounded col-span-2" v-model="mymusic.release_name" />
    </div>
    <!-- other fields... -->
    <div class="mt-32 w-full flex justify-end">
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" @click="update">
        {{ $t('update') }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    music: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      mymusic: {}
    }
  },
  emits: ['update'],
  methods: {
    update() {
      this.$emit('update', this.mymusic)
    }
  },
  mounted() {
    this.mymusic = this.music
  }
}
</script>
