import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../../assets/logo.png';
import './style.css';

const NavigationBar: React.FC = () => {
    const [visible, setVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    
    // Mock user data - ในการใช้งานจริงจะได้จาก context หรือ state management
    const [user, setUser] = useState({
        name: 'สมชาย ใจดี',
        avatar: null, // ถ้าไม่มีรูปจะใช้ initial
        role: 'volunteer' // admin, volunteer, adopter
    });

    const controlNavbar = () => {
        if (typeof window !== 'undefined') {
            if (window.scrollY > lastScrollY) {
                setVisible(false);
            } else {
                setVisible(true);
            }
            setLastScrollY(window.scrollY);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', controlNavbar);
            return () => {
                window.removeEventListener('scroll', controlNavbar);
            };
        }
    }, [lastScrollY]);

    // Mock function to check login status
    useEffect(() => {
        // ตรวจสอบสถานะการเข้าสู่ระบบจาก localStorage หรือ token
        const token = localStorage.getItem('userToken');
        if (token) {
            setIsLoggedIn(true);
            // fetch user data
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        setIsLoggedIn(false);
        setShowDropdown(false);
        // redirect หรือ refresh state
    };

    const getUserInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

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
                <Link to="/sponsor" className="btn btn-action sponsor-btn">อุปถัมป์</Link>
                <Link to="/donation" className="btn btn-action donate-btn">
                    <span className="heart-icon">&#x2764;</span> บริจาค
                </Link>
                
                {/* User Profile Section */}
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
                                    <span className="user-initials">
                                        {getUserInitials(user.name)}
                                    </span>
                                )}
                            </div>
                            <span className="user-name">{user.name.split(' ')[0]}</span>
                            <svg className="dropdown-arrow" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
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
                                                <span className="user-initials">
                                                    {getUserInitials(user.name)}
                                                </span>
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