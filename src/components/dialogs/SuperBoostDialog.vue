<template>
    <!-- 顶部说明 -->
    <div class="alert alert-info mb-4 shadow-lg">
        <div>
            <font-awesome-icon icon="fa-solid fa-rocket" class="h-6 w-6 mr-2" />
            <span>{{ $t('superBoostWarning') }}</span>
        </div>
    </div>

    <!-- 模块1：输入用户数据源 -->
    <div class="card bg-base-100 border border-base-300 mb-4">
        <div class="card-body p-4">
            <h3 class="card-title text-lg mb-4 text-primary">
                <font-awesome-icon icon="fa-solid fa-database" class="mr-2" />
                {{ $t('userDataSource') }}
            </h3>

            <!-- 数据源类型选择 -->
            <div class="form-control mb-4">
                <label class="label">
                    <span class="label-text font-semibold">{{ $t('dataSourceType') }}</span>
                </label>
                <div class="grid md:grid-cols-2 gap-3">
                    <label class="cursor-pointer flex items-start gap-3 p-3 rounded-lg border border-base-200"
                        :class="{ 'bg-primary/5 border-primary': isUsernameSource }">
                        <input type="radio" class="radio radio-primary mt-1" value="usernames" v-model="dataSourceType">
                        <div>
                            <span class="font-semibold">{{ $t('dataSourceUsernames') }}</span>
                            <p class="text-md text-gray-500 mt-1">{{ $t('dataSourceUsernamesDesc') }}</p>
                        </div>
                    </label>
                    <label class="cursor-pointer flex items-start gap-3 p-3 rounded-lg border border-base-200"
                        :class="{ 'bg-info/5 border-info': isPostLinkSource }">
                        <input type="radio" class="radio radio-info mt-1" value="post_links" v-model="dataSourceType">
                        <div>
                            <span class="font-semibold">{{ $t('dataSourcePostLinks') }}</span>
                            <p class="text-md text-gray-500 mt-1">{{ $t('dataSourcePostLinksDesc') }}</p>
                        </div>
                    </label>
                </div>
            </div>

            <div v-if="isUsernameSource" class="space-y-4">
                <!-- 用户名文件选择 -->
                <div class="form-control">
                    <label class="label">
                        <span class="label-text font-semibold">{{ $t('targetUsernamesPath') }}</span>
                    </label>
                    <div class="join flex w-full">
                        <input type="text" :placeholder="$t('selectUsernameFile')" readonly
                            class="input input-bordered join-item  flex-1 w-full" v-model="targetUsernamesPath" />
                        <button class="btn btn-info join-item" @click="selectUsernameFile">{{ $t('select') }}</button>
                    </div>
                </div>

                <!-- 最大处理用户数量 -->
                <div class="form-control">
                    <label class="label">
                        <span class="label-text font-semibold">{{ $t('maxUsersToProcess') }}</span>
                    </label>
                    <div class="flex flex-wrap items-center gap-3">
                        <input type="number" class="input input-bordered input-md w-28" min="0"
                            v-model.number="maxUsersCount" />
                    </div>
                    <div class="alert alert-info py-2 px-3 mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            class="stroke-current shrink-0 w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="text-md">{{ $t('maxUsersToProcessHelp') }}</span>
                    </div>
                </div>

                <!-- 进入用户主页方式 -->
                <div class="form-control">
                    <label class="label">
                        <span class="label-text font-semibold">{{ $t('userProfileAccessMethod') }}</span>
                    </label>
                    <div class="flex flex-wrap gap-4">
                        <label class="cursor-pointer flex items-center gap-2">
                            <input type="radio" name="accessMethod" class="radio radio-primary" value="search"
                                v-model="accessMethod" />
                            <span>{{ $t('searchUser') }}</span>
                        </label>
                        <label class="cursor-pointer flex items-center gap-2">
                            <input type="radio" name="accessMethod" class="radio radio-primary" value="direct"
                                v-model="accessMethod" />
                            <span>{{ $t('directOpenProfile') }}</span>
                        </label>
                    </div>
                </div>
            </div>

            <div v-else class="space-y-4">
                <!-- 帖子链接文件选择 -->
                <div class="form-control">
                    <label class="label">
                        <span class="label-text font-semibold">{{
                            $t('postLinksPath') }}
                        </span>
                    </label>
                    <div class="join flex w-full">
                        <input type="text" :placeholder="$t('selectPostFile')" readonly
                            class="input input-bordered join-item flex-1 w-full" v-model="postLinksPath" /> <button
                            class="btn btn-info join-item" @click="selectPostLinksFile">{{ $t('select') }}</button>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- 模块2：用户相关操作 -->
    <div class="card bg-base-100 border border-base-300 mb-4">
        <div class="card-body p-4">
            <h3 class="card-title text-lg mb-4 text-primary">
                <font-awesome-icon icon="fa-solid fa-users" class="mr-2" />
                {{ $t('userRelatedActions') }}
            </h3>

            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">

                <!-- 关注操作配置 -->
                <div :class="[
                    'border border-base-200 rounded-lg p-3 transition-all',
                    features.followUsers ? 'bg-success/10 border-success shadow' : 'bg-base-50',
                    !isUsernameSource ? 'opacity-50' : ''
                ]">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <font-awesome-icon icon="fa-solid fa-user-plus" class="text-success" />
                            <span class="font-semibold">{{ $t('followUsersAction') }}</span>
                        </div>
                        <input type="checkbox" class="toggle toggle-success toggle-md" v-model="features.followUsers"
                            :disabled="!isUsernameSource" />
                    </div>
                </div>

                <!-- 取消关注配置 -->
                <div :class="[
                    'border border-base-200 rounded-lg p-3 transition-all',
                    features.unfollowUsers ? 'bg-error/10 border-error shadow' : 'bg-base-50',
                    !isUsernameSource ? 'opacity-50' : ''
                ]">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <font-awesome-icon icon="fa-solid fa-user-minus" class="text-error" />
                            <span class="font-semibold">{{ $t('unfollowUsersAction') }}</span>
                        </div>
                        <input type="checkbox" class="toggle toggle-error toggle-md" v-model="features.unfollowUsers"
                            :disabled="!isUsernameSource" />
                    </div>
                </div>

                <!-- 私信操作配置 -->
                <div :class="[
                    'border border-base-200 rounded-lg p-3 transition-all space-y-3',
                    features.sendDM ? 'bg-info/10 border-info shadow' : 'bg-base-50',
                    !isUsernameSource ? 'opacity-50' : ''
                ]">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <font-awesome-icon icon="fa-solid fa-envelope" class="text-info" />
                            <span class="font-semibold">{{ $t('sendDMAction') }}</span>
                        </div>
                        <input type="checkbox" class="toggle toggle-info toggle-md" v-model="features.sendDM"
                            :disabled="!isUsernameSource" />
                    </div>

                    <div v-if="features.sendDM" class="form-control">
                        <label class="label py-1">
                            <span class="label-text text-md">{{ $t('messageContents') }}</span>
                        </label>
                        <textarea class="textarea textarea-md textarea-bordered h-16"
                            v-model="dmSettings.message_contents" :placeholder="$t('messageContentsTips')"></textarea>

                        <label class="cursor-pointer flex items-center gap-2 mt-2">
                            <input type="checkbox" class="checkbox checkbox-md checkbox-accent"
                                v-model="dmSettings.insert_emoji" />
                            <span class="text-md">{{ $t('insertEmoji') }}</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 模块3：帖子相关操作 -->
    <div class="card bg-base-100 border border-base-300 mb-4">
        <div class="card-body p-4">
            <h3 class="card-title text-lg mb-4 text-primary">
                <font-awesome-icon icon="fa-solid fa-photo-film" class="mr-2" />
                {{ $t('postRelatedActions') }}
            </h3>

            <!-- 帖子处理设置 -->
            <div class="mb-4 p-3 bg-base-50 rounded-lg border border-base-200">
                <div class="space-y-3 flex flex-row flex-wrap gap-4">
                    <div class="flex items-center gap-4">
                        <span class="text-md font-bold">{{ $t('maxPostsToProcess') }}:</span>
                        <input type="number" class="input input-md input-bordered w-20"
                            v-model.number="postSettings.max_posts_count" min="1" max="50" />
                        <span class="text-md">{{ $t('posts') }}</span>
                        <div class="alert alert-info py-2 px-3 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                class="stroke-current shrink-0 w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-md">{{ helpMaxPosts }}</span>
                        </div>
                    </div>



                    <div class="flex items-center gap-3">
                        <span class="text-md font-bold min-w-[100px]">{{ $t('repeatTimes') }}:</span>
                        <input type="number" class="input input-md input-bordered w-20"
                            v-model.number="postSettings.repeat_times" min="1" max="20" />
                        <span class="text-md">{{ $t('times') }}</span>
                        <div class="alert alert-info py-2 px-3 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                class="stroke-current shrink-0 w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-md">{{ helpRepeatTimes }}</span>
                        </div>
                    </div>

                    <div class="text-sm text-primary font-semibold mt-1">{{ maxTotalLabel }}: {{
                        postSettings.max_posts_count * postSettings.repeat_times }}</div>

                    <div class="alert alert-info py-2 px-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            class="stroke-current shrink-0 w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="text-md">{{ $t('repeatTimesTip') }}</span>
                    </div>
                </div>
                <!-- 观看时长 -->
                <div class="flex w-full items-center gap-2 mt-8 mb-8">
                    <label class="font-bold mr-4">{{ $t('viewDuration') }}:</label>
                    <VueSlider v-model="postSettings.view_durations" :width="500" :min="0" :max="300"
                        :marks="{ 0: '0', 60: '60', 120: '120', 180: '180', 240: '240', 300: '300' + ' ' + $t('second') }" />


                </div>
                <div class="alert alert-info py-2 px-3 mt-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        class="stroke-current shrink-0 w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span class="text-md">{{ $t('viewDurationTips') }}</span>
                </div>
            </div>
            <div class="divider my-2"></div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

                <!-- 帖子互动操作 -->
                <div class="border border-base-200 rounded-lg p-4 bg-base-50">
                    <div class="flex items-center mb-4">
                        <input type="checkbox" class="checkbox checkbox-primary mr-3" v-model="features.boostPosts" />
                        <font-awesome-icon icon="fa-solid fa-heart" class="text-error mr-2" />
                        <span class="font-semibold text-lg">{{ $t('postInteractionAction') }}</span>
                    </div>

                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-3">
                            <label class="cursor-pointer flex items-center gap-2">
                                <input type="checkbox" class="checkbox checkbox-md checkbox-primary"
                                    v-model="postSettings.enable_like" />
                                <span class="text-md">{{ $t('like') }}</span>
                            </label>
                            <label class="cursor-pointer flex items-center gap-2">
                                <input type="checkbox" class="checkbox checkbox-md checkbox-primary"
                                    v-model="postSettings.enable_favorite" />
                                <span class="text-md">{{ $t('favorite') }}</span>
                            </label>
                            <label class="cursor-pointer flex items-center gap-2">
                                <input type="checkbox" class="checkbox checkbox-md checkbox-primary"
                                    v-model="postSettings.enable_repost" />
                                <span class="text-md">{{ $t('repost') }}</span>
                            </label>
                            <label class="cursor-pointer flex items-center gap-2">
                                <input type="checkbox" class="checkbox checkbox-md checkbox-primary"
                                    v-model="postSettings.enable_share" />
                                <span class="text-md">{{ $t('share') }}</span>
                            </label>
                        </div>




                    </div>
                </div>

                <!-- 评论操作 -->
                <div class="border border-base-200 rounded-lg p-4 bg-base-50">
                    <div class="flex items-center mb-4">
                        <input type="checkbox" class="checkbox checkbox-primary mr-3" v-model="features.massComment" />
                        <font-awesome-icon icon="fa-solid fa-comment" class="text-warning mr-2" />
                        <span class="font-semibold text-lg">{{ $t('commentAction') }}</span>
                    </div>

                    <div class="space-y-3">
                        <div class="flex flex-row items-center gap-2 mb-3">
                            <label class="font-bold text-md">{{ $t('generateByChatGPT') }}:</label>
                            <input type="checkbox" class="toggle toggle-accent toggle-md"
                                v-model="commentSettings.generate_by_chatgpt" />
                        </div>

                        <div v-if="commentSettings.generate_by_chatgpt" class="space-y-3">
                            <fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-3">
                                <legend class="fieldset-legend text-md">{{ $t('chatgptSettings') }}</legend>

                                <div class="grid grid-cols-1 gap-2">
                                    <div>
                                        <label class="label py-1">
                                            <span class="label-text text-md">{{ $t('url') }}</span>
                                        </label>
                                        <input type="text" class="input input-md w-full"
                                            placeholder="https://api.openai.com/v1/chat/completions"
                                            v-model="commentSettings.chatgpt_settings.url" />
                                    </div>

                                    <div>
                                        <label class="label py-1">
                                            <span class="label-text text-md">{{ $t('apiKey') }}</span>
                                        </label>
                                        <input type="password" class="input input-md w-full" placeholder="sk-********"
                                            v-model="commentSettings.chatgpt_settings.api_key" />
                                    </div>

                                    <div>
                                        <label class="label py-1">
                                            <span class="label-text text-md">{{ $t('model') }}</span>
                                        </label>
                                        <input type="text" class="input input-md" placeholder="gpt-3.5-turbo"
                                            v-model="commentSettings.chatgpt_settings.model" />
                                    </div>

                                    <div>
                                        <label class="label py-1">
                                            <span class="label-text text-md">{{ $t('systemPrompt') }}</span>
                                        </label>
                                        <textarea class="textarea textarea-md h-12"
                                            :placeholder="$t('systemPromptTips')"
                                            v-model="commentSettings.chatgpt_settings.system_prompt"></textarea>
                                    </div>
                                </div>
                            </fieldset>

                            <div class="flex items-center gap-2">
                                <button class="btn btn-md btn-primary" @click="testChatGPT">{{ $t('testChatGPT')
                                    }}</button>
                                <span :class="testResultStyle" class="text-md">{{ testResult }}</span>
                            </div>
                        </div>

                        <div v-else class="space-y-3">
                            <div class="form-control">
                                <label class="label py-1">
                                    <span class="label-text text-md">{{ $t('comments') }}</span>
                                </label>
                                <textarea class="textarea textarea-md textarea-bordered h-16"
                                    v-model="commentSettings.comment_content"
                                    :placeholder="$t('commentContentTips')"></textarea>
                            </div>

                            <div class="flex gap-4">
                                <label class="cursor-pointer flex items-center gap-2">
                                    <input type="radio" name="commentOrder" value="random"
                                        class="radio radio-md radio-primary" v-model="commentSettings.comment_order" />
                                    <span class="text-md">{{ $t('random') }}</span>
                                </label>
                                <label class="cursor-pointer flex items-center gap-2">
                                    <input type="radio" name="commentOrder" value="sequential"
                                        class="radio radio-md radio-primary" v-model="commentSettings.comment_order" />
                                    <span class="text-md">{{ $t('sequential') }}</span>
                                </label>
                            </div>

                            <label class="cursor-pointer flex items-center gap-2">
                                <input type="checkbox" class="checkbox checkbox-md checkbox-accent"
                                    v-model="commentSettings.insert_emoji" />
                                <span class="text-md">{{ $t('insertEmoji') }}</span>
                            </label>
                        </div>
                    </div>
                </div>

            </div>
            <div class="divider my-2"></div>
            <!-- 添加任务间隔时间设置 -->
            <div class="flex flex-row items-center mt-8 mb-8">
                <label class="font-bold mr-4">{{ $t('taskInterval') }}:</label>
                <VueSlider v-model="task_interval" :width="500" :min="0" :max="10" :marks="{
                    0: '0',
                    5: '5',
                    10: '10' + ' ' + $t('minute')
                }" />
            </div>
            <div class="alert alert-info py-2 px-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    class="stroke-current shrink-0 w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-md">{{ $t('taskIntervalTip') }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import { open } from '@tauri-apps/api/dialog';
import { superBoostSettings } from '@/utils/settingsManager';
import VueSlider from "vue-3-slider-component";

export default {
    name: 'SuperBoostDialog',
    components: {
        VueSlider
    },
    mixins: [
        superBoostSettings.createVueMixin(
            {
                dataSourceType: 'usernames',
                targetUsernamesPath: '',
                postLinksPath: '',
                accessMethod: 'search',
                maxUsersCount: 0,
                features: {
                    followUsers: false,
                    unfollowUsers: false,
                    sendDM: false,
                    boostPosts: false,
                    massComment: false
                },
                followSettings: {
                    boost_type: 'follow'
                },
                dmSettings: {
                    message_contents: '',
                    insert_emoji: false
                },
                postSettings: {
                    max_posts_count: 1,
                    enable_like: false,
                    enable_favorite: false,
                    enable_repost: false,
                    enable_share: false,
                    repeat_times: 1,
                    view_durations: [5, 30]
                },
                commentSettings: {
                    comment_content: '',
                    insert_emoji: false,
                    comment_order: 'random',
                    generate_by_chatgpt: false,
                    chatgpt_settings: {
                        url: 'https://api.openai.com/v1/chat/completions',
                        api_key: '',
                        model: 'gpt-3.5-turbo',
                        system_prompt: 'Generate a casual, relevant comment for this TikTok post. Keep it under 50 characters, use emojis, and make it sound natural and engaging.'
                    }
                },
                task_interval: [0, 0]
            },
            [
                'dataSourceType', 'targetUsernamesPath', 'postLinksPath', 'accessMethod', 'features',
                'maxUsersCount', 'followSettings', 'dmSettings', 'postSettings',
                'commentSettings', 'task_interval'
            ]
        )
    ],
    data() {
        return {
            // 数据源类型
            dataSourceType: 'usernames',

            // 统一的目标用户名文件路径
            targetUsernamesPath: '',

            // 帖子链接文件路径
            postLinksPath: '',

            // 进入用户主页的方式
            accessMethod: 'search', // 'search' 或 'direct'

            // 最大处理用户数量 0 表示不限制
            maxUsersCount: 0,

            // ChatGPT测试结果
            testResult: '',
            testResultStyle: 'text-gray-500',

            // 功能开关
            features: {
                followUsers: false,
                unfollowUsers: false,
                sendDM: false,
                boostPosts: false,
                massComment: false
            },

            // 关注用户设置
            followSettings: {
                boost_type: 'follow' // 'follow' 或 'unFollow'
            },

            // 私信设置
            dmSettings: {
                message_contents: '',
                insert_emoji: false
            },

            // 帖子操作设置
            postSettings: {
                max_posts_count: 1, // 最大处理帖子数量
                enable_like: false,
                enable_favorite: false,
                enable_repost: false,
                enable_share: false,
                repeat_times: 1, // 默认值为 1
                view_durations: [5, 30] // 观看时长范围，单位秒
            },

            // 评论设置
            commentSettings: {
                comment_content: '',
                insert_emoji: false,
                comment_order: 'random',
                generate_by_chatgpt: false,
                chatgpt_settings: {
                    url: 'https://api.openai.com/v1/chat/completions',
                    api_key: '',
                    model: 'gpt-3.5-turbo',
                    system_prompt: 'Generate a casual, relevant comment for this TikTok post. Keep it under 50 characters, use emojis, and make it sound natural and engaging.'
                }
            },
            // 任务间隔时间
            task_interval: [0, 0]
        }
    },
    async mounted() {
        let needsReset = false;

        if (typeof this.dataSourceType === 'undefined' || !['usernames', 'post_links'].includes(this.dataSourceType)) {
            this.dataSourceType = 'usernames';
        }

        if (typeof this.postLinksPath === 'undefined' || typeof this.postLinksPath !== 'string') {
            this.postLinksPath = '';
        }

        const parsedMaxUsers = Number(this.maxUsersCount);
        if (!Number.isFinite(parsedMaxUsers) || parsedMaxUsers < 0) {
            this.maxUsersCount = 0;
        } else {
            this.maxUsersCount = Math.floor(parsedMaxUsers);
        }

        if (this.dataSourceType === 'post_links') {
            this.features.followUsers = false;
            this.features.unfollowUsers = false;
            this.features.sendDM = false;
        }

        if (typeof this.features.unfollowUsers === 'undefined') {
            this.$set(this.features, 'unfollowUsers', false);
        }

        // 检查 postSettings 是否为有效对象
        if (typeof this.postSettings === 'string' || !this.postSettings) {
            console.error(`postSettings 异常: ${typeof this.postSettings}`, this.postSettings);
            needsReset = true;
        } else {
            if (typeof this.postSettings.enable_share === 'undefined') {
                this.$set(this.postSettings, 'enable_share', false);
            }
            if (!this.postSettings.repeat_times || this.postSettings.repeat_times < 1) {
                this.$set(this.postSettings, 'repeat_times', 1);
            }
        }

        // 检查 commentSettings 是否为有效对象
        if (typeof this.commentSettings === 'string' || !this.commentSettings) {
            console.error(`commentSettings 异常: ${typeof this.commentSettings}`, this.commentSettings);
            needsReset = true;
        } else {
            // 确保 commentSettings.chatgpt_settings 对象存在
            if (!this.commentSettings.chatgpt_settings) {
                this.$set(this.commentSettings, 'chatgpt_settings', {
                    url: 'https://api.openai.com/v1/chat/completions',
                    api_key: '',
                    model: 'gpt-3.5-turbo',
                    system_prompt: 'Generate a casual, relevant comment for this TikTok post. Keep it under 50 characters, use emojis, and make it sound natural and engaging.'
                });
            }
        }

        // 如果发现问题，尝试重置设置文件并重新加载
        if (needsReset) {
            console.warn('检测到设置异常，尝试修复...');
            await this.resetSettingsFile();
            console.log('设置已重置并重新加载');
        }
    },
    computed: {
        isUsernameSource() {
            return this.dataSourceType === 'usernames';
        },
        isPostLinkSource() {
            return this.dataSourceType === 'post_links';
        }
        ,
        helpMaxPosts() {
            return this.isPostLinkSource ? this.$t('maxPostsToProcessHelpPostLinks') : this.$t('maxPostsToProcessHelp');
        },
        helpRepeatTimes() {
            return this.isPostLinkSource ? this.$t('repeatTimesHelpPostLinks') : this.$t('repeatTimesHelp');
        },
        maxTotalLabel() {
            return this.isPostLinkSource ? this.$t('maxTotalForList') : this.$t('maxTotalPerUser');
        }
    },
    watch: {
        dataSourceType(newValue) {
            if (newValue === 'post_links') {
                if (this.features.followUsers) this.features.followUsers = false;
                if (this.features.unfollowUsers) this.features.unfollowUsers = false;
                if (this.features.sendDM) this.features.sendDM = false;
            }
        }
    },
    methods: {
        // 重置设置文件
        async resetSettingsFile() {
            try {
                // 使用默认设置重置
                const defaultSettings = {
                    dataSourceType: 'usernames',
                    targetUsernamesPath: '',
                    postLinksPath: '',
                    accessMethod: 'search',
                    maxUsersCount: 0,
                    features: {
                        followUsers: false,
                        unfollowUsers: false,
                        sendDM: false,
                        boostPosts: false,
                        massComment: false
                    },
                    followSettings: {
                        boost_type: 'follow'
                    },
                    dmSettings: {
                        message_contents: '',
                        insert_emoji: false
                    },
                    postSettings: {
                        max_posts_count: 1,
                        enable_like: false,
                        enable_favorite: false,
                        enable_repost: false,
                        enable_share: false,
                        repeat_times: 1,
                        view_durations: [5, 30]
                    },
                    commentSettings: {
                        comment_content: '',
                        insert_emoji: false,
                        comment_order: 'random',
                        generate_by_chatgpt: false,
                        chatgpt_settings: {
                            url: 'https://api.openai.com/v1/chat/completions',
                            api_key: '',
                            model: 'gpt-3.5-turbo',
                            system_prompt: 'Generate a casual, relevant comment for this TikTok post. Keep it under 50 characters, use emojis, and make it sound natural and engaging.'
                        }
                    }
                };

                await superBoostSettings.resetSettings(defaultSettings);
                console.log('设置文件已重置');
                // 重新加载设置
                await this.loadComponentSettings();
                return true;
            } catch (error) {
                console.error('重置设置文件失败:', error);
                return false;
            }
        },

        // 选择用户名文件
        async selectUsernameFile() {
            const filePath = await open({
                multiple: false,
                directory: false,
                filters: [
                    { name: 'Text Files', extensions: ['txt'] }
                ]
            });
            if (filePath) {
                this.targetUsernamesPath = filePath;
            }
        },

        async selectPostLinksFile() {
            const filePath = await open({
                multiple: false,
                directory: false,
                filters: [
                    { name: 'Text Files', extensions: ['txt'] }
                ]
            });
            if (filePath) {
                this.postLinksPath = filePath;
            }
        },

        // 测试ChatGPT连接
        async testChatGPT() {
            try {
                this.testResult = 'Testing...';
                this.testResultStyle = 'text-warning';
                const response = await this.$service.chatgpt_completion({
                    url: this.commentSettings.chatgpt_settings.url,
                    api_key: this.commentSettings.chatgpt_settings.api_key,
                    model: this.commentSettings.chatgpt_settings.model,
                    system_prompt: this.commentSettings.chatgpt_settings.system_prompt,
                    post_caption: 'This is a test post caption for TikTok.',
                });
                console.log(response);
                if (response.code == 0) {
                    this.testResult = response.data;
                    this.testResultStyle = 'text-success';
                } else {
                    this.testResult = response.data;
                    this.testResultStyle = 'text-error';
                }
            } catch (error) {
                this.testResult = 'Error: ' + error.message;
                this.testResultStyle = 'text-error';
            }
        },

        // 验证配置
        validateSettings() {
            const errors = [];

            if (!Object.values(this.features).some(feature => feature)) {
                errors.push(this.$t('selectAtLeastOneFeature'));
            }

            // 如果选择了需要用户名列表的功能，检查文件路径
            if (this.isUsernameSource && (this.features.followUsers || this.features.unfollowUsers || this.features.sendDM) && !this.targetUsernamesPath) {
                errors.push(this.$t('selectUsernameFileRequired'));
            }

            if (this.isPostLinkSource && (this.features.boostPosts || this.features.massComment) && !this.postLinksPath) {
                errors.push(this.$t('selectPostFileRequired'));
            }

            const parsedMaxUsers = Number(this.maxUsersCount);
            if (!Number.isFinite(parsedMaxUsers) || parsedMaxUsers < 0) {
                this.maxUsersCount = 0;
            } else {
                this.maxUsersCount = Math.floor(parsedMaxUsers);
            }

            if (this.features.sendDM && !this.dmSettings.message_contents.trim()) {
                errors.push(this.$t('enterMessageContent'));
            }

            if (this.features.boostPosts && (!Number.isInteger(this.postSettings.repeat_times) || this.postSettings.repeat_times < 1)) {
                this.postSettings.repeat_times = 1;
            }

            if (this.features.massComment && !this.commentSettings.generate_by_chatgpt && !this.commentSettings.comment_content.trim()) {
                errors.push(this.$t('enterCommentContent'));
            }

            return errors;
        },

        // 执行超级脚本
        async runScript(enable_multi_account = false, rotate_proxy = false) {
            const errors = this.validateSettings();
            if (errors.length > 0) {
                alert(errors.join('\n'));
                return;
            }


            // 发送到后端执行
            await this.$emiter('run_now_by_account', {
                name: 'super_boost_v2',
                args: {
                    enable_multi_account: enable_multi_account,
                    rotate_proxy: rotate_proxy,
                    min_interval: Number(this.task_interval[0]),
                    max_interval: Number(this.task_interval[1]),
                }
            });
        }
    }
}
</script>

<style scoped>
/* 移除Tailwind @apply指令，使用标准CSS */
</style>
