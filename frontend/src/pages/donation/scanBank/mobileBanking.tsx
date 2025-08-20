import React, { useState, useEffect } from "react";
import './style.css';
import { useNavigate } from "react-router-dom";

// ใช้ Base64 placeholder แทนการ import ไฟล์
const qr_code = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y5ZjlmOSIgc3Ryb2tlPSIjZGRkIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCB4PSIxNTAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPkdSIENvZGU8L3RleHQ+Cjwvc3ZnPgo=";

interface DonationInfoFormProps {
  onSubmit?: (formData: object) => void;
}

// Helper to get initial state from sessionStorage
const MobileBankingPage: React.FC<DonationInfoFormProps> = ({ }) => {
  const navigate = useNavigate();

  // State สำหรับตัวนับเวลา
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 นาที * 60 วินาที
  const [isExpired, setIsExpired] = useState(false);

  // State สำหรับหมายเลขการชำระเงิน
  const [paymentNumber, setPaymentNumber] = useState('');

  // ฟังก์ชันสำหรับสร้างหมายเลขการชำระเงิน
  const generatePaymentNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
    return `PAY-${year}${month}${day}-${randomNum}`;
  };

  useEffect(() => {
    // ตรวจสอบว่ามีหมายเลขการชำระเงินใน sessionStorage หรือไม่
    const existingPaymentNumber = sessionStorage.getItem('transactionNumber');
    
    if (existingPaymentNumber) {
      setPaymentNumber(existingPaymentNumber);
    } else {
      // สร้างหมายเลขการชำระเงินใหม่
      const newPaymentNumber = generatePaymentNumber();
      setPaymentNumber(newPaymentNumber);
      sessionStorage.setItem('transactionNumber', newPaymentNumber);
    }

    // ตั้งค่าตัวนับเวลา
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

    // Cleanup function
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSaveQrCode = () => {
    try {
      // สร้าง canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          // สร้าง download link
          const link = document.createElement('a');
          link.download = `qr-code-${paymentNumber}.png`;
          link.href = canvas.toDataURL();
          
          // Trigger download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      };
      
      img.src = qr_code;
      
    } catch (error) {
      console.error('Error saving QR code:', error);
      alert('ไม่สามารถบันทึก QR Code ได้ กรุณาลองอีกครั้ง');
    }
  };

  const handleRefreshQrCode = () => {
    if (isExpired) {
      // รีเซ็ตตัวนับเวลาและสร้างหมายเลขใหม่
      const newPaymentNumber = generatePaymentNumber();
      setPaymentNumber(newPaymentNumber);
      sessionStorage.setItem('transactionNumber', newPaymentNumber);
      
      setTimeLeft(10 * 60);
      setIsExpired(false);
      
      // เริ่มตัวนับเวลาใหม่
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
    }
  };

  const handleFinish = () => {
    // ตรวจสอบว่าชำระเงินเสร็จสิ้นหรือไม่
    const confirmed = window.confirm('คุณได้ชำระเงินเรียบร้อยแล้วใช่หรือไม่?');
    
    if (confirmed) {
      // เก็บข้อมูลการชำระเงิน
      const paymentData = {
        paymentNumber: paymentNumber,
        paymentMethod: 'Mobile Banking',
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      
            sessionStorage.setItem('paymentData', JSON.stringify(paymentData));
      
      // ลบข้อมูลฟอร์มที่ไม่จำเป็น
      sessionStorage.removeItem('donationInfoFormData');
      sessionStorage.removeItem('donationMoneyFormData');
      sessionStorage.removeItem('creditCardFormData');
      
      // transactionNumber ถูกเก็บไว้แล้วใน sessionStorage
      navigate('/thank-you');
    }
  };

  const handleGoBack = () => {
    const confirmed = window.confirm('การย้อนกลับจะยกเลิกการชำระเงินนี้ คุณต้องการดำเนินการต่อหรือไม่?');
    
    if (confirmed) {
      sessionStorage.removeItem('transactionNumber');
      navigate('/donation-money');
    }
  };

  return (
    <div className="form-page-container">
      <div className="form-card">
        {/* ปุ่มย้อนกลับ */}
        <button
          onClick={handleGoBack}
          className="back-link"
        >
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
              
              <div className="payment-instructions">
                <h3>วิธีการชำระเงิน:</h3>
                <ol>
                  <li>เปิดแอปธนาคารของคุณ</li>
                  <li>เลือกเมนู "สแกน QR Code" หรือ "จ่ายเงิน"</li>
                  <li>สแกน QR Code ด้านบน</li>
                  <li>ยืนยันการชำระเงิน</li>
                  <li>กดปุ่ม "เสร็จสิ้น" หลังจากชำระเงินแล้ว</li>
                </ol>
              </div>
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
            เสร็จสิ้น
          </button>
        </div>

        {/* แสดงข้อมูลการบริจาคสำหรับยืนยัน */}
        <div className="donation-summary">
          <h3>สรุปการบริจาค:</h3>
          <div className="summary-content">
            {/* ดึงข้อมูลจาก sessionStorage เพื่อแสดง */}
            <p>กรุณาตรวจสอบยอดเงินในแอปธนาคารของคุณให้ถูกต้อง</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileBankingPage;