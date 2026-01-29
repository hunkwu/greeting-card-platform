import { Router } from 'express';
import {
    generateText,
    getDesignSuggestions,
    enhanceText,
    getAIUsageStats,
} from '../controllers/ai.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route POST /api/ai/generate-text
 * @desc 生成贺卡文案
 * @access Private
 */
router.post('/generate-text', authenticateToken, generateText);

/**
 * @route POST /api/ai/design-suggestions
 * @desc 获取设计建议
 * @access Private
 */
router.post('/design-suggestions', authenticateToken, getDesignSuggestions);

/**
 * @route POST /api/ai/enhance-text
 * @desc 优化文案
 * @access Private
 */
router.post('/enhance-text', authenticateToken, enhanceText);

/**
 * @route GET /api/ai/usage
 * @desc 获取AI使用统计
 * @access Private
 */
router.get('/usage', authenticateToken, getAIUsageStats);

export default router;
