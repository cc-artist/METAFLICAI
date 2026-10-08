import React, { useState, useRef, useEffect } from 'react';
import '../styles/VideoPlayer.css';

// 视频类型定义
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

// 组件属性定义
interface VideoPlayerProps {
  video?: Video | null;
  subtitleUrl?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.7);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // 默认视频URL，使用真实的Google Sample Video
  const defaultVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  
  // 当前实际使用的视频URL
  const currentVideoUrl = video?.url || defaultVideoUrl;
  console.log('当前视频URL:', currentVideoUrl);
  
  // 定时器引用
  const hideControlsTimer = useRef<number | null>(null);
  
  // 重置隐藏控制栏的定时器
  const resetHideControlsTimer = () => {
    setShowControls(true);
    
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    
    hideControlsTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 5000) as unknown as number;
  };
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, []);

  // 当用户与视频播放器交互时，重置隐藏控制栏的定时器
  useEffect(() => {
    const playerContainer = document.querySelector('.video-player');
    
    if (playerContainer) {
      const interactionEvents = ['mousemove', 'mousedown', 'touchstart', 'keydown', 'click'];
      
      const handleInteraction = () => {
        resetHideControlsTimer();
      };
      
      interactionEvents.forEach(event => {
        playerContainer.addEventListener(event, handleInteraction);
      });
      
      return () => {
        interactionEvents.forEach(event => {
          playerContainer.removeEventListener(event, handleInteraction);
        });
      };
    }
  }, []);
  
  // 设置音量
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  // 当视频URL变化时，重新加载视频
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // 重置播放状态
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      
      console.log('加载视频URL:', currentVideoUrl);
      
      // 确保视频元素支持CORS
      video.crossOrigin = 'anonymous';
      
      // 直接设置视频源
      video.src = currentVideoUrl;
      
      // 监听加载事件
      const handleLoadedMetadata = () => {
        console.log('视频元数据加载完成:', {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight
        });
        setDuration(video.duration);
      };
      
      const handleCanPlay = () => {
        console.log('视频可以播放了:', currentVideoUrl);
        // 不自动播放，等待用户点击
      };
      
      const handleError = (e: Event) => {
        const videoElement = e.target as HTMLVideoElement;
        console.error('视频加载错误:', {
          code: videoElement.error?.code,
          message: videoElement.error?.message,
          url: currentVideoUrl
        });
        // 加载失败时使用默认视频
        if (currentVideoUrl !== defaultVideoUrl) {
          console.log('使用默认视频:', defaultVideoUrl);
          video.src = defaultVideoUrl;
          video.load();
        }
      };
      
      // 添加事件监听器
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);
      
      // 加载视频
      video.load();
      
      // 清理事件监听器
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
      };
    }
  }, [currentVideoUrl]);

  // 更新播放状态和时间
  useEffect(() => {
    const updateCurrentTime = () => {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
      }
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener('timeupdate', updateCurrentTime);
      video.addEventListener('play', () => setIsPlaying(true));
      video.addEventListener('pause', () => setIsPlaying(false));
      video.addEventListener('loadedmetadata', () => {
        if (videoRef.current) {
          setDuration(videoRef.current.duration);
        }
      });

      return () => {
        video.removeEventListener('timeupdate', updateCurrentTime);
        video.removeEventListener('play', () => setIsPlaying(true));
        video.removeEventListener('pause', () => setIsPlaying(false));
      };
    }
  }, []);

  // 播放/暂停控制
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 进度条控制
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // 音量控制
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  // 全屏切换函数
  const toggleFullscreen = () => {
    const videoContainer = document.querySelector('.video-player');
    if (videoContainer) {
      if (!isFullscreen) {
        // 进入全屏
        if (videoContainer.requestFullscreen) {
          videoContainer.requestFullscreen();
        } else if ((videoContainer as any).webkitRequestFullscreen) {
          (videoContainer as any).webkitRequestFullscreen();
        } else if ((videoContainer as any).mozRequestFullScreen) {
          (videoContainer as any).mozRequestFullScreen();
        } else if ((videoContainer as any).msRequestFullscreen) {
          (videoContainer as any).msRequestFullscreen();
        }
      } else {
        // 退出全屏
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      }
    }
  };

  // 监听全屏变化事件
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreenActive = !!(document.fullscreenElement || 
        (document as any).webkitFullscreenElement || 
        (document as any).mozFullScreenElement || 
        (document as any).msFullscreenElement);
      setIsFullscreen(isFullscreenActive);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="video-player">
      {/* 视频元素 */}
      <video
        ref={videoRef}
        className="video-element"
        onClick={togglePlay}
        playsInline
        controls={true}
        src={currentVideoUrl}
        onError={(e) => {
          console.error('视频加载失败:', e);
          const video = e.target as HTMLVideoElement;
          console.error('视频加载失败详细信息:', video.error?.code, video.error?.message);
          video.src = defaultVideoUrl;
          video.load();
        }}
        onLoadedMetadata={() => {
          console.log('视频加载成功:', currentVideoUrl);
          if (videoRef.current) {
            console.log('视频元数据:', videoRef.current.duration, videoRef.current.videoWidth, videoRef.current.videoHeight);
          }
        }}
      />
      
      {/* 视频信息 - 显示影视名称和简介等信息 */}
      {video && (
        <div className="video-info-overlay">
          <div className="video-info-container">
            <h2 className="video-title">{video.title}</h2>
            <div className="video-meta">
              <span className="video-year">{video.releaseYear}</span>
              <span className="video-category">{video.category}</span>
              <span className="video-rating">⭐ {video.rating}</span>
            </div>
            <div className="video-description">{video.description}</div>
          </div>
        </div>
      )}

      {/* 只有showControls为true时才显示自定义控制栏 */}
      {showControls && (
        <div className="controls-overlay">
          <div className="bottom-controls">
            <div className="progress-bar-container">
              <input
                type="range"
                className="progress-bar"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSeek}
              />
            </div>
            
            <div className="control-buttons">
              <button className="control-button" onClick={togglePlay}>
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              
              <div className="volume-control">
                <span className="volume-icon">🔊</span>
                <input
                  type="range"
                  className="volume-slider"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                />
              </div>
              
              <button className="control-button" onClick={toggleFullscreen}>
                {isFullscreen ? '⛶⬅️' : '➡️⛶'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
