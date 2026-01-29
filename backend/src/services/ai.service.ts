import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 生成贺卡文案
 */
export async function generateGreetingText(params: {
    occasion: string;
    recipient: string;
    tone?: string;
    language?: string;
}): Promise<string> {
    const { occasion, recipient, tone = 'warm', language = 'zh' } = params;

    const languagePrompts: Record<string, string> = {
        zh: '中文',
        en: 'English',
        fr: 'French',
        de: 'German',
        es: 'Spanish',
    };

    const prompt = `你是一个专业的贺卡文案创作助手。请为以下场景生成一段${languagePrompts[language]}祝福语：

场合：${occasion}
收件人：${recipient}
语气：${tone}

要求：
1. 真诚温暖，富有情感
2. 长度适中（50-100字）
3. 符合场合氛围
4. 语言优美流畅

请直接输出祝福语内容，不要包含其他说明。`;

    try {
        const response = await openai.chat.completions.create({
            model: process.env.AI_MODEL || 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: '你是一个专业的贺卡文案创作助手，擅长为各种场合创作真诚温暖的祝福语。',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.8,
            max_tokens: 300,
        });

        return response.choices[0]?.message?.content || '祝福满满！';
    } catch (error) {
        console.error('OpenAI API error:', error);
        throw new Error('AI文案生成失败');
    }
}

/**
 * 提供设计建议
 */
export async function generateDesignSuggestions(params: {
    occasion: string;
    style?: string;
    colors?: string[];
}): Promise<{
    colorScheme: string[];
    fontSuggestions: string[];
    layoutTips: string[];
}> {
    const { occasion, style = 'modern', colors = [] } = params;

    const prompt = `作为专业的贺卡设计顾问，请为以下场景提供设计建议：

场合：${occasion}
风格：${style}
${colors.length > 0 ? `当前颜色：${colors.join(', ')}` : ''}

请以JSON格式返回设计建议，包含：
1. colorScheme: 推荐的3-5个颜色代码（hex格式）
2. fontSuggestions: 推荐的2-3个字体名称
3. layoutTips: 3个简短的布局建议

示例格式：
{
  "colorScheme": ["#FF6B6B", "#4ECDC4", "#45B7D1"],
  "fontSuggestions": ["Arial", "Georgia"],
  "layoutTips": ["居中对齐", "留白充足", "对比鲜明"]
}`;

    try {
        const response = await openai.chat.completions.create({
            model: process.env.AI_MODEL || 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: '你是一个专业的贺卡设计顾问，擅长提供配色、字体和布局建议。',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        const content = response.choices[0]?.message?.content || '{}';

        // 尝试解析JSON
        try {
            return JSON.parse(content);
        } catch {
            // 如果解析失败，返回默认建议
            return {
                colorScheme: ['#3b82f6', '#8b5cf6', '#ec4899'],
                fontSuggestions: ['Arial', 'Georgia'],
                layoutTips: ['保持简洁', '突出重点', '注意对比'],
            };
        }
    } catch (error) {
        console.error('OpenAI API error:', error);
        throw new Error('AI设计建议生成失败');
    }
}

/**
 * 优化现有文案
 */
export async function improveText(text: string, language: string = 'zh'): Promise<string> {
    const languageNames: Record<string, string> = {
        zh: '中文',
        en: 'English',
    };

    const prompt = `请优化以下${languageNames[language] || '中文'}祝福语，使其更加优美、真诚和富有感染力。保持原意，但提升表达质量：

原文：${text}

请直接输出优化后的文案，不要包含其他说明。`;

    try {
        const response = await openai.chat.completions.create({
            model: process.env.AI_MODEL || 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: '你是一个专业的文案优化师，擅长提升祝福语的表达质量。',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 300,
        });

        return response.choices[0]?.message?.content || text;
    } catch (error) {
        console.error('OpenAI API error:', error);
        throw new Error('文案优化失败');
    }
}
