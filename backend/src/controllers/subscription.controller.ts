import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import {
    SUBSCRIPTION_PLANS,
    createPayPalOrder,
    capturePayPalOrder,
    createAlipayOrder,
    verifyPayPalWebhook,
} from '../services/payment.service';

const createOrderSchema = z.object({
    planId: z.enum(['monthly', 'quarterly', 'yearly']),
    paymentMethod: z.enum(['paypal', 'alipay']),
});

/**
 * 获取订阅计划列表
 */
export const getSubscriptionPlans = async (req: Request, res: Response) => {
    try {
        const plans = Object.values(SUBSCRIPTION_PLANS);
        res.json({ plans });
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({ error: 'Failed to get subscription plans' });
    }
};

/**
 * 创建订阅订单
 */
export const createSubscriptionOrder = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const data = createOrderSchema.parse(req.body);

        let orderId: string;
        let paymentUrl: string;

        if (data.paymentMethod === 'paypal') {
            const result = await createPayPalOrder(data.planId, userId);
            orderId = result.orderId;
            paymentUrl = result.approvalUrl;
        } else if (data.paymentMethod === 'alipay') {
            const result = await createAlipayOrder(data.planId, userId);
            orderId = result.orderId;
            paymentUrl = result.paymentUrl;
        } else {
            return res.status(400).json({ error: 'Unsupported payment method' });
        }

        // 创建订阅记录（待支付状态）
        await prisma.subscription.create({
            data: {
                userId,
                plan: data.planId,
                status: 'pending',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 临时设置
                paypalSubscriptionId: data.paymentMethod === 'paypal' ? orderId : undefined,
            },
        });

        res.json({
            orderId,
            paymentUrl,
            planId: data.planId,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Create subscription order error:', error);
        res.status(500).json({ error: 'Failed to create subscription order' });
    }
};

/**
 * 确认PayPal支付
 */
export const confirmPayPalPayment = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { orderId } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // 捕获订单
        const order = await capturePayPalOrder(orderId);

        if (order.status === 'COMPLETED') {
            // 提取计划ID
            const customId = order.purchase_units[0].custom_id;
            const [_, planId] = customId.split(':');

            // 计算订阅周期
            const now = new Date();
            let periodEnd = new Date(now);

            if (planId === 'monthly') {
                periodEnd.setMonth(periodEnd.getMonth() + 1);
            } else if (planId === 'quarterly') {
                periodEnd.setMonth(periodEnd.getMonth() + 3);
            } else if (planId === 'yearly') {
                periodEnd.setFullYear(periodEnd.getFullYear() + 1);
            }

            // 更新或创建订阅
            const existingSubscription = await prisma.subscription.findFirst({
                where: { userId },
            });

            let subscription;
            if (existingSubscription) {
                subscription = await prisma.subscription.update({
                    where: { id: existingSubscription.id },
                    data: {
                        plan: planId,
                        status: 'active',
                        currentPeriodStart: now,
                        currentPeriodEnd: periodEnd,
                        paypalSubscriptionId: orderId,
                    },
                });
            } else {
                subscription = await prisma.subscription.create({
                    data: {
                        userId,
                        plan: planId,
                        status: 'active',
                        currentPeriodStart: now,
                        currentPeriodEnd: periodEnd,
                        paypalSubscriptionId: orderId,
                    },
                });
            }

            // 更新用户订阅等级
            await prisma.user.update({
                where: { id: userId },
                data: {
                    subscriptionTier: planId,
                    subscriptionExpiresAt: periodEnd,
                },
            });

            res.json({
                success: true,
                subscription,
            });
        } else {
            res.status(400).json({ error: 'Payment not completed' });
        }
    } catch (error) {
        console.error('Confirm PayPal payment error:', error);
        res.status(500).json({ error: 'Failed to confirm payment' });
    }
};

/**
 * 取消订阅
 */
export const cancelSubscription = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // 更新订阅状态为取消
        await prisma.subscription.updateMany({
            where: { userId, status: 'active' },
            data: {
                status: 'canceled',
                cancelAtPeriodEnd: true,
            },
        });

        res.json({ message: 'Subscription canceled successfully' });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
};

/**
 * 获取当前用户订阅信息
 */
export const getMySubscription = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const subscription = await prisma.subscription.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                subscriptionTier: true,
                subscriptionExpiresAt: true,
            },
        });

        res.json({
            subscription,
            tier: user?.subscriptionTier || 'free',
            expiresAt: user?.subscriptionExpiresAt,
        });
    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({ error: 'Failed to get subscription' });
    }
};

/**
 * PayPal Webhook处理
 */
export const handlePayPalWebhook = async (req: Request, res: Response) => {
    try {
        const webhookId = process.env.PAYPAL_WEBHOOK_ID || '';
        const isValid = await verifyPayPalWebhook(webhookId, req.headers, req.body);

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid webhook signature' });
        }

        const event = req.body;

        // 处理不同类型的webhook事件
        switch (event.event_type) {
            case 'PAYMENT.SALE.COMPLETED':
                // 支付完成
                console.log('Payment completed:', event);
                break;

            case 'BILLING.SUBSCRIPTION.CANCELLED':
                // 订阅取消
                console.log('Subscription cancelled:', event);
                break;

            case 'BILLING.SUBSCRIPTION.EXPIRED':
                // 订阅过期
                console.log('Subscription expired:', event);
                break;

            default:
                console.log('Unhandled webhook event:', event.event_type);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('PayPal webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};
