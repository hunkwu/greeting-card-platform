'use client';

import { useRouter } from 'next/navigation';

export default function PaymentCancelPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="text-6xl mb-4">❌</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">支付已取消</h1>
                <p className="text-gray-600 mb-6">
                    您已取消支付流程，如有需要可以重新选择订阅计划。
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/pricing')}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                    >
                        重新选择计划
                    </button>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition"
                    >
                        返回Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
