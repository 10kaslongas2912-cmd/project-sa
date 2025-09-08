import React, { useState } from 'react';
import { 
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu
} from 'lucide-react';
import Slidebar from '../../components/SlideBarTest';
import './style.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const notifications = [
    { id: 1, message: 'น้องชาโดว์ได้บ้านใหม่แล้ว', time: '2 ชั่วโมงที่แล้ว', unread: true },
    { id: 2, message: 'มีการบริจาคเงินจำนวน ₿2,500', time: '4 ชั่วโมงที่แล้ว', unread: true },
    { id: 3, message: 'การนัดหมายวันพรุ่งนี้ 3 รายการ', time: '6 ชั่วโมงที่แล้ว', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleNotificationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    setShowProfile(false);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProfile(!showProfile);
    setShowNotifications(false);
  };

  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowNotifications(false);
      setShowProfile(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      <Slidebar 
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Header */}
      <header className="header">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="mobile-menu-btn"
        >
          <Menu size={20} />
        </button>

        {/* Header title */}
        <div className="header-title">
          <h1>ระบบจัดการศูนย์พักพิงสุนัข</h1>
        </div>

        {/* Header actions */}
        <div className="header-actions">
          {/* Notifications */}
          <div className="notification-wrapper">
            <button
              onClick={handleNotificationClick}
              className="notification-btn"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="dropdown-header">
                  <h3>การแจ้งเตือน</h3>
                  <span className="notification-count">{unreadCount} ใหม่</span>
                </div>
                <div className="notification-list">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${notification.unread ? 'unread' : ''}`}
                    >
                      <div className="notification-content">
                        <p>{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                      {notification.unread && <div className="unread-dot"></div>}
                    </div>
                  ))}
                </div>
                <div className="dropdown-footer">
                  <button className="view-all-btn">ดูทั้งหมด</button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="profile-wrapper">
            <button
              onClick={handleProfileClick}
              className="profile-btn"
            >
              <div className="profile-avatar">
                <User size={16} />
              </div>
              <div className="profile-info">
                <span className="profile-name">สมชาย ใจดี</span>
                <span className="profile-role">เจ้าหน้าที่</span>
              </div>
              <ChevronDown size={16} className="profile-chevron" />
            </button>

            {showProfile && (
              <div className="profile-dropdown">
                <div className="profile-header">
                  <div className="profile-avatar large">
                    <User size={24} />
                  </div>
                  <div>
                    <h3>สมชาย ใจดี</h3>
                    <p>somchai@dogshelter.com</p>
                  </div>
                </div>
                
                <div className="profile-menu">
                  <button className="profile-menu-item">
                    <User size={16} />
                    <span>ข้อมูลส่วนตัว</span>
                  </button>
                  <button className="profile-menu-item">
                    <Settings size={16} />
                    <span>การตั้งค่า</span>
                  </button>
                  <hr className="profile-divider" />
                  <button className="profile-menu-item logout">
                    <LogOut size={16} />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;