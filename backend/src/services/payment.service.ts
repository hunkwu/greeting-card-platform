import paypal from '@paypal/checkout-server-sdk';

// PayPal environment setup
const environment = process.env.NODE_ENV === 'production'
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!
    )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!
    );

const client = new paypal.core.PayPalHttpClient(environment);

/**
 * Subscription plans with pricing
 */
export const SUBSCRIPTION_PLANS = {
    monthly: {
        id: 'monthly',
        name: 'Monthly Premium',
        price: 9.99,
        currency: 'USD',
        interval: 'month',
        features: [
            '50 AI文案生成/月',
            '无限制模板访问',
            '高级编辑工具',
            '优先客服支持',
        ],
    },
    quarterly: {
        id: 'quarterly',
        name: 'Quarterly Premium',
        price: 24.99,
        currency: 'USD',
        interval: 'quarter',
        features: [
            '150 AI文案生成/月',
            '无限制模板访问',
            '高级编辑工具',
            '优先客服支持',
            '额外存储空间',
        ],
    },
    yearly: {
        id: 'yearly',
        name: 'Yearly Premium',
        price: 79.99,
        currency: 'USD',
        interval: 'year',
        features: [
            '500 AI文案生成/月',
            '无限制模板访问',
            '高级编辑工具',
            '24/7专属客服',
            '额外存储空间',
            '团队协作功能',
        ],
    },
};

/**
 * 创建PayPal订单
 */
export async function createPayPalOrder(
    planId: keyof typeof SUBSCRIPTION_PLANS,
    userId: string
): Promise<{ orderId: string; approvalUrl: string }> {
    const plan = SUBSCRIPTION_PLANS[planId];

    if (!plan) {
        throw new Error('Invalid subscription plan');
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
            {
                amount: {
                    currency_code: plan.currency,
                    value: plan.price.toFixed(2),
                },
                description: plan.name,
                custom_id: `${userId}:${planId}`,
            },
        ],
        application_context: {
            brand_name: 'Greeting Card',
            landing_page: 'BILLING',
            user_action: 'PAY_NOW',
            return_url: `${process.env.FRONTEND_URL}/payment/success`,
            cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        },
    });

    try {
        const response = await client.execute(request);
        const order = response.result;

        // Find approval URL
        const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href || '';

        return {
            orderId: order.id!,
            approvalUrl,
        };
    } catch (error) {
        console.error('PayPal order creation error:', error);
        throw new Error('Failed to create PayPal order');
    }
}

/**
 * 捕获PayPal订单（完成支付）
 */
export async function capturePayPalOrder(orderId: string): Promise<any> {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
        const response = await client.execute(request);
        return response.result;
    } catch (error) {
        console.error('PayPal order capture error:', error);
        throw new Error('Failed to capture PayPal order');
    }
}

/**
 * 支付宝国际版支付参数生成
 * 注：实际需要集成支付宝国际SDK
 */
export async function createAlipayOrder(
    planId: keyof typeof SUBSCRIPTION_PLANS,
    userId: string
): Promise<{ orderId: string; paymentUrl: string }> {
    const plan = SUBSCRIPTION_PLANS[planId];

    if (!plan) {
        throw new Error('Invalid subscription plan');
    }

    // 这里是示例，实际需要使用支付宝国际SDK
    // 支付宝国际版通常使用Alipay+ SDK
    const orderId = `alipay_${Date.now()}_${userId}`;

    // 实际应该调用支付宝API生成支付链接
    const paymentUrl = `https://intl.alipay.com/payment?order=${orderId}`;

    return {
        orderId,
        paymentUrl,
    };
}

/**
 * 验证PayPal Webhook签名
 */
export async function verifyPayPalWebhook(
    webhookId: string,
    headers: any,
    body: any
): Promise<boolean> {
    const request = new paypal.notifications.WebhookVerificationRequest();
    request.requestBody({
        webhook_id: webhookId,
        transmission_id: headers['paypal-transmission-id'],
        transmission_time: headers['paypal-transmission-time'],
        cert_url: headers['paypal-cert-url'],
        auth_algo: headers['paypal-auth-algo'],
        transmission_sig: headers['paypal-transmission-sig'],
        webhook_event: body,
    });

    try {
        const response = await client.execute(request);
        return response.result.verification_status === 'SUCCESS';
    } catch (error) {
        console.error('PayPal webhook verification error:', error);
        return false;
    }
}
