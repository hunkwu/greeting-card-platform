'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { templateApi, Template, Category } from '@/lib/api';
import { TemplateCard } from '@/components/templates/TemplateCard';

export default function TemplatesPage() {
    const router = useRouter();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadTemplates();
        loadCategories();
    }, [selectedCategory, currentPage]);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const response = await templateApi.getTemplates({
                category: selectedCategory || undefined,
                page: currentPage,
                limit: 12,
            });
            setTemplates(response.templates);
            setTotalPages(response.pagination.totalPages);
        } catch (error) {
            console.error('Failed to load templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await templateApi.getCategories();
            setCategories(response.categories);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadTemplates();
            return;
        }

        try {
            setLoading(true);
            const response = await templateApi.searchTemplates(searchQuery, selectedCategory || undefined);
            setTemplates(response.results);
            setTotalPages(1);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTemplateSelect = (template: Template) => {
        router.push(`/editor?template=${template.id}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">模板库</h1>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            返回
                        </button>
                    </div>
                </div>
            </header>

            {/* Search Bar */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold mb-6 text-center">探索精美模板</h2>
                    <div className="max-w-2xl mx-auto flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="搜索模板、标签..."
                            className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                        />
                        <button
                            onClick={handleSearch}
                            className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition"
                        >
                            🔍 搜索
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Categories Filter */}
                <div className="mb-8">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => {
                                setSelectedCategory('');
                                setCurrentPage(1);
                            }}
                            className={`px-6 py-2 rounded-full font-medium transition ${selectedCategory === ''
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            全部
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.name}
                                onClick={() => {
                                    setSelectedCategory(category.name);
                                    setCurrentPage(1);
                                }}
                                className={`px-6 py-2 rounded-full font-medium transition ${selectedCategory === category.name
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {category.name} ({category.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Templates Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        <p className="mt-4 text-gray-600">加载中...</p>
                    </div>
                ) : templates.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-xl text-gray-600">未找到模板</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {templates.map((template) => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    onSelect={handleTemplateSelect}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                                >
                                    上一页
                                </button>
                                <div className="flex items-center px-4 py-2 bg-white rounded-lg">
                                    {currentPage} / {totalPages}
                                </div>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                                >
                                    下一页
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
