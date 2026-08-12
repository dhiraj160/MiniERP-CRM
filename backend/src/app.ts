import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

// Import Routes
import authRoutes from './modules/auth/auth.routes';
import customerRoutes from './modules/customers/customer.routes';
import productRoutes from './modules/products/product.routes';
import stockRoutes from './modules/stock/stock.routes';
import categoryRoutes from './modules/categories/category.routes';
import challanRoutes from './modules/challans/challan.routes';
import userRoutes from './modules/users/user.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

const app: Express = express();

// Security and utility Middlewares
app.use(helmet());
app.use(
  cors({
    // During local development allow all origins so Vite may pick any port (5173/5174/5175...)
    origin: config.nodeEnv === 'development' ? true : config.cors.origin,
    credentials: true,
  })
);
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(express.json());

// Base Route
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
