import React, { useEffect } from 'react';
import './style.css';

import { useNavigate } from 'react-router-dom';

const DonationOptionsPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.removeItem('donationItemsFormData');
    sessionStorage.removeItem('createAccount');
    console.log("DonationOptionsPage loaded.");
  }, []);

  const handleDonationMoneyClick = () => {
    sessionStorage.setItem('donationType', 'money');
    navigate('/donation/information');
  };

  const handleDonationItemClick = () => {
    sessionStorage.setItem('donationType', 'item');
    navigate('/donation/information');
  };

  return (
    <div className="page-container">
      <div className="card">
        <button className="button orange-button" onClick={handleDonationMoneyClick}>
          <h1>บริจาคเงิน</h1>
          <h2>ร่วมมอบโอกาสครั้งที่สองให้สุนัขที่เจ็บป่วยและถูกทอดทิ้ง</h2>
        </button>
        <button className="button blue-button" onClick={handleDonationItemClick}>
          <h1>บริจาคสิ่งของ</h1>
          <h2>ของใช้เล็กๆจากคุณ อาจหมายถึงทั้งโลกสำหรับพวกเขา</h2>
        </button>
      </div>
    </div>
  );
};

export default DonationOptionsPage;