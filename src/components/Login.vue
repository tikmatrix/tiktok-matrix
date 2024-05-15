<template>
  <div class="flex h-screen bg-gray-200 justify-center items-center w-full">
    <div class="bg-white p-8 rounded-lg shadow-lg">
      <h1 class="text-2xl font-bold mb-4">Need Auth</h1>

      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="password"> Password </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          v-model="password"
          type="password"
          placeholder="password"
          @keyup.enter="auth"
        />
        <label class="text-red-500 text-xs italic" v-if="error">{{ error }}</label>
      </div>
      <div class="flex items-center justify-between">
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="button"
          @click="auth"
        >
          Auth
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import * as util from '../utils'
export default {
  name: 'Login',
  data() {
    return {
      password: '',
      error: ''
    }
  },
  methods: {
    auth() {
      if (!this.password) {
        return
      }
      this.$service
        .auth({
          password: this.password
        })
        .then(res => {
          if (res.data === 'success') {
            util.setCookie('password', this.password)
            //refresh
            window.location.reload()
          } else {
            this.error = res.data
          }
        })
    }
  }
}
</script>
