import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../../assets/logo.png';
import './style.css';
import { useAuthUser } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
const NavigationBar: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, isLoggedIn, loading, logout } = useAuthUser();
  const navigate = useNavigate();

  const handleDonateClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (isLoggedIn && user?.ID) {
      navigate("/donation/options");
    } else {
      navigate("/donation");
    }
  };
  
  useEffect(() => {
    const controlNavbar = () => {
      setVisible(window.scrollY <= lastScrollY);
      setLastScrollY(window.scrollY);
    };
    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  return (
    <header className={`header ${visible ? 'header-visible' : 'header-hidden'}`}>
      <div className="header-logo">
        <Link to="/"><img src={logo} alt="logo" /></Link>
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
        <a href="/health-record/search" className="btn btn-action adopt-btn">รับเลี้ยง</a>
        <Link to="/sponsor" className="btn btn-action sponsor-btn">อุปถัมภ์</Link>
        <a onClick={handleDonateClick} className="btn btn-action donate-btn">
          <span className="heart-icon">&#x2764;</span> บริจาค
        </a>

        {isLoggedIn ? (
          loading ? (
            <div className="user-skeleton" aria-label="กำลังโหลดผู้ใช้">...</div>
          ) : (
            <div className="user-profile-container">
              <button
                className="user-profile-btn"
                onClick={() => setShowDropdown(!showDropdown)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              >
                <div className="user-avatar">
                  <img src={user?.photo_url ?? undefined} alt="Profile" />
                </div>
                <span className="user-name">{user?.name ?? ''}</span>
                <svg className="dropdown-arrow" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-info">
                      <div className="user-avatar-large">
                        <img src={user?.photo_url ?? undefined} alt="Profile" />
                      </div>
                      <div className="user-details">
                        <div className="user-name-full">
                          {user?.name ?? ''}
                        </div>
                        <div className="user-role">user</div>
                      </div>
                    </div>
                  </div>

                  <div className="dropdown-menu">
                    <Link to="/profile" className="dropdown-item"><span className="item-icon">👤</span>โปรไฟล์ของฉัน</Link>
                    <Link to="/my-adoptions" className="dropdown-item"><span className="item-icon">🐕</span>สุนัขที่รับเลี้ยง</Link>
                    <Link to="/my-donations" className="dropdown-item"><span className="item-icon">💖</span>ประวัติการบริจาค</Link>
                    <hr className="dropdown-divider" />
                    <button onClick={logout} className="dropdown-item logout-btn">
                      <span className="item-icon">🚪</span>ออกจากระบบ
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          <Link to="/auth" className="btn btn-action login-btn"><span>เข้าสู่ระบบ</span></Link>
        )}
      </div>
    </header>
  );
};

export default NavigationBar;