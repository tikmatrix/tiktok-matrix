<template>
    <!--status-->
    <div class="flex flex-wrap">
        <div class="w-1/4 text-center">
            <div class="badge badge-neutral">
                <font-awesome-icon icon="clock" class="h-3 w-3 mr-1" />{{ waiting_count }}
            </div>

        </div>
        <div class="w-1/4 text-center">
            <div class="badge badge-accent">
                <font-awesome-icon icon="spinner" class="h-3 w-3 mr-1 fa-spin" />
                {{ running_count }}

            </div>
        </div>
        <div class="w-1/4 text-center">
            <div class="badge badge-primary">
                <font-awesome-icon icon="check" class="h-3 w-3 mr-1" />
                {{ success_count }}
            </div>

        </div>
        <div class="w-1/4 text-center">
            <div class="badge badge-secondary">
                <font-awesome-icon icon="times" class="h-3 w-3 mr-1" />
                {{ failed_count }}
            </div>
        </div>
        <button
            class="btn btn-sm bg-green-500 hover:bg-green-300 border-0 text-white text-xs block font-normal mt-1 ml-1 mb-1 min-w-max"
            @click="$emitter.emit('menuSelected', { name: 'tasks' })">
            <font-awesome-icon icon="random" class="h-3 w-3 mr-1" />{{ $t('tasks') }}
        </button>

        <button
            class="btn btn-sm bg-green-500 hover:bg-green-300 border-0 text-white text-xs block font-normal mt-1 ml-1 mb-1 min-w-max"
            @click="$emitter.emit('stop_task')">
            <font-awesome-icon icon="fa fa-stop" class="h-3 w-3 mr-1 text-pink-500" />{{ $t('stopTask') }}
        </button>
    </div>


</template>
<script>
export default {
    name: 'Tools',
    props: ['settings'],
    data() {
        return {
            waiting_count: 0,
            running_count: 0,
            success_count: 0,
            failed_count: 0,
        }
    },
    methods: {
        countTasks() {
            this.$service.count_task_by_status().then((res) => {
                for (let item of res.data) {
                    if (item.status == 0) {
                        this.waiting_count = item.count;
                    } else if (item.status == 1) {
                        this.running_count = item.count;
                    } else if (item.status == 2) {
                        this.success_count = item.count;
                    } else if (item.status == 3) {
                        this.failed_count = item.count;
                    }
                }
            });

        }

    },
    mounted() {
        this.countTasks();
        setInterval(this.countTasks, 10000);
        this.$emitter.on('reload_tasks', async () => {
            this.countTasks();
        });
    }
}
</script>