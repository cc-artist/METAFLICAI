import React, { useState, useEffect, useRef } from 'react';
import '../styles/VideoList.css';

interface Video {
  _id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: number;
  category: string;
  subCategory: string;
  tags: string[];
  source: string;
  language: string;
  releaseDate: string;
  releaseYear: number;
  rating: number;
  viewCount: number;
  likes: number;
}

interface VideoListProps {
  onVideoSelect: (video: Video) => void;
  isVisible: boolean;
  onClose: () => void;
  selectedCategory: string;
}

const VideoList: React.FC<VideoListProps> = ({ onVideoSelect, isVisible, onClose, selectedCategory }) => {
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // 滚动容器引用
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // 滚动速度引用
  const scrollSpeedRef = useRef<number>(0);
  // 动画帧ID引用
  const animationFrameRef = useRef<number>(0);
  // 滚动动画活跃状态
  const isScrollingRef = useRef<boolean>(false);
  // 自动隐藏定时器引用
  const autoHideTimerRef = useRef<number | null>(null);
  // 鼠标是否在视频列表上的引用
  const isMouseOverRef = useRef<boolean>(false);
  
  // 鼠标移动处理函数 - 只有鼠标在容器边缘时才触发滚动
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const mouseX = e.clientX;
    
    // 计算触发滚动的边缘区域宽度（容器宽度的20%）
    const edgeWidth = containerRect.width * 0.2;
    
    // 检查鼠标是否在左边缘区域
    if (mouseX < containerRect.left + edgeWidth) {
      // 左边缘 - 向左滚动
      scrollSpeedRef.current = -2; // 固定向左滚动速度
      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
        smoothScroll();
      }
    }
    // 检查鼠标是否在右边缘区域
    else if (mouseX > containerRect.right - edgeWidth) {
      // 右边缘 - 向右滚动
      scrollSpeedRef.current = 2; // 固定向右滚动速度
      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
        smoothScroll();
      }
    }
    // 鼠标在中间区域 - 停止滚动
    else {
      scrollSpeedRef.current = 0;
    }
  };
  
  // 鼠标离开容器时停止滚动
  const handleMouseLeave = () => {
    scrollSpeedRef.current = 0;
  };
  
  // 视频卡鼠标悬停时停止滚动
  const handleVideoCardMouseEnter = () => {
    scrollSpeedRef.current = 0;
  };
  
  // 平滑滚动函数
  const smoothScroll = () => {
    if (!scrollContainerRef.current) {
      isScrollingRef.current = false;
      return;
    }
    
    const container = scrollContainerRef.current;
    
    // 应用滚动速度
    if (Math.abs(scrollSpeedRef.current) > 0.5) {
      container.scrollLeft += scrollSpeedRef.current; // 直接使用固定速度滚动
      
      // 继续动画
      animationFrameRef.current = requestAnimationFrame(smoothScroll);
    } else {
      // 停止动画
      scrollSpeedRef.current = 0;
      isScrollingRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };
  
  // 重置自动隐藏定时器
  const resetAutoHideTimer = () => {
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
    }
    
    autoHideTimerRef.current = setTimeout(() => {
      // 如果鼠标不在视频列表上，自动隐藏
      if (!isMouseOverRef.current) {
        onClose();
      }
    }, 5000) as unknown as number;
  };
  
  // 鼠标进入视频列表容器时
  const handleContainerMouseEnter = () => {
    isMouseOverRef.current = true;
    // 重置定时器
    resetAutoHideTimer();
  };
  
  // 鼠标离开视频列表容器时
  const handleContainerMouseLeave = () => {
    isMouseOverRef.current = false;
    // 重置定时器，5秒后自动隐藏
    resetAutoHideTimer();
  };
  
  // 视频卡鼠标点击时
  const handleVideoCardClick = (video: Video) => {
    onVideoSelect(video);
    onClose(); // 选择视频后关闭菜单
  };
  
  // 组件挂载时，启动自动隐藏定时器
  useEffect(() => {
    if (isVisible) {
      resetAutoHideTimer();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current);
      }
    };
  }, [isVisible]);

  // 根据selectedCategory获取分类名称映射
  const getCategoryNameFromId = (categoryId: string) => {
    const categoryMap: Record<string, string> = {
      'short-drama': '短剧',
      'comic-drama': '漫剧',
      'variety': '综艺',
      'event': '赛事&演出',
      'super-ip': '超级IP',
      'high-concept': '高概念',
      'family': '合家欢'
    };
    return categoryMap[categoryId] || '';
  };

  // 当selectedCategory变化时，从后端获取相应分类的视频
  useEffect(() => {
    const fetchVideosByCategory = async () => {
      try {
        setLoading(true);
        console.log(`开始获取视频数据，选中的分类ID: ${selectedCategory}`);
        // 根据selectedCategory获取对应的分类名称
        const categoryName = getCategoryNameFromId(selectedCategory);
        console.log(`获取分类名称成功: ${categoryName}`);
        // 构建请求URL，包含分类参数
        const url = `/api/v1/videos?category=${encodeURIComponent(categoryName)}`;
        console.log(`构建请求URL成功: ${url}`);
        
        // 先检查API是否可访问
        const healthResponse = await fetch('/api/v1/videos', { method: 'HEAD' });
        console.log(`API健康检查: ${healthResponse.status}`);
        
        const response = await fetch(url);
        console.log(`API请求返回状态: ${response.status}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch videos from backend, status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log(`API返回原始文本长度: ${text.length}`);
        console.log(`API返回原始文本前100个字符: ${text.substring(0, 100)}`);
        
        const data = JSON.parse(text);
        console.log(`API返回解析后的数据:`, data);
        
        if (!data || !data.data || !Array.isArray(data.data.videos)) {
          throw new Error('Invalid data format from backend');
        }
        
        // 直接设置过滤后的视频
        setFilteredVideos(data.data.videos);
        console.log(`从后端获取到${categoryName}分类的视频数据:`, data.data.videos);
        console.log(`视频数据长度:`, data.data.videos.length);
        if (data.data.videos.length > 0) {
          console.log(`第一个视频数据:`, data.data.videos[0]);
        }
      } catch (err) {
        console.error('Error fetching videos:', err);
        console.error('Error stack:', (err as Error).stack);
        setError('无法连接到后端获取视频数据');
        // 清空过滤后的视频
        setFilteredVideos([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedCategory) {
      fetchVideosByCategory();
    } else {
      setFilteredVideos([]);
    }
  }, [selectedCategory]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="video-list-container">
        <div className="loading">加载视频列表中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-list-container">
        <div className="error">加载失败: {error}</div>
      </div>
    );
  }

  // 如果不可见，不渲染
  if (!isVisible) {
    return null;
  }

  // 根据selectedCategory获取分类名称
  const getCategoryName = (categoryId: string) => {
    const categoryMap: Record<string, string> = {
      'short-drama': '短剧',
      'comic-drama': '漫剧',
      'variety': '综艺',
      'event': '赛事&演出',
      'super-ip': '超级IP',
      'high-concept': '高概念',
      'family': '合家欢'
    };
    return categoryMap[categoryId] || '推荐视频';
  };

  return (
    <div 
      className="video-floating-container"
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
      onMouseMove={resetAutoHideTimer}
    >
      <div className="video-floating-header">
        <h3 className="video-floating-title">{getCategoryName(selectedCategory)}</h3>
        <button className="video-floating-close" onClick={onClose}>×</button>
      </div>
      <div 
        className="video-floating-scroll"
        ref={scrollContainerRef}
        onMouseMove={(e) => {
          handleMouseMove(e);
          resetAutoHideTimer();
        }}
        onMouseLeave={handleMouseLeave}
      >
        <div style={{ color: '#fff', margin: '10px' }}>当前分类视频数量: {filteredVideos.length}</div>
        {filteredVideos.length > 0 ? (
          filteredVideos.map((video, index) => {
            console.log(`渲染视频卡 ${index}:`, video);
            return (
              <div 
                key={video._id} 
                className="video-floating-card" 
                onClick={() => handleVideoCardClick(video)}
                onMouseEnter={() => {
                  handleVideoCardMouseEnter();
                  resetAutoHideTimer();
                }}
              >
                <div className="video-floating-thumbnail-container">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="video-floating-thumbnail" 
                    onError={(e) => {
                      console.error(`图片加载失败: ${video.thumbnail}`);
                      // 图片加载失败时使用默认图片
                      const img = e.target as HTMLImageElement;
                      img.src = 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg';
                    }}
                    onLoad={() => {
                      console.log(`图片加载成功: ${video.thumbnail}`);
                    }}
                  />
                  <div className="video-floating-duration">{formatDuration(video.duration)}</div>
                </div>
                <div className="video-floating-info">
                  <h4 className="video-floating-title-small">{video.title}</h4>
                  <div className="video-floating-meta-main">
                    <span className="video-floating-year">{video.releaseYear}</span>
                    <span className="video-floating-rating">⭐ {video.rating}</span>
                    <span className="video-floating-category">{video.category}</span>
                  </div>
                  <p className="video-floating-description">{video.description}</p>
                  <div className="video-floating-meta">
                    <span className="video-floating-view-count">{video.viewCount} 次观看</span>
                    <span className="video-floating-likes">❤️ {video.likes}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-videos" style={{ color: '#fff', margin: '20px' }}>该分类暂无视频资源</div>
        )}
      </div>
    </div>
  );
};

export default VideoList;
