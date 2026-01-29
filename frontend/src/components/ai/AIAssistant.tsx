'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface AIAssistantProps {
    onTextGenerated?: (text: string) => void;
}

export function AIAssistant({ onTextGenerated }: AIAssistantProps) {
    const [occasion, setOccasion] = useState('');
    const [recipient, setRecipient] = useState('');
    const [tone, setTone] = useState('warm');
    const [generatedText, setGeneratedText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [usageStats, setUsageStats] = useState<{
        used: number;
        quota: number;
        remaining: number;
    } | null>(null);

    const fetchUsageStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/ai/usage`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const stats = await response.json();
                setUsageStats(stats);
            }
        } catch (err) {
            console.error('Failed to fetch usage stats:', err);
        }
    };

    const handleGenerate = async () => {
        if (!occasion || !recipient) {
            setError('请填写场合和收件人');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/ai/generate-text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    occasion,
                    recipient,
                    tone,
                    language: 'zh',
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setGeneratedText(data.text);
                onTextGenerated?.(data.text);
                fetchUsageStats();
            } else {
                const errorData = await response.json();
                setError(errorData.message || '生成失败');
            }
        } catch (err) {
            setError('网络错误，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleEnhance = async () => {
        if (!generatedText) return;

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/ai/enhance-text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    text: generatedText,
                    language: 'zh',
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setGeneratedText(data.text);
                onTextGenerated?.(data.text);
                fetchUsageStats();
            } else {
                const errorData = await response.json();
                setError(errorData.message || '优化失败');
            }
        } catch (err) {
            setError('网络错误，请重试');
        } finally {
            setLoading(false);
        }
    };

    // Load usage stats on mount
    useState(() => {
        fetchUsageStats();
    });

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                    <span className="text-2xl mr-2">🤖</span>
                    AI智能助手
                </h3>
                {usageStats && (
                    <div className="text-sm text-gray-600">
                        本月使用: {usageStats.used}/{usageStats.quota}
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        场合 *
                    </label>
                    <select
                        value={occasion}
                        onChange={(e) => setOccasion(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="">选择场合</option>
                        <option value="生日">生日</option>
                        <option value="结婚">结婚</option>
                        <option value="节日">节日</option>
                        <option value="感谢">感谢</option>
                        <option value="祝贺">祝贺</option>
                        <option value="慰问">慰问</option>
                        <option value="道歉">道歉</option>
                        <option value="其他">其他</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        收件人 *
                    </label>
                    <input
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="例如：妈妈、朋友、老师"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        语气
                    </label>
                    <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="warm">温暖</option>
                        <option value="formal">正式</option>
                        <option value="casual">轻松</option>
                        <option value="humorous">幽默</option>
                        <option value="poetic">诗意</option>
                    </select>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading || !occasion || !recipient}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? '生成中...' : '✨ 生成文案'}
                </button>

                {generatedText && (
                    <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-purple-900">
                                生成的文案
                            </span>
                            <button
                                onClick={handleEnhance}
                                disabled={loading}
                                className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                            >
                                ✨ 优化
                            </button>
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap">{generatedText}</p>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                    💡 提示：升级会员可获得更多AI使用次数
                </p>
            </div>
        </div>
    );
}
