import React, { useState, useRef, useEffect } from "react";
import "./style.css"; // Import CSS file
import { useNavigate, useLocation, Outlet } from "react-router-dom";
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
  Search,
  Bell,
  Mail,
  BookOpen,
  CheckSquare,
  Settings,
  LogOut,
  Play,
  Eye,
  ChevronRight,
  ChevronLeft,
  Plus,
  MoreVertical,
  Edit,
} from "lucide-react";
import type { JSX } from "react/jsx-runtime";

// Types
interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: "info" | "warning" | "success" | "error";
}

interface MenuItem {
  id: string;
  label: string;
  icon?: any;
  path?: string; // 👈 เพิ่ม path
  children?: MenuItem[]
}

interface Course {
  title: string;
  category: string;
  mentor: string;
  image: string;
}

interface Friend {
  name: string;
  role: string;
  avatar: string;
}

interface Mentor {
  name: string;
  role: string;
  avatar: string;
}

const UpdatedDashboard: React.FC = () => {
  // State management
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeMenu, setActiveMenu] = useState<string>("dashboard");
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] =
    useState<boolean>(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState<boolean>(false);

  // Refs for dropdown handling
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (item: MenuItem) => {
    if (!item.path) return false;
    if (item.id === "dashboard") return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  // Sample data
  const sampleStaff: Staff = {
    id: "1",
    name: "Jason Ranti",
    email: "jason@company.com",
    role: "Student",
    avatar: "",
  };

  const sampleNotifications: Notification[] = [
    {
      id: "1",
      title: "งานใหม่เข้าระบบ",
      message: "มีงานใหม่ที่ต้องการการอนุมัติจากคุณ",
      time: "5 นาทีที่แล้ว",
      isRead: false,
      type: "info",
    },
    {
      id: "2",
      title: "เตือนการประชุม",
      message: "การประชุมทีมจะเริ่มในอีก 15 นาที",
      time: "10 นาทีที่แล้ว",
      isRead: false,
      type: "warning",
    },
  ];

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "แดชบอร์ด", icon: Home, path: "/dashboard" },
    {
    id: "visit",
    label: "การเยี่ยมชม",
    icon: Play,
    children: [
      { id: "create-visit", label: "สร้างการเยี่ยมชม", icon: Plus, path: "/dashboard/create-visit" },
      { id: "update-visit", label: "แก้ไขการเยี่ยมชม", icon: Edit, path: "/dashboard/update-visit" },
    ],
  },
    {
      id: "dogs",
      label: "จัดการข้อมูลสุนัข",
      icon: PawPrint,
      path: "/dashboard/dogs",
    },
    {
      id: "health-records",
      label: "บันทึกสุขภาพสุนัข",
      icon: Stethoscope,
      path: "/dashboard/health-record",
    },
    {
      id: "adoption",
      label: "การรับเลี้ยง",
      icon: Heart,
      path: "/dashboard/adoptions",
    },
    {
      id: "donation",
      label: "การบริจาค",
      icon: DollarSign,
      path: "/dashboard/donation",
    },
    {
      id: "visits",
      label: "ตารางการเยี่ยมชม",
      icon: Calendar,
      path: "/dashboard/visits",
    },
    {
      id: "support",
      label: "การอุปถัมภ์สนับสนุน",
      icon: Shield,
      path: "/dashboard/support",
    },
    {
      id: "reports",
      label: "รายงานสถิติ",
      icon: BarChart3,
      path: "/dashboard/reports",
    },
  ];



  const courses: Course[] = [
    {
      title: "Beginner's Guide to Becoming a Professional Front-End Developer",
      category: "FRONT-END",
      mentor: "Leonardo Samuel",
      image:
        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop",
    },
    {
      title: "Optimizing User Experience with the Best UI/UX Design",
      category: "UI/UX DESIGN",
      mentor: "Bayu Saito",
      image:
        "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=200&fit=crop",
    },
    {
      title: "Reviving and Refreshing Your Company Image",
      category: "BRANDING",
      mentor: "Padhang Satrio",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop",
    },
  ];

  const mentors: Mentor[] = [
    { name: "Padhang Satrio", role: "Mentor", avatar: "PS" },
    { name: "Zakir Horizontal", role: "Mentor", avatar: "ZH" },
    { name: "Leonardo Samuel", role: "Mentor", avatar: "LS" },
  ];

  const progressData = [
    { title: "UI/UX Design", progress: "2/8 watched", color: "#8b5cf6" },
    { title: "Branding", progress: "3/8 watched", color: "#f59e0b" },
    { title: "Front End", progress: "6/8 watched", color: "#06b6d4" },
  ];

  const chartData = [20, 45, 30, 60, 25, 40, 55];

  // Event handlers
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

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileMenuClick = (action: string): void => {
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

  const renderDashboardContent = (): JSX.Element => {
    return (
      <>
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-badge">ONLINE COURSE</div>
          <div className="hero-content">
            <h1 className="hero-title">
              Sharpen Your Skills with Professional Online Courses
            </h1>
            <button className="hero-button">
              Join Now <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Course Progress Cards */}
        <div className="course-progress-grid">
          {progressData.map((course, index) => (
            <div key={index} className="progress-card">
              <div
                className="progress-icon"
                style={{ background: course.color }}
              ></div>
              <div className="progress-text">{course.progress}</div>
              <h3 className="progress-title">{course.title}</h3>
            </div>
          ))}
        </div>

        <div className="main-grid">
          {/* Continue Watching */}
          <div>
            <div className="section-header">
              <h2 className="section-title">Continue Watching</h2>
              <div className="nav-buttons">
                <button className="nav-button">
                  <ChevronLeft size={16} />
                </button>
                <button className="nav-button active">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="courses-grid">
              {courses.map((course, index) => (
                <div key={index} className="course-card">
                  <div
                    className="course-image"
                    style={{ backgroundImage: `url(${course.image})` }}
                  >
                    <button className="favorite-button">
                      <Heart size={14} />
                    </button>
                  </div>
                  <div className="course-content">
                    <div className="course-category">📚 {course.category}</div>
                    <h4 className="course-title">{course.title}</h4>
                    <div className="mentor-info">
                      <div className="mentor-avatar">
                        {course.mentor
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="mentor-details">
                        <div className="mentor-name">{course.mentor}</div>
                        <div className="mentor-role">Mentor</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div>
            {/* Statistics */}
            <div className="sidebar-panel">
              <div className="panel-header">
                <h3 className="panel-title">Statistic</h3>
                <MoreVertical size={16} color="#6b7280" />
              </div>

              <div className="greeting-section">
                <div className="greeting-avatar">JR</div>
                <div className="greeting-text">
                  <div className="greeting-title">Good Morning Jason 👋</div>
                  <div className="greeting-subtitle">
                    Continue your learning to reach your target!
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="chart-container">
                {chartData.map((height, index) => (
                  <div
                    key={index}
                    className={`chart-bar ${index === 5 ? "active" : ""}`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Your Mentor */}
            <div className="sidebar-panel">
              <div className="panel-header">
                <h3 className="panel-title">Your mentor</h3>
                <Plus size={16} color="#6b7280" />
              </div>

              <div className="mentor-list">
                {mentors.map((mentor, index) => (
                  <div key={index} className="mentor-item">
                    <div className="mentor-info-section">
                      <div className="mentor-avatar-large">{mentor.avatar}</div>
                      <div className="mentor-details-large">
                        <div className="mentor-name">{mentor.name}</div>
                        <div className="mentor-role">{mentor.role}</div>
                      </div>
                    </div>
                    <button className="follow-button">Follow</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderDevelopmentMessage = (): JSX.Element => {
    const currentMenu = menuItems.find((item) => item.id === activeMenu);
    return (
      <div className="development-message">
        <div className="development-icon">
          {currentMenu && <currentMenu.icon size={32} color="#6b7280" />}
        </div>
        <h2 className="development-title">{currentMenu?.label || "หน้านี้"}</h2>
        <p className="development-subtitle">
          กำลังพัฒนา... รอติดตามในเร็วๆ นี้
        </p>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="logo-section">
            <div className="logo-icon">C</div>
            <span className="logo-text">Course</span>
          </div>
        </div>

        <div className="header-right">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search your course..."
              className="search-input"
            />
          </div>

          <button className="icon-button">
            <Mail size={20} color="#6b7280" />
          </button>

          <div ref={notificationRef} style={{ position: "relative" }}>
            <button
              className="icon-button"
              onClick={() =>
                setIsNotificationDropdownOpen(!isNotificationDropdownOpen)
              }
            >
              <Bell size={20} color="#6b7280" />
              <div className="notification-badge">2</div>
            </button>

            {isNotificationDropdownOpen && (
              <div className="dropdown notification-dropdown">
                <div className="dropdown-header">
                  <h3>การแจ้งเตือน</h3>
                  <button className="mark-all-read-btn">
                    ทำเครื่องหมายอ่านทั้งหมด
                  </button>
                </div>
                <div>
                  {sampleNotifications.map((notification) => (
                    <div key={notification.id} className="notification-item">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <span>{notification.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div ref={profileRef} style={{ position: "relative" }}>
            <button
              className="profile-button"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            >
              <div className="profile-avatar">
                {getInitials(sampleStaff.name)}
              </div>
              <span className="profile-name">{sampleStaff.name}</span>
            </button>

            {isProfileDropdownOpen && (
              <div className="dropdown profile-dropdown">
                <div className="profile-dropdown-header">
                  <div className="profile-dropdown-info">
                    <div className="profile-dropdown-avatar">
                      {getInitials(sampleStaff.name)}
                    </div>
                    <div className="profile-dropdown-details">
                      <div className="profile-name">{sampleStaff.name}</div>
                      <div className="profile-email">{sampleStaff.email}</div>
                      <div className="profile-role-badge">
                        {sampleStaff.role}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="dropdown-menu">
                  <button
                    className="dropdown-menu-item"
                    onClick={() => handleProfileMenuClick("profile")}
                  >
                    <span>👤</span>
                    ข้อมูลส่วนตัว
                  </button>
                  <button
                    className="dropdown-menu-item"
                    onClick={() => handleProfileMenuClick("settings")}
                  >
                    <span>⚙️</span>
                    การตั้งค่า
                  </button>
                  <button
                    className="dropdown-menu-item"
                    onClick={() => handleProfileMenuClick("help")}
                  >
                    <span>❓</span>
                    ความช่วยเหลือ
                  </button>
                  <div className="menu-divider"></div>
                  <button
                    className="dropdown-menu-item logout"
                    onClick={() => handleProfileMenuClick("logout")}
                  >
                    <span>🚪</span>
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="main-content-area">
        {/* Sidebar */}
        <div className={`sidebar ${!sidebarOpen ? "collapsed" : ""}`}>
          <div className="sidebar-content">
            <div className="sidebar-section-title">
              {sidebarOpen ? "OVERVIEW" : ""}
            </div>

            {menuItems.map((item) => {
  const Icon = item.icon;
  const hasChildren = !!item.children?.length;
  const active = isActive(item);

  return (
    <div key={item.id} className="sidebar-menu-group">
      <button
        type="button"
        className={`sidebar-menu-item ${active ? "active" : ""}`}
        onClick={() => {
          if (hasChildren) {
            setActiveMenu(activeMenu === item.id ? "" : item.id); // toggle dropdown
          } else {
            navigate(item.path ?? "/");
          }
        }}
        aria-current={active ? "page" : undefined}
      >
        <Icon size={20} />
        {sidebarOpen && <span>{item.label}</span>}
      </button>

      {/* Dropdown items */}
      {hasChildren && activeMenu === item.id && sidebarOpen && (
        <div className="sidebar-submenu">
          {item.children!.map((child) => {
            const ChildIcon = child.icon;
            const childActive = isActive(child);
            return (
              <button
                key={child.id}
                type="button"
                className={`sidebar-menu-item submenu-item ${
                  childActive ? "active" : ""
                }`}
                onClick={() => navigate(child.path!)}
                aria-current={childActive ? "page" : undefined}
              >
                <ChildIcon size={16} />
                <span>{child.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
})}

            <div className="sidebar-section-title">
              {sidebarOpen ? "SETTINGS" : ""}
            </div>

            <button className="sidebar-menu-item">
              <Settings size={20} />
              {sidebarOpen && <span>Setting</span>}
            </button>

            <button
              className="sidebar-menu-item logout-button"
              onClick={() => handleProfileMenuClick("logout")}
            >
              <LogOut size={20} />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UpdatedDashboard;
