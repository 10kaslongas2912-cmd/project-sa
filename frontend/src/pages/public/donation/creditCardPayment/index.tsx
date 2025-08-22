import React, { useState, useEffect } from "react";
import './style.css';
import { useNavigate } from "react-router-dom";
import option_heart from '../../../../assets/visa-master-icon-5.png';
interface DonationInfoFormProps {
  onSubmit?: (formData: object) => void;
}

// Helper to get initial state from sessionStorage
const getInitialFormData = () => {
  try {
    const storedData = sessionStorage.getItem('donationInfoFormData');
    return storedData ? JSON.parse(storedData) : {};
  } catch (error) {
    console.error("Error parsing stored form data:", error);
    return {};
  }
};

const CreditCardPaymentForm: React.FC<DonationInfoFormProps> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const initialData = getInitialFormData();

  // สร้าง State สำหรับเก็บค่าของแต่ละ Input
  const [cardNumber, setCardNumber] = useState(initialData.cardNumber || '');
  const [expiryDate, setExpiryDate] = useState(initialData.expiryDate || '');
  const [cvv, setCvv] = useState(initialData.cvv || '');
  const [cardHolderName, setCardHolderName] = useState(initialData.cardHolderName || '');

  // Use useEffect to save data to sessionStorage whenever state changes
  useEffect(() => {
    const formData = { cardNumber, expiryDate, cvv, cardHolderName };
    sessionStorage.setItem('creditCardFormData', JSON.stringify(formData));
  }, [cardNumber, expiryDate, cvv, cardHolderName]); // Dependencies array

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // ป้องกันการรีเฟรชหน้าเมื่อกดส่งฟอร์ม
    const formData = { cardNumber, expiryDate, cvv, cardHolderName };
    console.log('Form Data Submitted:', formData);
    // เรียกใช้ฟังก์ชัน onSubmit ที่ส่งมาจาก parent component
    if (onSubmit) {
      onSubmit(formData);
    }
    navigate('/donation/thankyou'); // ย้าย navigate มาที่นี่
  };

  return (
    <div className="form-page-container">
      <div className="form-card">
        {/* ปุ่มย้อนกลับ */}
        <button
          onClick={() => {
            sessionStorage.removeItem('creditCardFormData'); // ล้างข้อมูลเมื่อย้อนกลับ
            navigate('/donation/money');
          }}
          className="back-link"
        >
          &lt; ย้อนกลับ
        </button>
        <h1 className="form-title">ชำระเงินด้วยบัตรเครดิต</h1>
        <h1 className="form-subtitle">การ์ดที่รองรับ</h1>
        <img src={option_heart} className="supported-cards" alt="การ์ดที่รองรับ" />

        {/* ฟอร์ม */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{16}"
            placeholder="หมายเลขบัตรเครดิต"
            className="form-input"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            required
          />
          <input
            type="text"
            inputMode="numeric"
            pattern="(0[1-9]|1[0-2])/[0-9]{2}"
            placeholder="วันหมดอายุ (MM/YY)"
            className="form-input"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
          />
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{3,4}"
            placeholder="CVV"
            className="form-input"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="ชื่อผู้ถือบัตร"
            className="form-input"
            value={cardHolderName}
            onChange={(e) => setCardHolderName(e.target.value)}
            required
          />

          {/* ปุ่มส่งฟอร์ม */}
          <button type="submit" className="submit-button">
            ยืนยันการชำระเงิน
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreditCardPaymentForm;