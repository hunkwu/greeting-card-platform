import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
    userId: string;
    email: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}

/**
 * JWT认证中间件
 * 验证请求中的JWT token
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }

        const payload = jwt.verify(token, secret) as AuthPayload;
        req.user = payload;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

/**
 * 可选认证中间件
 * 如果有token则验证，没有则继续
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return next();
        }

        const payload = jwt.verify(token, secret) as AuthPayload;
        req.user = payload;
    } catch (error) {
        // 忽略错误，继续处理请求
    }

    next();
};
