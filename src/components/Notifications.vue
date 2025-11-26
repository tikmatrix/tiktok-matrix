<template>
    <div class="fixed top-0 left-1/2 -translate-x-1/2 z-9999 pointer-events-none">
        <div class="notification-container">
            <transition name="notification" mode="out-in">
                <div v-if="currentNotification" :key="currentNotification.id"
                    class="notification-item shadow-xl rounded-lg p-2 max-w-xxl flex items-center pointer-events-auto"
                    :class="notificationClass(currentNotification.type)">
                    <div class="shrink-0 mr-3">
                        <font-awesome-icon :icon="notificationIcon(currentNotification.type)" class="text-lg" />
                    </div>
                    <div class="flex-1 overflow-hidden">
                        <p class="whitespace-nowrap overflow-hidden text-ellipsis font-medium">{{
                            formatMessage(currentNotification.message) }}</p>
                    </div>
                    <button @click="removeNotification(currentNotification.id)"
                        class="ml-3 opacity-70 hover:opacity-100 transition-opacity">
                        <font-awesome-icon icon="fa-solid fa-times" class="text-md" />
                    </button>
                </div>
            </transition>
        </div>
    </div>
</template>

<script>

export default {
    name: 'Notifications',
    data() {
        return {
            notificationQueue: [],
            currentNotification: null,
            nextId: 1,
            isProcessing: false
        }
    },
    methods: {
        notificationClass(type) {
            switch (type) {
                case 'success': return 'bg-green-500 text-white';
                case 'error': return 'bg-red-500 text-white';
                case 'warning': return 'bg-orange-500 text-white';
                case 'info':
                default: return 'bg-blue-500 text-white';
            }
        },
        notificationIcon(type) {
            switch (type) {
                case 'success': return 'fa-solid fa-check-circle';
                case 'error': return 'fa-solid fa-exclamation-circle';
                case 'warning': return 'fa-solid fa-exclamation-triangle';
                case 'info':
                default: return 'fa-solid fa-info-circle';
            }
        },
        formatMessage(message) {
            // 将所有换行符替换为空格,强制单行显示
            if (!message) return '';
            return message.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
        },
        addNotification(notification) {
            const id = this.nextId++;
            const newNotification = {
                id,
                ...notification,
                timeout: notification.timeout || 3000
            };

            this.notificationQueue.push(newNotification);
            this.processQueue();
        },
        async processQueue() {
            if (this.isProcessing || this.notificationQueue.length === 0) {
                return;
            }

            this.isProcessing = true;

            while (this.notificationQueue.length > 0) {
                this.currentNotification = this.notificationQueue.shift();

                await new Promise(resolve => {
                    this.currentNotification.timer = setTimeout(() => {
                        resolve();
                    }, this.currentNotification.timeout);
                });

                this.currentNotification = null;

                // 等待动画完成
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            this.isProcessing = false;
        },
        removeNotification(id) {
            if (this.currentNotification && this.currentNotification.id === id) {
                if (this.currentNotification.timer) {
                    clearTimeout(this.currentNotification.timer);
                }
                this.currentNotification = null;

                // 继续处理队列
                setTimeout(() => {
                    this.isProcessing = false;
                    this.processQueue();
                }, 300);
            } else {
                // 从队列中移除
                this.notificationQueue = this.notificationQueue.filter(n => n.id !== id);
            }
        }
    },
    async mounted() {
        await this.$listen('NOTIFY', (event) => {
            this.addNotification(event.payload);
        });
    }
}
</script>

<style scoped>
.notification-container {
    min-height: 0;
    padding-top: 0.5rem;
}

.notification-item {
    transition: all 0.3s ease-out;
    transform-origin: top center;
    backdrop-filter: blur(8px);
}

.notification-enter-active {
    transition: all 0.3s ease-out;
}

.notification-leave-active {
    transition: all 0.3s ease-in;
}

.notification-enter-from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
}

.notification-enter-to {
    opacity: 1;
    transform: translateY(0) scale(1);
}

.notification-leave-from {
    opacity: 1;
    transform: translateY(0) scale(1);
}

.notification-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
}
</style>