import React, { useState, useRef, useEffect } from "react";
import "./style.css";
import { Outlet } from "react-router-dom";
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
  X,
} from "lucide-react";
import logo from "../../assets/logo.png";

// Types
interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: "info" | "warning" | "success" | "error";
}

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

const sampleStaff: Staff = {
  id: "1",
  name: "สมชาย ใจดี",
  email: "somchai@company.com",
  role: "Senior Manager",
  avatar: "", // Leave empty to show initials
};

const sampleNotifications: Notification[] = [
  {
    id: "1",
    title: "งานใหม่เข้าระบบ",
    message: "มีงานใหม่ที่ต้องการการอนุมัติจากคุณ",
    time: "5 นาทีที่แล้ว",
    isRead: false,
    type: "info" as const,
  },
  {
    id: "2",
    title: "เตือนการประชุม",
    message: "การประชุมทีมจะเริ่มในอีก 15 นาที",
    time: "10 นาทีที่แล้ว",
    isRead: false,
    type: "warning" as const,
  },
  {
    id: "3",
    title: "อัพเดตสถานะงาน",
    message: "งาน #12345 ได้รับการอนุมัติเรียบร้อย",
    time: "30 นาทีที่แล้ว",
    isRead: true,
    type: "success" as const,
  },
  {
    id: "4",
    title: "ข้อผิดพลาดในระบบ",
    message: "พบข้อผิดพลาดในการประมวลผลข้อมูล",
    time: "1 ชั่วโมงที่แล้ว",
    isRead: true,
    type: "error" as const,
  },
];

const menuItems = [
  { id: "dashboard", label: "แดชบอร์ด", icon: Home },
  { id: "dogs", label: "จัดการข้อมูลสุนัข", icon: PawPrint },
  { id: "adoption", label: "การรับเลี้ยง", icon: Heart },
  { id: "donation", label: "การบริจาค", icon: DollarSign },
  { id: "visits", label: "ตารางการเยี่ยมชม", icon: Calendar },
  { id: "medical", label: "บันทึกการรักษา", icon: Stethoscope },
  { id: "support", label: "การอุปถัมภ์สนับสนุน", icon: Shield },
  { id: "reports", label: "รายงานสถิติ", icon: BarChart3 },
];

const DashboardLayout: React.FC = () => {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    setIsNotificationDropdownOpen(false);
  };

  const handleNotificationClick = () => {
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
    setIsProfileDropdownOpen(false);
  };

  const handleProfileMenuClick = (action: string) => {
    console.log("Profile menu action:", action);

    switch (action) {
      case "profile":
        alert("เปิดหน้าข้อมูลส่วนตัว");
        break;
      case "settings":
        alert("เปิดหน้าการตั้งค่า");
        break;
      case "help":
        alert("เปิดหน้าความช่วยเหลือ");
        break;
      case "logout":
        if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
          alert("ทำการออกจากระบบ");
        }
        break;
      default:
        break;
    }
    setIsProfileDropdownOpen(false);
  };

  const handleNotificationItemClick = (notification: Notification) => {
    console.log("Notification clicked:", notification);

    // Mark as read when clicked
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
    );

    alert(`คลิกการแจ้งเตือน: ${notification.title}`);
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    console.log("Marked all notifications as read");
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return "⚠️";
      case "success":
        return "✅";
      case "error":
        return "❌";
      default:
        return "ℹ️";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="container">
      <header className="header-bar">
        <div className="header-content">
          <div className="header-left">
            <div className="sidebar-header">
              <div className="logo">
                <img src={logo} alt="logo" />
              </div>
              <button
                className="toggle-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
          <div className="header-right">
            {/* Notification Bell */}
            <div className="notification-container" ref={notificationRef}>
              <button
                className="notification-btn"
                onClick={handleNotificationClick}
                aria-label="Notifications"
              >
                <div className="bell-icon">
                  🔔
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </div>
              </button>

              {isNotificationDropdownOpen && (
                <div className="notification-dropdown">
                  <div className="dropdown-header">
                    <h3>การแจ้งเตือน</h3>
                    {unreadCount > 0 && (
                      <button
                        className="mark-all-read-btn"
                        onClick={handleMarkAllAsRead}
                      >
                        ทำเครื่องหมายอ่านทั้งหมด
                      </button>
                    )}
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="no-notifications">ไม่มีการแจ้งเตือน</div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`notification-item ${
                            !notification.isRead ? "unread" : ""
                          }`}
                          onClick={() =>
                            handleNotificationItemClick(notification)
                          }
                        >
                          <div className="notification-icon">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="notification-content">
                            <h4>{notification.title}</h4>
                            <p>{notification.message}</p>
                            <span className="notification-time">
                              {notification.time}
                            </span>
                          </div>
                          {!notification.isRead && (
                            <div className="unread-dot"></div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Section */}
            <div className="profile-container" ref={profileRef}>
              <button
                className="profile-btn"
                onClick={handleProfileClick}
                aria-label="Profile menu"
              >
                <div className="profile-info">
                  <span className="staff-name">{sampleStaff.name}</span>
                  <span className="staff-role">{sampleStaff.role}</span>
                </div>
                <div className="profile-avatar">
                  {sampleStaff.avatar ? (
                    <img src={sampleStaff.avatar} alt={sampleStaff.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {getInitials(sampleStaff.name)}
                    </div>
                  )}
                </div>
                <div className="dropdown-arrow">▼</div>
              </button>

              {isProfileDropdownOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="profile-details">
                      <div className="profile-avatar-large">
                        {sampleStaff.avatar ? (
                          <img
                            src={sampleStaff.avatar}
                            alt={sampleStaff.name}
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {getInitials(sampleStaff.name)}
                          </div>
                        )}
                      </div>
                      <div className="profile-text">
                        <h3>{sampleStaff.name}</h3>
                        <p>{sampleStaff.email}</p>
                        <span className="role-badge">{sampleStaff.role}</span>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-menu">
                    <button
                      className="menu-item"
                      onClick={() => handleProfileMenuClick("profile")}
                    >
                      <span className="menu-icon">👤</span>
                      ข้อมูลส่วนตัว
                    </button>
                    <button
                      className="menu-item"
                      onClick={() => handleProfileMenuClick("settings")}
                    >
                      <span className="menu-icon">⚙️</span>
                      การตั้งค่า
                    </button>
                    <button
                      className="menu-item"
                      onClick={() => handleProfileMenuClick("help")}
                    >
                      <span className="menu-icon">❓</span>
                      ความช่วยเหลือ
                    </button>
                    <div className="menu-divider"></div>
                    <button
                      className="menu-item logout"
                      onClick={() => handleProfileMenuClick("logout")}
                    >
                      <span className="menu-icon">🚪</span>
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className={`main ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="sidebar">
          <div className={`sidebar-body ${sidebarOpen ? "open" : "closed"}`}>
            <nav className="sidebar-nav">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`nav-item ${
                      activeMenu === item.id ? "active" : ""
                    }`}
                    onClick={() => setActiveMenu(item.id)}
                  >
                    <Icon size={20} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
