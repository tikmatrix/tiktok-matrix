<template>
  <div class="bg-base-100 flex flex-col items-start p-4">
    <div class="grid grid-cols-3 w-full items-center gap-2 mb-2">
      <label class="font-bold text-right col-span-1">{{ $t('artistName') }}</label>
      <input class="border-2 border-gray-300 p-2 rounded col-span-2" v-model="music.artist_name" />
    </div>

    <div class="grid grid-cols-3 w-full items-center gap-2 mb-2">
      <label class="font-bold text-right col-span-1">{{ $t('releaseName') }}</label>
      <input class="border-2 border-gray-300 p-2 rounded col-span-2" v-model="music.release_name" />
    </div>
    <!-- other fields... -->
    <div class="mt-32 w-full flex justify-end">
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" @click="add">
        {{ $t('add') }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      music: {
        release_name: '',
        artist_name: ''
      }
    }
  },
  emits: ['add'],
  methods: {
    add() {
      this.$emit('add', this.music)
    }
  },
  mounted() {}
}
</script>
