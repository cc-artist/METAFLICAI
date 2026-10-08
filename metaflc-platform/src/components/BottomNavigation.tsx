import React from 'react';
import '../styles/BottomNavigation.css';

interface BottomNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setShowSubMenu: (show: boolean) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, setActiveTab, setShowSubMenu }) => {
  const tabs = [
    { id: 'videos', label: '影视资源', icon: '🎬' },
    { id: 'companions', label: '影伴', icon: '🤖' },
    { id: 'ai-viewing', label: 'AI观影', icon: '🧠' },
    { id: 'playlists', label: '影片单', icon: '📋' }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setShowSubMenu(true);
  };

  return (
    <div className="bottom-navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => handleTabClick(tab.id)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNavigation;
