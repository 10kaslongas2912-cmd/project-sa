import React from 'react';

import './style.css';
import CheckmarkIcon from '../../../components/CheckmarkIcon';
import NavigationBar from '../../../components/NavigationBar';

const DonationPage: React.FC = () => {
  

  const handleDonateNowClick = () => {
    window.location.href = '/donate-options';
  };

  return (
    <>
      <NavigationBar />
      <br />
      <br />
      <div className="page-container">
        <div className="card">
          <h1 className="title">
            ร่วมบริจาคเงินหรือสิ่งของ
          </h1>
          <h2 >เพื่อร่วมเป็นส่วนหนึ่งในการดูแลชีวิตให้เพื่อนสี่ขา</h2>
          <button className="button orange-button">
            สร้างบัญชีบริจาค/เข้าสู่ระบบ
          </button>

          <div className="features-list">
            <div className="feature-item">
              <CheckmarkIcon />
              <span>ตรวจสอบประวัติการบริจาคย้อนหลังได้</span>
            </div>
            <div className="feature-item">
              <CheckmarkIcon />
              <span>สะดวก บริจาคครั้งต่อไปได้ทันที</span>
            </div>
          </div>

          <p className="or-text">หรือ</p>

          <button className="button blue-button" onClick={handleDonateNowClick}>
            บริจาคทันที
          </button>
        </div>
      </div>
    </>
  );
};

export default DonationPage;