import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database';
import { generateShareUrl } from '../utils/geo';

// Validation schemas
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    displayName: z.string().optional(),
    language: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

/**
 * 用户注册
 */
export const register = async (req: Request, res: Response) => {
    try {
        // 验证输入
        const data = registerSchema.parse(req.body);

        // 检查用户是否已存在
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // 哈希密码
        const passwordHash = await bcrypt.hash(data.password, 10);

        // 获取用户地理位置
        const country = req.geo?.country || 'US';
        const language = data.language || (req as any).detectedLanguage || 'en';

        // 创建用户
        const user = await prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                displayName: data.displayName || data.email.split('@')[0],
                language,
                country,
            },
            select: {
                id: true,
                email: true,
                displayName: true,
                language: true,
                country: true,
                subscriptionTier: true,
                createdAt: true,
            }
        });

        // 生成JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            user,
            token
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

/**
 * 用户登录
 */
export const login = async (req: Request, res: Response) => {
    try {
        const data = loginSchema.parse(req.body);

        // 查找用户
        const user = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (!user || !user.passwordHash) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 验证密码
        const validPassword = await bcrypt.compare(data.password, user.passwordHash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 生成JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // 返回用户信息（不包含密码）
        const { passwordHash, ...userWithoutPassword } = user;

        res.json({
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

/**
 * 获取当前用户信息
 */
export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                displayName: true,
                avatarUrl: true,
                language: true,
                country: true,
                subscriptionTier: true,
                subscriptionExpiresAt: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
};

/**
 * 更新用户信息
 */
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const updateSchema = z.object({
            displayName: z.string().optional(),
            avatarUrl: z.string().url().optional(),
            language: z.string().optional(),
        });

        const data = updateSchema.parse(req.body);

        const user = await prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                displayName: true,
                avatarUrl: true,
                language: true,
                country: true,
                subscriptionTier: true,
                updatedAt: true,
            }
        });

        res.json(user);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
