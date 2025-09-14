<template>
    <dialog ref="licenseMigrationDialog" class="modal">
        <div class="modal-box w-11/12 max-w-4xl">
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>

            <h3 class="font-bold text-lg mb-4">{{ $t('migrateLicense') }}</h3>

            <div class="space-y-6">
                <!-- 当前设备信息 -->
                <div class="bg-base-200 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 flex items-center gap-2">
                        <font-awesome-icon icon="fas fa-desktop" class="h-5 w-5" />
                        {{ $t('currentDevice') }}
                    </h4>
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <span class="font-medium">{{ $t('machineId') }}:</span>
                            <code class="bg-base-300 px-2 py-1 rounded text-sm">{{ currentMachineId }}</code>
                            <button @click="copyText(currentMachineId, $event)" class="btn btn-sm btn-ghost">
                                <font-awesome-icon icon="fas fa-copy" class="h-4 w-4" />
                            </button>
                        </div>
                        <div class="flex items-center gap-2"
                            v-if="licenseInfo.leftdays > 0 || licenseInfo.is_stripe_active">
                            <span class="font-medium">{{ $t('licenseStatus') }}:</span>
                            <span class="badge badge-success">{{ $t('activated') }}</span>
                        </div>
                    </div>
                </div>

                <!-- 迁移说明 -->
                <div class="alert alert-info">
                    <font-awesome-icon icon="fas fa-info-circle" class="h-5 w-5" />
                    <div>
                        <h4 class="font-bold">{{ $t('migrationInstructions') }}</h4>
                        <div class="text-sm mt-2">
                            <ul class="list-disc list-inside space-y-1">
                                <li>{{ $t('migrationStep1') }}</li>
                                <li>{{ $t('migrationStep2') }}</li>
                                <li>{{ $t('migrationStep3') }}</li>
                                <li>{{ $t('migrationStep4') }}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- 目标设备输入 -->
                <div class="form-control">
                    <label class="label">
                        <span class="label-text font-medium">{{ $t('targetMachineId') }}</span>
                        <span class="label-text-alt text-error">*</span>
                    </label>
                    <div class="input-group">
                        <input type="text" :placeholder="$t('enterTargetMachineId')" class="input input-bordered flex-1"
                            v-model="targetMachineId" :class="{ 'input-error': showError && !targetMachineId }" />
                        <button @click="validateMachineId" class="btn btn-primary"
                            :disabled="!targetMachineId || isValidating">
                            <span v-if="isValidating" class="loading loading-spinner loading-sm"></span>
                            <font-awesome-icon v-else icon="fas fa-search" class="h-4 w-4" />
                            {{ $t('validate') }}
                        </button>
                    </div>
                    <label class="label" v-if="showError && !targetMachineId">
                        <span class="label-text-alt text-error">{{ $t('pleaseEnterTargetMachineId') }}</span>
                    </label>
                    <label class="label" v-if="machineIdValidationResult">
                        <span class="label-text-alt"
                            :class="machineIdValidationResult.valid ? 'text-success' : 'text-error'">
                            {{ machineIdValidationResult.message }}
                        </span>
                    </label>
                </div>

                <!-- 许可证详细信息 -->
                <div v-if="machineIdValidationResult && machineIdValidationResult.valid && machineIdValidationResult.licenseInfo"
                    class="bg-info/10 border border-info rounded-lg p-4">
                    <h4 class="font-semibold text-info mb-2">{{ $t('licenseDetails') }}</h4>
                    <div class="space-y-1 text-sm">
                        <div class="flex justify-between">
                            <span>{{ $t('licenseCode') }}:</span>
                            <code class="text-xs">{{ machineIdValidationResult.licenseInfo.license_code }}</code>
                        </div>
                        <div class="flex justify-between"
                            v-if="!machineIdValidationResult.licenseInfo.is_stripe_active">
                            <span>{{ $t('daysRemaining') }}:</span>
                            <span class="font-medium">{{ machineIdValidationResult.licenseInfo.days_remaining }} {{
                                $t('days') }}</span>
                        </div>
                        <div class="flex justify-between" v-if="machineIdValidationResult.licenseInfo.is_stripe_active">
                            <span>{{ $t('subscriptionType') }}:</span>
                            <span class="badge badge-success badge-sm">{{ $t('stripeSubscription') }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>{{ $t('application') }}:</span>
                            <span>{{ machineIdValidationResult.licenseInfo.app }}</span>
                        </div>
                    </div>
                </div>

                <!-- 确认信息 -->
                <div v-if="machineIdValidationResult && machineIdValidationResult.valid"
                    class="bg-warning/10 border border-warning rounded-lg p-4">
                    <h4 class="font-semibold text-warning mb-2 flex items-center gap-2">
                        <font-awesome-icon icon="fas fa-exclamation-triangle" class="h-5 w-5" />
                        {{ $t('migrationWarning') }}
                    </h4>
                    <div class="space-y-2 text-sm">
                        <p>{{ $t('migrationWarningText1') }}</p>
                        <p>{{ $t('migrationWarningText2') }}</p>
                    </div>

                    <!-- 确认复选框 -->
                    <div class="form-control mt-4">
                        <label class="cursor-pointer label justify-start gap-3">
                            <input type="checkbox" v-model="confirmMigration" class="checkbox checkbox-warning" />
                            <span class="label-text">{{ $t('confirmMigrationText') }}</span>
                        </label>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="flex justify-end gap-3 pt-4">
                    <button @click="close" class="btn btn-ghost" :disabled="isMigrating">
                        {{ $t('cancel') }}
                    </button>
                    <button @click="migrateLicense" class="btn btn-warning" :disabled="!canMigrate || isMigrating">
                        <span v-if="isMigrating" class="loading loading-spinner loading-sm"></span>
                        <font-awesome-icon v-else icon="fas fa-exchange-alt" class="h-4 w-4" />
                        {{ isMigrating ? $t('migrating') : $t('migrateLicense') }}
                    </button>
                </div>
            </div>
        </div>

        <!-- 点击背景关闭 -->
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script>
import { writeText } from '@tauri-apps/api/clipboard';
import { message, confirm } from '@tauri-apps/api/dialog';

export default {
    name: 'LicenseMigrationDialog',
    props: {
        licenseInfo: {
            type: Object,
            required: true
        }
    },

    data() {
        return {
            targetMachineId: '',
            currentMachineId: '',
            showError: false,
            isValidating: false,
            isMigrating: false,
            confirmMigration: false,
            machineIdValidationResult: null
        };
    },

    computed: {
        canMigrate() {
            return this.targetMachineId &&
                this.machineIdValidationResult &&
                this.machineIdValidationResult.valid &&
                this.confirmMigration &&
                !this.isMigrating;
        }
    },

    methods: {
        async show() {
            // 重置状态
            this.targetMachineId = '';
            this.showError = false;
            this.confirmMigration = false;
            this.machineIdValidationResult = null;

            // 获取当前机器ID
            this.currentMachineId = this.licenseInfo.mid || '';

            this.$refs.licenseMigrationDialog.showModal();
        },

        close() {
            this.$refs.licenseMigrationDialog.close();
        },

        async copyText(text, event) {
            try {
                await writeText(text);
                await this.$emiter('NOTIFY', {
                    type: 'success',
                    message: this.$t('copied'),
                    timeout: 2000
                });
            } catch (error) {
                await this.$emiter('NOTIFY', {
                    type: 'error',
                    message: this.$t('copyFailed'),
                    timeout: 2000
                });
            }
        },

        async validateMachineId() {
            if (!this.targetMachineId.trim()) {
                this.showError = true;
                return;
            }

            // 检查是否与当前机器ID相同
            if (this.targetMachineId === this.currentMachineId) {
                this.machineIdValidationResult = {
                    valid: false,
                    message: this.$t('cannotMigrateToSameMachine')
                };
                return;
            }

            // 基本格式验证
            if (this.targetMachineId.length < 10) {
                this.machineIdValidationResult = {
                    valid: false,
                    message: this.$t('targetMachineIdTooShort')
                };
                return;
            }

            this.isValidating = true;
            this.machineIdValidationResult = null;

            try {
                // 调用后端API验证目标机器ID和当前许可证
                const response = await this.$service.validate_license_migration({
                    current_machine_id: this.currentMachineId,
                    target_machine_id: this.targetMachineId
                });

                if (response.code === 0) {
                    const result = JSON.parse(response.data);
                    this.machineIdValidationResult = {
                        valid: result.valid,
                        message: result.valid
                            ? this.$t('migrationValidationSuccess')
                            : result.message || this.$t('migrationValidationFailed'),
                        licenseInfo: result.license_info // 保存许可证详细信息
                    };
                } else {
                    this.machineIdValidationResult = {
                        valid: false,
                        message: response.data || this.$t('validateMachineIdFailed')
                    };
                }

            } catch (error) {
                console.error('Validate machine ID error:', error);
                this.machineIdValidationResult = {
                    valid: false,
                    message: this.$t('validateMachineIdFailed')
                };
            } finally {
                this.isValidating = false;
            }
        },

        async migrateLicense() {
            if (!this.canMigrate) {
                return;
            }

            // 最终确认
            const confirmed = await confirm(
                this.$t('finalMigrationConfirm', {
                    from: this.currentMachineId,
                    to: this.targetMachineId
                }),
                this.$t('confirmAction')
            );

            if (!confirmed) {
                return;
            }

            this.isMigrating = true;

            try {
                // TODO: 调用后端API进行license迁移
                // 注意: 这里需要后端实现 migrate_license API接口
                // API需要接收当前机器ID和目标机器ID参数
                const response = await this.$service.migrate_license({
                    current_machine_id: this.currentMachineId,
                    target_machine_id: this.targetMachineId
                });

                if (response.code === 0) {
                    await message(this.$t('migrationSuccess'));
                    this.close();

                    // 重新加载license信息
                    await this.$emiter('LICENSE', { reload: true });

                    // 通知父组件迁移完成
                    this.$emit('migrationCompleted');

                } else {
                    await message(this.$t('migrationFailed') + ': ' + response.data);
                }

            } catch (error) {
                console.error('Migration error:', error);
                await message(this.$t('migrationError'));
            } finally {
                this.isMigrating = false;
            }
        }
    },

    watch: {
        targetMachineId() {
            // 清除之前的验证结果
            this.machineIdValidationResult = null;
            this.confirmMigration = false;
            this.showError = false;
        }
    }
};
</script>

<style scoped>
.input-group {
    display: flex;
}

.input-group .input {
    border-radius: 0.5rem 0 0 0.5rem;
}

.input-group .btn {
    border-radius: 0 0.5rem 0.5rem 0;
}
</style>