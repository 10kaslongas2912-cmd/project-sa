import React from 'react';
import { 
  Home, 
  Heart, 
  Users, 
  DollarSign, 
  Calendar, 
  Stethoscope, 
  Shield,
  PawPrint,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import './style.css';

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeMenu, 
  setActiveMenu, 
  sidebarOpen, 
  setSidebarOpen 
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'แดชบอร์ด', icon: Home },
    { id: 'dogs', label: 'จัดการข้อมูลสุนัข', icon: PawPrint },
    { id: 'adoption', label: 'การรับเลี้ยง', icon: Heart },
    { id: 'donation', label: 'การบริจาค', icon: DollarSign },
    { id: 'visits', label: 'ตารางการเยี่ยมชม', icon: Calendar },
    { id: 'medical', label: 'บันทึกการรักษา', icon: Stethoscope },
    { id: 'support', label: 'การอุปถัมภ์สนับสนุน', icon: Shield },
    { id: 'reports', label: 'รายงานสถิติ', icon: BarChart3 }
  ];

  return (
    <>
      {/* Sidebar Overlay for mobile */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        {/* Logo Section */}
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <PawPrint size={24} />
            </div>
            <div className="logo-text">
              <h2>Dog Shelter</h2>
              <span>Management System</span>
            </div>
          </div>
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sidebar-toggle"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <ul className="menu-list">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              
              return (
                <li key={item.id} className="menu-item">
                  <button
                    onClick={() => setActiveMenu(item.id)}
                    className={`menu-link ${isActive ? 'active' : ''}`}
                    title={!sidebarOpen ? item.label : ''}
                  >
                    <Icon size={20} className="menu-icon" />
                    <span className="menu-label">{item.label}</span>
                    {isActive && <div className="active-indicator" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-version">
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;