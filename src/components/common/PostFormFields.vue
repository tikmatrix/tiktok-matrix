<template>
    <div>
        <!-- 发布方式 -->
        <div class="flex w-full items-center gap-2 mb-2">
            <label class="font-bold w-40">{{ $t('postWay') }}:</label>
            <div class="flex items-center gap-4">
                <div class="flex items-center">
                    <input type="radio" id="share" value="share" v-model="localFormData.post_way"
                        class="form-radio text-primary">
                    <label for="share" class="ml-2">{{ $t('share') }}</label>
                </div>
                <div class="flex items-center">
                    <input type="radio" id="addButton" value="addButton" v-model="localFormData.post_way"
                        class="form-radio text-primary">
                    <label for="addButton" class="ml-2">{{ $t('addButton') }}</label>
                </div>
                <div class="flex items-center">
                    <input type="radio" id="useSound" value="useSound" v-model="localFormData.post_way"
                        class="form-radio text-primary">
                    <label for="useSound" class="ml-2">{{ $t('useSound') }}</label>
                </div>
            </div>
        </div>

        <!-- 当选择使用声音时显示输入框 -->
        <div v-if="localFormData.post_way === 'useSound'" class="flex w-full items-center gap-2 mb-2 mt-2">
            <label class="font-bold w-40">{{ $t('soundName') }}:</label>
            <div class="flex-1 flex items-center gap-2">
                <input type="text" v-model="localFormData.sound_name" :placeholder="$t('soundNameOrUrlPlaceholder')"
                    class="border-2 border-gray-300 p-2 rounded flex-1 min-w-[300px]" />
                <div role="alert" class="alert flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        class="stroke-info shrink-0 w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{{ $t('soundInputTips') }}</span>
                </div>
            </div>
        </div>

        <!-- 内容类型 -->
        <div class="flex w-full items-center gap-2 mb-2">
            <label class="font-bold w-40">{{ $t('contentType') }}:</label>
            <div class="flex items-center gap-4">
                <div class="flex items-center">
                    <input type="radio" id="video" value="0" v-model="localFormData.content_type"
                        class="form-radio text-primary">
                    <label for="video" class="ml-2">{{ $t('video') }}</label>
                </div>
                <div class="flex items-center">
                    <input type="radio" id="image" value="1" v-model="localFormData.content_type"
                        class="form-radio text-primary">
                    <label for="image" class="ml-2">{{ $t('image') }}</label>
                </div>
                <div class="flex items-center" v-if="localFormData.content_type == 1">
                    <input class="border-2 border-gray-300 p-2 rounded col-span-1 input-md"
                        v-model="localFormData.image_count" :placeholder="$t('imageCount')" type="number" />
                </div>
            </div>
        </div>

        <!-- 添加声音 -->
        <div class="flex w-full items-center gap-2 mb-2">
            <label class="font-bold w-40">{{ $t('addSound') }}:</label>
            <div class="flex items-center gap-4">
                <div class="flex items-center">
                    <input type="radio" id="default" value="-1" v-model="localFormData.add_sound"
                        class="form-radio text-primary">
                    <label for="default" class="ml-2">{{ $t('default') }}</label>
                </div>
                <div class="flex items-center">
                    <input type="radio" id="disable" value="0" v-model="localFormData.add_sound"
                        class="form-radio text-primary">
                    <label for="disable" class="ml-2">{{ $t('disable') }}</label>
                </div>
                <div class="flex items-center">
                    <input type="radio" id="enable" value="1" v-model="localFormData.add_sound"
                        class="form-radio text-primary">
                    <label for="enable" class="ml-2">{{ $t('enable') }}</label>
                </div>
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

        <!-- 加载时间 -->
        <div class="flex w-full items-center gap-2 mb-4">
            <label class="font-bold w-40">{{ $t('loadingTime') }}:</label>
            <VueSlider class="ml-8" v-model="localFormData.sound_wait_time" :width="500" :min="5" :max="30" :step="1"
                :marks="{
                    5: '5' + $t('second'),
                    10: '10' + $t('second'),
                    15: '15' + $t('second'),
                    20: '20' + $t('second'),
                    25: '25' + $t('second'),
                    30: '30' + $t('second')
                }" />
            <div role="alert" class="alert ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    class="stroke-info shrink-0 w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>{{ $t('loadingTimeTips') }}</span>
            </div>
        </div>

        <!-- 上传等待时间 -->
        <div class="flex w-full items-center gap-2 mb-4">
            <label class="font-bold w-40">{{ $t('uploadWaitTime') }}:</label>
            <VueSlider class="ml-8" v-model="localFormData.upload_wait_time" :width="500" :min="5" :max="60" :step="5"
                :marks="{
                    5: '5' + $t('second'),
                    15: '15' + $t('second'),
                    30: '30' + $t('second'),
                    45: '45' + $t('second'),
                    60: '60' + $t('second')
                }" />
            <div role="alert" class="alert ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    class="stroke-info shrink-0 w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>{{ $t('uploadWaitTimeTips') }}</span>
            </div>
        </div>

        <!-- 音量设置 -->
        <div class="flex w-full items-center gap-2 mb-4 mt-8"
            v-if="localFormData.add_sound == 1 || localFormData.post_way == 'useSound'">
            <label class="font-bold w-40">{{ $t('soundVolume') }}:</label>
            <div class="flex items-center">
                <label class="ml-2 mr-2">{{ $t('originSound') }}: </label>
                <VueSlider v-model="localFormData.origin_sound_volume" :width="100" :min="0" :max="100" :step="25"
                    :marks="{ 0: '0', 100: '100' }" />
                <label class="ml-8 mr-2">{{ $t('addSound') }}: </label>
                <VueSlider v-model="localFormData.add_sound_volume" :width="100" :min="0" :max="100" :step="25"
                    :marks="{ 0: '0', 100: '100' }" />
            </div>
        </div>

        <!-- 添加商品链接 -->
        <div class="flex w-full items-center gap-2 mb-2">
            <label class="font-bold w-40">{{ $t('addProductLink') }}:</label>
            <div class="flex items-center gap-4">
                <div class="flex items-center">
                    <input type="radio" id="disable" value="0" v-model="localFormData.add_product_link"
                        class="form-radio text-primary">
                    <label for="disable" class="ml-2">{{ $t('disable') }}</label>
                </div>
                <div class="flex items-center">
                    <input type="radio" id="enable" value="1" v-model="localFormData.add_product_link"
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

        <!-- 文案 -->
        <div class="flex w-full items-center gap-2 mb-2">
            <label class="font-bold w-40">{{ $t('captions') }}:</label>
            <textarea class="textarea textarea-success w-full max-w-xl col-span-3 h-32 leading-tight"
                :placeholder="$t('captionsTips')" autocomplete="off" v-model="localFormData.captions"> </textarea>
        </div>

        <!-- 文案提示信息 -->
        <div role="alert" class="alert">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                class="stroke-info shrink-0 w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{{ $t('captionsTips') }}</span>
        </div>

        <!-- 素材选择 -->
        <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
            <span class="font-bold w-40">{{ $t('materials') }}: </span>
            <div class="flex items-center gap-4">
                <div class="flex items-center">
                    <input type="radio" id="localFolder" value="localFolder" v-model="localFormData.material_source"
                        class="form-radio text-primary">
                    <label for="localFolder" class="ml-2">{{ $t('localFolder') }}</label>
                </div>
                <div class="flex items-center">
                    <input type="radio" id="materialLibrary" value="materialLibrary"
                        v-model="localFormData.material_source" class="form-radio text-primary">
                    <label for="materialLibrary" class="ml-2">{{ $t('materialLibrary') }}</label>
                </div>
            </div>

            <!-- 本地文件夹选择 -->
            <div class="relative grow" v-if="localFormData.material_source === 'localFolder'">
                <input type="text" :placeholder="$t('clickToSelectMaterialsPath')"
                    class="input input-md grow input-bordered w-full" readonly @click="selectMaterials"
                    v-model="localFormData.material_path" />
                <div role="alert" class="alert">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        class="stroke-info shrink-0 w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{{ $t('materialsPathTips') }}</span>
                </div>
            </div>

            <!-- 素材库标签选择 -->
            <div class="relative grow" v-if="localFormData.material_source === 'materialLibrary'">
                <div class="min-h-[42px] w-full border border-gray-300 rounded-lg px-2 py-1 cursor-pointer flex flex-wrap items-center gap-1"
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

                <!-- 标签下拉多选框 -->
                <div v-if="showTagsDialog"
                    class="absolute top-full left-0 right-0 mt-1 bg-base-100 border rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto p-2">
                    <div v-for="tag in tags" :key="tag.id" class="mb-1">
                        <label class="flex items-center p-1 hover:bg-base-200 rounded cursor-pointer" @click.stop>
                            <input type="checkbox" :id="'tag-' + tag.id"
                                class="checkbox checkbox-primary checkbox-sm mr-2"
                                :checked="selectedTags.includes(tag.name)" @change="toggleTag(tag)" @click.stop />
                            <span class="truncate">{{ tag.name }}</span>
                        </label>
                    </div>
                </div>

                <div role="alert" class="alert">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        class="stroke-info shrink-0 w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{{ $t('materialsTagsTips') }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import VueSlider from "vue-3-slider-component";
import { open } from '@tauri-apps/api/dialog';

export default {
    name: 'PostFormFields',
    components: {
        VueSlider
    },
    props: {
        formData: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            localFormData: {},
            tags: [],
            showTagsDialog: false,
        }
    },
    computed: {
        selectedTags() {
            return this.localFormData.materials_tags
                ? this.localFormData.materials_tags.split(',').map(tag => tag.trim()).filter(tag => tag)
                : [];
        },
    },
    watch: {
        formData: {
            handler(newVal) {
                this.localFormData = { ...newVal };
            },
            deep: true,
            immediate: true
        },
        localFormData: {
            handler(newVal) {
                this.$emit('update:formData', newVal);
            },
            deep: true
        }
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
            const tags = [...this.selectedTags];
            tags.splice(index, 1);
            this.localFormData.materials_tags = tags.join(', ');
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
            this.showTagsDialog = true;
            setTimeout(() => {
                document.removeEventListener('click', this.handleOutsideClick);
                document.addEventListener('click', this.handleOutsideClick);
            }, 10);
        },

        // 处理点击外部区域
        handleOutsideClick(event) {
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

        // 切换标签选择状态
        toggleTag(tag) {
            const tags = [...this.selectedTags];
            const index = tags.indexOf(tag.name);
            if (index === -1) {
                tags.push(tag.name);
            } else {
                tags.splice(index, 1);
            }
            this.localFormData.materials_tags = tags.join(', ');
        },

        // 选择本地素材文件夹
        async selectMaterials() {
            try {
                const filePath = await open({
                    multiple: false,
                    directory: true,
                    filters: []
                });
                if (filePath && typeof filePath === 'string') {
                    this.localFormData.material_path = filePath;
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
    },
    async mounted() {
        await this.getTags();
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleOutsideClick);
    }
}
</script>

<style scoped>
.badge {
    font-size: 0.8rem;
    font-weight: normal;
    line-height: 1;
}
</style>
