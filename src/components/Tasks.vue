<template>
    <!--status-->
    <div class="flex flex-wrap">
        <div class="w-1/5 text-center tooltip ml-2" :data-tip="$t('waitingTasks')">
            <div class="bg-warning font-bold text-lg flex justify-center items-center rounded-3xl ring-1">
                <font-awesome-icon icon="clock" class="h-3 w-3 mr-1" />
                <Countup :end="taskCounts[0] || 0" :options="{ duration: 3 }" />
            </div>
        </div>
        <div class="w-1/5 text-center tooltip ml-2" :data-tip="$t('runningTasks')">
            <div class="bg-info font-bold text-lg flex justify-center items-center rounded-3xl ring-1">
                <font-awesome-icon icon="spinner" class="h-3 w-3 mr-1" />
                <Countup :end="taskCounts[1] || 0" :options="{ duration: 3 }" />
            </div>
        </div>
        <div class="w-1/5 text-center tooltip ml-2" :data-tip="$t('successTasks')">
            <div class="bg-success font-bold text-lg flex justify-center items-center rounded-3xl ring-1">
                <font-awesome-icon icon="check" class="h-3 w-3 mr-1" />
                <Countup :end="taskCounts[2] || 0" :options="{ duration: 3 }" />
            </div>
        </div>
        <div class="w-1/5 text-center tooltip ml-2" :data-tip="$t('failedTasks')">
            <div class="bg-error font-bold text-lg flex justify-center items-center rounded-3xl ring-1">
                <font-awesome-icon icon="times" class="h-4 w-4 mr-1" />
                <Countup :end="taskCounts[3] || 0" :options="{ duration: 3 }" />
            </div>
        </div>
        <button class="btn btn-sm btn-secondary mt-1 mb-1" @click="$emiter('menuSelected', { name: 'tasks' })">
            <font-awesome-icon icon="random" class="h-3 w-3" />{{ $t('tasks') }}
        </button>

        <button class="btn btn-sm btn-secondary mt-1 ml-1 mb-1" @click="$emiter('stop_task')">
            <font-awesome-icon icon="fa fa-stop" class="h-3 w-3 text-error" />{{ $t('stopTask') }}
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
        await this.$listen('reload_tasks', async (e) => {
            console.log('reload_tasks');
            this.countTasks();
        });
    }
}
</script>