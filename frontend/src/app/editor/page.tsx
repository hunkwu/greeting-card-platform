import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CanvasEditor } from '@/components/editor/CanvasEditor';
import { AIAssistant } from '@/components/ai/AIAssistant';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Card {
    id: string;
    title: string;
    designData: any;
}

export default function EditorPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get('template');
    const cardId = searchParams.get('card');

    const [title, setTitle] = useState('未命名贺卡');
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentCardId, setCurrentCardId] = useState<string | null>(cardId);

    useEffect(() => {
        loadCard();
    }, [templateId, cardId]);

    const loadCard = async () => {
        try {
            setLoading(true);

            if (cardId) {
                // Load existing card
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/cards/${cardId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                if (response.ok) {
                    const card: Card = await response.json();
                    setTitle(card.title);
                    setInitialData(card.designData);
                    setCurrentCardId(card.id);
                }
            } else if (templateId) {
                // Load template
                const response = await fetch(`${API_URL}/api/templates/${templateId}`);

                if (response.ok) {
                    const template = await response.json();
                    setTitle(`基于 ${template.name}`);
                    setInitialData(template.designData);
                }
            }
        } catch (error) {
            console.error('Failed to load:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (designData: any) => {
        try {
            setSaving(true);
            const token = localStorage.getItem('token');

            if (!token) {
                alert('请先登录');
                router.push('/auth/login');
                return;
            }

            if (currentCardId) {
                // Update existing card
                const response = await fetch(`${API_URL}/api/cards/${currentCardId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title,
                        designData,
                    }),
                });

                if (response.ok) {
                    alert('保存成功！');
                } else {
                    throw new Error('保存失败');
                }
            } else {
                // Create new card
                const response = await fetch(`${API_URL}/api/cards`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title,
                        templateId: templateId || undefined,
                        designData,
                    }),
                });

                if (response.ok) {
                    const card: Card = await response.json();
                    setCurrentCardId(card.id);
                    alert('保存成功！');
                    router.push(`/editor?card=${card.id}`);
                } else {
                    throw new Error('保存失败');
                }
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('保存失败，请重试');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-gray-600">加载中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-gray-600 hover:text-gray-900 transition"
                    >
                        ← 返回
                    </button>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-xl font-semibold border-b-2 border-transparent hover:border-gray-300 focus:border-purple-500 outline-none transition px-2 py-1"
                        placeholder="贺卡标题"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
                    >
                        我的贺卡
                    </button>
                </div>
            </header>

            {/* Editor */}
            <div className="flex-1 overflow-hidden flex">
                {/* AI Assistant Panel */}
                <div className="w-80 bg-gray-50 border-r overflow-y-auto p-4">
                    <AIAssistant onTextGenerated={(text) => console.log('Generated:', text)} />
                </div>

                {/* Canvas Editor */}
                <div className="flex-1">
                    <CanvasEditor onSave={handleSave} initialData={initialData} />
                </div>
            </div>
        </div>
    );
}
