// src/pages/public/sponsor/SponsorPayment/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CreditCardOutlined,
  DollarOutlined,
  SmileOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { Steps, message } from "antd";
import { CreditCard, Building2, QrCode } from "lucide-react";

import { useDog } from "../../../../hooks/useDog";
import { useSponsorship } from "../../../../hooks/sponsorship/useSponsorship";
import SponsorDogCard from "../../../../components/Sponsor/SponsorCard";
import CreditCardForm from "../../../../components/Payment/Creditcard";
import "./style.css";

type Method = "Credit Card" | "Bank Transfer" | "PromptPay";

const banks = [
  { id: "kbank", name: "ธนาคารกสิกรไทย", color: "#4CAF50" },
  { id: "scb",  name: "ธนาคารไทยพาณิชย์", color: "#9C27B0" },
  { id: "bbl",  name: "ธนาคารกรุงเทพ",   color: "#2196F3" },
  { id: "ktb",  name: "ธนาคารกรุงไทย",    color: "#FF5722" },
  { id: "ttb",  name: "ธนาคารทหารไทย",    color: "#FF9800" },
  { id: "gsb",  name: "ธนาคารออมสิน",     color: "#E91E63" },
];

const SponsorPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dogId = id ? Number(id) : null;
  const { dog } = useDog(dogId);

  // เอาค่าที่เลือกจาก step ก่อนหน้า
  const { planType, amount } = useSponsorship(); // planType: 'one-time' | 'subscription'

  // state ภายในหน้า
  const [selectedMethod, setSelectedMethod] = useState<Method | null>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [promptPayNumber, setPromptPayNumber] = useState<string>("");
  const [promptPayNote, setPromptPayNote] = useState<string>("");

  // สรุปยอด
  const paymentSummary = useMemo(() => ({
    sponsorship: amount ?? 0,
    total: amount ?? 0,
  }), [amount]);

  // Guard: ถ้าไม่มี dogId/amount/planType ให้ย้อนกลับไปเลือกใหม่
  useEffect(() => {
    if (!dogId || !planType || !amount) {
      message.error("ข้อมูลไม่ครบ กรุณาเริ่มใหม่");
      navigate("/sponsor");
      return;
    }
  }, [dogId, planType, amount, navigate]);

  // ถ้าเป็น subscription → ล็อกวิธีชำระเงินเป็น Credit Card
  useEffect(() => {
    if (planType === "subscription") {
      setSelectedMethod("Credit Card");
    } else {
      // one-time: เคลียร์ไว้ให้ผู้ใช้เลือกเอง
      setSelectedMethod(null);
      setSelectedBank(null);
      setPromptPayNumber("");
      setPromptPayNote("");
    }
  }, [planType]);

  const handlePreviousClick = () => navigate(-1);

  const handleConfirmPayment = () => {
    console.log("Hellow")
    if (!selectedMethod) {
      message.error("กรุณาเลือกวิธีการชำระเงิน");
      return;
    }

    if (selectedMethod === "Bank Transfer") {
      if (!selectedBank) {
        message.error("กรุณาเลือกธนาคารสำหรับการโอนเงิน");
        return;
      }
    }

    if (selectedMethod === "PromptPay") {
      if (!promptPayNumber.trim()) {
        message.error("กรุณากรอกหมายเลข PromptPay");
        return;
      }
    }

    // ที่นี่คุณจะยิง API ชำระเงินจริง ๆ ก็ได้
    navigate("thankyou");
  };

  const renderPaymentMethodDetails = () => {
    if (!selectedMethod) return null;

    switch (selectedMethod) {
      case "Credit Card":
        return (
          <div className="payment-method-details">
            <div className="credit-card-form-container">
              <CreditCardForm />
            </div>
          </div>
        );

      case "Bank Transfer":
        return (
          <div className="payment-method-details">
            <h4>เลือกธนาคาร</h4>
            <div className="bank-selection">
              {banks.map((bank) => (
                <button
                  key={bank.id}
                  className={`bank-button ${selectedBank === bank.id ? "selected" : ""}`}
                  onClick={() => setSelectedBank(bank.id)}
                  style={{ borderColor: selectedBank === bank.id ? bank.color : "#ddd" }}
                >
                  <div className="bank-color" style={{ backgroundColor: bank.color }} />
                  <span>{bank.name}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case "PromptPay":
        return (
          <div className="payment-method-details">
            <h4>ข้อมูล PromptPay</h4>
            <div className="promptpay-form">
              <div className="form-group">
                <label htmlFor="promptpay-number">หมายเลข PromptPay *</label>
                <input
                  id="promptpay-number"
                  type="text"
                  placeholder="เบอร์โทรศัพท์หรือเลขบัตรประชาชน"
                  value={promptPayNumber}
                  onChange={(e) => setPromptPayNumber(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="promptpay-note">หมายเหตุ (ไม่บังคับ)</label>
                <textarea
                  id="promptpay-note"
                  placeholder="หมายเหตุเพิ่มเติม"
                  value={promptPayNote}
                  onChange={(e) => setPromptPayNote(e.target.value)}
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="sponsor-container">
      <div className="sponsor-card">
        <SponsorDogCard dog={dog} />

        <div className="sponsor-progress">
          <Steps
            items={[
              { title: "Select Amount", status: "finish",  icon: <DollarOutlined /> },
              { title: "Verification",  status: "finish",  icon: <SolutionOutlined /> },
              { title: "Pay",           status: "process", icon: <CreditCardOutlined /> },
              { title: "Done",          status: "wait",    icon: <SmileOutlined /> },
            ]}
          />
        </div>

        <div className="sponsor-form-content">
          <h3 className="section-title">เลือกวิธีการชำระเงิน</h3>

          <div className="payment-options">
            {/* Credit Card — ใช้ได้ทุกกรณี และเป็นตัวเลือกเดียวเมื่อเป็น subscription */}
            <button
              className={`payment-button ${selectedMethod === "Credit Card" ? "selected" : ""}`}
              onClick={() => setSelectedMethod("Credit Card")}
            >
              <CreditCard className="payment-icon" />
              <span>Credit Card</span>
            </button>
            {selectedMethod === "Credit Card" && renderPaymentMethodDetails()}

            {/* วิธีอื่น ๆ แสดงเฉพาะ one-time */}
            {planType === "one-time" && (
              <>
                <button
                  className={`payment-button ${selectedMethod === "Bank Transfer" ? "selected" : ""}`}
                  onClick={() => setSelectedMethod("Bank Transfer")}
                >
                  <Building2 className="payment-icon" />
                  <span>Bank Transfer</span>
                </button>
                {selectedMethod === "Bank Transfer" && renderPaymentMethodDetails()}

                <button
                  className={`payment-button ${selectedMethod === "PromptPay" ? "selected" : ""}`}
                  onClick={() => setSelectedMethod("PromptPay")}
                >
                  <QrCode className="payment-icon" />
                  <span>PromptPay</span>
                </button>
                {selectedMethod === "PromptPay" && renderPaymentMethodDetails()}
              </>
            )}
          </div>

          <div className="payment-summary">
            <h3 className="section-title">จำนวนเงินทั้งหมด</h3>
            <div className="summary-row">
              <span className="summary-label">
                {planType === "subscription" ? "Sponsorship (Subscription)" : "Sponsorship (One-time)"}
              </span>
              <span className="summary-value">฿{paymentSummary.sponsorship.toLocaleString()}</span>
            </div>
            <div className="summary-row total">
              <span className="summary-label">Total</span>
              <span className="summary-value">฿{paymentSummary.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="sponsor-form-footer">
          <button className="previous-button" onClick={handlePreviousClick}>
            ย้อนกลับ
          </button>
          <button className="next-button confirm-button" onClick={handleConfirmPayment}>
            ยืนยันการชำระเงิน
          </button>
        </div>
      </div>
    </div>
  );
};

export default SponsorPaymentPage;
