<template>
    <!--status-->
    <div class="flex flex-wrap">
        <div class="w-1/5 text-center tooltip ml-2" :data-tip="$t('waitingTasks')">
            <div class="bg-warning font-bold text-md flex justify-center items-center rounded-3xl ring-1">
                <font-awesome-icon icon="clock" class="h-3 w-3 mr-1" />
                <Countup :end="taskCounts[0] || 0" :options="{ duration: 3 }" />
            </div>
        </div>
        <div class="w-1/5 text-center tooltip ml-2" :data-tip="$t('runningTasks')">
            <div class="bg-info font-bold text-md flex justify-center items-center rounded-3xl ring-1">
                <font-awesome-icon icon="spinner" class="h-3 w-3 mr-1" />
                <Countup :end="taskCounts[1] || 0" :options="{ duration: 3 }" />
            </div>
        </div>
        <div class="w-1/5 text-center tooltip ml-2" :data-tip="$t('successTasks')">
            <div class="bg-success font-bold text-md flex justify-center items-center rounded-3xl ring-1">
                <font-awesome-icon icon="check" class="h-3 w-3 mr-1" />
                <Countup :end="taskCounts[2] || 0" :options="{ duration: 3 }" />
            </div>
        </div>
        <div class="w-1/5 text-center tooltip ml-2" :data-tip="$t('failedTasks')">
            <div class="bg-error font-bold text-md flex justify-center items-center rounded-3xl ring-1">
                <font-awesome-icon icon="times" class="h-4 w-4 mr-1" />
                <Countup :end="taskCounts[3] || 0" :options="{ duration: 3 }" />
            </div>
        </div>
        <button class="btn btn-md btn-primary mt-1 mb-1" @click="$emiter('showDialog', { name: 'tasks' })">
            <font-awesome-icon icon="random" class="h-3 w-3" />{{ $t('tasks') }}
        </button>

        <button class="btn btn-md btn-primary mt-1 ml-1 mb-1" @click="$emiter('stop_task')">
            <font-awesome-icon icon="fa fa-stop" class="h-3 w-3 text-error" />{{ $t('stopTask') }}
        </button>
        <fieldset
            class="fieldset p-1 bg-base-100 border border-base-300 rounded-box text-center align-middle flex flex-row items-center">
            <label class="fieldset-label">
                {{ $t('autoRetry') }}:
                <input type="checkbox" checked="checked" class="toggle toggle-primary" v-model="autoRetry" />
            </label>
        </fieldset>
        <a class="link link-primary flex items-start gap-2 text-md leading-snug max-w-full md:max-w-md whitespace-normal break-words"
            :href="whitelabelConfig.officialWebsite + '/docs/troubleshooting/task_failed'" target="_blank">
            <font-awesome-icon icon="fas fa-question-circle" class="h-5 w-5 shrink-0" />
            <span class="text-left">{{ $t('taskFailedTip') }}</span>
        </a>
    </div>


</template>
<script>
import Countup from './Countup.vue'
import { getWhiteLabelConfig, cloneDefaultWhiteLabelConfig } from '../config/whitelabel.js';
import { getItem, setItem } from '@/utils/persistentStorage.js';
export default {
    name: 'Tasks',
    props: ['settings'],
    components: {
        Countup
    },
    data() {
        return {
            whitelabelConfig: cloneDefaultWhiteLabelConfig(),
            taskCounts: {},
            autoRetry: false,
            isCountingTasks: false
        }
    },
    watch: {
        autoRetry: {
            handler: async function (val) {
                await this.$emiter('NOTIFY', {
                    type: 'success',
                    message: `${this.$t('autoRetry')}: ${val ? this.$t('enabled') : this.$t('disabled')}`,
                    timeout: 2000
                });
                await setItem('autoRetry', val ? 'true' : 'false');
                if (val) {
                    this.countTasks();
                }
            },
            immediate: true
        }
    },
    async created() {
        const [config, storedAutoRetry] = await Promise.all([
            getWhiteLabelConfig(),
            getItem('autoRetry')
        ]);

        if (config) {
            this.whitelabelConfig = config;
        }
        if (storedAutoRetry !== null) {
            this.autoRetry = storedAutoRetry === 'true';
        }
    },
    methods: {
        countTasks() {
            // 如果正在执行,则忽略新的请求
            if (this.isCountingTasks) {
                console.log('countTasks is already running, skipping...');
                return;
            }

            this.isCountingTasks = true;
            this.$service.count_task_by_status().then((res) => {
                const counts = {};
                let needRetryAll = false;
                for (let item of res.data) {
                    counts[item.status] = item.count;
                    if (this.autoRetry && item.status === 3 && item.count > 0) {
                        needRetryAll = true;
                    }
                }
                this.taskCounts = counts;
                if (needRetryAll) {
                    this.$service
                        .retry_all_failed_tasks()
                        .then(() => {
                            console.log('retry_all_failed_tasks');
                            this.countTasks();
                        })
                        .finally(() => {
                            this.isCountingTasks = false;
                        });
                } else {
                    this.isCountingTasks = false;
                }
            }).catch((error) => {
                console.error('countTasks error:', error);
                this.isCountingTasks = false;
            });
        }
    },
    async mounted() {
        this.countTasks();
        await this.$listen('reload_tasks', async (e) => {
            this.countTasks();
        });
    }
}
</script>
