// 许可证相关的业务逻辑混入
import { message } from '@tauri-apps/api/dialog';
import confetti from 'canvas-confetti';
import Bluebird from 'bluebird';

confetti.Promise = Bluebird;

export default {
    methods: {
        async activate(event) {
            event.target.innerText = this.$t('activating');
            event.target.disabled = true;

            try {
                const res = await this.$service.activate_license({
                    'license_code': this.license.license_code,
                });

                console.log(`activate_license: ${JSON.stringify(res)}`);

                if (res.code === 0) {
                    const license = JSON.parse(res.data);
                    if (license.leftdays > 0) {
                        await this.$emiter('LICENSE', { reload: true });
                        this.paymentSuccess();
                        await message(this.$t('activateSuccess'));
                    } else {
                        await message(this.$t('invalidLicense'));
                    }
                } else {
                    await message(res.data);
                }
            } catch (err) {
                console.error('activate license error:', err);
                await this.$emiter('NOTIFY', {
                    type: 'error',
                    message: this.$t('activateLicenseErrorMessage'),
                    timeout: 2000
                });
            } finally {
                event.target.innerText = this.$t('activate');
                event.target.disabled = false;
            }
        },

        showLicenseMigration() {
            // 检查是否有已激活的license
            if (this.license.leftdays <= 0 && !this.license.is_stripe_active) {
                this.$emiter('NOTIFY', {
                    type: 'warning',
                    message: this.$t('noActiveLicenseToMigrate'),
                    timeout: 3000
                });
                return;
            }

            this.$refs.licenseMigrationDialog.show();
        },

        handleMigrationCompleted() {
            // 迁移完成后的处理
            console.log('License migration completed');
        },

        async paymentSuccess() {
            this.close();

            var count = 1000;
            var defaults = {
                origin: { y: 0.7 }
            };

            function fire(particleRatio, opts) {
                confetti({
                    ...defaults,
                    ...opts,
                    particleCount: Math.floor(count * particleRatio)
                });
            }

            fire(0.25, {
                spread: 26,
                startVelocity: 55,
            });
            fire(0.2, {
                spread: 60,
            });
            fire(0.35, {
                spread: 100,
                decay: 0.91,
                scalar: 0.8
            });
            fire(0.1, {
                spread: 120,
                startVelocity: 25,
                decay: 0.92,
                scalar: 1.2
            });
            fire(0.1, {
                spread: 120,
                startVelocity: 45,
            });
        },

        async setupEventListeners() {
            await this.$listen('STRIPE_PAYMENT_SUCCESS', async (e) => {
                console.log('STRIPE_PAYMENT_SUCCESS:', e);
                await this.$emiter('LICENSE', { reload: true });
                await this.paymentSuccess();
                await message(this.$t('paymentSuccess'));
            });

            await this.$listen('STRIPE_PAYMENT_CANCEL', async (e) => {
                console.log('STRIPE_PAYMENT_CANCEL:', e);
            });
        }
    }
};