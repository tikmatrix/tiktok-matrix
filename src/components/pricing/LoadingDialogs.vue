<template>
    <div>
        <!-- 隐私协议提醒对话框 -->
        <dialog ref="agreePolicyDialog" class="modal">
            <div class="modal-box max-w-md bg-gradient-to-br from-warning/10 to-error/10 border border-warning/20">
                <form method="dialog">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4">✕</button>
                </form>
                <div class="text-center">
                    <div class="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <font-awesome-icon icon="fas fa-exclamation-triangle" class="text-warning text-2xl" />
                    </div>
                    <h3 class="font-bold text-xl text-warning mb-4">{{ $t('tips') }}</h3>
                    <p class="text-base-content/80 mb-6 leading-relaxed">{{ $t('pleaseAgree') }}</p>
                    <div class="modal-action justify-center">
                        <form method="dialog">
                            <button
                                class="btn btn-warning btn-wide hover:btn-warning-focus transition-all duration-200">
                                <font-awesome-icon icon="fas fa-check" class="mr-2" />
                                {{ $t('confirm') }}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button></button>
            </form>
        </dialog>

        <!-- 创建订单加载对话框 -->
        <dialog ref="createOrderLoadingDialog" class="modal">
            <div class="modal-box max-w-sm bg-gradient-to-br from-primary/10 to-secondary/10">
                <div class="text-center">
                    <div class="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                    <h3 class="font-bold text-xl text-primary mb-4">{{ $t('creatingOrder') }}</h3>
                    <p class="text-base-content/70 mb-6">{{ $t('pleaseWait') }}...</p>
                    <div class="modal-action justify-center">
                        <form method="dialog">
                            <button
                                class="btn btn-primary btn-wide hover:btn-primary-focus transition-all duration-200">
                                {{ $t('confirm') }}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </dialog>

        <!-- 管理订阅加载对话框 -->
        <dialog ref="manageSubscriptionLoadingDialog" class="modal">
            <div class="modal-box max-w-sm bg-gradient-to-br from-success/10 to-info/10">
                <div class="text-center">
                    <div class="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="loading loading-dots loading-lg text-success"></span>
                    </div>
                    <h3 class="font-bold text-xl text-success mb-4">{{ $t('loadingManagingSubscription') }}</h3>
                    <p class="text-base-content/70 mb-6">{{ $t('redirectingToStripe') }}...</p>
                    <div class="modal-action justify-center">
                        <form method="dialog">
                            <button
                                class="btn btn-success btn-wide hover:btn-success-focus transition-all duration-200">
                                {{ $t('confirm') }}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </dialog>
    </div>
</template>

<script>
export default {
    name: 'LoadingDialogs',
    methods: {
        showAgreePolicyDialog() {
            this.$refs.agreePolicyDialog.showModal();
        },
        showCreateOrderLoadingDialog() {
            this.$refs.createOrderLoadingDialog.showModal();
        },
        closeCreateOrderLoadingDialog() {
            this.$refs.createOrderLoadingDialog.close();
        },
        showManageSubscriptionLoadingDialog() {
            this.$refs.manageSubscriptionLoadingDialog.showModal();
        },
        closeManageSubscriptionLoadingDialog() {
            this.$refs.manageSubscriptionLoadingDialog.close();
        }
    }
}
</script>