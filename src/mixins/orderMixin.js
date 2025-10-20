// 订单相关的业务逻辑混入
import QRCode from 'qrcode';
import { message } from '@tauri-apps/api/dialog';

export default {
    methods: {
        async getStripePriceTableInfo() {
            if (!this.license.mid) {
                return;
            }

            try {
                const res = await this.$service.get_stripe_price_table_info();

                if (res.code !== 0) {
                    console.log('get stripe price table info failed:', res.data);
                    this.order = null;
                } else {
                    console.log('get stripe price table info:', res.data);
                    this.priceTableInfo = JSON.parse(res.data);
                }
            } catch (err) {
                console.error('get_stripe_price_table_info error:', err);
                await this.$emiter('NOTIFY', {
                    type: 'error',
                    message: this.$t('getStripePriceTableInfoErrorMessage'),
                    timeout: 2000
                });
            }
        },

        async getOrder(refresh_status = false) {
            if (!this.license.mid) {
                return;
            }

            try {
                const res = await this.$service.get_order();

                if (res.code !== 0) {
                    console.log('get order failed:', res.data);
                    this.order = null;
                } else {
                    console.log('get order:', res.data);

                    if (refresh_status) {
                        if (JSON.parse(res.data).status === 1) {
                            await this.$emiter('LICENSE', { reload: true });
                            await this.paymentSuccess();
                            await message(this.$t('paymentSuccess'));
                            return;
                        }
                        return;
                    }

                    await this.showOrder(res.data);
                }
            } catch (err) {
                console.error('get_order error:', err);
                await this.$emiter('NOTIFY', {
                    type: 'error',
                    message: this.$t('getOrderErrorMessage'),
                    timeout: 2000
                });
            }
        },

        async showOrder(order) {
            // 解析JSON
            this.order = JSON.parse(order);
            console.log('showOrder:', this.order);

            if (this.order.status !== 0) {
                console.log('order status is not 0');
                return;
            }

            console.log('start to get qrcode');

            if (this.interval) {
                clearInterval(this.interval);
            }

            this.order.qrcode = await QRCode.toDataURL(this.order.to_address);

            const expireAt = this.parseExpireAt(this.order.expire_at);
            if (Number.isNaN(expireAt)) {
                console.warn(`Invalid expire_at received: ${this.order.expire_at}`);
                this.remainingTime = 0;
                return;
            }

            const now = new Date().getTime();
            this.remainingTime = Math.floor((expireAt - now) / 1000);
            this.refreshTime = 10;

            this.interval = setInterval(async () => {
                if (this.remainingTime > 0) {
                    this.remainingTime--;
                    this.refreshTime--;

                    if (this.refreshTime === 0) {
                        console.log('refresh order status');
                        await this.getOrder(true);
                        this.refreshTime = 10;
                    }
                } else {
                    clearInterval(this.interval);
                    this.order = null;
                }
            }, 1000);
        },

        async closeOrder() {
            try {
                const res = await this.$service.close_order({});
                console.log(`close_order: ${JSON.stringify(res)}`);

                clearInterval(this.interval);
                this.order = null;
            } catch (err) {
                console.error('close_order error:', err);
                await this.$emiter('NOTIFY', {
                    type: 'error',
                    message: this.$t('closeOrderErrorMessage'),
                    timeout: 2000
                });
            }
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
