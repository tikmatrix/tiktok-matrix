<template>
    <!--status-->
    <div class="flex flex-wrap">
        <div class="w-1/4 text-center tooltip" :data-tip="$t('waitingTasks')">
            <div class="badge badge-neutral">
                <font-awesome-icon icon="clock" class="h-3 w-3 mr-1" />
                <Countup :end="taskCounts[0] || 0" :options="{ duration: 3 }" />
            </div>

        </div>
        <div class="w-1/4 text-center tooltip" :data-tip="$t('runningTasks')">
            <div class="badge badge-accent">
                <font-awesome-icon icon="spinner" class="h-3 w-3 mr-1 fa-spin" />
                <Countup :end="taskCounts[1] || 0" :options="{ duration: 3 }" />

            </div>
        </div>
        <div class="w-1/4 text-center tooltip" :data-tip="$t('successTasks')">
            <div class="badge badge-primary">
                <font-awesome-icon icon="check" class="h-3 w-3 mr-1" />
                <Countup :end="taskCounts[2] || 0" :options="{ duration: 3 }" />
            </div>

        </div>
        <div class="w-1/4 text-center tooltip" :data-tip="$t('failedTasks')">
            <div class="badge badge-secondary">
                <font-awesome-icon icon="times" class="h-3 w-3 mr-1" />
                <Countup :end="taskCounts[3] || 0" :options="{ duration: 3 }" />
            </div>
        </div>
        <button
            class="btn btn-sm bg-green-500 hover:bg-green-300 border-0 text-white text-xs block font-normal mt-1 ml-1 mb-1 min-w-max"
            @click="$emiter('menuSelected', { name: 'tasks' })">
            <font-awesome-icon icon="random" class="h-3 w-3 mr-1" />{{ $t('tasks') }}
        </button>

        <button
            class="btn btn-sm bg-green-500 hover:bg-green-300 border-0 text-white text-xs block font-normal mt-1 ml-1 mb-1 min-w-max"
            @click="$emiter('stop_task')">
            <font-awesome-icon icon="fa fa-stop" class="h-3 w-3 mr-1 text-pink-500" />{{ $t('stopTask') }}
        </button>
    </div>


</template>
<script>
import Countup from './Countup.vue'
export default {
    name: 'Tools',
    props: ['settings'],
    components: {
        Countup
    },
    data() {
        return {
            taskCounts: {},
        }
    },
    methods: {
        countTasks() {
            this.$service.count_task_by_status().then((res) => {
                const counts = {};
                for (let item of res.data) {
                    counts[item.status] = item.count;
                }
                this.taskCounts = counts;
            });

        }

    },
    async mounted() {
        this.countTasks();
        setInterval(this.countTasks, 10000);
        await this.$listen('reload_tasks', async (e) => {
            this.countTasks();
        });
    }
}
</script>