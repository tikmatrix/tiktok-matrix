<template>
  <div ref="countup"></div>
</template>

<script>
import { CountUp } from 'countup.js'
export default {
  name: 'app',
  components: {},
  props: {
    end: {
      type: Number,
      default: 0
    },
    options: {
      type: Object,
      default: () => {
        return {
          duration: 3
        }
      }
    }
  },
  watch: {
    end: function (newVal) {
      this.countUp.update(newVal)
    }
  },
  data() {
    return {
      countUp: null
    }
  },
  mounted() {
    this.countUp = new CountUp(this.$refs.countup, this.end, this.options)
    this.countUp.start()
  }
}
</script>
