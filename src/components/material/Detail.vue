<template>
  <div class="m-4 flex">
    <template v-if="material.name.endsWith('.mp4') || material.name.endsWith('.webm')">
      <video :src="`${$config.apiUrl}/${material.name}`" class="max-w-[800px] max-h-[800px] rounded-lg"
        controls></video>
    </template>
    <template v-else>
      <img :src="`${$config.apiUrl}/${material.name}`" class="max-w-[800px] max-h-[800px] rounded-lg" />
    </template>
  </div>
</template>
<script>
export default {
  props: {
    material: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  unmounted() {
    console.log('unmounted detail', this.material)
  }
}
</script>
