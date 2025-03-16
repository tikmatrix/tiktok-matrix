<template>
    <div class="flex flex-col items-start p-12">
      <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
        <span class="font-bold">{{ $t('maxViews') }}: </span>
        <input class="input ring input-sm ml-2" type="number" v-model="maxViews"
                    :placeholder="$t('maxViews')" />
      </div>
      <div role="alert" class="alert col-span-5 mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    class="stroke-info shrink-0 w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>{{ $t('maxViewsTips') }}</span>
            </div>
  
      <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
        <div class="flex flex-1"></div>
        <button class="btn btn-success" @click="deletePost">{{ $t('startScript') }}</button>
      </div>
    </div>
  </template>
  <script>
  export default {
    name: 'DeletePost',
    data() {
      return {
        maxViews: 0,
      }
    },
    methods: {
        async deletePost() {
            await this.$emiter('run_now_by_account', { name: 'delete_post', args: { max_views: this.maxViews } })
        },
    },
    async mounted() {
    }
  }
  </script>
  