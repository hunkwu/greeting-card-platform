'use client';

import { Template } from '@/lib/api';

interface TemplateCardProps {
    template: Template;
    onSelect?: (template: Template) => void;
}

export function TemplateCard({ template, onSelect }: TemplateCardProps) {
    return (
        <div
            className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
            onClick={() => onSelect?.(template)}
        >
            {/* Premium Badge */}
            {template.isPremium && (
                <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    ⭐ Premium
                </div>
            )}

            {/* Preview Image */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {template.previewImageUrl ? (
                    <img
                        src={template.previewImageUrl}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                        🎨
                    </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <button className="opacity-0 group-hover:opacity-100 bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold transform scale-90 group-hover:scale-100 transition-all duration-300">
                        使用模板
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{template.name}</h3>
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="capitalize">{template.category}</span>
                    <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        {template.downloadsCount.toLocaleString()}
                    </span>
                </div>

                {/* Tags */}
                {template.tags && template.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
