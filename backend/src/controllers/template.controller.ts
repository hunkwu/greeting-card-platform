import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { getParamString, getRequiredParamString } from '../utils/params';

/**
 * 获取模板列表（支持分页和筛选）
 */
export const getTemplates = async (req: Request, res: Response) => {
    try {
        const category = getParamString(req.query.category);
        const isPremium = getParamString(req.query.isPremium);
        const language = getParamString(req.query.language);
        const page = getParamString(req.query.page) || '1';
        const limit = getParamString(req.query.limit) || '20';

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // 构建筛选条件
        const where: any = {};

        if (category) {
            where.category = category;
        }

        if (isPremium !== undefined) {
            where.isPremium = isPremium === 'true';
        }

        if (language) {
            where.language = language;
        }

        // 查询模板
        const [templates, total] = await Promise.all([
            prisma.template.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    category: true,
                    tags: true,
                    previewImageUrl: true,
                    isPremium: true,
                    language: true,
                    country: true,
                    downloadsCount: true,
                },
                orderBy: { downloadsCount: 'desc' },
                skip,
                take: limitNum,
            }),
            prisma.template.count({ where }),
        ]);

        res.json({
            templates,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            }
        });
    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({ error: 'Failed to get templates' });
    }
};

/**
 * 获取推荐模板（基于GEO）
 */
export const getRecommendedTemplates = async (req: Request, res: Response) => {
    try {
        const country = req.geo?.country || 'US';
        const userId = req.user?.userId;

        // 优先级：本国模板 > 同语言模板 > 通用模板
        const templates = await prisma.template.findMany({
            where: {
                OR: [
                    { country: country },
                    { isUniversal: true },
                ],
            },
            select: {
                id: true,
                name: true,
                category: true,
                tags: true,
                previewImageUrl: true,
                isPremium: true,
                language: true,
                country: true,
                downloadsCount: true,
            },
            orderBy: [
                { country: country ? 'asc' : 'desc' },
                { downloadsCount: 'desc' },
            ],
            take: 20,
        });

        res.json({ templates, country });
    } catch (error) {
        console.error('Get recommended templates error:', error);
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
};

/**
 * 获取单个模板详情
 */
export const getTemplateById = async (req: Request, res: Response) => {
    try {
        const id = getRequiredParamString(req.params.id);

        const template = await prisma.template.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        cards: true,
                        favorites: true,
                    }
                }
            }
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        res.json(template);
    } catch (error) {
        console.error('Get template error:', error);
        res.status(500).json({ error: 'Failed to get template' });
    }
};

/**
 * 搜索模板
 */
export const searchTemplates = async (req: Request, res: Response) => {
    try {
        const q = getParamString(req.query.q);
        const category = getParamString(req.query.category);

        if (!q) {
            return res.status(400).json({ error: 'Search query required' });
        }

        const searchQuery = q;

        const where: any = {
            OR: [
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { tags: { has: searchQuery } },
            ],
        };

        if (category) {
            where.category = category;
        }

        const templates = await prisma.template.findMany({
            where,
            select: {
                id: true,
                name: true,
                category: true,
                tags: true,
                previewImageUrl: true,
                isPremium: true,
                language: true,
                downloadsCount: true,
            },
            orderBy: { downloadsCount: 'desc' },
            take: 30,
        });

        res.json({ query: searchQuery, results: templates });
    } catch (error) {
        console.error('Search templates error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
};

/**
 * 收藏模板
 */
export const favoriteTemplate = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { templateId } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const favorite = await prisma.favorite.create({
            data: {
                userId,
                templateId,
            },
        });

        res.status(201).json(favorite);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Already favorited' });
        }
        console.error('Favorite template error:', error);
        res.status(500).json({ error: 'Failed to favorite template' });
    }
};

/**
 * 取消收藏
 */
export const unfavoriteTemplate = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { templateId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        await prisma.favorite.delete({
            where: {
                userId_templateId: {
                    userId,
                    templateId,
                },
            },
        });

        res.json({ message: 'Unfavorited successfully' });
    } catch (error) {
        console.error('Unfavorite template error:', error);
        res.status(500).json({ error: 'Failed to unfavorite template' });
    }
};

/**
 * 获取用户收藏的模板
 */
export const getFavorites = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const favorites = await prisma.favorite.findMany({
            where: { userId },
            include: {
                template: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        tags: true,
                        previewImageUrl: true,
                        isPremium: true,
                        language: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ favorites: favorites.map((f: any) => f.template) });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ error: 'Failed to get favorites' });
    }
};

/**
 * 获取模板分类列表
 */
export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.template.groupBy({
            by: ['category'],
            _count: {
                category: true,
            },
        });

        res.json({
            categories: categories.map((c: any) => ({
                name: c.category,
                count: c._count.category,
            }))
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to get categories' });
    }
};
