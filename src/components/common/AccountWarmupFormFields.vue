<template>
    <div>
        <!-- 观看时长 -->
        <div class="flex w-full items-center gap-2 mb-2">
            <label class="font-bold w-40">{{ $t('viewDuration') }}:</label>
            <VueSlider v-model="localFormData.view_duration" :width="300" :min="10" :max="180"
                :marks="{ 10: '10' + $t('second'), 90: '90' + $t('second'), 180: '180' + $t('second') }" />

            <div role="alert" class="alert w-96 ml-8">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    class="stroke-info shrink-0 w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>{{ $t('viewDurationTips') }}</span>
            </div>
        </div>

        <!-- 任务时长 -->
        <div class="flex w-full items-center gap-2 mb-8">
            <label class="font-bold w-40">{{ $t('taskDuration') }}:</label>
            <VueSlider v-model="localFormData.taskDurationInMinutes" :width="700" :min="5" :max="60" :marks="{
                5: '5' + $t('minute'),
                10: '10' + $t('minute'),
                20: '20' + $t('minute'),
                30: '30' + $t('minute'),
                40: '40' + $t('minute'),
                50: '50' + $t('minute'),
                60: '60' + $t('minute')
            }" />
        </div>

        <!-- 话题 -->
        <div class="flex w-full items-center gap-2 mb-2">
            <label class="font-bold w-40">{{ $t('topics') }}:</label>
            <textarea class="textarea textarea-success w-full" :placeholder="$t('topicsTips')" autocomplete="off"
                v-model="localFormData.topic"> </textarea>
        </div>

        <!-- 评论设置 -->
        <div class="flex w-full items-center gap-2 mb-2">
            <label class="font-bold w-40">{{ $t('comments') }}:</label>
            <div class="flex flex-col w-full gap-2">
                <div class="flex flex-row items-center gap-2">
                    <label class="font-bold">{{ $t('generateByChatGPT') }}:</label>
                    <input type="checkbox" class="toggle toggle-accent" v-model="localFormData.generate_by_chatgpt" />
                </div>
                <div v-if="localFormData.generate_by_chatgpt" class="flex flex-col gap-2">
                    <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
                        <legend class="fieldset-legend">{{ $t('chatgptSettings') }}</legend>

                        <label class="label">{{ $t('url') }}</label>
                        <input type="text" class="input w-full" placeholder="https://api.openai.com/v1/chat/completions"
                            v-model="localFormData.chatgpt_settings.url" />

                        <label class="label">{{ $t('apiKey') }}</label>
                        <input type="password" class="input w-full" placeholder="sk-********"
                            v-model="localFormData.chatgpt_settings.api_key" />

                        <label class="label">{{ $t('model') }}</label>
                        <input type="text" class="input" placeholder="gpt-3.5-turbo"
                            v-model="localFormData.chatgpt_settings.model" />
                        <label class="label">{{ $t('systemPrompt') }}</label>
                        <textarea class="textarea textarea-success w-full" :placeholder="$t('systemPromptTips')"
                            autocomplete="off" v-model="localFormData.chatgpt_settings.system_prompt"> </textarea>
                    </fieldset>
                    <button class="btn btn-primary" @click="testChatGPT">Test ChatGPT</button>
                    <span :class="testResultStyle">{{ testResult }}</span>

                </div>
                <div class="flex flex-col gap-2 relative" v-else>
                    <textarea class="textarea textarea-success w-full" :placeholder="$t('commentsTips')"
                        autocomplete="off" v-model="localFormData.comment"> </textarea>
                    <div class="flex flex-row items-center gap-2 absolute top-2 right-4">
                        <label class="font-bold">{{ $t('insertEmoji') }}:</label>
                        <input type="checkbox" class="toggle toggle-accent" v-model="localFormData.insert_emoji"
                            title="😃, 😄, 😁, 😆, 😅, 😂, 🤣, 😊, 😇, 🙂, 🙃, 😉, 😋, 😛, 😝, 😜, 🤪, 😎, 🤩, 🥳, 😏, 🤗, 🤠, 😍, 😘, 😚, 😙, 😗, 🥰, 🤤, 😻, 😽, 💖, 💗, 💓, 💞, 💕, 💟, ❣️, 💌, 🌟, ✨, 💫, 🎉, 🎊, 🎁, 🎈, 🍾, 🥂, 🍻" />
                    </div>
                    <div class="flex flex-row items-center absolute top-8 right-4">
                        <label class="font-bold">{{ $t('commentOrder') }}:</label>
                        <div class="flex items-center">
                            <label class="flex items-center gap-1 cursor-pointer">
                                <input type="radio" name="commentOrder" value="random"
                                    class="radio radio-sm radio-primary" v-model="localFormData.comment_order" />
                                <span>{{ $t('random') }}</span>
                            </label>
                            <label class="flex items-center gap-1 cursor-pointer">
                                <input type="radio" name="commentOrder" value="sequential"
                                    class="radio radio-sm radio-primary" v-model="localFormData.comment_order" />
                                <span>{{ $t('sequential') }}</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 互动设置 -->
        <div class="flex w-full items-center gap-2 mb-2">
            <label class="font-bold w-40">{{ $t('interact') }}:</label>
            <div class="flex flex-wrap gap-8">
                <!-- 关注概率滑块 -->
                <div class="flex flex-col">
                    <div class="flex justify-between items-center mb-1">
                        <label class="text-md">{{ $t('follow') }}: </label>
                        <span class="text-md font-medium">{{ localFormData.floow_probable }}%</span>
                    </div>
                    <VueSlider v-model="localFormData.floow_probable" :width="100" :min="0" :max="100"
                        :marks="{ 0: '0%', 50: '50%', 100: '100%' }" />
                </div>

                <!-- 点赞概率滑块 -->
                <div class="flex flex-col">
                    <div class="flex justify-between items-center mb-1">
                        <label class="text-md">{{ $t('like') }}: </label>
                        <span class="text-md font-medium">{{ localFormData.like_probable }}%</span>
                    </div>
                    <VueSlider v-model="localFormData.like_probable" :width="100" :min="0" :max="100"
                        :marks="{ 0: '0%', 50: '50%', 100: '100%' }" />
                </div>

                <!-- 收藏概率滑块 -->
                <div class="flex flex-col">
                    <div class="flex justify-between items-center mb-1">
                        <label class="text-md">{{ $t('favorite') }}: </label>
                        <span class="text-md font-medium">{{ localFormData.collect_probable }}%</span>
                    </div>
                    <VueSlider v-model="localFormData.collect_probable" :width="100" :min="0" :max="100"
                        :marks="{ 0: '0%', 50: '50%', 100: '100%' }" />
                </div>

                <!-- 评论概率滑块 -->
                <div class="flex flex-col">
                    <div class="flex justify-between items-center mb-1">
                        <label class="text-md">{{ $t('comment') }}: </label>
                        <span class="text-md font-medium">{{ localFormData.comment_probable }}%</span>
                    </div>
                    <VueSlider v-model="localFormData.comment_probable" :width="100" :min="0" :max="100"
                        :marks="{ 0: '0%', 50: '50%', 100: '100%' }" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import VueSlider from "vue-3-slider-component";

export default {
    name: 'AccountWarmupFormFields',
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
            testResult: '',
            testResultStyle: 'text-gray-500',
        }
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
        async testChatGPT() {
            try {
                this.testResult = 'Testing...';
                this.testResultStyle = 'text-warning';
                const response = await this.$service.chatgpt_completion({
                    url: this.localFormData.chatgpt_settings.url,
                    api_key: this.localFormData.chatgpt_settings.api_key,
                    model: this.localFormData.chatgpt_settings.model,
                    system_prompt: this.localFormData.chatgpt_settings.system_prompt,
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
    },
}
</script>

<style scoped></style>
