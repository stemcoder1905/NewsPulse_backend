import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import newsRoutes from './routes/news.routes';
import analyticsRoutes from './routes/analytics.routes';
import { refreshNews } from './controllers/admin.controller';
import { errorHandler } from './middlewares/errorMiddleware';
import { swaggerSpec } from './docs/swagger';
import { config } from './config';
import mongoose from 'mongoose';

const app: Application = express();

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(cors({ origin: config.corsOrigin, credentials: true }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});
app.use('/api', limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger Documentation Route
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check Endpoints (both /api/health and /api/v1/health)
const getHealthStatus = (req: express.Request, res: express.Response) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  const isMediastackConfigured = Boolean(
    config.newsApi.mediastackApiKey &&
      config.newsApi.mediastackApiKey !== 'MY_MEDIASTACK_KEY' &&
      config.newsApi.mediastackApiKey !== 'your_mediastack_api_key_here'
  );

  res.json({
    success: true,
    message: 'NewsPulse API is healthy',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'newspulse-backend',
      database: isMongoConnected ? 'connected' : 'fallback',
      mediastackConfigured: isMediastackConfigured
    }
  });
};

app.get('/', (req, res) => {
  res.json({
    name: 'NewsPulse AI API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

app.get('/api/health', getHealthStatus);
app.get('/api/v1/health', getHealthStatus);

// API Route Aliases for /api/news and /api/analytics compatibility
app.use('/api/news', newsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.post('/api/news/fetch', refreshNews);

// Register API v1 Routes
app.use('/api/v1', routes);

// Global Error Handler
app.use(errorHandler);

export default app;
