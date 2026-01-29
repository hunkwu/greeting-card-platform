import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { geoDetection, languageDetection } from './middleware/geo';
import authRoutes from './routes/auth.routes';
import templateRoutes from './routes/template.routes';
import cardRoutes from './routes/card.routes';
import aiRoutes from './routes/ai.routes';
import subscriptionRoutes from './routes/subscription.routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GEO Detection Middleware
app.use(geoDetection);
app.use(languageDetection);

// Health check route
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
    });
});

// API routes
app.get('/api/v1', (req: Request, res: Response) => {
    const geo = req.geo;
    res.json({
        message: 'Welcome to Greeting Card API',
        version: '1.0.0',
        geo
    });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Template routes
app.use('/api/templates', templateRoutes);

// Card routes
app.use('/api/cards', cardRoutes);

// AI routes
app.use('/api/ai', aiRoutes);

// Subscription routes
app.use('/api/subscriptions', subscriptionRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path
    });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌍 CORS enabled for: ${process.env.CORS_ORIGIN}`);
});

export default app;
