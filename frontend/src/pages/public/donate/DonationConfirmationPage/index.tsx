import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

const DonationConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    // ดึงข้อมูลจาก sessionStorage
    const infoData = JSON.parse(sessionStorage.getItem('donationInfoFormData') || '{}');
    const moneyData = JSON.parse(sessionStorage.getItem('donationMoneyFormData') || '{}');
    setFormData({ ...infoData, ...moneyData });
  }, []);

  const handleConfirm = () => {
    // ส่งข้อมูลทั้งหมดไปยัง Backend
    console.log('Confirming donation with data:', formData);
    // TODO: Implement API call to backend here

    // ล้างข้อมูลใน sessionStorage หลังจากยืนยัน
    sessionStorage.removeItem('donationInfoFormData');
    sessionStorage.removeItem('donationMoneyFormData');

    // นำทางไปยังหน้าสำเร็จ หรือหน้าแรก
    navigate('/donation-success'); // หรือหน้าอื่นที่เหมาะสม
  };

  return (
    <div className="confirmation-page-container">
      <div className="confirmation-card">
        <button onClick={() => navigate('/donation-money')} className="back-link">
          &lt; ย้อนกลับ
        </button>
        <h1 className="confirmation-title">ยืนยันข้อมูลการบริจาค</h1>
        <h2 className="confirmation-subtitle">โปรดตรวจสอบข้อมูลให้ถูกต้อง</h2>

        <div className="confirmation-details">
          <h3>ข้อมูลผู้บริจาค:</h3>
          <p><strong>ชื่อ:</strong> {formData.firstName} {formData.lastName}</p>
          <p><strong>เบอร์โทรศัพท์:</strong> {formData.phone}</p>
          <p><strong>อีเมล:</strong> {formData.email}</p>

          <h3>ข้อมูลการบริจาค:</h3>
          <p><strong>จำนวนเงิน:</strong> {formData.amount} บาท</p>
          <p><strong>วิธีการชำระเงิน:</strong> {formData.paymentMethod}</p>
        </div>

        <button onClick={handleConfirm} className="confirm-button">
          ยืนยันการบริจาค
        </button>
      </div>
    </div>
  );
};

export default DonationConfirmationPage;
