import React, { useState, useEffect } from "react";
import './style.css';

import { useNavigate } from "react-router-dom";

interface DonationMoneyFormProps {
  onSubmit?: (formData: object) => void;
}

// Helper to get initial state from sessionStorage
const getInitialDonationMoneyData = () => {
  try {
    const storedData = sessionStorage.getItem('donationMoneyFormData');
    return storedData ? JSON.parse(storedData) : {};
  } catch (error) {
    console.error("Error parsing stored donation money data:", error);
    return {};
  }
};

const DonationMoneyForm: React.FC<DonationMoneyFormProps> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const initialData = getInitialDonationMoneyData();

  // สร้าง State สำหรับเก็บค่าของแต่ละ Input
  const [amount, setAmount] = useState(initialData.amount || '');
  const [paymentMethod, setPaymentMethod] = useState(initialData.paymentMethod || '');

  // Use useEffect to save data to sessionStorage whenever state changes
  useEffect(() => {
    const formData = { amount, paymentMethod };
    sessionStorage.setItem('donationMoneyFormData', JSON.stringify(formData));
  }, [amount, paymentMethod]); // Dependencies array

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // ป้องกันการรีเฟรชหน้าเมื่อกดส่งฟอร์ม
    const formData = { amount, paymentMethod };
    console.log('Donation Money Data Submitted:', formData);
    // เรียกใช้ฟังก์ชัน onSubmit ที่ส่งมาจาก parent component
    if (onSubmit) {
      onSubmit(formData);
    }
    navigate('/donation-confirmation'); // นำทางไปยังหน้ายืนยันข้อมูล
  };

  return (
    <div className="form-page-container">
      <div className="form-card">
        {/* ปุ่มย้อนกลับ */}
        <button onClick={() => navigate('/information-donors')} className="back-link">
          &lt; ย้อนกลับ
        </button>
        <h1 className="form-title">ข้อมูลการบริจาคเงิน</h1>
        <h2 className="form-subtitle">กรุณากรอกจำนวนเงินและวิธีการชำระเงิน</h2>

        {/* ฟอร์ม */}
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="จำนวนเงิน (บาท)"
            className="form-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="วิธีการชำระเงิน (เช่น โอนเงิน, บัตรเครดิต)"
            className="form-input"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          />

          {/* ปุ่มส่งฟอร์ม */}
          <button type="submit" className="submit-button">
            ต่อไป
          </button>
        </form>
      </div>
    </div>
  );
};

export default DonationMoneyForm;