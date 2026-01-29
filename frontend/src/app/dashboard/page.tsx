'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, User } from '@/lib/api';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await apiClient.getProfile();
                setUser(profile);
            } catch (error) {
                // 未登录，跳转到登录页
                router.push('/auth/login');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleLogout = () => {
        apiClient.logout();
        router.push('/auth/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">加载中...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">我的贺卡</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition"
                    >
                        退出登录
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Welcome Card */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                        欢迎, {user.displayName || user.email}!
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">会员等级</p>
                            <p className="text-lg font-semibold text-blue-900 capitalize">
                                {user.subscriptionTier}
                            </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">语言</p>
                            <p className="text-lg font-semibold text-green-900 uppercase">
                                {user.language}
                            </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">国家/地区</p>
                            <p className="text-lg font-semibold text-purple-900">
                                {user.country || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h3 className="text-lg font-semibold mb-4">快速开始</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <button
                            onClick={() => router.push('/editor')}
                            className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white hover:from-blue-600 hover:to-blue-700 transition">
                            <div className="text-4xl mb-2">🎨</div>
                            <div className="font-semibold">创建新贺卡</div>
                        </button>
                        <button
                            onClick={() => router.push('/templates')}
                            className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg text-white hover:from-purple-600 hover:to-purple-700 transition">
                            <div className="text-4xl mb-2">🖼️</div>
                            <div className="font-semibold">浏览模板</div>
                        </button>
                        <button className="p-6 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg text-white hover:from-pink-600 hover:to-pink-700 transition">
                            <div className="text-4xl mb-2">⭐</div>
                            <div className="font-semibold">我的收藏</div>
                        </button>
                    </div>
                </div>

                {/* My Cards */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">我的贺卡</h3>
                        <button
                            onClick={() => router.push('/editor')}
                            className="text-purple-600 hover:text-purple-700 font-medium">
                            查看全部 →
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Placeholder cards */}
                        <div
                            onClick={() => router.push('/editor')}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center hover:border-purple-400 hover:bg-purple-50 transition cursor-pointer">
                            <div className="text-4xl mb-2">➕</div>
                            <div className="text-gray-600 font-medium">创建新贺卡</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
