import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../../assets/logo.png';
import './style.css';

type AppUser = {
  name: string;
  avatar: string | null;
  role: 'admin' | 'volunteer' | 'adopter';
};

const NavigationBar: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<AppUser>({
    name: 'สมชาย ใจดี',
    avatar: null,
    role: 'volunteer',
  });

  const location = useLocation();
  const navigate = useNavigate();

  // อ่านสถานะ login จาก localStorage ให้สอดคล้องกับหน้า Auth
  const readAuth = () => {
    const token = localStorage.getItem('token');
    const type = localStorage.getItem('token_type');
    const name =
      localStorage.getItem('user_name') || // แนะนำให้เซฟชื่อหลัง login
      localStorage.getItem('username') ||  // หรือ username
      user.name;

    const avatar = localStorage.getItem('avatar') || null;
    return {
      isLoggedIn: Boolean(token && type),
      name,
      avatar,
    };
  };

  // ซ่อน/แสดง navbar ตามการเลื่อน
  const controlNavbar = () => {
    if (typeof window !== 'undefined') {
      if (window.scrollY > lastScrollY) setVisible(false);
      else setVisible(true);
      setLastScrollY(window.scrollY);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      return () => window.removeEventListener('scroll', controlNavbar);
    }
  }, [lastScrollY]);

  // เช็คสถานะ login ตอน mount และทุกครั้งที่เส้นทางเปลี่ยน
  useEffect(() => {
    const a = readAuth();
    setIsLoggedIn(a.isLoggedIn);
    setUser((u) => ({ ...u, name: a.name, avatar: a.avatar }));
  }, [location.pathname]);

  // รองรับกรณี login ในอีกแท็บ (storage event)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (['token', 'token_type', 'user_name', 'username', 'avatar', 'isLogin'].includes(e.key)) {
        const a = readAuth();
        setIsLoggedIn(a.isLoggedIn);
        setUser((u) => ({ ...u, name: a.name, avatar: a.avatar }));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    ['token', 'token_type', 'isLogin', 'id', 'user_name', 'username', 'avatar'].forEach((k) =>
      localStorage.removeItem(k)
    );
    setIsLoggedIn(false);
    setShowDropdown(false);
    navigate('/auth');
  };

  const getUserInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  return (
    <header className={`header ${visible ? 'header-visible' : 'header-hidden'}`}>
      <div className="header-logo">
        <Link to="/">
          <img src={logo} alt="logo" />
        </Link>
      </div>

      <nav className="header-nav">
        <ul>
          <li><Link to="/">หน้าแรก</Link></li>
          <li><a href="#get-involved">ร่วมเป็นส่วนหนึ่งในการช่วยเหลือสุนัข</a></li>
          <li><a href="#about-us">เกี่ยวกับเรา</a></li>
          <li><a href="#shop">กิจกรรม</a></li>
        </ul>
      </nav>

      <div className="header-actions">
        <a href="#adopt" className="btn btn-action adopt-btn">รับเลี้ยง</a>
        <Link to="/sponsor" className="btn btn-action sponsor-btn">อุปถัมภ์</Link>
        <Link to="/donation" className="btn btn-action donate-btn">
          <span className="heart-icon">&#x2764;</span> บริจาค
        </Link>

        {isLoggedIn ? (
          <div className="user-profile-container">
            <button
              className="user-profile-btn"
              onClick={() => setShowDropdown(!showDropdown)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            >
              <div className="user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" />
                ) : (
                  <span className="user-initials">{getUserInitials(user.name)}</span>
                )}
              </div>
              <span className="user-name">{user.name.split(' ')[0] || 'ผู้ใช้'}</span>
              <svg className="dropdown-arrow" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {showDropdown && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="user-info">
                    <div className="user-avatar-large">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Profile" />
                      ) : (
                        <span className="user-initials">{getUserInitials(user.name)}</span>
                      )}
                    </div>
                    <div className="user-details">
                      <div className="user-name-full">{user.name}</div>
                      <div className="user-role">
                        {user.role === 'admin' && 'ผู้ดูแลระบบ'}
                        {user.role === 'volunteer' && 'อาสาสมัคร'}
                        {user.role === 'adopter' && 'ผู้รับเลี้ยง'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">
                    <span className="item-icon">👤</span>
                    โปรไฟล์ของฉัน
                  </Link>
                  <Link to="/my-adoptions" className="dropdown-item">
                    <span className="item-icon">🐕</span>
                    สุนัขที่รับเลี้ยง
                  </Link>
                  <Link to="/my-donations" className="dropdown-item">
                    <span className="item-icon">💖</span>
                    ประวัติการบริจาค
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item">
                      <span className="item-icon">⚙️</span>
                      จัดการระบบ
                    </Link>
                  )}
                  <hr className="dropdown-divider" />
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <span className="item-icon">🚪</span>
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link to="/auth" className="btn btn-action login-btn">
            <span>เข้าสู่ระบบ</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default NavigationBar;
