import React, { useState, useRef, useEffect } from 'react';
import './styles/App.css';
import VideoPlayer from './components/VideoPlayer';
import BottomNavigation from './components/BottomNavigation';
import SubMenu from './components/SubMenu';
import VideoList from './components/VideoList';

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

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('videos');
  const [showSubMenu, setShowSubMenu] = useState<boolean>(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showVideoList, setShowVideoList] = useState<boolean>(false); // 初始隐藏视频列表
  const [selectedCategory, setSelectedCategory] = useState<string>('short-drama'); // 初始选中短剧
  // 添加状态来控制是否显示工具栏和菜单
  const [showNavigation, setShowNavigation] = useState<boolean>(true);
  // 定时器引用
  const hideNavigationTimer = useRef<number | null>(null);
  
  // 重置隐藏导航栏的定时器
  const resetHideNavigationTimer = () => {
    // 显示导航栏
    setShowNavigation(true);
    
    // 清除之前的定时器
    if (hideNavigationTimer.current) {
      clearTimeout(hideNavigationTimer.current);
    }
    
    // 设置新的定时器，5秒后隐藏导航栏
    hideNavigationTimer.current = setTimeout(() => {
      setShowNavigation(false);
    }, 5000) as unknown as number;
  };
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (hideNavigationTimer.current) {
        clearTimeout(hideNavigationTimer.current);
      }
    };
  }, []);
  
  // 当用户与应用交互时，重置隐藏导航栏的定时器
  useEffect(() => {
    // 监听各种用户交互事件
    const interactionEvents = ['mousemove', 'mousedown', 'touchstart', 'keydown', 'click'];
    
    const handleInteraction = () => {
      resetHideNavigationTimer();
    };
    
    // 添加事件监听器
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleInteraction);
    });
    
    // 清理事件监听器
    return () => {
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, []);

  // 当组件挂载或activeTab变化时，更新视频列表显示状态
  useEffect(() => {
    // 如果当前激活的标签是'videos'，显示视频列表
    if (activeTab === 'videos') {
      setShowVideoList(true);
    } else {
      setShowVideoList(false);
    }
  }, [activeTab]);

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  // 处理底部导航点击
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setShowSubMenu(true);
    // 点击"影视资源"时显示视频列表
    if (tabId === 'videos') {
      setShowVideoList(true);
    } else {
      setShowVideoList(false);
    }
  };

  // 处理下级菜单点击
  const handleSubMenuClick = (subMenuId: string) => {
    // 点击视频相关的下级菜单时显示视频列表
    if (activeTab === 'videos') {
      setSelectedCategory(subMenuId); // 更新选中的分类
      setShowVideoList(true);
    }
  };

  return (
    <div className="app-container">
      {/* 只有在showNavigation为true时才显示LOGO和搜索栏 */}
      {showNavigation && (
        <div className="top-left-header">
          <div className="logo">
            <h1>元影</h1>
          </div>
          <div className="search-container">
            <input 
              type="text" 
              className="search-input" 
              placeholder="搜索影视资源..." 
            />
            <button className="search-button">🔍</button>
          </div>
        </div>
      )}
      <div className="player-container">
        <VideoPlayer video={selectedVideo} />
        {/* 将视频列表集成到播放器容器中 */}
        <VideoList 
          onVideoSelect={handleVideoSelect} 
          isVisible={showVideoList} 
          onClose={() => setShowVideoList(false)} 
          selectedCategory={selectedCategory} 
        />
      </div>
      {/* 只有在showNavigation为true时才显示工具栏和菜单 */}
      {showNavigation && (
        <div className="navigation-container">
          <BottomNavigation 
            activeTab={activeTab} 
            setActiveTab={handleTabClick} 
            setShowSubMenu={setShowSubMenu} 
          />
          {showSubMenu && <SubMenu 
            activeTab={activeTab} 
            onSubMenuClick={handleSubMenuClick} 
          />
          }
        </div>
      )}
    </div>
  );
};

export default App;
