import React, { useEffect, useState } from 'react';
import './style.css';
import { useNavigate } from 'react-router-dom';
import { GetUsersById } from '../../../../services/https';

const DonationOptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // ลบข้อมูลเก่าใน sessionStorage
    sessionStorage.removeItem('donationItemsFormData');
    sessionStorage.removeItem('createAccount');
    console.log("DonationOptionsPage loaded.");
    
    // รอ 1 วินาทีก่อนแสดงผล
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);


  const handleDonationMoneyClick = async () => {
    sessionStorage.setItem('donationType', 'money');
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('id'); // Get user ID
    console.log("DonationOptionsPage: Token:", token ? "Present" : "Missing", "UserId:", userId); // Log token and userId
    if (token && userId) { // Check for token and userId
      try {
        const userData = await GetUsersById(userId); // Use GetUsersById
        console.log("DonationOptionsPage: GetUsersById response:", userData); // Log API response
        if (userData.status === 200) {
          sessionStorage.setItem('prefillUserData', JSON.stringify(userData.data));
          console.log("DonationOptionsPage: Stored prefillUserData:", userData.data); // Log stored data
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
    const userId = localStorage.getItem('id'); // Get user ID
    console.log("DonationOptionsPage: Token:", token ? "Present" : "Missing", "UserId:", userId); // Log token and userId
    if (token && userId) { // Check for token and userId
      try {
        const userData = await GetUsersById(userId); // Use GetUsersById
        console.log("DonationOptionsPage: GetUsersById response:", userData); // Log API response
        if (userData.status === 200) {
          sessionStorage.setItem('prefillUserData', JSON.stringify(userData.data));
          console.log("DonationOptionsPage: Stored prefillUserData:", userData.data); // Log stored data
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
            <h2>ของใช้เล็กๆจากคุณ อาจหมายถึงทั้งโลกสำหรับพวกเขา</h2>
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