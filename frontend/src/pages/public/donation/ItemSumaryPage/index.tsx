import React, { useState, useEffect } from "react";
import './style.css';
import { useNavigate } from "react-router-dom";

interface DonationItem {
  id: string;
  itemName: string;
  quantity: string;
  unit: string;
}

interface DonationSummaryProps {
  donationData?: {
    donationItems: DonationItem[];
  };
}

// Helper to get donation data from sessionStorage
const getDonationData = () => {
  try {
    const storedData = sessionStorage.getItem('donationItemsFormData');
    return storedData ? JSON.parse(storedData) : { donationItems: [] };
  } catch (error) {
    console.error("Error parsing stored donation data:", error);
    return { donationItems: [] };
  }
};

const DonationSummaryPage: React.FC<DonationSummaryProps> = ({ donationData }) => {
  const navigate = useNavigate();
  const [createAccount, setCreateAccount] = useState<boolean | null>(null);
  const [summaryData, setSummaryData] = useState(donationData || getDonationData());
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for login token
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }

    // If no donation data is passed as props, get it from sessionStorage
    if (!donationData) {
      setSummaryData(getDonationData());
    }
  }, [donationData]);

  const handleNext = () => {
    if (!isLoggedIn && createAccount === null) {
      alert('กรุณาเลือกตัวเลือกการสร้างบัญชีการบริจาค');
      return;
    }

    // Save account preference to sessionStorage
    if (createAccount !== null) {
      sessionStorage.setItem('createAccount', createAccount.toString());
    }
    
    if (!isLoggedIn && createAccount) {
      sessionStorage.setItem('returnTo', '/donation/summary');
      navigate('/signup');
    } else {
      // For logged-in users or users who don't want to create an account
      sessionStorage.removeItem('donationItemsFormData');
      sessionStorage.removeItem('createAccount');
      navigate('/donation/thankyou');
    }
  };

  const handleBack = () => {
    navigate('/donation/item');
  };

  return (
    <div className="summary-page-container">
      <div className="summary-content">
        {/* ปุ่มย้อนกลับ */}
        <button onClick={handleBack} className="back-button">
          &lt; ย้อนกลับ
        </button>

        {/* หัวข้อหลัก */}
        <h1 className="summary-main-title">รายละเอียดการบริจาคสิ่งของ</h1>
        
        {/* สรุปรายการบริจาค */}
        <div className="summary-box">
          <h2 className="summary-section-title">สรุปรายการบริจาคสิ่งของ</h2>
          
          <ul className="donation-list">
            {summaryData.donationItems && summaryData.donationItems.length > 0 ? (
              summaryData.donationItems.map((item: DonationItem) => (
                <li key={item.id} className="donation-list-item">
                  {item.itemName} จำนวน {item.quantity} {item.unit}
                </li>
              ))
            ) : (
              <>
                <li className="donation-list-item">อาหารเม็ดสุนัข จำนวน 10 ถุง</li>
                <li className="donation-list-item">ยาฆ่าเชื้อ จำนวน 3 ขวด</li>
              </>
            )}
          </ul>
        </div>

        {/* วิธีการจัดส่ง */}
        <div className="delivery-box">
          <h2 className="delivery-section-title">วิธีการจัดส่ง</h2>
          <p className="delivery-description">
            ท่านสามารถนำมาบริจาคด้วยตนเองหรือส่งมาให้ได้ จ่าหน้าถึง <strong>DOG CARE (ของบริจาค)</strong>
          </p>
          <p className="delivery-address">
            เลขที่ 15/1 ม.1 ซ.พระมหาการุณย์25 ถ.ติวานนท์-ปากเกร็ด56 ต.บ้านใหม่ อ.ปากเกร็ด จ.นนทบุรี 11120<br />
            โทร.02-584-4896 หรือมือถือ 065-887-4888
          </p>
        </div>

        {/* สร้างบัญชีบริจาค - แสดงเมื่อยังไม่ล็อคอินเท่านั้น */}
        {!isLoggedIn && (
          <div className="account-box">
            <h2 className="account-section-title">สร้างบัญชีบริจาค</h2>
            
            <div className="radio-group">
              <label className={`radio-option ${createAccount === true ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="createAccount"
                  value="true"
                  checked={createAccount === true}
                  onChange={() => setCreateAccount(true)}
                />
                <span className="radio-indicator"></span>
                <span className="radio-text">ฉันต้องการสร้างบัญชีการบริจาค</span>
              </label>
              
              <label className={`radio-option ${createAccount === false ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="createAccount"
                  value="false"
                  checked={createAccount === false}
                  onChange={() => setCreateAccount(false)}
                />
                <span className="radio-indicator"></span>
                <span className="radio-text">ฉันไม่ต้องการสร้างบัญชีการบริจาค</span>
              </label>
            </div>
          </div>
        )}

        {/* ปุ่มต่อไป */}
        <button 
          onClick={handleNext} 
          className="continue-button"
        >
          ต่อไป
        </button>
      </div>
    </div>
  );
};

export default DonationSummaryPage;