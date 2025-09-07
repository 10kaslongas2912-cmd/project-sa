import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { useDog } from "../../../../hooks/useDog";
import { ageText } from "../../../../utils/date"
import './style.css';


const Doglist: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dog, loading, error } = useDog(id ? Number(id) : null);
  console.log(dog);
  if (loading) return <p>กำลังโหลด...</p>;
  if (error) return <p>โหลดไม่ได้: {error}</p>;
  if (!dog) return <p>ไม่พบน้องหมา</p>;

  const handleBackClick = (): void => {
    navigate(-1);
    // window.history.back(); // หรือใช้ React Router
  };

  const handleSponsorClick = (): void => {
  navigate(`/adoption/from/${dog.ID}`);
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
            {/* <div className="donation-badge">
              ค่าใช้จ่าย {dog.donationAmount} ต่อเดือน
            </div> */}
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

          {/* Personality */}
          <div className="info-section">
            <h2 className="section-title">บุคลิกภาพ</h2>
            <div className="personality-tags">
              {/* {petData.personality.map((trait: string, index: number) => (
                <span key={index} className="personality-tag">
                  {trait}
                </span>
              ))} */}
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
            <button className="sponsor-button" onClick={handleSponsorClick}>
              รับเลี้ยง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Doglist;