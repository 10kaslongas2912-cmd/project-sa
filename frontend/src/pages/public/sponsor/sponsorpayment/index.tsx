import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';
import { CreditCard, Building2, QrCode } from 'lucide-react'; // Icon จาก lucide-react

const SponsorPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const handlePreviousClick = () => {
    navigate(-1);
  };

  const handleConfirmPayment = () => {
    if (!selectedMethod) {
        alert('กรุณาเลือกวิธีการชำระเงิน');
        return;
    }
    // Logic สำหรับการยืนยันการชำระเงิน
    navigate('../thankyou')
  };

  // สมมติว่ามีข้อมูล Payment Summary
  const paymentSummary = {
    sponsorship: 1000000,
  };

  return (
    <div className="sponsor-container">
      <div className="sponsor-card">
        <div className="sponsor-header orange-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back to Dogs
          </button>
          <h1 className="sponsor-title-form">Sponsor Luna</h1>
          <p className="sponsor-subtitle-form">Help us provide the best care for Luna with your generous sponsorship</p>
        </div>

        <div className="sponsor-progress">
          <div className="progress-bar">
            <div className="progress-step done">1</div>
            <div className="progress-line done-line"></div>
            <div className="progress-step done">2</div>
            <div className="progress-line done-line"></div>
            <div className="progress-step active">3</div>
          </div>
        </div>

        <div className="sponsor-form-content">
          <h3 className="section-title">Payment Method</h3>
          <div className="payment-options">
            <button
              className={`payment-button ${selectedMethod === 'Credit Card' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('Credit Card')}
            >
              <CreditCard className="payment-icon" />
              <span>Credit Card</span>
            </button>
            <button
              className={`payment-button ${selectedMethod === 'Bank Transfer' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('Bank Transfer')}
            >
              <Building2 className="payment-icon" />
              <span>Bank Transfer</span>
            </button>
            <button
              className={`payment-button ${selectedMethod === 'PromptPay' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('PromptPay')}
            >
              <QrCode className="payment-icon" />
              <span>PromptPay</span>
            </button>
          </div>

          <div className="payment-summary">
            <h3 className="section-title">Payment Summary</h3>
            <div className="summary-row">
              <span className="summary-label">Sponsorship for Luna</span>
              <span className="summary-value">฿{paymentSummary.sponsorship}</span>
            </div>
            <div className="summary-row total">
              <span className="summary-label">Total</span>
              <span className="summary-value">฿{paymentSummary.sponsorship}</span>
            </div>
          </div>
        </div>

        <div className="sponsor-form-footer">
          <button className="previous-button" onClick={handlePreviousClick}>Previous</button>
          <button className="next-button confirm-button" onClick={handleConfirmPayment}>Confirm Payment</button>
        </div>
      </div>
    </div>
  );
};

export default SponsorPaymentPage;