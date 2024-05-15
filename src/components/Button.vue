<template>
  <button :class="`btn btn-sm ${color} ml-2 mb-1 mt-1`" :disabled="disabled || loading" @click="handleClick">
    <span class="loading loading-spinner" v-if="loading"></span>
    <font-awesome-icon v-if="icon && !loading" :icon="icon" class="h-4 w-4" />
    {{ $t(`${label}`) }}
  </button>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: 'btn-success'
    },
    loadingTime: {
      type: Number,
      default: 1000 // default to 1 seconds
    },
    showLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isLoading: false
    }
  },
  computed: {
    loading() {
      return this.showLoading || this.isLoading
    }
  },

  methods: {
    handleClick() {
      this.isLoading = true
      setTimeout(() => {
        this.isLoading = false
      }, this.loadingTime)
    }
  }
}
</script>
