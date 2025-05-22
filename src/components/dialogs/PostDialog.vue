<template>
  <!-- 添加提示信息 -->
  <div class="alert alert-warning mb-4 shadow-lg">
    <div>
      <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
      <span>{{ $t('postWarning') }}</span>
    </div>
  </div>
  <div class="bg-base-100 flex flex-col items-start p-4">
    <div class="flex w-full items-center gap-2 mb-2">
      <label class="font-bold w-40">{{ $t('taskArgs') }}:</label>
      <div class="flex items-center gap-4">
        <label class="flex items-center gap-1 cursor-pointer">
          <input type="radio" name="settingsOption" value="group" class="radio radio-sm radio-primary"
            v-model="settings" />
          <span>{{ $t('group') }}</span>
        </label>
        <label class="flex items-center gap-1 cursor-pointer">
          <input type="radio" name="settingsOption" value="custom" class="radio radio-sm radio-primary"
            v-model="settings" />
          <span>{{ $t('custom') }}</span>
        </label>
      </div>
    </div>
    <template v-if="settings === 'custom'">
      <div class="flex w-full items-center gap-2 mb-2">
        <label class="font-bold w-40">{{ $t('startTime') }}:</label>
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="startOption" value="now" class="radio radio-sm radio-primary"
              v-model="startOption" />
            <span>{{ $t('startNow') }}</span>
          </label>
          <label class="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="startOption" value="scheduled" class="radio radio-sm radio-primary"
              v-model="startOption" />
            <span>{{ $t('scheduleTime') }}</span>
          </label>
        </div>
        <div v-if="startOption === 'scheduled'" class="flex items-center">
          <input type="time" class="border-2 border-gray-300 p-2 rounded" v-model="scheduledTime" />
        </div>

      </div>
      <div>

        <div class="flex w-full items-center gap-2 mb-2">
          <label class="font-bold w-40">{{ $t('contentType') }}:</label>
          <div class="flex items-center gap-4">
            <div class="flex items-center">
              <input type="radio" id="video" value="0" v-model="content_type" class="form-radio text-primary h-4 w-4">
              <label for="video" class="ml-2">{{ $t('video') }}</label>
            </div>
            <div class="flex items-center">
              <input type="radio" id="image" value="1" v-model="content_type" class="form-radio text-primary h-4 w-4">
              <label for="image" class="ml-2">{{ $t('image') }}</label>
            </div>
            <div class="flex items-center" v-if="content_type == 1">
              <input class="border-2 border-gray-300 p-2 rounded col-span-1 input-md" v-model="image_count"
                :placeholder="$t('imageCount')" type="number" />
            </div>
          </div>
        </div>
        <!-- add sound start -->
        <div class="flex w-full items-center gap-2 mb-2">
          <label class="font-bold w-40">{{ $t('addSound') }}:</label>
          <div class="flex items-center gap-4">
            <div class="flex items-center">
              <input type="radio" id="default" value="-1" v-model="add_sound" class="form-radio text-primary h-4 w-4">
              <label for="default" class="ml-2">{{ $t('default') }}</label>
            </div>
            <div class="flex items-center">
              <input type="radio" id="disable" value="0" v-model="add_sound" class="form-radio text-primary h-4 w-4">
              <label for="disable" class="ml-2">{{ $t('disable') }}</label>
            </div>
            <div class="flex items-center">
              <input type="radio" id="enable" value="1" v-model="add_sound" class="form-radio text-primary h-4 w-4">
              <label for="enable" class="ml-2">{{ $t('enable') }}</label>
            </div>
            <!-- add sound tips -->

            <div role="alert" class="alert">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                class="stroke-info shrink-0 w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>{{ $t('addSoundTips') }}</span>
            </div>
          </div>
        </div>
        <div class="flex w-full items-center gap-2 mb-4">
          <label class="font-bold w-40">{{ $t('loadingTime') }}:</label>
          <VueSlider class="ml-8" v-model="sound_wait_time" :width="500" :min="5" :max="30" :step="1"
            :marks="{ 5: '5' + $t('second'), 10: '10' + $t('second'), 15: '15' + $t('second'), 20: '20' + $t('second'), 25: '25' + $t('second'), 30: '30' + $t('second') }" />
        </div>
        <div class="flex w-full items-center gap-2 mb-4" v-if="add_sound == 1">
          <label class="font-bold w-40">{{ $t('soundVolume') }}:</label>
          <div class="flex items-center">
            <label class="ml-2 mr-2">{{ $t('originSound') }}: </label>
            <VueSlider v-model="origin_sound_volume" :width="100" :min="0" :max="100" :step="25"
              :marks="{ 0: '0', 100: '100' }" />
            <label class="ml-8 mr-2">{{ $t('addSound') }}: </label>
            <VueSlider v-model="add_sound_volume" :width="100" :min="0" :max="100" :step="25"
              :marks="{ 0: '0', 100: '100' }" />
          </div>
        </div>
        <!-- add sound end-->
        <div class="flex w-full items-center gap-2 mb-2">
          <label class="font-bold w-40">{{ $t('addProductLink') }}:</label>
          <div class="flex items-center gap-4">
            <div class="flex items-center">
              <input type="radio" id="disable" value="0" v-model="add_product_link"
                class="form-radio text-primary h-4 w-4">
              <label for="disable" class="ml-2">{{ $t('disable') }}</label>
            </div>
            <div class="flex items-center">
              <input type="radio" id="enable" value="1" v-model="add_product_link"
                class="form-radio text-primary h-4 w-4">
              <label for="enable" class="ml-2">{{ $t('enable') }}</label>
            </div>

            <div role="alert" class="alert">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                class="stroke-info shrink-0 w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>{{ $t('addProductLinkTips') }}</span>
            </div>
          </div>
        </div>
        <div class="flex w-full items-center gap-2 mb-2">
          <label class="font-bold w-40">{{ $t('captions') }}:</label>
          <textarea class="textarea textarea-success w-full max-w-xl col-span-3 h-32 leading-tight"
            :placeholder="$t('captionsTips')" autocomplete="off" v-model="captions"> </textarea>
        </div>
        <!-- 添加提示信息 -->
        <div role="alert" class="alert">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ $t('captionsTips') }}</span>
        </div>
        <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
          <span class="font-bold w-40">{{ $t('materials') }}: </span>
          <div class="relative grow">
            <!-- 自定义标签显示区域 -->
            <div
              class="min-h-[42px] w-full border border-gray-300 rounded-lg px-2 py-1 cursor-pointer flex flex-wrap items-center gap-1"
              @click.stop="toggleTagsDropdown">
              <template v-if="selectedTags.length > 0">
                <div v-for="(tag, index) in selectedTags" :key="index"
                  class="badge badge-info gap-1 px-2 py-3 text-white">
                  <span>{{ tag }}</span>
                  <span class="cursor-pointer hover:text-error" @click.stop="removeTag(index)">×</span>
                </div>
              </template>
              <span v-else class="text-gray-400 text-sm">{{ $t('clickToSelectTags') }}</span>
            </div>

            <!-- 添加提示信息 -->

            <div role="alert" class="alert">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                class="stroke-info shrink-0 w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>{{ $t('materialsTagsTips') }}</span>
            </div>
            <!-- 标签下拉多选框 -->
            <div v-if="showTagsDialog"
              class="absolute top-full left-0 right-0 mt-1 bg-base-100 border rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto p-2">
              <div v-for="tag in tags" :key="tag.id" class="mb-1">
                <label class="flex items-center p-1 hover:bg-base-200 rounded cursor-pointer" @click.stop>
                  <input type="checkbox" :id="'tag-' + tag.id" class="checkbox checkbox-primary checkbox-sm mr-2"
                    :checked="selectedTags.includes(tag.name)" @change="toggleTag(tag)" @click.stop />
                  <span class="truncate">{{ tag.name }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>
<script>
import VueSlider from "vue-3-slider-component";
export default {
  components: {
    VueSlider
  },
  name: 'PostDialog',
  data() {

    return {
      settings: localStorage.getItem('postSettings') || 'custom',
      startOption: localStorage.getItem('postStartOption') || 'now',
      scheduledTime: localStorage.getItem('postScheduledTime') || '',
      content_type: Number(localStorage.getItem('content_type')) || 0,
      image_count: Number(localStorage.getItem('image_count')) || 1,
      add_sound: Number(localStorage.getItem('add_sound')) || -1,
      sound_wait_time: Number(localStorage.getItem('sound_wait_time')) || 10,
      origin_sound_volume: Number(localStorage.getItem('origin_sound_volume')) || 100,
      add_sound_volume: Number(localStorage.getItem('add_sound_volume')) || 100,
      add_product_link: Number(localStorage.getItem('add_product_link')) || 0,
      captions: localStorage.getItem('captions') || '',
      materials_tags: localStorage.getItem('materials_tags') || '',
      tags: [],
      showTagsDialog: false,
    }
  },
  computed: {
    selectedTags: function () {
      return this.materials_tags ? this.materials_tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    },

  },
  watch: {
    settings: function (newVal) {
      localStorage.setItem('postSettings', newVal);
    },
    startOption: function (newVal) {
      localStorage.setItem('postStartOption', newVal);
    },
    scheduledTime: function (newVal) {
      localStorage.setItem('postScheduledTime', newVal);
    },
    content_type: function (newVal) {
      localStorage.setItem('content_type', newVal);
    },
    image_count: function (newVal) {
      localStorage.setItem('image_count', newVal);
    },
    add_sound: function (newVal) {
      localStorage.setItem('add_sound', newVal);
    },
    sound_wait_time: function (newVal) {
      localStorage.setItem('sound_wait_time', newVal);
    },
    origin_sound_volume: function (newVal) {
      localStorage.setItem('origin_sound_volume', newVal);
    },
    add_sound_volume: function (newVal) {
      localStorage.setItem('add_sound_volume', newVal);
    },
    add_product_link: function (newVal) {
      localStorage.setItem('add_product_link', newVal);
    },
    captions: function (newVal) {
      localStorage.setItem('captions', newVal);
    },
    materials_tags: function (newVal) {
      localStorage.setItem('materials_tags', newVal);
    },
  },

  methods: {
    // 获取所有标签
    async getTags() {
      try {
        const res = await this.$service.get_tags();
        this.tags = res.data || [];
      } catch (err) {
        console.error('获取标签失败', err);
      }
    },
    // 移除特定索引的标签
    removeTag(index) {
      this.selectedTags.splice(index, 1);
      this.materials_tags = this.selectedTags.join(', ');
    },

    // 切换标签下拉框状态
    toggleTagsDropdown() {
      if (this.showTagsDialog) {
        this.closeTagsDropdown();
      } else {
        this.showTagsDropdown();
      }
    },

    // 显示下拉框
    showTagsDropdown() {
      // 弹出下拉框
      this.showTagsDialog = true;

      // 点击页面其他区域关闭下拉框
      setTimeout(() => {
        // 移除旧的监听器以防重复添加
        document.removeEventListener('click', this.handleOutsideClick);
        document.addEventListener('click', this.handleOutsideClick);
      }, 10);
    },

    // 处理点击外部区域
    handleOutsideClick(event) {
      // 如果点击发生在下拉框之外
      const isOutside = !event.target.closest('.relative');
      if (isOutside && this.showTagsDialog) {
        this.closeTagsDropdown();
      }
    },

    // 关闭标签下拉框
    closeTagsDropdown() {
      this.showTagsDialog = false;
      document.removeEventListener('click', this.handleOutsideClick);
    },

    // 切换标签选择状态并立即更新
    toggleTag(tag) {
      const index = this.selectedTags.indexOf(tag.name);
      if (index === -1) {
        // 添加标签
        this.selectedTags.push(tag.name);
      } else {
        // 移除标签
        this.selectedTags.splice(index, 1);
      }

      // 直接更新材料标签
      this.materials_tags = this.selectedTags.join(', ');
    },
    convertTagsToIds(tag_names) {
      return tag_names.map(tag_name => this.tags.find(tag => tag.name === tag_name)?.id).join(',');
    },

    async runScript() {
      await this.$emiter('run_now_by_account', {
        name: 'post', args: {
          settings: this.settings,
          start_time: this.startOption === 'scheduled' ? this.scheduledTime : '',
          content_type: Number(this.content_type),
          image_count: Number(this.image_count),
          add_sound: Number(this.add_sound),
          sound_wait_time: Number(this.sound_wait_time),
          origin_sound_volume: Number(this.origin_sound_volume),
          add_sound_volume: Number(this.add_sound_volume),
          add_product_link: Number(this.add_product_link),
          captions: this.captions,
          materials_tags: this.convertTagsToIds(this.selectedTags),
        }
      })
    },
  },
  async mounted() {
    await this.getTags();
  },
  beforeUnmount() {
    // 移除可能未清除的事件监听
    document.removeEventListener('click', this.handleOutsideClick);
  }
}
</script>

<style scoped>
/* 可选：添加额外样式 */
.badge {
  font-size: 0.8rem;
  font-weight: normal;
  line-height: 1;
}
</style>
