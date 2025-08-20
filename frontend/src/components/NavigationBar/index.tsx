import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../../assets/logo.png';
import './style.css';
import './style.css';

const NavigationBar: React.FC = () => {
    const [visible, setVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const controlNavbar = () => {
        if (typeof window !== 'undefined') {
            if (window.scrollY > lastScrollY) { // if scroll down hide the navbar
                setVisible(false);
            } else { // if scroll up show the navbar
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

    return (
        <header className={`header ${visible ? 'header-visible' : 'header-hidden'}`}>
            <div className="header-logo">
                <img src={logo} alt="logo" />
            </div>
            <nav className="header-nav">
                <ul>
                    <li><a href="/">หน้าแรก</a></li>
                    <li><a href="#get-involved">ร่วมเป็นส่วนหนึ่งในการช่วยเหลือสุนัข</a></li>
                    <li><a href="#about-us">เกี่ยวกับเรา</a></li>
                    <li><a href="#shop">กิจกรรม</a></li>
                </ul>
            </nav>
            <div className="header-actions">
                <a href="#adopt" className="btn btn-action adopt-btn">รับเลี้ยง</a>
                <a href="#sponsor" className="btn btn-action sponsor-btn">อุปถัมป์</a>
                <Link to="/donate" className="btn btn-action donate-btn">
                    <span className="heart-icon">&#x2764;</span> บริจาค
                </Link>
                <a href="/login" className="btn btn-action login-btn">เข้าสู่ระบบ</a>
            </div>
        </header>
    );
};

export default NavigationBar;