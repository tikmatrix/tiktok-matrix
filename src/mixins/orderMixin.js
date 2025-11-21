// 订单相关的业务逻辑混入
import QRCode from 'qrcode';
import { message } from '@tauri-apps/api/dialog';
import * as licenseWsService from '../service/licenseWebSocketService';

export default {
    methods: {
        async getStripePriceTableInfo() {
            if (!this.license.mid) {
                return;
            }

            try {
                const priceTableInfo = await licenseWsService.ws_get_stripe_price_table_info();
                console.log('get stripe price table info:', priceTableInfo);
                this.priceTableInfo = priceTableInfo;
            } catch (err) {
                console.error('ws_get_stripe_price_table_info error:', err);
                await this.$emiter('NOTIFY', {
                    type: 'error',
                    message: err.message || this.$t('getStripePriceTableInfoErrorMessage'),
                    timeout: 2000
                });
            }
        },

        async getOrder() {
            if (!this.license.mid) {
                return;
            }

            try {
                const orderData = await licenseWsService.ws_get_order();
                console.log('get order:', orderData);
                await this.showOrder(JSON.stringify(orderData));
            } catch (err) {
                console.error('ws_get_order error:', err);
                console.log('get order failed, setting order to null');
                this.order = null;
            }
        },

        async showOrder(order) {
            const parsedOrder = JSON.parse(order);
            this.orderPaymentHandled = false;
            console.log('showOrder:', parsedOrder);

            if (parsedOrder.status !== 0) {
                console.log('order status is not 0');
                this.order = null;
                return;
            }

            if (this.interval) {
                clearInterval(this.interval);
            }

            let qrCodeData = '';
            if (parsedOrder.to_address) {
                try {
                    qrCodeData = await QRCode.toDataURL(parsedOrder.to_address);
                } catch (error) {
                    console.error('generate qrcode error:', error);
                }
            }
            parsedOrder.qrcode = qrCodeData;

            this.order = parsedOrder;

            const expireAt = this.parseExpireAt(parsedOrder.expire_at);
            if (Number.isNaN(expireAt)) {
                console.warn(`Invalid expire_at received: ${parsedOrder.expire_at}`);
                this.remainingTime = 0;
                return;
            }

            const now = new Date().getTime();
            this.remainingTime = Math.floor((expireAt - now) / 1000);
            this.interval = setInterval(() => {
                if (this.remainingTime > 0) {
                    this.remainingTime = Math.max(this.remainingTime - 1, 0);
                    return;
                }

                this.remainingTime = 0;
                clearInterval(this.interval);
                this.interval = null;
                this.order = null;
                this.orderPaymentHandled = false;
            }, 1000);
        },

        async closeOrder() {
            try {
                await licenseWsService.ws_close_order();
                console.log('close_order: success');

                clearInterval(this.interval);
                this.interval = null;
                this.order = null;
                this.orderPaymentHandled = false;
                this.remainingTime = 0;
            } catch (err) {
                console.error('ws_close_order error:', err);
                await this.$emiter('NOTIFY', {
                    type: 'error',
                    message: err.message || this.$t('closeOrderErrorMessage'),
                    timeout: 2000
                });
            }
        },

        async handlePaymentStatusEvent(event = {}) {
            if (typeof this.orderPaymentHandled !== 'boolean') {
                this.orderPaymentHandled = false;
            }
            const rawStatus = event?.status;
            const normalizedStatus = typeof rawStatus === 'string'
                ? rawStatus.toLowerCase()
                : rawStatus;
            const isPaid = normalizedStatus === 1 || normalizedStatus === '1'
                || normalizedStatus === 'paid'
                || normalizedStatus === 'success'
                || normalizedStatus === 'completed';

            if (!isPaid) {
                return;
            }

            if (this.orderPaymentHandled) {
                return;
            }

            this.orderPaymentHandled = true;

            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }

            this.order = null;
            this.remainingTime = 0;

            await this.$emiter('reload_license', { reload: true });

            if (typeof this.paymentSuccess === 'function') {
                await this.paymentSuccess();
            }

            await message(this.$t('paymentSuccess'));
        },

        parseExpireAt(expireAt) {
            if (expireAt === null || expireAt === undefined) {
                return NaN;
            }

            if (typeof expireAt === 'number') {
                if (!Number.isFinite(expireAt)) {
                    return NaN;
                }

                // Support both second and millisecond precision timestamps.
                return expireAt > 1e12 ? expireAt : expireAt * 1000;
            }

            const expireAtString = String(expireAt);
            if (!expireAtString.trim()) {
                return NaN;
            }

            const attempts = new Set();
            attempts.add(expireAtString);

            const normalized = expireAtString.includes(' ')
                ? expireAtString.replace(' ', 'T')
                : expireAtString;
            attempts.add(normalized);

            const timezonePattern = /([zZ])|([+-]\d{2}:?\d{2})$/;
            if (!timezonePattern.test(normalized)) {
                attempts.add(`${normalized}Z`);
            }

            for (const attempt of attempts) {
                const parsed = Date.parse(attempt);
                if (!Number.isNaN(parsed)) {
                    return parsed;
                }
            }

            console.warn(`Unable to parse expire_at value: ${expireAt}`);
            return NaN;
        }
    }
};
