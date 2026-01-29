/**
 * 生成唯一的分享URL
 */
export function generateShareUrl(): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 8;
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
    }

    return result;
}

/**
 * 根据国家代码获取货币
 */
export function getCurrencyByCountry(country: string): { code: string; symbol: string; rate: number } {
    const currencyMap: Record<string, { code: string; symbol: string; rate: number }> = {
        'US': { code: 'USD', symbol: '$', rate: 1.0 },
        'GB': { code: 'GBP', symbol: '£', rate: 0.82 },
        'FR': { code: 'EUR', symbol: '€', rate: 0.92 },
        'DE': { code: 'EUR', symbol: '€', rate: 0.92 },
        'ES': { code: 'EUR', symbol: '€', rate: 0.92 },
        'CN': { code: 'CNY', symbol: '¥', rate: 7.2 },
        'JP': { code: 'JPY', symbol: '¥', rate: 148.5 },
    };

    return currencyMap[country] || currencyMap['US'];
}

/**
 * 格式化价格
 */
export function formatPrice(priceUSD: number, country: string): string {
    const currency = getCurrencyByCountry(country);
    const localPrice = (priceUSD * currency.rate).toFixed(2);
    return `${currency.symbol}${localPrice}`;
}

/**
 * 获取地区的主要支付方式
 */
export function getPaymentMethods(country: string): Array<{ id: string; name: string; priority: number }> {
    const paymentConfigs: Record<string, Array<{ id: string; name: string; priority: number }>> = {
        'US': [
            { id: 'paypal', name: 'PayPal', priority: 1 },
            { id: 'stripe', name: 'Credit Card', priority: 2 },
        ],
        'CN': [
            { id: 'alipay', name: '支付宝', priority: 1 },
            { id: 'wechatpay', name: '微信支付', priority: 2 },
        ],
        'DE': [
            { id: 'sepa', name: 'SEPA', priority: 1 },
            { id: 'paypal', name: 'PayPal', priority: 2 },
        ],
    };

    return paymentConfigs[country] || paymentConfigs['US'];
}
