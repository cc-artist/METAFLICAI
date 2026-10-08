import React from 'react';
import '../styles/SubMenu.css';

interface SubMenuProps {
  activeTab: string;
  onSubMenuClick: (subMenuId: string) => void;
}

const SubMenu: React.FC<SubMenuProps> = ({ activeTab, onSubMenuClick }) => {
  // Submenu items for each main tab
  const subMenuItems = {
    videos: [
      { id: 'short-drama', label: '短剧' },
      { id: 'comic-drama', label: '漫剧' },
      { id: 'variety', label: '综艺' },
      { id: 'event', label: '赛事&演出' },
      { id: 'super-ip', label: '超级IP' },
      { id: 'high-concept', label: '高概念' },
      { id: 'family', label: '合家欢' }
    ],
    companions: [
      { id: 'my-companions', label: '我的AI影伴' },
      { id: 'create-companion', label: '创建影伴' },
      { id: 'find-companions', label: '寻找影伴' },
      { id: 'cross-region', label: '跨地域连线' }
    ],
    'ai-viewing': [
      { id: 'ai-subtitles', label: 'AI字幕翻译' },
      { id: 'emoji-generation', label: '生成表情包' },
      { id: '3d-space', label: '3D虚拟空间' },
      { id: 'fan-creation', label: '影视二创' }
    ],
    playlists: [
      { id: 'my-playlists', label: '我的影片单' },
      { id: 'create-playlist', label: '创建影片单' },
      { id: 'recommended-playlists', label: '推荐影片单' },
      { id: 'followed-playlists', label: '关注的影片单' }
    ]
  };

  const items = subMenuItems[activeTab as keyof typeof subMenuItems] || [];

  return (
    <div className="sub-menu">
      <div className="sub-menu-scroll">
        {items.map((item) => (
          <button 
            key={item.id} 
            className="sub-menu-button"
            onClick={() => onSubMenuClick(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubMenu;
