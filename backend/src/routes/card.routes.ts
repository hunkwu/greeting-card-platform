import { Router } from 'express';
import {
    createCard,
    getUserCards,
    getCardById,
    getCardByShareUrl,
    updateCard,
    deleteCard,
} from '../controllers/card.controller';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @route POST /api/cards
 * @desc 创建新卡片
 * @access Private
 */
router.post('/', authenticateToken, createCard);

/**
 * @route GET /api/cards
 * @desc 获取用户的所有卡片
 * @access Private
 */
router.get('/', authenticateToken, getUserCards);

/**
 * @route GET /api/cards/share/:shareUrl
 * @desc 通过分享URL获取卡片
 * @access Public
 */
router.get('/share/:shareUrl', getCardByShareUrl);

/**
 * @route GET /api/cards/:id
 * @desc 获取单个卡片详情
 * @access Public (if card is public) / Private (if card is private)
 */
router.get('/:id', optionalAuth, getCardById);

/**
 * @route PUT /api/cards/:id
 * @desc 更新卡片
 * @access Private
 */
router.put('/:id', authenticateToken, updateCard);

/**
 * @route DELETE /api/cards/:id
 * @desc 删除卡片
 * @access Private
 */
router.delete('/:id', authenticateToken, deleteCard);

export default router;
