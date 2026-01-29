import { Router } from 'express';
import {
    getTemplates,
    getRecommendedTemplates,
    getTemplateById,
    searchTemplates,
    favoriteTemplate,
    unfavoriteTemplate,
    getFavorites,
    getCategories,
} from '../controllers/template.controller';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @route GET /api/templates
 * @desc 获取模板列表（支持分页和筛选）
 * @access Public
 */
router.get('/', getTemplates);

/**
 * @route GET /api/templates/recommended
 * @desc 获取推荐模板（基于 GEO）
 * @access Public
 */
router.get('/recommended', optionalAuth, getRecommendedTemplates);

/**
 * @route GET /api/templates/search
 * @desc 搜索模板
 * @access Public
 */
router.get('/search', searchTemplates);

/**
 * @route GET /api/templates/categories
 * @desc 获取模板分类列表
 * @access Public
 */
router.get('/categories', getCategories);

/**
 * @route GET /api/templates/favorites
 * @desc 获取用户收藏的模板
 * @access Private
 */
router.get('/favorites', authenticateToken, getFavorites);

/**
 * @route GET /api/templates/:id
 * @desc 获取单个模板详情
 * @access Public
 */
router.get('/:id', getTemplateById);

/**
 * @route POST /api/templates/favorite
 * @desc 收藏模板
 * @access Private
 */
router.post('/favorite', authenticateToken, favoriteTemplate);

/**
 * @route DELETE /api/templates/favorite/:templateId
 * @desc 取消收藏
 * @access Private
 */
router.delete('/favorite/:templateId', authenticateToken, unfavoriteTemplate);

export default router;
