import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import {
    generateGreetingText,
    generateDesignSuggestions,
    improveText,
} from '../services/ai.service';

const generateTextSchema = z.object({
    occasion: z.string(),
    recipient: z.string(),
    tone: z.string().optional(),
    language: z.string().optional(),
});

const designSuggestionsSchema = z.object({
    occasion: z.string(),
    style: z.string().optional(),
    colors: z.array(z.string()).optional(),
});

const improveTextSchema = z.object({
    text: z.string(),
    language: z.string().optional(),
});

/**
 * 检查用户AI使用配额
 */
async function checkAIQuota(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionTier: true },
    });

    if (!user) return false;

    // 获取本月使用次数
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const usageCount = await prisma.aIUsage.count({
        where: {
            userId,
            createdAt: { gte: startOfMonth },
        },
    });

    // 根据会员等级设置配额
    const quotas: Record<string, number> = {
        free: 3,
        monthly: 50,
        quarterly: 150,
        yearly: 500,
    };

    const quota = quotas[user.subscriptionTier] || 3;
    return usageCount < quota;
}

/**
 * 记录AI使用
 */
async function trackAIUsage(userId: string, type: string, tokensUsed: number = 0) {
    await prisma.aIUsage.create({
        data: {
            userId,
            type,
            tokensUsed,
        },
    });
}

/**
 * 生成贺卡文案
 */
export const generateText = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // 检查配额
        const hasQuota = await checkAIQuota(userId);
        if (!hasQuota) {
            return res.status(429).json({
                error: 'AI usage quota exceeded',
                message: '本月AI使用次数已达上限，请升级会员以获得更多使用次数',
            });
        }

        const data = generateTextSchema.parse(req.body);

        const text = await generateGreetingText(data);

        // 记录使用
        await trackAIUsage(userId, 'text_generation');

        res.json({ text });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Generate text error:', error);
        res.status(500).json({
            error: 'Failed to generate text',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * 生成设计建议
 */
export const getDesignSuggestions = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // 检查配额
        const hasQuota = await checkAIQuota(userId);
        if (!hasQuota) {
            return res.status(429).json({
                error: 'AI usage quota exceeded',
                message: '本月AI使用次数已达上限',
            });
        }

        const data = designSuggestionsSchema.parse(req.body);

        const suggestions = await generateDesignSuggestions(data);

        // 记录使用
        await trackAIUsage(userId, 'design_suggestion');

        res.json(suggestions);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Design suggestions error:', error);
        res.status(500).json({
            error: 'Failed to generate suggestions',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * 优化文案
 */
export const enhanceText = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // 检查配额
        const hasQuota = await checkAIQuota(userId);
        if (!hasQuota) {
            return res.status(429).json({
                error: 'AI usage quota exceeded',
                message: '本月AI使用次数已达上限',
            });
        }

        const data = improveTextSchema.parse(req.body);

        const improvedText = await improveText(data.text, data.language);

        // 记录使用
        await trackAIUsage(userId, 'text_improvement');

        res.json({ text: improvedText });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Enhance text error:', error);
        res.status(500).json({
            error: 'Failed to enhance text',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * 获取AI使用统计
 */
export const getAIUsageStats = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { subscriptionTier: true },
        });

        // 获取本月使用次数
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const usageCount = await prisma.aIUsage.count({
            where: {
                userId,
                createdAt: { gte: startOfMonth },
            },
        });

        // 配额限制
        const quotas: Record<string, number> = {
            free: 3,
            monthly: 50,
            quarterly: 150,
            yearly: 500,
        };

        const quota = quotas[user?.subscriptionTier || 'free'] || 3;

        res.json({
            used: usageCount,
            quota,
            remaining: Math.max(0, quota - usageCount),
            tier: user?.subscriptionTier || 'free',
        });
    } catch (error) {
        console.error('Get AI usage stats error:', error);
        res.status(500).json({ error: 'Failed to get usage stats' });
    }
};
