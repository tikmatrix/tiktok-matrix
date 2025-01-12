<template>
  <div class="m-4 flex max-h-60">
    <template v-if="material.name.endsWith('.mp4') || material.name.endsWith('.webm')">
      <video :src="`${apiUrl}/${material.name}`" class="rounded-lg" controls></video>
    </template>
    <template v-else>
      <img :src="`${apiUrl}/${material.name}`" class="rounded-lg" />
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
    },
    apiUrl: {
      type: String,
      default: ''
    }
  },
  unmounted() {
    console.log('unmounted detail', this.material)
  }
}
</script>
