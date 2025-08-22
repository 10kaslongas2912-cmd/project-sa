import React from 'react';
import './style.css'; // Import CSS สำหรับทุก Component
import { useLocation, useNavigate } from 'react-router-dom';

// Component สำหรับ Chip
const Chip: React.FC<{ label: string; active?: boolean; color?: 'default' | 'red' }> = ({ label, active = false, color = 'default' }) => {
  const chipClasses = `chip ${active ? 'chip-active' : ''} ${color === 'red' ? 'chip-red' : ''}`;
  return (
    <div className={chipClasses}>
      <span className="chip-label">{label}</span>
    </div>
  );
};

// Component สำหรับ Button
const Button: React.FC<{ label: string; onClick?: () => void }> = ({ label, onClick }) => {
    return (
        <button onClick={onClick} className="primary-button">
            {label}
        </button>
    );
};

interface Dog {
  id: number;
  name: string;
  age: string;
  size: string;
  image: string;
}
// ข้อมูลสำหรับแสดงผล
const petData = {
  name: "H2K",
  gender: "ตัวเมีย",
  size: "กลาง",
  age: "7 ปี 3 เดือน",
  personality: [
    "ชอบผจญภัย",
    "ชอบเรียนรู้สิ่งใหม่ ๆ",
    "มั่นใจในตนเอง",
    "สงบ",
    "เข้ากับคนอื่นง่าย",
    "เป็นมิตร"
  ],
  care: "เคยพบเจอเหตุการณ์ที่รุนแรงต่อจิตใจ",
  donationAmount: "$3",
  // เพิ่ม URL รูปภาพเข้ามาในข้อมูล
  imageUrl: "https://via.placeholder.com/500x700.png?text=H2K"
};

const DogInfoPage: React.FC = () => {
  const location = useLocation();
  const dogData = location.state as Dog;
  const navigate = useNavigate();
  const handleClick = () => {
      navigate('../amount');
  };
  if (!petData) {
    return <div>ไม่พบข้อมูลน้องหมาที่ต้องการอุปถัมภ์</div>;
  }
  return (
    <div className="main-container">
      <div className="content-wrapper">
        {/* กล่องรูปภาพด้านซ้าย */}
        <div className="image-box">
          <img src={dogData.image} alt={`รูปภาพของ ${petData.name}`} className="pet-image" />
        </div>

        {/* Info Card ด้านขวา */}
        <div className="info-card">
          {/* Header */}
          <h1 className="pet-profile-title">น้อง {petData.name}</h1>

          {/* Section: เพศ */}
          <div className="section">
            <span className="section-label">เพศ</span>
            <div className="chip-group">
              <Chip label={petData.gender} active />
            </div>
          </div>

          {/* Section: ขนาด */}
          <div className="section">
            <span className="section-label">ขนาด</span>
            <div className="chip-group">
              <Chip label={petData.size} active />
            </div>
          </div>
          
          {/* Section: อายุ */}
          <div className="section">
            <span className="section-label">อายุ</span>
            <div className="chip-group">
              <Chip label={petData.age} active />
            </div>
          </div>

          {/* Section: บุคลิก */}
          <div className="section">
            <span className="section-label">บุคลิก</span>
            <div className="chip-group">
              {petData.personality.map((trait, index) => (
                <Chip key={index} label={trait} />
              ))}
            </div>
          </div>

          {/* Section: การดูแล */}
          <div className="section">
            <span className="section-label">การดูแล</span>
            <div className="chip-group">
              <Chip label={petData.care} color="red" />
            </div>
          </div>
          
          {/* Footer Button */}
          <div className="pet-profile-footer">
            <Button label="อุปถัมภ์น้อง" onClick={handleClick}/>
            {/* <span className="donation-info">จาก {petData.donationAmount} รายสัปดาห์</span> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DogInfoPage;