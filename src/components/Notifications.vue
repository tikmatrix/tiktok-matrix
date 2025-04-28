<template>
    <div class="fixed top-14 right-4 z-[9999] space-y-2">
        <transition-group name="notification">
            <div v-for="notification in notifications" :key="notification.id"
                class="bg-base-100 shadow-lg rounded-lg p-3 max-w-md flex items-start"
                :class="notificationClass(notification.type)">
                <div class="flex-shrink-0 mr-3">
                    <font-awesome-icon :icon="notificationIcon(notification.type)" class="text-lg" />
                </div>
                <div class="flex-1">
                    <p>{{ notification.message }}</p>
                </div>
                <button @click="removeNotification(notification.id)"
                    class="ml-2 text-base-content/50 hover:text-base-content">
                    <font-awesome-icon icon="fa-solid fa-times" />
                </button>
            </div>
        </transition-group>
    </div>
</template>

<script>

export default {
    name: 'Notifications',
    data() {
        return {
            notifications: [],
            nextId: 1
        }
    },
    methods: {
        notificationClass(type) {
            switch (type) {
                case 'success': return 'border-l-4 border-success';
                case 'error': return 'border-l-4 border-error';
                case 'warning': return 'border-l-4 border-warning';
                case 'info':
                default: return 'border-l-4 border-info';
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
        addNotification(notification) {
            const id = this.nextId++;
            this.notifications.push({
                id,
                ...notification,
                timeout: notification.timeout || 3000
            });

            setTimeout(() => {
                this.removeNotification(id);
            }, notification.timeout || 3000);
        },
        removeNotification(id) {
            this.notifications = this.notifications.filter(n => n.id !== id);
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
.notification-enter-active,
.notification-leave-active {
    transition: all 0.3s ease;
}

.notification-enter-from {
    opacity: 0;
    transform: translateX(30px);
}

.notification-leave-to {
    opacity: 0;
    transform: translateX(30px);
}
</style>