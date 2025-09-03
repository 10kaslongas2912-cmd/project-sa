import React from 'react';
import './style.css';

interface PetData {
  name: string;
  gender: string;
  size: string;
  age: string;
  personality: string[];
  care: string;
  donationAmount: string;
  imageUrl: string;
}

const DogInfo: React.FC = () => {
  const petData: PetData = {
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
      "เป็นมิตร",
    ],
    care: "เคยพบเจอเหตุการณ์ที่รุนแรงต่อจิตใจ",
    donationAmount: "$3",
    imageUrl: "http://localhost:8000/static/images/dog/dog6.jpg",
  };

  const handleBackClick = (): void => {
    // Navigate back functionality
    console.log('Navigate back');
    // window.history.back(); // หรือใช้ React Router
  };

  const handleSponsorClick = (): void => {
    // Navigate to sponsor page functionality
    console.log('Navigate to sponsor page');
    // หรือใช้ React Router navigate('/sponsor')
  };

  return (
    <div className="dog-info-container">
      <div className="dog-info-card">
        {/* Header */}
        <div className="dog-info-header">
          <button className="back-button" onClick={handleBackClick}>
            ← ย้อนกลับ
          </button>
          <div className="header-content">
            <h1 className="dog-name">{petData.name}</h1>
            <p className="header-subtitle">รู้จักเพื่อนตัวน้อยของเรา</p>
          </div>
        </div>

        {/* Dog Image */}
        <div className="dog-image-section">
          <div className="dog-image-container">
            <img 
              src={petData.imageUrl} 
              alt={petData.name}
              className="dog-image"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/400x300/ff9028/ffffff?text=🐕';
              }}
            />
            <div className="donation-badge">
              ค่าใช้จ่าย {petData.donationAmount} ต่อเดือน
            </div>
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
                <span className="info-value">{petData.gender}</span>
              </div>
              <div className="info-item">
                <span className="info-label">ขนาด:</span>
                <span className="info-value">{petData.size}</span>
              </div>
              <div className="info-item">
                <span className="info-label">อายุ:</span>
                <span className="info-value">{petData.age}</span>
              </div>
            </div>
          </div>

          {/* Personality */}
          <div className="info-section">
            <h2 className="section-title">บุคลิกภาพ</h2>
            <div className="personality-tags">
              {petData.personality.map((trait: string, index: number) => (
                <span key={index} className="personality-tag">
                  {trait}
                </span>
              ))}
            </div>
          </div>

          {/* Special Care */}
          <div className="info-section special-care">
            <h2 className="section-title">การดูแลพิเศษ</h2>
            <div className="care-info">
              <div className="care-item">
                <div className="care-icon">💝</div>
                <p className="care-text">{petData.care}</p>
              </div>
              <p className="care-description">
                {petData.name} ต้องการความรักและความเข้าใจเป็นพิเศษ 
                การสนับสนุนของคุณจะช่วยให้เขาได้รับการดูแลที่ดีที่สุด
              </p>
            </div>
          </div>

          {/* Story Section */}
          <div className="info-section">
            <h2 className="section-title">เรื่องราวของ {petData.name}</h2>
            <div className="story-content">
              <p>
                {petData.name} เป็นสุนัขตัวเมียที่มีอายุ {petData.age} 
                แม้จะเคยผ่านประสบการณ์ที่ไม่ดีมาก่อน แต่เธอยังคงมีจิตใจที่แข็งแกร่ง
                และพร้อมที่จะเรียนรู้สิ่งใหม่ ๆ อยู่เสมอ
              </p>
              <p>
                ด้วยบุคลิกที่เป็นมิตรและเข้ากับคนอื่นได้ง่าย {petData.name} 
                จึงเป็นเพื่อนที่น่ารักและพร้อมที่จะมอบความรักให้กับคนที่ดูแลเธอ
              </p>
              <p>
                การสนับสนุนจากคุณจะช่วยให้ {petData.name} 
                ได้รับอาหาร การรักษาพยาบาล และความรักที่เธอสมควรได้รับ
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="dog-info-footer">
          <div className="sponsor-call-to-action">
            <h3>ร่วมเป็นผู้อุปถัมภ์ {petData.name}</h3>
            <p>ด้วยเพียง {petData.donationAmount} ต่อเดือน คุณจะช่วยให้ {petData.name} มีชีวิตที่ดีขึ้น</p>
            <button className="sponsor-button" onClick={handleSponsorClick}>
              เริ่มการอุปถัมภ์
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DogInfo;