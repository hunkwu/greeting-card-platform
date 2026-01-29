import { Request, Response, NextFunction } from 'express';

// GEO Detection Middleware
export interface GeoData {
    country: string;
    city?: string;
    timezone?: string;
    latitude?: string;
    longitude?: string;
}

declare global {
    namespace Express {
        interface Request {
            geo?: GeoData;
        }
    }
}

/**
 * GEO检测中间件
 * 从Cloudflare headers或其他来源检测用户地理位置
 */
export const geoDetection = (req: Request, res: Response, next: NextFunction) => {
    const country = (req.headers['cf-ipcountry'] as string) || 'US';
    const city = req.headers['cf-ipcity'] as string;
    const timezone = req.headers['cf-timezone'] as string;
    const latitude = req.headers['cf-iplatitude'] as string;
    const longitude = req.headers['cf-iplongitude'] as string;

    req.geo = {
        country,
        city,
        timezone,
        latitude,
        longitude
    };

    // Log GEO信息（开发环境）
    if (process.env.NODE_ENV === 'development') {
        console.log('🌍 GEO:', req.geo);
    }

    next();
};

/**
 * 语言检测中间件
 * 根据地理位置和Accept-Language头检测用户语言
 */
export const languageDetection = (req: Request, res: Response, next: NextFunction) => {
    const countryToLanguage: Record<string, string> = {
        'US': 'en',
        'GB': 'en',
        'CA': 'en',
        'FR': 'fr',
        'DE': 'de',
        'ES': 'es',
        'CN': 'zh',
        'JP': 'ja',
        'KR': 'ko'
    };

    const country = req.geo?.country || 'US';
    const geoLanguage = countryToLanguage[country] || 'en';

    // 从Accept-Language header获取
    const acceptLanguage = req.headers['accept-language'];
    const browserLanguage = acceptLanguage ? acceptLanguage.split(',')[0].split('-')[0] : 'en';

    // 优先使用地理位置推断的语言
    (req as any).detectedLanguage = geoLanguage || browserLanguage;

    next();
};
