// 许可证相关的业务逻辑混入
import { message } from '@tauri-apps/api/dialog';
import confetti from 'canvas-confetti';
import Bluebird from 'bluebird';
import * as licenseWsService from '../service/licenseWebSocketService';

confetti.Promise = Bluebird;

export default {
    methods: {
        async activate(event) {
            event.target.innerText = this.$t('activating');
            event.target.disabled = true;

            try {
                const license = await licenseWsService.ws_activate_license(this.license.license_code);
                console.log(`ws_activate_license: ${JSON.stringify(license)}`);

                if (license.leftdays > 0) {
                    await this.$emiter('LICENSE', { reload: true });
                    this.paymentSuccess();
                    await message(this.$t('activateSuccess'));
                } else {
                    await message(this.$t('invalidLicense'));
                }
            } catch (err) {
                console.error('activate license error:', err);
                await this.$emiter('NOTIFY', {
                    type: 'error',
                    message: err.message || this.$t('activateLicenseErrorMessage'),
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

            await this.$listen('ORDER_PAYMENT_STATUS', async (e) => {
                const payload = e?.payload || {};
                if (typeof this.handlePaymentStatusEvent === 'function') {
                    await this.handlePaymentStatusEvent(payload);
                }
            });
        }
    }
};