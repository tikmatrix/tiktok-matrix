<template>
  <div class="container mx-auto">
    <AppBar />

    <Body />
  </div>
</template>
<script>
import AppBar from './components/AppBar.vue'
import Body from './components/Body.vue'
export default {
  name: 'app',
  components: {
    AppBar,
    Body
  },
  data() {
    return {
    }
  },
  methods: {
  },


}
</script>
