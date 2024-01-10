<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import Greet from "./components/Greet.vue";
</script>

<template>
  <div class="container">
    <h1>Welcome to TikTok Matrix System!</h1>

    <div class="row">
      <a href="http://127.0.0.1:8090" target="_blank">
        <img src="/tiktok.svg" class="logo vite" alt="Vite logo" />
      </a>

    </div>

    <p>Click on the TikTok logo to open TikTok Matrix System.</p>



    <Greet />
  </div>
</template>

<style scoped>
.logo.vite:hover {
  filter: drop-shadow(0 0 2em #747bff);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #249b73);
}
</style>
