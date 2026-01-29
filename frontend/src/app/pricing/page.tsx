'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Plan {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: string;
    features: string[];
}

export default function PricingPage() {
    const router = useRouter();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingPlan, setProcessingPlan] = useState<string | null>(null);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const response = await fetch(`${API_URL}/api/subscriptions/plans`);
            if (response.ok) {
                const data = await response.json();
                setPlans(data.plans);
            }
        } catch (error) {
            console.error('Failed to load plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (planId: string, paymentMethod: 'paypal' | 'alipay') => {
        const token = localStorage.getItem('token');

        if (!token) {
            alert('请先登录');
            router.push('/auth/login');
            return;
        }

        setProcessingPlan(planId);

        try {
            const response = await fetch(`${API_URL}/api/subscriptions/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ planId, paymentMethod }),
            });

            if (response.ok) {
                const data = await response.json();
                // 跳转到支付页面
                window.location.href = data.paymentUrl;
            } else {
                const error = await response.json();
                alert(error.message || '创建订单失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        } finally {
            setProcessingPlan(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">加载中...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">订阅计划</h1>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            返回
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        选择适合你的计划
                    </h2>
                    <p className="text-xl text-gray-600">
                        解锁更多AI文案、高级功能和专属服务
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Free Plan */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">免费版</h3>
                            <div className="text-4xl font-bold text-gray-900 mb-4">
                                $0
                                <span className="text-lg font-normal text-gray-600">/月</span>
                            </div>
                        </div>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center text-gray-700">
                                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                3次AI文案/月
                            </li>
                            <li className="flex items-center text-gray-700">
                                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                基础模板访问
                            </li>
                            <li className="flex items-center text-gray-700">
                                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                基础编辑工具
                            </li>
                        </ul>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full py-3 px-6 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                        >
                            当前计划
                        </button>
                    </div>

                    {/* Paid Plans */}
                    {plans.map((plan, index) => (
                        <div
                            key={plan.id}
                            className={`bg-white rounded-2xl shadow-xl p-8 border-2 ${index === 1 ? 'border-purple-500 transform scale-105' : 'border-gray-200'
                                } relative`}
                        >
                            {index === 1 && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                                        最受欢迎
                                    </span>
                                </div>
                            )}
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {plan.name}
                                </h3>
                                <div className="text-4xl font-bold text-purple-600 mb-4">
                                    ${plan.price}
                                    <span className="text-lg font-normal text-gray-600">/{plan.interval}</span>
                                </div>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center text-gray-700">
                                        <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleSubscribe(plan.id, 'paypal')}
                                    disabled={processingPlan === plan.id}
                                    className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
                                >
                                    {processingPlan === plan.id ? '处理中...' : 'PayPal支付'}
                                </button>
                                <button
                                    onClick={() => handleSubscribe(plan.id, 'alipay')}
                                    disabled={processingPlan === plan.id}
                                    className="w-full py-3 px-6 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold transition disabled:opacity-50"
                                >
                                    支付宝国际
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-20 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">常见问题</h3>
                    <div className="max-w-2xl mx-auto space-y-4 text-left">
                        <div className="bg-white rounded-lg p-6 shadow">
                            <h4 className="font-semibold text-gray-900 mb-2">如何取消订阅？</h4>
                            <p className="text-gray-600">
                                您可以随时在账户设置中取消订阅，取消后将在当前周期结束时停止续费。
                            </p>
                        </div>
                        <div className="bg-white rounded-lg p-6 shadow">
                            <h4 className="font-semibold text-gray-900 mb-2">支持哪些支付方式？</h4>
                            <p className="text-gray-600">
                                目前支持PayPal和支付宝国际版，后续将陆续支持Stripe信用卡、微信支付等。
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
