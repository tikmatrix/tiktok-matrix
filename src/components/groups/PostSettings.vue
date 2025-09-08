<template>
  <div class="bg-base-100 flex flex-col items-start p-4">
    <div class="flex w-full items-center gap-2 mb-2">
      <label class="font-bold w-40">{{ $t('enableSchedule') }}:</label>
      <input type="checkbox" class="toggle toggle-accent" v-model="mygroup.auto_publish" true-value="1"
        false-value="0" />
      <div role="alert" class="alert">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>{{ $t('enableScheduleTips') }}</span>
      </div>
    </div>
    <div>
      <div class="flex w-full items-center gap-2 mb-2" v-if="mygroup.auto_publish == 1">
        <label class="font-bold w-40">{{ $t('scheduleTime') }}:</label>
        <div class="flex flex-wrap gap-2">
          <div v-for="(time, index) in publishTimes" :key="index" class="flex items-center">
            <input type="time" class="border-2 border-gray-300 p-2 rounded" v-model="publishTimes[index]"
              :placeholder="'00:00'" />
            <button @click="removeTime(index)" class="ml-1 p-1 text-red-500 hover:text-red-700">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button @click="addTime" class="p-2 text-primary hover:text-primary-focus">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      <div class="flex w-full items-center gap-2 mb-2">
        <label class="font-bold w-40">{{ $t('postWay') }}:</label>
        <div class="flex items-center gap-4">
          <div class="flex items-center">
            <input type="radio" id="share" value="share" v-model="mygroup.post_way" class="form-radio text-primary">
            <label for="share" class="ml-2">{{ $t('share') }}</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="addButton" value="addButton" v-model="mygroup.post_way"
              class="form-radio text-primary">
            <label for="addButton" class="ml-2">{{ $t('addButton') }}</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="useSound" value="useSound" v-model="mygroup.post_way"
              class="form-radio text-primary">
            <label for="useSound" class="ml-2">{{ $t('useSound') }}</label>
            <input type="text" v-model="mygroup.sound_name" :placeholder="$t('soundNamePlaceholder')"
              v-if="mygroup.post_way == 'useSound'" class="border-2 border-gray-300 p-2 rounded" />
          </div>
        </div>
      </div>
      <div class="flex w-full items-center gap-2 mb-2">
        <label class="font-bold w-40">{{ $t('contentType') }}:</label>
        <div class="flex items-center gap-4">
          <div class="flex items-center">
            <input type="radio" id="video" value="0" v-model="mygroup.content_type" class="form-radio text-primary">
            <label for="video" class="ml-2">{{ $t('video') }}</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="image" value="1" v-model="mygroup.content_type" class="form-radio text-primary">
            <label for="image" class="ml-2">{{ $t('image') }}</label>
          </div>
          <div class="flex items-center" v-if="mygroup.content_type == 1">
            <input class="border-2 border-gray-300 p-2 rounded col-span-1 input-md" v-model="mygroup.image_count"
              :placeholder="$t('imageCount')" type="number" />
          </div>
        </div>
      </div>
      <!-- add sound start -->
      <div class="flex w-full items-center gap-2 mb-2">
        <label class="font-bold w-40">{{ $t('addSound') }}:</label>
        <div class="flex items-center gap-4">
          <div class="flex items-center">
            <input type="radio" id="default" value="-1" v-model="mygroup.add_sound" class="form-radio text-primary">
            <label for="default" class="ml-2">{{ $t('default') }}</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="disable" value="0" v-model="mygroup.add_sound" class="form-radio text-primary">
            <label for="disable" class="ml-2">{{ $t('disable') }}</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="enable" value="1" v-model="mygroup.add_sound" class="form-radio text-primary">
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
        <VueSlider v-model="mygroup.sound_wait_time" :width="500" :min="5" :max="30" :step="1"
          :marks="{ 5: '5' + $t('second'), 10: '10' + $t('second'), 15: '15' + $t('second'), 20: '20' + $t('second'), 25: '25' + $t('second'), 30: '30' + $t('second') }" />
        <div role="alert" class="alert ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ $t('loadingTimeTips') }}</span>
        </div>
      </div>
      <div class="flex w-full items-center gap-2 mb-4">
        <label class="font-bold w-40">{{ $t('uploadWaitTime') }}:</label>
        <VueSlider v-model="mygroup.upload_wait_time" :width="500" :min="5" :max="60" :step="5"
          :marks="{ 5: '5' + $t('second'), 15: '15' + $t('second'), 30: '30' + $t('second'), 45: '45' + $t('second'), 60: '60' + $t('second') }" />
        <div role="alert" class="alert ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ $t('uploadWaitTimeTips') }}</span>
        </div>
      </div>
      <div class="flex w-full items-center gap-2 mb-4 mt-8"
        v-if="mygroup.add_sound == 1 || mygroup.post_way == 'useSound'">
        <label class="font-bold w-40">{{ $t('soundVolume') }}:</label>
        <div class="flex items-center">
          <label class="ml-2 mr-2">{{ $t('originSound') }}: </label>
          <VueSlider v-model="mygroup.origin_sound_volume" :width="100" :min="0" :max="100" :step="25"
            :marks="{ 0: '0', 100: '100' }" />
          <label class="ml-8 mr-2">{{ $t('addSound') }}: </label>
          <VueSlider v-model="mygroup.add_sound_volume" :width="100" :min="0" :max="100" :step="25"
            :marks="{ 0: '0', 100: '100' }" />
        </div>
      </div>
      <!-- add sound end-->
      <div class="flex w-full items-center gap-2 mb-2">
        <label class="font-bold w-40">{{ $t('addProductLink') }}:</label>
        <div class="flex items-center gap-4">
          <div class="flex items-center">
            <input type="radio" id="disable" value="0" v-model="mygroup.add_product_link"
              class="form-radio text-primary">
            <label for="disable" class="ml-2">{{ $t('disable') }}</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="enable" value="1" v-model="mygroup.add_product_link"
              class="form-radio text-primary">
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
          :placeholder="$t('titlesTips')" autocomplete="off" v-model="mygroup.captions"> </textarea>
      </div>
      <!-- 添加提示信息 -->
      <div role="alert" class="alert">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>{{ $t('captionsTips') }}</span>
      </div>
    </div>
    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <span class="font-bold w-40">{{ $t('materials') }}: </span>
      <div class="flex items-center gap-4">
        <div class="flex items-center">
          <input type="radio" id="localFolder" value="localFolder" v-model="mygroup.material_source"
            class="form-radio text-primary">
          <label for="localFolder" class="ml-2">{{ $t('localFolder') }}</label>
        </div>
        <div class="flex items-center">
          <input type="radio" id="materialLibrary" value="materialLibrary" v-model="mygroup.material_source"
            class="form-radio text-primary">
          <label for="materialLibrary" class="ml-2">{{ $t('materialLibrary') }}</label>
        </div>

      </div>
      <div class="relative grow" v-if="mygroup.material_source === 'localFolder'">
        <input type="text" :placeholder="$t('clickToSelectMaterialsPath')"
          class="input input-md grow input-bordered w-full" readonly @click="selectMaterials"
          v-model="mygroup.material_path" />
        <!-- 添加提示信息 -->
        <div role="alert" class="alert">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ $t('materialsPathTips') }}</span>
        </div>
      </div>
      <div class="relative grow" v-if="mygroup.material_source === 'materialLibrary'">
        <!-- 自定义标签显示区域 -->
        <div
          class="min-h-[42px] w-full border border-gray-300 rounded-lg px-2 py-1 cursor-pointer flex flex-wrap items-center gap-1"
          @click.stop="toggleTagsDropdown">
          <template v-if="selectedTags.length > 0">
            <div v-for="(tag, index) in selectedTags" :key="index" class="badge badge-info gap-1 px-2 py-3 text-white">
              <span>{{ tag }}</span>
              <span class="cursor-pointer hover:text-error" @click.stop="removeTag(index)">×</span>
            </div>
          </template>
          <span v-else class="text-gray-400 text-sm">{{ $t('clickToSelectTags') }}</span>
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
        <!-- 添加提示信息 -->
        <div role="alert" class="alert">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ $t('materialsTagsTips') }}</span>
        </div>
      </div>

    </div>

    <!-- other fields... -->
    <div class="mt-8 w-full flex justify-end">
      <button class="btn btn-primary mr-2" @click="update">
        {{ $t('update') }}
      </button>
    </div>
  </div>
</template>

<script>
import VueSlider from "vue-3-slider-component";
import { open } from '@tauri-apps/api/dialog';
export default {
  components: {
    VueSlider
  },
  props: {
    group: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      mygroup: {},
      publishTimes: [],
      tags: [],
      showTagsDialog: false,
    }
  },
  computed: {
    selectedTags: function () {
      return this.mygroup.materials_tags ? this.mygroup.materials_tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    },
  },
  watch: {
    'mygroup.auto_publish': function (val) {
      this.mygroup.auto_publish = Number(val)
    },
    'mygroup.content_type': function (val) {
      this.mygroup.content_type = Number(val)
    },
    'mygroup.add_sound': function (val) {
      this.mygroup.add_sound = Number(val)
    },
    'mygroup.add_product_link': function (val) {
      this.mygroup.add_product_link = Number(val)
    },
    'mygroup.origin_sound_volume': function (val) {
      this.mygroup.origin_sound_volume = Number(val)
    },
    'mygroup.add_sound_volume': function (val) {
      this.mygroup.add_sound_volume = Number(val)
    },
    'mygroup.sound_wait_time': function (val) {
      this.mygroup.sound_wait_time = Number(val)
    },
    'mygroup.upload_wait_time': function (val) {
      this.mygroup.upload_wait_time = Number(val)
    },


  },
  methods: {
    // 选择本地素材文件夹
    async selectMaterials() {
      try {
        // 这里需要调用Tauri的文件对话框API来选择文件夹
        const filePath = await open({
          multiple: false, // 是否允许多选文件
          directory: true, // 是否选择目录
          filters: [ // 文件过滤器
          ]
        });
        console.log('Selected file path:', filePath);
        if (filePath && typeof filePath === 'string') {
          this.mygroup.material_path = filePath;
        } else {
          await this.$emiter('NOTIFY', {
            type: 'info',
            message: this.$t('clickToSelectMaterialsPath'),
            timeout: 2000
          });
        }
      } catch (error) {
        console.error('选择文件夹失败:', error);
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('selectFolderFailed'),
          timeout: 2000
        });
      }
    },
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
      this.mygroup.materials_tags = this.selectedTags.join(', ');
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
      this.mygroup.materials_tags = this.selectedTags.join(', ');
    },
    convertTagsToIds(tag_names) {
      return tag_names.map(tag_name => this.tags.find(tag => tag.name === tag_name)?.id).join(',');
    },
    addTime() {
      const currentTime = new Date();
      this.publishTimes.push(currentTime.toTimeString().slice(0, 5));
    },
    removeTime(index) {
      this.publishTimes.splice(index, 1)
    },
    async update() {
      this.mygroup.publish_start_time = this.publishTimes
        .filter(Boolean)
        .join(',')
      if (this.mygroup.auto_publish == 1 && !this.mygroup.publish_start_time.match(/^(\d{2}:\d{2},)*\d{2}:\d{2}$/)) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('publishStartTimeFormatError'),
          timeout: 2000
        });
        return
      }
      if (this.mygroup.post_way === 'useSound' && !this.mygroup.sound_name) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('soundNameRequired'),
          timeout: 2000
        });
        return
      }

      // 验证素材配置
      if (this.mygroup.material_source === 'localFolder' && !this.mygroup.material_path) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('selectFolderFailed'),
          timeout: 2000
        });
        return
      }

      // 直接保存到配置文件而不是更新数据库
      await this.saveGroupConfigFile()

      // 保存成功后关闭对话框
      await this.$emiter('closeDialog', {})
      await this.$emiter('reload_group', {})
    },

    // 保存到配置文件
    async saveGroupConfigFile() {
      try {
        // 构建要保存的配置
        const config = {
          auto_publish: this.mygroup.auto_publish,
          publish_start_time: this.mygroup.publish_start_time,
          post_way: this.mygroup.post_way,
          sound_name: this.mygroup.sound_name,
          content_type: this.mygroup.content_type,
          image_count: this.mygroup.image_count,
          add_sound: this.mygroup.add_sound,
          sound_wait_time: this.mygroup.sound_wait_time,
          upload_wait_time: this.mygroup.upload_wait_time,
          origin_sound_volume: this.mygroup.origin_sound_volume,
          add_sound_volume: this.mygroup.add_sound_volume,
          add_product_link: this.mygroup.add_product_link,
          captions: this.mygroup.captions || '', // 改为 captions
          material_source: this.mygroup.material_source,
          material_path: this.mygroup.material_path || '',
          materials_tags: this.mygroup.materials_tags || '',
          settings: 'group_file'
        };

        const result = await this.$service.save_group_config_file({
          group_id: this.mygroup.id,
          script_name: 'post',
          settings: config
        });
        if (result.code === 0) {
          await this.$emiter('NOTIFY', {
            type: 'success',
            message: this.$t('configFileSaved') || 'Configuration saved successfully',
            timeout: 2000
          });
        } else {
          await this.$emiter('NOTIFY', {
            type: 'error',
            message: result.data || 'Failed to save configuration file',
            timeout: 2000
          });
        }
      } catch (error) {
        console.error('Error saving config file:', error);
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('saveConfigError') || 'Error saving configuration file',
          timeout: 2000
        });
      }
    },
  },
  async mounted() {
    this.mygroup = { ...this.group }

    // 尝试从配置文件加载设置，如果存在则使用配置文件的设置
    try {
      const response = await this.$service.get_group_config_file({
        group_id: this.mygroup.id,
        script_name: 'post'
      });

      if (response.code === 0 && response.data) {
        // 如果存在配置文件，则使用配置文件的设置覆盖数据库设置
        const config = response.data;

        // 更新post相关配置
        if (config.auto_publish !== undefined) {
          this.mygroup.auto_publish = config.auto_publish;
        }
        if (config.publish_start_time !== undefined) {
          this.mygroup.publish_start_time = config.publish_start_time;
        }
        if (config.post_way !== undefined) {
          this.mygroup.post_way = config.post_way;
        }
        if (config.sound_name !== undefined) {
          this.mygroup.sound_name = config.sound_name;
        }
        if (config.content_type !== undefined) {
          this.mygroup.content_type = config.content_type;
        } else if (config.publish_type !== undefined) {
          // 向后兼容旧的字段名
          this.mygroup.content_type = config.publish_type;
        }
        if (config.image_count !== undefined) {
          this.mygroup.image_count = config.image_count;
        }
        if (config.add_sound !== undefined) {
          this.mygroup.add_sound = config.add_sound;
        }
        if (config.sound_wait_time !== undefined) {
          this.mygroup.sound_wait_time = config.sound_wait_time;
        }
        if (config.upload_wait_time !== undefined) {
          this.mygroup.upload_wait_time = config.upload_wait_time;
        }
        if (config.origin_sound_volume !== undefined) {
          this.mygroup.origin_sound_volume = config.origin_sound_volume;
        }
        if (config.add_sound_volume !== undefined) {
          this.mygroup.add_sound_volume = config.add_sound_volume;
        }
        if (config.add_product_link !== undefined) {
          this.mygroup.add_product_link = config.add_product_link;
        }
        if (config.captions !== undefined) {
          this.mygroup.captions = config.captions;
        } else if (config.title !== undefined) {
          // 向后兼容旧的字段名
          this.mygroup.captions = config.title;
        }
        if (config.material_source !== undefined) {
          this.mygroup.material_source = config.material_source;
        }
        if (config.material_path !== undefined) {
          this.mygroup.material_path = config.material_path;
        }
        if (config.materials_tags !== undefined) {
          this.mygroup.materials_tags = config.materials_tags;
        }

        console.log('Loaded settings from config file for post');
      } else {
        console.log('No config file found, using database settings for post');
      }
    } catch (error) {
      console.log('Failed to load config file, using database settings for post:', error);
    }

    // 设置默认的素材源
    if (!this.mygroup.material_source) {
      this.mygroup.material_source = 'materialLibrary';
    }

    if (this.mygroup.publish_start_time) {
      this.publishTimes = this.mygroup.publish_start_time.split(',')
    }
    await this.getTags();
  }
}
</script>
