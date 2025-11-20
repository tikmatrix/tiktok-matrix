// 支付相关的业务逻辑混入
import { writeText } from '@tauri-apps/api/clipboard';
import { open } from '@tauri-apps/api/shell';
import * as licenseWsService from '../service/licenseWebSocketService';

export default {
    methods: {
        async createStripeCheckoutUrl(priceId, planInterval) {
            if (!this.agreePolicy) {
                this.$refs.loadingDialogs.showAgreePolicyDialog();
                return;
            }

            this.$refs.loadingDialogs.showCreateOrderLoadingDialog();

            try {
                const checkoutUrl = await licenseWsService.ws_get_stripe_checkout_url({
                    price_id: priceId,
                    plan_interval: planInterval
                });
                console.log('ws_get_stripe_checkout_url:', checkoutUrl);
                await open(checkoutUrl);
            } catch (err) {
                console.error('ws_get_stripe_checkout_url error:', err);
                await this.$emiter('NOTIFY', {
                    type: 'error',
                    message: err.message || this.$t('getStripeCheckoutUrlErrorMessage'),
                    timeout: 2000
                });
            } finally {
                this.$refs.loadingDialogs.closeCreateOrderLoadingDialog();
            }
        },

        async createAlipayCheckoutUrl(planId, planInterval) {
            if (!this.agreePolicy) {
                this.$refs.loadingDialogs.showAgreePolicyDialog();
                return;
            }

            this.$refs.loadingDialogs.showCreateOrderLoadingDialog();

            try {
                const checkoutUrl = await licenseWsService.ws_get_alipay_checkout_url({
                    plan_id: planId,
                    plan_interval: planInterval
                });
                console.log('ws_get_alipay_checkout_url:', checkoutUrl);
                await open(checkoutUrl);
            } catch (err) {
                console.error('ws_get_alipay_checkout_url error:', err);
                await this.$emiter('NOTIFY', {
                    type: 'error',
                    message: err.message || this.$t('getAlipayCheckoutUrlErrorMessage'),
                    timeout: 2000
                });
            } finally {
                this.$refs.loadingDialogs.closeCreateOrderLoadingDialog();
            }
        },

        async createOrder(price, planId, planInterval, network) {
            this.$refs.loadingDialogs.showCreateOrderLoadingDialog(); try {
                const orderData = await licenseWsService.ws_create_order({
                    network: network,
                    amount: price,
                    plan_id: planId,
                    plan_interval: planInterval
                });
                await this.showOrder(JSON.stringify(orderData));
            } catch (err) {
                console.error('ws_create_order error:', err);
                await this.$emiter('NOTIFY', {
                    type: 'error',
                    message: err.message || this.$t('createOrderErrorMessage'),
                    timeout: 2000
                });
            } finally {
                this.$refs.loadingDialogs.closeCreateOrderLoadingDialog();
            }
        },

        async manageStripeSubscription() {
            try {
                this.$refs.loadingDialogs.showManageSubscriptionLoadingDialog();

                const portalUrl = await licenseWsService.ws_get_stripe_portal_url();
                console.log('portalUrl:', portalUrl);
                await open(portalUrl);
            } catch (error) {
                await this.$emiter('NOTIFY', {
                    type: 'error',
                    message: error.message || this.$t('manageSubscriptionErrorMessage'),
                    timeout: 2000
                });
            } finally {
                this.$refs.loadingDialogs.closeManageSubscriptionLoadingDialog();
            }
        },

        async copyText(text) {
            await writeText(text);
            await this.$emiter('NOTIFY', {
                type: 'success',
                message: this.$t('copied'),
                timeout: 2000
            });
        }
    }
};