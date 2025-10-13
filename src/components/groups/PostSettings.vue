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

      <!-- 使用公共表单组件 -->
      <PostFormFields :formData="formDataForFields" @update:formData="updateFormData" />
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
import PostFormFields from '@/components/common/PostFormFields.vue';

export default {
  components: {
    VueSlider,
    PostFormFields
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
    }
  },
  computed: {
    // 为 PostFormFields 组件准备数据
    formDataForFields() {
      return {
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
        captions: this.mygroup.captions,
        material_source: this.mygroup.material_source,
        material_path: this.mygroup.material_path,
        materials_tags: this.mygroup.materials_tags
      };
    }
  },
  watch: {
    'mygroup.auto_publish': function (val) {
      this.mygroup.auto_publish = Number(val)
    },
  },
  methods: {
    // 更新表单数据
    updateFormData(newData) {
      Object.keys(newData).forEach(key => {
        if (this.mygroup[key] !== undefined) {
          this.mygroup[key] = newData[key];
        }
      });
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
    if (this.mygroup.publish_type !== undefined) {
      // 向后兼容旧的字段名
      this.mygroup.content_type = this.mygroup.publish_type;
    }
    if (this.mygroup.title !== undefined) {
      // 向后兼容旧的字段名
      this.mygroup.captions = this.mygroup.title;
    }

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
  }
}
</script>
