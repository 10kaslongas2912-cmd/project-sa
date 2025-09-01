import React, { useEffect, useState } from 'react';
import './style.css';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../../../services/apis';

const DonationOptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    sessionStorage.removeItem('donationItemsFormData');
    sessionStorage.removeItem('createAccount');
    console.log("DonationOptionsPage loaded.");
    
    requestAnimationFrame(() => {
      setTimeout(() => {
        setIsReady(true);
      }, 50); // เพิ่ม delay เล็กน้อยเพื่อให้แน่ใจว่า CSS โหลดเสร็จ
    });
  }, []);

  const handleDonationMoneyClick = async () => {
    sessionStorage.setItem('donationType', 'money');
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('id');
    console.log("DonationOptionsPage: Token:", token ? "Present" : "Missing", "UserId:", userId);
    if (token && userId) {
      try {
        const userData = await userAPI.getById(userId);
        console.log("DonationOptionsPage: GetUsersById response:", userData);
        if (userData.status === 200) {
          sessionStorage.setItem('prefillUserData', JSON.stringify(userData.data));
          console.log("DonationOptionsPage: Stored prefillUserData:", userData.data);
        } else {
          console.error("Failed to fetch user data:", userData.data?.error);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    navigate('/donation/information');
  };

  const handleDonationItemClick = async () => {
    sessionStorage.setItem('donationType', 'item');
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('id');
    console.log("DonationOptionsPage: Token:", token ? "Present" : "Missing", "UserId:", userId);
    if (token && userId) { 
      try {
        const userData = await userAPI.getById(userId);
        console.log("DonationOptionsPage: GetUsersById response:", userData);
        if (userData.status === 200) {
          sessionStorage.setItem('prefillUserData', JSON.stringify(userData.data));
          console.log("DonationOptionsPage: Stored prefillUserData:", userData.data);
        } else {
          console.error("Failed to fetch user data:", userData.data?.error);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    navigate('/donation/information');
  };

  // แสดง skeleton loading หรือ invisible content ขณะรอ CSS
  if (!isReady) {
    return (
      <div className="page-container" style={{ visibility: 'hidden', opacity: 0 }}>
        <div className="card">
          <button className="button orange-button">
            <h1>บริจาคเงิน</h1>
            <h2>ร่วมมอบโอกาสครั้งที่สองให้สุนัขที่เจ็บป่วยและถูกทอดทิ้ง</h2>
          </button>
          <button className="button blue-button">
            <h1>บริจาคสิ่งของ</h1>
            <h2 className='text-blue'>ของใช้เล็กๆจากคุณ อาจหมายถึงทั้งโลกสำหรับพวกเขา</h2>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ 
      visibility: 'visible', 
      opacity: 1,
      transition: 'opacity 0.3s ease-in-out' 
    }}>
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