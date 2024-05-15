<template>
    <div class="flex flex-row justify-between pl-4 pr-4">
      <button class="btn bg-transparent hover:bg-transparent border-0 text-black-500 hover:text-blue-700 p-0 block"
      @click="$emit('send_keycode','task')">
        <font-awesome-icon icon="fa fa-window-restore" class="h-4 w-4 text-blue-500" />
        <span class="text-xs block font-normal">{{ $t('task') }}</span>
      </button>
      <button class="btn bg-transparent hover:bg-transparent border-0 text-black-500 hover:text-blue-700 p-0 block"
      @click="$emit('send_keycode','home')">
        <font-awesome-icon icon="fa-solid fa-home" class="h-4 w-4 text-blue-500" />
        <span class="text-xs block font-normal">{{ $t('home') }}</span>
      </button>
      <button class="btn bg-transparent hover:bg-transparent border-0 text-black-500 hover:text-blue-700 p-0 block"
      @click="$emit('send_keycode','back')">
        <font-awesome-icon icon="fa fa-reply" class="h-4 w-4 text-blue-500" />
        <span class="text-xs block font-normal">{{ $t('back') }}</span>
      </button>
     
      
    </div>
    
</template>
<script>
export default {
  name: 'BottomBar',
  data() {
    return {
    }
  },
}
</script>
