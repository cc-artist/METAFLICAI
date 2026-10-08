import express from 'express';
import { crawlVideos, startAutoCrawl } from '../services/crawlerService';

const router = express.Router();

let autoCrawlInterval: NodeJS.Timeout | null = null;

/**
 * @route GET /api/v1/crawler/start
 * @desc Start manual crawling
 * @access Public
 */
router.get('/start', async (req, res) => {
  try {
    const crawledVideos = await crawlVideos();
    
    res.status(200).json({
      status: 'success',
      message: '爬虫任务已启动',
      data: {
        crawledVideos: crawledVideos.length,
        videos: crawledVideos
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '爬虫任务失败',
      error: (error as Error).message
    });
  }
});

/**
 * @route GET /api/v1/crawler/auto-start
 * @desc Start automatic crawling
 * @access Public
 */
router.get('/auto-start', (req, res) => {
  try {
    const { interval = 3600000 } = req.query;
    
    if (autoCrawlInterval) {
      clearInterval(autoCrawlInterval);
    }
    
    autoCrawlInterval = startAutoCrawl(parseInt(interval as string));
    
    res.status(200).json({
      status: 'success',
      message: '自动爬虫已启动',
      data: {
        interval: parseInt(interval as string),
        intervalMinutes: parseInt(interval as string) / 1000 / 60
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '自动爬虫启动失败',
      error: (error as Error).message
    });
  }
});

/**
 * @route GET /api/v1/crawler/auto-stop
 * @desc Stop automatic crawling
 * @access Public
 */
router.get('/auto-stop', (req, res) => {
  try {
    if (autoCrawlInterval) {
      clearInterval(autoCrawlInterval);
      autoCrawlInterval = null;
      
      res.status(200).json({
        status: 'success',
        message: '自动爬虫已停止'
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: '自动爬虫未运行'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '停止自动爬虫失败',
      error: (error as Error).message
    });
  }
});

/**
 * @route GET /api/v1/crawler/status
 * @desc Get crawler status
 * @access Public
 */
router.get('/status', (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      data: {
        isAutoCrawlRunning: !!autoCrawlInterval
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '获取爬虫状态失败',
      error: (error as Error).message
    });
  }
});

export default router;
