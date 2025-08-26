import React, { useState, useEffect } from "react";
import './style.css';
import { useNavigate } from "react-router-dom";
import { message } from "antd";

import { CreateDonation } from "../../../../services/https";
import type { DonorsInterface } from "../../../../interfaces/Donors";
import type { ItemDonationsInterface } from "../../../../interfaces/ItemDonations";

interface DonationItem { 
  itemName: string;
  quantity: string;
  unit: string;
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

const DonationSummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [createAccount, setCreateAccount] = useState<boolean | null>(null);
  const [summaryData] = useState(getDonationData());
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleNext = async () => {
    if (!isLoggedIn && createAccount === null) {
      message.error('กรุณาเลือกตัวเลือกการสร้างบัญชีการบริจาค');
      return;
    }

    if (!isLoggedIn && createAccount) {
      sessionStorage.setItem('returnTo', '/donation/summary');
      navigate('/signup');
      return;
    }

    // API Call Logic
    const donorInfoString = sessionStorage.getItem('donationInfoFormData');
    const itemDetailsString = sessionStorage.getItem('donationItemsFormData');
    const donationType = sessionStorage.getItem('donationType');

    if (!donorInfoString || !itemDetailsString || donationType !== 'item') {
      messageApi.open({ type: "error", content: "ข้อมูลการบริจาคไม่สมบูรณ์ กรุณาเริ่มต้นใหม่" });
      navigate('/donation/options');
      return;
    }

    try {
      const donorInfo: DonorsInterface = JSON.parse(donorInfoString);
      const itemDetailsRaw = JSON.parse(itemDetailsString);

      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('id');
      donorInfo.donor_type = token ? "user" : "guest";
      if (token && userId) {
        donorInfo.user_id = parseInt(userId, 10);
      }

      const transactionNumber = `SA-ITEM-${Date.now()}`;
      const itemDetails: ItemDonationsInterface[] = itemDetailsRaw.donationItems.map((item: DonationItem) => ({
        item_name: item.itemName,
        quantity: Number(item.quantity),
        unit: item.unit,
        item_ref: `${transactionNumber}-${item.itemName}`
      }));

      const result = await CreateDonation(donorInfo, donationType, undefined, itemDetails);

      if (result.status === 200) {
        messageApi.open({ type: "success", content: "การบริจาคสำเร็จ ขอบคุณ!" });
        sessionStorage.removeItem('donationInfoFormData');
        sessionStorage.removeItem('donationItemsFormData');
        sessionStorage.removeItem('donationType');
        sessionStorage.removeItem('createAccount');
        navigate('/donation/thankyou');
      } else {
        messageApi.open({ type: "error", content: result.data?.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
      }
    } catch (error) {
      console.error("Error processing donation:", error);
      messageApi.open({ type: "error", content: "เกิดข้อผิดพลาดในการประมวลผลข้อมูล" });
    }
  };

  const handleBack = () => {
    navigate('/donation/item');
  };

  return (
    <>
      {contextHolder}
      <div className="summary-page-container">
        <div className="summary-content">
          <button onClick={handleBack} className="back-button">
            &lt; ย้อนกลับ
          </button>
          <h1 className="summary-main-title">รายละเอียดการบริจาคสิ่งของ</h1>
          <div className="summary-box">
            <h2 className="summary-section-title">สรุปรายการบริจาคสิ่งของ</h2>
            <ul className="donation-list">
              {summaryData.donationItems && summaryData.donationItems.length > 0 ? (
                summaryData.donationItems.map((item: DonationItem, index: number) => (
                  <li key={index} className="donation-list-item">
                    {item.itemName} จำนวน {item.quantity} {item.unit}
                  </li>
                ))
              ) : (
                <li className="donation-list-item">ไม่มีข้อมูล</li>
              )}
            </ul>
          </div>
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
          {!isLoggedIn && (
            <div className="account-box">
              <h2 className="account-section-title">สร้างบัญชีบริจาค</h2>
              <div className="radio-group">
                <label className={`radio-option ${createAccount === true ? 'selected' : ''}`}>
                  <input type="radio" name="createAccount" value="true" checked={createAccount === true} onChange={() => setCreateAccount(true)} />
                  <span className="radio-indicator"></span>
                  <span className="radio-text">ฉันต้องการสร้างบัญชีการบริจาค</span>
                </label>
                <label className={`radio-option ${createAccount === false ? 'selected' : ''}`}>
                  <input type="radio" name="createAccount" value="false" checked={createAccount === false} onChange={() => setCreateAccount(false)} />
                  <span className="radio-indicator"></span>
                  <span className="radio-text">ฉันไม่ต้องการสร้างบัญชีการบริจาค</span>
                </label>
              </div>
            </div>
          )}
          <button onClick={handleNext} className="continue-button">
            ยืนยันและเสร็จสิ้น
          </button>
        </div>
      </div>
    </>
  );
};

export default DonationSummaryPage;
