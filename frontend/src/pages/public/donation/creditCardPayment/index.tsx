import React, { useState } from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import option_heart from "../../../../assets/visa-master-icon-5.png";

import { donationAPI } from "../../../../services/apis";
import type {
  DonorInterface,
  MoneyDonationInterface,
  CreateDonationRequest,
} from "../../../../interfaces/Donation";


const CreditCardPaymentForm: React.FC = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  // form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState(""); // MM/YY
  const [cvv, setCvv] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // 1) โหลดข้อมูลจาก sessionStorage
    const donorInfoString = sessionStorage.getItem("donationInfoFormData");
    const moneyDetailsString = sessionStorage.getItem("moneyDonationData");
    const donationType = sessionStorage.getItem("donationType");

    if (!donorInfoString || !moneyDetailsString || !donationType) {
      messageApi.open({
        type: "error",
        content: "ข้อมูลการบริจาคไม่สมบูรณ์ กรุณาเริ่มต้นใหม่",
      });
      navigate("/donation/options");
      return;
    }

    try {
      const donorInfo: DonorInterface = JSON.parse(donorInfoString);
      let moneyDetails: MoneyDonationInterface = JSON.parse(moneyDetailsString);

      // 2) enrich donorInfo from login status
      const token = sessionStorage.getItem("token");
      const userId = sessionStorage.getItem("ID");
      donorInfo.donor_type = token ? "user" : "guest";
      if (token && userId) {
        donorInfo.user_id = parseInt(userId, 10);
      }

      // 3) Add final properties to moneyDetails
      const transactionNumber = `SA-TXN-${Date.now()}`;
      const isMonthly = moneyDetails.payment_type === "monthly";

      moneyDetails = {
        ...moneyDetails,
        status: isMonthly ? "success" : "complete",
        transaction_ref: transactionNumber,
      };

      // 5) Combine payload for CreateDonationRequest 
      const payload: CreateDonationRequest = {
        donor_info: donorInfo,
        donation_type: donationType,
        money_donation_details: moneyDetails,
      };

      // 6) เรียก API ครั้งเดียวด้วย payload ก้อนเดียว
      const result = await donationAPI.create(payload);

      // 7) ตรวจผลลัพธ์
      const status = (result as any)?.status ?? 200;
      const data = (result as any)?.data ?? result;

      if (status === 200) {
        messageApi.open({
          type: "success",
          content: "การบริจาคสำเร็จ ขอบคุณ!",
        });
        // เคลียร์ค่า form/session
        sessionStorage.removeItem("donationInfoFormData");
        sessionStorage.removeItem("donationMoneyFormData");
        sessionStorage.removeItem("donationType");
        sessionStorage.removeItem("creditCardFormData");
        navigate("/donation/thankyou");
      } else {
        messageApi.open({
          type: "error",
          content: data?.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
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
            onClick={() => navigate("/donation/money")}
            className="back-link"
          >
            &lt; ย้อนกลับ
          </button>

          <h1 className="form-title">ชำระเงินด้วยบัตรเครดิต</h1>
          <h1 className="form-subtitle">การ์ดที่รองรับ</h1>
          <img
            src={option_heart}
            className="supported-cards"
            alt="การ์ดที่รองรับ"
          />

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