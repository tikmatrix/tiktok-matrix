<template>
  <div v-if="show" class="bg-base-100 fixed z-10 inset-0" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 text-center">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="close" aria-hidden="true"></div>
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['show'],
  methods: {
    close() {
      this.$emit('close')
    }
  }
}
</script>
