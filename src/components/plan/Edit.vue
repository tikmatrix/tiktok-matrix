<template>
  <dialog ref="edit_dialog" class="modal">
    <div class="modal-box">
      <div class="bg-base-100 flex flex-col items-start p-4 min-h-96">
        <div class="flex w-full items-center gap-2 mb-2">
          <label class="font-bold w-40">{{ $t('username') }}:</label>
          <input class="input validator" type="input" required placeholder="Username" v-model="myplan.username" />
        </div>
        <span class="font-bold w-full">{{ $t('targetUsernamesPath') }}: </span>
        <div class="flex items-center flex-row gap-2  w-full mt-2">
          <input type="text" placeholder="example: C:/Users/Administrator/Desktop/usernames.txt"
            class="input input-md grow input-bordered" v-model="myplan.target_username_path" />
          <button class="btn btn-md btn-info ml-2" @click="selectTargetUsernames">{{ $t('select') }}</button>
        </div>
        <div class="flex w-full items-center gap-2 mb-2">
          <label class="font-bold w-40">{{ $t('startTime') }}:</label>
          <div class="flex items-center">
            <input type="time" class="border-2 border-gray-300 p-2 rounded" v-model="myplan.start_time" />
          </div>
        </div>
        <div class="flex w-full items-center gap-2 mb-2">
          <label class="font-bold w-40">{{ $t('followCount') }}:</label>
          <div class="flex items-center">
            <input type="number" class="border-2 border-gray-300 p-2 rounded" v-model="myplan.follow_count" />
          </div>
        </div>
        <div class="flex w-full items-center gap-2 mb-2">
          <label class="font-bold w-40">{{ $t('unfollowDelay') }}:</label>
          <div class="flex items-center">
            <input type="number" class="border-2 border-gray-300 p-2 rounded" v-model="myplan.unfollow_delay" /> {{
              $t('days') }}
          </div>
        </div>
        <div class="flex w-full items-center gap-2 mb-2">
          <label class="font-bold w-40">{{ $t('unfollowCount') }}:</label>
          <div class="flex items-center">
            <input type="number" class="border-2 border-gray-300 p-2 rounded" v-model="myplan.unfollow_count" />
          </div>
        </div>
        <!-- other fields... -->
        <div class="mt-4 w-full flex justify-end">
          <button
            class="bg-primary hover:bg-blue-700 text-primary-content font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            @click="save">
            {{ $t('save') }}
          </button>
        </div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script>
import { open } from '@tauri-apps/api/dialog';
export default {
  data() {
    return {
      myplan: {

      },
    }
  },
  methods: {
    // 选择文件并获取路径
    async selectTargetUsernames() {
      const filePath = await open({
        multiple: false, // 是否允许多选文件
        directory: false, // 是否选择目录
        filters: [ // 文件过滤器
          { name: 'Text Files', extensions: ['txt'] },
        ]
      });

      this.myplan.target_username_path = filePath
    },

    save() {
      console.log('Saving plan:', this.myplan);
      if (this.myplan.id) {
        this.$emit('update', this.myplan)
      } else {
        this.$emit('add', this.myplan)
      }
    },
    show(plan) {
      if (plan) {
        this.myplan = { ...plan };
      } else {
        this.myplan = {
          username: '',
          target_username_path: '',
          start_time: '00:00',
          follow_count: 100,
          unfollow_delay: 3,
          unfollow_count: 100
        };
      }
      console.log('Showing edit dialog with plan:', this.myplan);
      this.$refs.edit_dialog.showModal();
    },
    close() {
      this.$refs.edit_dialog.close();
    }

  },
  mounted() {
  }
}
</script>
