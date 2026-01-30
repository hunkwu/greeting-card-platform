import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { getParamString, getRequiredParamString } from '../utils/params';
import { generateShareUrl } from '../utils/geo';

const createCardSchema = z.object({
    title: z.string().min(1),
    templateId: z.string().optional(),
    designData: z.any(),
    isPublic: z.boolean().optional(),
});

const updateCardSchema = z.object({
    title: z.string().min(1).optional(),
    designData: z.any().optional(),
    isPublic: z.boolean().optional(),
});

/**
 * 创建新卡片
 */
export const createCard = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const data = createCardSchema.parse(req.body);

        // 生成唯一的分享URL
        let shareUrl = generateShareUrl();

        // 确保分享URL唯一
        while (await prisma.card.findUnique({ where: { shareUrl } })) {
            shareUrl = generateShareUrl();
        }

        const card = await prisma.card.create({
            data: {
                userId,
                title: data.title,
                templateId: data.templateId,
                designData: data.designData,
                shareUrl,
                isPublic: data.isPublic || false,
            },
        });

        res.status(201).json(card);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Create card error:', error);
        res.status(500).json({ error: 'Failed to create card' });
    }
};

/**
 * 获取用户的所有卡片
 */
export const getUserCards = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const page = getParamString(req.query.page) || '1';
        const limit = getParamString(req.query.limit) || '20';
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [cards, total] = await Promise.all([
            prisma.card.findMany({
                where: { userId },
                select: {
                    id: true,
                    title: true,
                    thumbnailUrl: true,
                    shareUrl: true,
                    shareCount: true,
                    viewCount: true,
                    isPublic: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limitNum,
            }),
            prisma.card.count({ where: { userId } }),
        ]);

        res.json({
            cards,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Get user cards error:', error);
        res.status(500).json({ error: 'Failed to get cards' });
    }
};

/**
 * 获取单个卡片详情
 */
export const getCardById = async (req: Request, res: Response) => {
    try {
        const id = getRequiredParamString(req.params.id);
        const userId = req.user?.userId;

        const card = await prisma.card.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        // 检查权限：公开或者是卡片所有者
        if (!card.isPublic && card.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(card);
    } catch (error) {
        console.error('Get card error:', error);
        res.status(500).json({ error: 'Failed to get card' });
    }
};

/**
 * 通过分享URL获取卡片
 */
export const getCardByShareUrl = async (req: Request, res: Response) => {
    try {
        const shareUrl = getRequiredParamString(req.params.shareUrl);

        const card = await prisma.card.findUnique({
            where: { shareUrl },
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        if (!card.isPublic) {
            return res.status(403).json({ error: 'This card is private' });
        }

        // 增加浏览次数
        await prisma.card.update({
            where: { id: card.id },
            data: { viewCount: { increment: 1 } },
        });

        res.json(card);
    } catch (error) {
        console.error('Get card by share URL error:', error);
        res.status(500).json({ error: 'Failed to get card' });
    }
};

/**
 * 更新卡片
 */
export const updateCard = async (req: Request, res: Response) => {
    try {
        const id = getRequiredParamString(req.params.id);
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const data = updateCardSchema.parse(req.body);

        // 检查卡片所有权
        const existingCard = await prisma.card.findUnique({
            where: { id },
        });

        if (!existingCard) {
            return res.status(404).json({ error: 'Card not found' });
        }

        if (existingCard.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const card = await prisma.card.update({
            where: { id },
            data,
        });

        res.json(card);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Update card error:', error);
        res.status(500).json({ error: 'Failed to update card' });
    }
};

/**
 * 删除卡片
 */
export const deleteCard = async (req: Request, res: Response) => {
    try {
        const id = getRequiredParamString(req.params.id);
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // 检查卡片所有权
        const existingCard = await prisma.card.findUnique({
            where: { id },
        });

        if (!existingCard) {
            return res.status(404).json({ error: 'Card not found' });
        }

        if (existingCard.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await prisma.card.delete({
            where: { id },
        });

        res.json({ message: 'Card deleted successfully' });
    } catch (error) {
        console.error('Delete card error:', error);
        res.status(500).json({ error: 'Failed to delete card' });
    }
};
