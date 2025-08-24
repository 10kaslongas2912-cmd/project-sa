import React, { useState, useEffect } from "react";
import './style.css';
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import option_heart from '../../../../assets/visa-master-icon-5.png';

import { CreateDonation } from "../../../../services/https";
import type { DonorsInterface } from "../../../../interfaces/Donors";
import type { MoneyDonationsInterface } from "../../../../interfaces/MoneyDonations";

const CreditCardPaymentForm: React.FC = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // State for form inputs
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // 1. Retrieve data from sessionStorage
    const donorInfoString = sessionStorage.getItem('donationInfoFormData');
    const moneyDetailsString = sessionStorage.getItem('donationMoneyFormData');
    const donationType = sessionStorage.getItem('donationType');

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
      const moneyDetailsRaw = JSON.parse(moneyDetailsString);

      // 2. Determine donor_type
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('id');
      donorInfo.donor_type = token ? "user" : "guest";
      if (token && userId) {
        donorInfo.user_id = parseInt(userId, 10);
      }
      
      // 3. Construct MoneyDonations object
      const isMonthly = moneyDetailsRaw.donationFrequency === 'รายเดือน';
      const transactionNumber = `SA-TXN-${Date.now()}`;

      const moneyDetails: MoneyDonationsInterface = {
        amount: isMonthly ? Number(moneyDetailsRaw.monthlyAmount) : Number(moneyDetailsRaw.oneTimeAmount),
        payment_method_id: isMonthly ? 1 : moneyDetailsRaw.paymentMethod, // Monthly is always 1 (Credit Card)
        payment_type: isMonthly ? 'monthly' : 'one-time',
        status: isMonthly ? 'success' : 'complete',
        transaction_ref: transactionNumber, // Use generated transaction number
        billing_date: isMonthly ? moneyDetailsRaw.billingDate.toString() : "-", // Add billing date
        next_payment_date: isMonthly ? (() => {
            const today = new Date();
            const billingDay = Number(moneyDetailsRaw.billingDate);
            let nextDate = new Date(today.getFullYear(), today.getMonth(), billingDay);
            if (today.getDate() >= billingDay) {
                nextDate.setMonth(nextDate.getMonth() + 1);
            }
            return nextDate.toISOString().split('T')[0]; // Format to YYYY-MM-DD
        })() : "-",
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
        sessionStorage.removeItem('donationMoneyFormData');
        sessionStorage.removeItem('donationType');
        sessionStorage.removeItem('creditCardFormData');
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

  return (
    <>
      {contextHolder}
      <div className="form-page-container">
        <div className="form-card">
          <button
            onClick={() => navigate('/donation/money')}
            className="back-link"
          >
            &lt; ย้อนกลับ
          </button>
          <h1 className="form-title">ชำระเงินด้วยบัตรเครดิต</h1>
          <h1 className="form-subtitle">การ์ดที่รองรับ</h1>
          <img src={option_heart} className="supported-cards" alt="การ์ดที่รองรับ" />

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
            <button type="submit" className="submit-button">
              ยืนยันการชำระเงิน
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreditCardPaymentForm;