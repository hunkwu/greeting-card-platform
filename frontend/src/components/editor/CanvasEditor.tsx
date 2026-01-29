'use client';

import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

interface CanvasEditorProps {
    onSave?: (designData: any) => void;
    initialData?: any;
}

export function CanvasEditor({ onSave, initialData }: CanvasEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [selectedTool, setSelectedTool] = useState<string>('select');

    useEffect(() => {
        if (!canvasRef.current) return;

        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            width: 800,
            height: 600,
            backgroundColor: '#ffffff',
        });

        setCanvas(fabricCanvas);

        // Load initial data if provided
        if (initialData) {
            fabricCanvas.loadFromJSON(initialData, () => {
                fabricCanvas.renderAll();
            });
        }

        return () => {
            fabricCanvas.dispose();
        };
    }, []);

    const addText = () => {
        if (!canvas) return;

        const text = new fabric.IText('点击编辑文字', {
            left: 100,
            top: 100,
            fontFamily: 'Arial',
            fontSize: 32,
            fill: '#000000',
        });

        canvas.add(text);
        canvas.setActiveObject(text);
    };

    const addRect = () => {
        if (!canvas) return;

        const rect = new fabric.Rect({
            left: 100,
            top: 100,
            width: 200,
            height: 100,
            fill: '#3b82f6',
        });

        canvas.add(rect);
        canvas.setActiveObject(rect);
    };

    const addCircle = () => {
        if (!canvas) return;

        const circle = new fabric.Circle({
            left: 100,
            top: 100,
            radius: 50,
            fill: '#8b5cf6',
        });

        canvas.add(circle);
        canvas.setActiveObject(circle);
    };

    const deleteSelected = () => {
        if (!canvas) return;

        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length) {
            activeObjects.forEach((obj) => canvas.remove(obj));
            canvas.discardActiveObject();
            canvas.renderAll();
        }
    };

    const handleSave = () => {
        if (!canvas || !onSave) return;

        const designData = canvas.toJSON();
        onSave(designData);
    };

    const changeFontSize = (delta: number) => {
        if (!canvas) return;

        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'i-text') {
            const text = activeObject as fabric.IText;
            const currentSize = text.fontSize || 20;
            text.set({ fontSize: Math.max(8, currentSize + delta) });
            canvas.renderAll();
        }
    };

    const changeColor = (color: string) => {
        if (!canvas) return;

        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            activeObject.set({ fill: color });
            canvas.renderAll();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="bg-white border-b p-4 flex gap-2 flex-wrap">
                <div className="flex gap-2 border-r pr-4">
                    <button
                        onClick={addText}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                        title="添加文字"
                    >
                        📝 文字
                    </button>
                    <button
                        onClick={addRect}
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded transition"
                        title="添加矩形"
                    >
                        ▭ 矩形
                    </button>
                    <button
                        onClick={addCircle}
                        className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded transition"
                        title="添加圆形"
                    >
                        ● 圆形
                    </button>
                </div>

                <div className="flex gap-2 border-r pr-4">
                    <button
                        onClick={() => changeFontSize(4)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition"
                        title="增大字体"
                    >
                        A+
                    </button>
                    <button
                        onClick={() => changeFontSize(-4)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition"
                        title="减小字体"
                    >
                        A-
                    </button>
                </div>

                <div className="flex gap-2 border-r pr-4">
                    {['#000000', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'].map((color) => (
                        <button
                            key={color}
                            onClick={() => changeColor(color)}
                            className="w-8 h-8 rounded border-2 border-gray-300 transition hover:scale-110"
                            style={{ backgroundColor: color }}
                            title="颜色"
                        />
                    ))}
                </div>

                <div className="flex gap-2 border-r pr-4">
                    <button
                        onClick={deleteSelected}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition"
                        title="删除选中"
                    >
                        🗑️ 删除
                    </button>
                </div>

                <button
                    onClick={handleSave}
                    className="ml-auto px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-semibold transition"
                >
                    💾 保存
                </button>
            </div>

            {/* Canvas Container */}
            <div className="flex-1 bg-gray-100 p-8 overflow-auto flex items-center justify-center">
                <div className="bg-white shadow-2xl">
                    <canvas ref={canvasRef} />
                </div>
            </div>
        </div>
    );
}
