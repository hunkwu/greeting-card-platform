import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc 用户注册
 * @access Public
 */
router.post('/register', register);

/**
 * @route POST /api/auth/login
 * @desc 用户登录
 * @access Public
 */
router.post('/login', login);

/**
 * @route GET /api/auth/profile
 * @desc 获取当前用户信息
 * @access Private
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * @route PUT /api/auth/profile
 * @desc 更新用户信息
 * @access Private
 */
router.put('/profile', authenticateToken, updateProfile);

export default router;
