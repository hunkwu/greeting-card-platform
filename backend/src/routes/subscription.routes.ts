import { Router } from 'express';
import {
    getSubscriptionPlans,
    createSubscriptionOrder,
    confirmPayPalPayment,
    cancelSubscription,
    getMySubscription,
    handlePayPalWebhook,
} from '../controllers/subscription.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route GET /api/subscriptions/plans
 * @desc 获取订阅计划列表
 * @access Public
 */
router.get('/plans', getSubscriptionPlans);

/**
 * @route POST /api/subscriptions/create-order
 * @desc 创建订阅订单
 * @access Private
 */
router.post('/create-order', authenticateToken, createSubscriptionOrder);

/**
 * @route POST /api/subscriptions/confirm-paypal
 * @desc 确认PayPal支付
 * @access Private
 */
router.post('/confirm-paypal', authenticateToken, confirmPayPalPayment);

/**
 * @route POST /api/subscriptions/cancel
 * @desc 取消订阅
 * @access Private
 */
router.post('/cancel', authenticateToken, cancelSubscription);

/**
 * @route GET /api/subscriptions/my-subscription
 * @desc 获取当前用户订阅信息
 * @access Private
 */
router.get('/my-subscription', authenticateToken, getMySubscription);

/**
 * @route POST /api/subscriptions/webhook/paypal
 * @desc PayPal Webhook
 * @access Public (但需要验证签名)
 */
router.post('/webhook/paypal', handlePayPalWebhook);

export default router;
