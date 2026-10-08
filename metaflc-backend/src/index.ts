import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import videoRoutes from './routes/videoRoutes';
import userRoutes from './routes/userRoutes';
import crawlerRoutes from './routes/crawlerRoutes';
import { initializeVideos, startAutoCrawl } from './services/crawlerService';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize video data
initializeVideos();

// Routes
app.use(`${API_PREFIX}/videos`, videoRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/crawler`, crawlerRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'MetaFLC Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Start server only when not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}${API_PREFIX}`);
    console.log(`📺 已初始化公共领域视频资源`);
    
    // 启动自动爬虫，每30分钟运行一次
    console.log('⏰ 启动自动爬虫服务...');
    startAutoCrawl(30 * 60 * 1000); // 30分钟
  });
}

// Export app for Vercel serverless
export default app;
