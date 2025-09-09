import React from 'react';
// 1. นำเข้า useLocation เพิ่มเติม
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDog } from "../../../../hooks/useDog";
import { ageText } from "../../../../utils/date";
// Hook สำหรับเช็คสถานะ login (มีอยู่แล้ว)
import { useAuthUser } from "../../../../hooks/useAuth";
import './style.css';


const Doglist: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // 2. เรียกใช้ useLocation และ useAuthUser
  const location = useLocation(); // เพื่อจดจำ path ปัจจุบัน
  const { isLoggedIn } = useAuthUser(); // ดึงสถานะการล็อกอินมาใช้
  const { dog, loading, error } = useDog(id ? Number(id) : null);

  if (loading) return <p>กำลังโหลด...</p>;
  if (error) return <p>โหลดไม่ได้: {error}</p>;
  if (!dog) return <p>ไม่พบน้องหมา</p>;

  const handleBackClick = (): void => {
    navigate(-1);
  };

  // 3. ปรับปรุงฟังก์ชัน handleSponsorClick
  const handleAdoptClick = (): void => {
    // ตรวจสอบว่าผู้ใช้ล็อกอินแล้วหรือยัง
    if (isLoggedIn) {
      // ถ้าล็อกอินแล้ว: ไปที่หน้าฟอร์มรับเลี้ยงได้เลย
      navigate(`/adoption/from/${dog.ID}`);
    } else {
      // ถ้ายังไม่ล็อกอิน:
      // 1. พาไปที่หน้า '/login'
      // 2. ส่ง state 'from' ที่มีค่าเป็น location ปัจจุบันไปด้วย
      //    เพื่อให้หน้า login รู้ว่าล็อกอินเสร็จแล้วต้องกลับมาที่นี่
      alert("คุณยังไม่ได้ล็อกอิน โปรดล็อกอินเพื่อรับเลี้ยงสุนัข");
      navigate('/auth', { state: { from: location } });
    }
  };

  return (
    <div className="dog-info-container">
      <div className="dog-info-card">
        {/* Header */}
        <br />
        <br />
        <br />
        <br />
        <div className="dog-info-header">
          <button className="back-button" onClick={handleBackClick}>
            ← ย้อนกลับ
          </button>
          <div className="header-content">
            <h1 className="dog-name">{dog.name}</h1>
            <p className="header-subtitle">รู้จักเพื่อนตัวน้อยของเรา</p>
          </div>
        </div>

        {/* Dog Image */}
        <div className="dog-image-section">
          <div className="dog-image-container">
            <img 
              src={dog.photo_url} 
              alt={dog.name}
              className="dog-image"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/400x300/ff9028/ffffff?text=🐕';
              }}
            />
          </div>
        </div>

        {/* Dog Information */}
        <div className="dog-info-content">
          {/* Basic Info */}
          <div className="info-section">
            <h2 className="section-title">ข้อมูลพื้นฐาน</h2>
            <div className="basic-info-grid">
              <div className="info-item">
                <span className="info-label">เพศ:</span>
                <span className="info-value">{dog.animal_sex?.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">ขนาด:</span>
                <span className="info-value">{dog.animal_size?.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">อายุ:</span>
                <span className="info-value">{ageText(dog.date_of_birth)}</span>
              </div>
            </div>
          </div>

          {/* Special Care */}
          <div className="info-section special-care">
            <h2 className="section-title">การดูแลพิเศษ</h2>
            <div className="care-info">
              <div className="care-item">
                <div className="care-icon">💝</div>
                <p className="care-text">{}</p>
              </div>
              <p className="care-description">
                {dog.name} ต้องการความรักและความเข้าใจเป็นพิเศษ 
                การสนับสนุนของคุณจะช่วยให้เขาได้รับการดูแลที่ดีที่สุด
              </p>
            </div>
          </div>

          {/* Story Section */}
          <div className="info-section">
            <h2 className="section-title">เรื่องราวของ {dog.name}</h2>
            <div className="story-content">
              <p>
                {dog.name} เป็นสุนัขตัวเมียที่มีอายุ {ageText(dog.date_of_birth)} 
                แม้จะเคยผ่านประสบการณ์ที่ไม่ดีมาก่อน แต่เธอยังคงมีจิตใจที่แข็งแกร่ง
                และพร้อมที่จะเรียนรู้สิ่งใหม่ ๆ อยู่เสมอ
              </p>
              <p>
                ด้วยบุคลิกที่เป็นมิตรและเข้ากับคนอื่นได้ง่าย {dog.name} 
                จึงเป็นเพื่อนที่น่ารักและพร้อมที่จะมอบความรักให้กับคนที่ดูแลเธอ
              </p>
              <p>
                การสนับสนุนจากคุณจะช่วยให้ {dog.name} 
                ได้รับอาหาร การรักษาพยาบาล และความรักที่เธอสมควรได้รับ
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="dog-info-footer">
          <div className="sponsor-call-to-action">
            <h3>สนใจอยากรับเลี้ยงน้อง {dog.name}</h3>
            <p>กรอกแบบฟรอมเพื่อขอรับเลี้ยงน้อง {dog.name} </p>
            <button className="sponsor-button" onClick={handleAdoptClick}>
              รับเลี้ยง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Doglist;