import { Link } from 'react-router-dom';
import { useState } from 'react';
import logo from '../../assets/logo.png';
import './style.css';
import { useAuthUser } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const NavigationBar: React.FC = () => {
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

  return (
    <header className="header fixed-header">
      <div className="header-logo">
        <Link to="/"><img src={logo} alt="logo" /></Link>
      </div>
      <nav className="header-nav">
        <ul>
          <li><Link to="/">หน้าแรก</Link></li>
          <li><a href="#about-us">เกี่ยวกับเรา</a></li>
          <li><a href="/event">กิจกรรม</a></li>
        </ul>
      </nav>

      <div className="header-actions">
        <a href="/adoption" className="btn btn-action adopt-btn">รับเลี้ยง</a>
        <Link to="/sponsor" className="btn btn-action sponsor-btn">อุปถัมภ์</Link>
        <a onClick={handleDonateClick} className="btn btn-action donate-btn">
          <span className="heart-icon">&#x2764;</span>บริจาค
        </a>

        {isLoggedIn ? (
          loading ? (
            <div className="user-skeleton">...</div>
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
              </button>
            </div>
          )
        ) : null}
      </div>
    </header>
  );
};

export default NavigationBar;
