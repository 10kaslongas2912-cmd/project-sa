import React, { useState } from 'react';
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

const DogShelterDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const stats = [
    { 
      title: 'จำนวนสุนัขในศูนย์', 
      value: '127', 
      change: '+5', 
      color: '#3b82f6',
      bgColor: '#eff6ff'
    },
    { 
      title: 'การรับเลี้ยงเดือนนี้', 
      value: '23', 
      change: '+12', 
      color: '#10b981',
      bgColor: '#f0fdf4'
    },
    { 
      title: 'เงินบริจาคเดือนนี้', 
      value: '₿45,230', 
      change: '+18%', 
      color: '#f59e0b',
      bgColor: '#fffbeb'
    },
    { 
      title: 'จำนวนอาสาสมัคร', 
      value: '34', 
      change: '+3', 
      color: '#8b5cf6',
      bgColor: '#faf5ff'
    }
  ];

  const recentActivities = [
    { type: 'adoption', message: 'น้องชาโดว์ได้บ้านใหม่แล้ว', time: '2 ชั่วโมงที่แล้ว' },
    { type: 'medical', message: 'น้องมิกิ้ได้รับการฉีดวัคซีนแล้ว', time: '4 ชั่วโมงที่แล้ว' },
    { type: 'donation', message: 'ได้รับการบริจาค ₿2,500', time: '6 ชั่วโมงที่แล้ว' },
    { type: 'visit', message: 'มีผู้เข้าเยี่ยมชม 12 ท่าน', time: '1 วันที่แล้ว' }
  ];

  const upcomingEvents = [
    { title: 'วันฉีดวัคซีนประจำเดือน', date: '15 ก.พ. 2025', type: 'medical' },
    { title: 'งานหาบ้านให้สุนัข', date: '20 ก.พ. 2025', type: 'adoption' },
    { title: 'การประชุมอาสาสมัคร', date: '25 ก.พ. 2025', type: 'meeting' }
  ];

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="page-header">
        <h1>แดชบอร์ดหลัก</h1>
        <p>ข้อมูลสถิติของศูนย์พักพิงสุนัข</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ backgroundColor: stat.bgColor }}>
            <div className="stat-header">
              <h3 style={{ color: stat.color }}>{stat.title}</h3>
              <span className="stat-change" style={{ color: stat.color }}>
                {stat.change}
              </span>
            </div>
            <div className="stat-value" style={{ color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Recent Activities */}
        <div className="content-card">
          <h3>กิจกรรมล่าสุด</h3>
          <div className="activity-list">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'adoption' && <Heart size={16} />}
                  {activity.type === 'medical' && <Stethoscope size={16} />}
                  {activity.type === 'donation' && <DollarSign size={16} />}
                  {activity.type === 'visit' && <Users size={16} />}
                </div>
                <div className="activity-content">
                  <p>{activity.message}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="content-card">
          <h3>กิจกรรมที่กำลังจะมาถึง</h3>
          <div className="events-list">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="event-item">
                <div className="event-date">{event.date}</div>
                <div className="event-title">{event.title}</div>
                <div className={`event-type ${event.type}`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="content-card">
          <h3>การดำเนินการด่วน</h3>
          <div className="quick-actions">
            <button className="action-btn primary">เพิ่มสุนัขใหม่</button>
            <button className="action-btn secondary">บันทึกการรักษา</button>
            <button className="action-btn secondary">จัดการการนัดหมาย</button>
            <button className="action-btn secondary">ดูรายงานสถิติ</button>
          </div>
        </div>

        {/* Health Status */}
        <div className="content-card">
          <h3>สถานะสุขภาพสุนัข</h3>
          <div className="health-stats">
            <div className="health-item">
              <span className="health-label">สุขภาพดี</span>
              <div className="health-bar">
                <div className="health-progress" style={{ width: '85%', backgroundColor: '#10b981' }}></div>
              </div>
              <span className="health-count">108</span>
            </div>
            <div className="health-item">
              <span className="health-label">กำลังรักษา</span>
              <div className="health-bar">
                <div className="health-progress" style={{ width: '12%', backgroundColor: '#f59e0b' }}></div>
              </div>
              <span className="health-count">15</span>
            </div>
            <div className="health-item">
              <span className="health-label">ต้องดูแลเป็นพิเศษ</span>
              <div className="health-bar">
                <div className="health-progress" style={{ width: '3%', backgroundColor: '#ef4444' }}></div>
              </div>
              <span className="health-count">4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlaceholder = (title: string) => (
    <div className="placeholder-content">
      <h1>{title}</h1>
      <p>หน้านี้อยู่ระหว่างการพัฒนา</p>
      <div className="placeholder-box">
        <PawPrint size={64} color="#e5e7eb" />
        <p>เนื้อหาจะถูกเพิ่มในอนาคต</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return renderDashboard();
      case 'dogs':
        return renderPlaceholder('จัดการข้อมูลสุนัข');
      case 'adoption':
        return renderPlaceholder('การรับเลี้ยง');
      case 'donation':
        return renderPlaceholder('การบริจาค');
      case 'visits':
        return renderPlaceholder('ตารางการเยี่ยมชม');
      case 'medical':
        return renderPlaceholder('บันทึกการรักษา');
      case 'support':
        return renderPlaceholder('การอุปถัมภ์สนับสนุน');
      case 'reports':
        return renderPlaceholder('รายงานสถิติ');
      default:
        return renderDashboard();
    }
  };

  return (
    <div className={`app ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar Overlay for mobile */}
      <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>

      {/* Menu Toggle Button */}
      <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <PawPrint size={28} />
            <h2>Dog Shelter</h2>
          </div>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
                onClick={() => setActiveMenu(item.id)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default DogShelterDashboard;