import express from 'express';
import { getAllVideos, getVideoById, initializeVideos } from '../services/crawlerService';

const router = express.Router();

// 初始化视频数据
(async () => {
  await initializeVideos();
})();

/**
 * @route GET /api/v1/videos
 * @desc Get all videos
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, tags } = req.query;
    
    // 获取所有真实爬取的视频
    let videos = await getAllVideos();
    
    console.log(`📥 原始视频数量: ${videos.length}`);
    
    // 筛选激活状态的视频
    const activeVideos = videos.filter(video => {
      const isActive = video.isActive === true;
      if (!isActive) {
        console.log(`⚠️  视频 ${video.title} 的 isActive 为 ${video.isActive}`);
      }
      return isActive;
    });
    videos = activeVideos;
    
    console.log(`✅ 激活状态过滤后视频数量: ${videos.length}`);
    
    // Filter by category
    if (category) {
      // 确保category是字符串类型
      const categoryStr = typeof category === 'string' ? category : Array.isArray(category) ? category[0] : '';
      console.log(`🔍 按分类过滤: ${categoryStr}`);
      // 使用正确的字符串比较
      videos = videos.filter(video => video.category === categoryStr);
      console.log(`✅ 分类过滤后视频数量: ${videos.length}`);
    }
    
    // Search by title or description
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      console.log(`🔍 按搜索词过滤: ${searchTerm}`);
      videos = videos.filter(video => 
        video.title.toLowerCase().includes(searchTerm) || 
        video.description.toLowerCase().includes(searchTerm)
      );
      console.log(`✅ 搜索过滤后视频数量: ${videos.length}`);
    }
    
    // Filter by tags
    if (tags) {
      let tagsArray: string[] = [];
      if (Array.isArray(tags)) {
        tagsArray = tags as string[];
      } else if (typeof tags === 'string') {
        tagsArray = tags.split(',');
      }
      
      if (tagsArray.length > 0) {
        console.log(`🔍 按标签过滤: ${tagsArray.join(', ')}`);
        videos = videos.filter(video => 
          tagsArray.some(tag => video.tags.includes(tag))
        );
        console.log(`✅ 标签过滤后视频数量: ${videos.length}`);
      }
    }
    
    // Pagination
    const currentPage = parseInt(page as string);
    const itemsPerPage = parseInt(limit as string);
    const skip = (currentPage - 1) * itemsPerPage;
    const paginatedVideos = videos.slice(skip, skip + itemsPerPage);
    
    res.status(200).json({
      status: 'success',
      data: {
        videos: paginatedVideos,
        pagination: {
          currentPage,
          totalPages: Math.ceil(videos.length / itemsPerPage),
          totalVideos: videos.length,
          limit: itemsPerPage
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '获取视频列表失败',
      error: (error as Error).message
    });
  }
});

/**
 * @route GET /api/v1/videos/:id
 * @desc Get a single video by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const video = await getVideoById(req.params.id);
    
    if (!video || !video.isActive) {
      return res.status(404).json({
        status: 'error',
        message: '视频不存在或已下架'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { video }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '获取视频详情失败',
      error: (error as Error).message
    });
  }
});

/**
 * @route GET /api/v1/videos/categories
 * @desc Get all video categories
 * @access Public
 */
router.get('/categories/list', async (req, res) => {
  try {
    const videos = await getAllVideos();
    const categories = [...new Set(videos.map(video => video.category))];
    
    res.status(200).json({
      status: 'success',
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '获取分类列表失败',
      error: (error as Error).message
    });
  }
});

/**
 * @route GET /api/v1/videos/trending
 * @desc Get trending videos
 * @access Public
 */
router.get('/trending/list', async (req, res) => {
  try {
    const videos = (await getAllVideos())
      .filter(video => video.isActive)
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 10);
    
    res.status(200).json({
      status: 'success',
      data: { videos }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '获取热门视频失败',
      error: (error as Error).message
    });
  }
});

export default router;
