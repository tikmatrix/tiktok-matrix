<template>
<div class="toast toast-top toast-center z-50" v-if="showToast">
    <div class="alert alert-success">
      <span>{{ text }}</span>
    </div>
</div>
</template>

<script>
export default {
  name: 'toast',
  
  data() {
    return {
      showToast: false,
      text: ''
    }
  },
  mounted() {
    this.$emitter.on('showToast', (text) => {
      this.text = text
      this.showToast = true
      setTimeout(() => {
        this.showToast = false
      }, 3000)
    });
  }
}
</script>