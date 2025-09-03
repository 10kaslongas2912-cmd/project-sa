import React, { useEffect, useState } from 'react';
import './style.css';
import { useNavigate } from 'react-router-dom';

const ThankYouPage: React.FC = () => {
  const navigate = useNavigate();
  const [transactionNumber, setTransactionNumber] = useState<string | null>(null);

  useEffect(() => {
    const storedTransactionNumber = sessionStorage.getItem('transactionNumber');
    if (storedTransactionNumber) {
      setTransactionNumber(storedTransactionNumber);
    }

    // Clear all donation-related session storage items
    sessionStorage.removeItem('donationInfoFormData');
    sessionStorage.removeItem('donationMoneyFormData');
    sessionStorage.removeItem('creditCardFormData');
    sessionStorage.removeItem('donationItemsFormData');
    sessionStorage.removeItem('createAccount');

  }, []);

  return (
    <div className="thank-you-container">
      <div className="thank-you-card">
        <h1 className="thank-you-title">ขอบคุณสำหรับการบริจาค!</h1>
        <p className="thank-you-message">
          การบริจาคของคุณมีความหมายอย่างยิ่งต่อ DOG CARE
          และจะช่วยให้เราดูแลน้องหมาได้อย่างเต็มที่
        </p>
        {transactionNumber && (
          <p className="transaction-number-display">
            หมายเลขการทำธุรกรรม: <strong>{transactionNumber}</strong>
          </p>
        )}
        <p className="thank-you-message">
          เราขอขอบคุณจากใจจริงสำหรับความเมตตาของคุณ
        </p>
        <button onClick={() => {
          sessionStorage.removeItem('donationInfoFormData');
          sessionStorage.removeItem('donationMoneyFormData');
          sessionStorage.removeItem('creditCardFormData');
          sessionStorage.removeItem('transactionNumber'); // ล้าง transactionNumber ด้วย
          sessionStorage.removeItem('donationType'); // Clear donationType
          localStorage.setItem("page", "/"); // Set page to root
          navigate('/');
        }} className="back-to-home-button" style={{ fontFamily: 'Anakotmai-Bold' }}>
          กลับสู่หน้าหลัก
        </button>
      </div>
    </div>
  );
};

export default ThankYouPage;