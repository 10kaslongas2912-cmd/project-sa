import React, { useState, useEffect } from "react";
import './style.css';
import { useNavigate } from "react-router-dom";
import { message } from "antd";

import { CreateDonation } from "../../../../services/https";
import type { DonorsInterface } from "../../../../interfaces/Donors";
import type { MoneyDonationsInterface } from "../../../../interfaces/MoneyDonations";

// ใช้ Base64 placeholder แทนการ import ไฟล์
const qr_code = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y5ZjlmOSIgc3Ryb2tlPSIjZGRkIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCB4PSIxNTAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPkdSIENvZGU8L3RleHQ+Cjwvc3ZnPgo=";

const MobileBankingPage: React.FC = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isExpired, setIsExpired] = useState(false);
  const [paymentNumber, setPaymentNumber] = useState('');

  const generatePaymentNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `PAY-${year}${month}${day}-${randomNum}`;
  };

  useEffect(() => {
    const existingPaymentNumber = sessionStorage.getItem('transactionNumber');
    if (existingPaymentNumber) {
      setPaymentNumber(existingPaymentNumber);
    } else {
      const newPaymentNumber = generatePaymentNumber();
      setPaymentNumber(newPaymentNumber);
      sessionStorage.setItem('transactionNumber', newPaymentNumber);
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleFinish = async () => {
    // 1. Retrieve data from sessionStorage
    const donorInfoString = sessionStorage.getItem('donationInfoFormData');
    const moneyDetailsString = sessionStorage.getItem('moneyDonationData'); // CORRECT KEY
    const donationType = sessionStorage.getItem('donationType');
    const transactionNumber = sessionStorage.getItem('transactionNumber');

    if (!donorInfoString || !moneyDetailsString || !donationType) {
      messageApi.open({
        type: "error",
        content: "ข้อมูลการบริจาคไม่สมบูรณ์ กรุณาเริ่มต้นใหม่",
      });
      navigate('/donation/options');
      return;
    }

    try {
      const donorInfo: DonorsInterface = JSON.parse(donorInfoString);
      let moneyDetails: MoneyDonationsInterface = JSON.parse(moneyDetailsString); // PARSE CORRECT DATA

      // 2. Determine donor_type
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('id');
      donorInfo.donor_type = token ? "user" : "guest";
      if (token && userId) {
        donorInfo.user_id = parseInt(userId, 10);
      }

      // 3. Add final properties to MoneyDonations object
      moneyDetails = {
        ...moneyDetails,
        status: 'complete',
        transaction_ref: transactionNumber || generatePaymentNumber(),
      };

      // 4. Call CreateDonation
      const result = await CreateDonation(donorInfo, donationType, moneyDetails);

      if (result.status === 200) {
        messageApi.open({
          type: "success",
          content: "การบริจาคสำเร็จ ขอบคุณ!",
        });
        // Clear session storage after successful donation
        sessionStorage.removeItem('donationInfoFormData');
        sessionStorage.removeItem('moneyDonationData');
        sessionStorage.removeItem('donationMoneyFormData'); // Also remove the old raw data
        sessionStorage.removeItem('donationType');
        sessionStorage.removeItem('transactionNumber');
        navigate('/donation/thankyou');
      } else {
        messageApi.open({
          type: "error",
          content: result.data?.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        });
      }
    } catch (error) {
      console.error("Error processing donation:", error);
      messageApi.open({
        type: "error",
        content: "เกิดข้อผิดพลาดในการประมวลผลข้อมูล",
      });
    }
  };

  const handleGoBack = () => {
    const confirmed = window.confirm('การย้อนกลับจะยกเลิกการชำระเงินนี้ คุณต้องการดำเนินการต่อหรือไม่?');
    if (confirmed) {
      sessionStorage.removeItem('transactionNumber');
      navigate('/donation/money');
    }
  };
  
  // Other functions (formatTime, handleSaveQrCode, handleRefreshQrCode) remain the same...
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSaveQrCode = () => { /* ... implementation ... */ };
  const handleRefreshQrCode = () => { /* ... implementation ... */ };

  return (
    <>
      {contextHolder}
      <div className="form-page-container">
        <div className="form-card">
          <button onClick={handleGoBack} className="back-link">
            &lt; ย้อนกลับ
          </button>
          <h1 className="form-title">สแกนจ่ายด้วยแอปธนาคาร</h1>
          <h2 className="form-subtitle">หมายเลขการชำระเงิน: {paymentNumber}</h2>
          {isExpired ? (
            <div className="expired-section">
              <p className="timer-expired">QR Code หมดอายุแล้ว</p>
              <button onClick={handleRefreshQrCode} className="refresh-button">
                สร้าง QR Code ใหม่
              </button>
            </div>
          ) : (
            <>
              <p className="timer">เวลาที่เหลือ: {formatTime(timeLeft)}</p>
              <div className="qr-code-container">
                <img src={qr_code} className="qr-code-image" alt="QR Code สำหรับชำระเงิน" />
              </div>
            </>
          )}
          <div className="button-group">
            {!isExpired && (
              <button onClick={handleSaveQrCode} className="save-qr-button">
                บันทึก QR Code
              </button>
            )}
            <button 
              onClick={handleFinish} 
              className="submit-button"
              disabled={isExpired}
            >
              ยืนยันการบริจาค
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileBankingPage;
