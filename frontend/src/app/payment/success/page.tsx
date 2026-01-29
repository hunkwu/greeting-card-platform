'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function PaymentSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [processing, setProcessing] = useState(true);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const confirmPayment = async () => {
            const token = searchParams.get('token') || searchParams.get('orderId');
            const payerId = searchParams.get('PayerID');

            if (!token) {
                setProcessing(false);
                return;
            }

            try {
                const authToken = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/subscriptions/confirm-paypal`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({ orderId: token }),
                });

                if (response.ok) {
                    setSuccess(true);
                }
            } catch (error) {
                console.error('Payment confirmation error:', error);
            } finally {
                setProcessing(false);
            }
        };

        confirmPayment();
    }, [searchParams]);

    if (processing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-gray-600">正在确认支付...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                {success ? (
                    <>
                        <div className="text-6xl mb-4">✅</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">支付成功！</h1>
                        <p className="text-gray-600 mb-6">
                            感谢您的订阅，您的会员权益已生效。
                        </p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                        >
                            返回Dashboard
                        </button>
                    </>
                ) : (
                    <>
                        <div className="text-6xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">支付未完成</h1>
                        <p className="text-gray-600 mb-6">
                            未检测到有效的支付信息，请重试。
                        </p>
                        <button
                            onClick={() => router.push('/pricing')}
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                        >
                            返回定价页面
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
