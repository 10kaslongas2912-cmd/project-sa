import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCardOutlined, DollarOutlined, SmileOutlined, SolutionOutlined } from '@ant-design/icons';
import { Steps } from 'antd';
import './style.css';
import { CreditCard, Building2, QrCode } from 'lucide-react'; // Icon จาก lucide-react

const SponsorPaymentPage: React.FC = () => {
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [promptPayNumber, setPromptPayNumber] = useState<string>('');
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
    if (selectedMethod === 'Bank Transfer') {
      navigate('banktransfer');
      return;
    };
    if (selectedMethod === 'PromptPay') {
      navigate('promptpay');
      return;
    };
    if (selectedMethod === 'Credit Card') {
      navigate('creditcard');
      return;
    }
  }  
  // สมมติว่ามีข้อมูล Payment Summary
  const paymentSummary = {
    sponsorship: 1000000,
  };

  return (
    <div className="sponsor-container">
      <div className="sponsor-card">
        <div className="sponsor-header orange-header">
          <button className="back-button" onClick={() => navigate('/sponsor')}>
            ← กลับไปหน้าอุปถัมภ์
          </button>
          <h1 className="sponsor-title-form">Sponsor</h1>
          <p className="sponsor-subtitle-form">ช่วยให้เราดูแลสุนัขได้ดีที่สุด ด้วยการอุปถัมภ์อย่างมีน้ำใจของคุณ</p>
        </div>

        <div className="sponsor-progress">
          <Steps
              items={[
              {
                  title: 'Select Amount',
                  status: 'finish',
                  icon: <DollarOutlined />,
              },
              {
                  title: 'Verification',
                  status: 'finish',
                  icon: <SolutionOutlined />,
              },
              {
                  title: 'Pay',
                  status: 'process',
                  icon: <CreditCardOutlined />,
              },
              {
                  title: 'Done',
                  status: 'wait',
                  icon: <SmileOutlined />,
              },
              ]}
          />
        </div>

        <div className="sponsor-form-content">
          <h3 className="section-title">เลือกวิธีการชำระเงิน</h3>
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
            <h3 className="section-title">จำนวนเงินทั้งหมด</h3>
            <div className="summary-row">
              <span className="summary-label">Sponsorship for Dog</span>
              <span className="summary-value">฿{paymentSummary.sponsorship}</span>
            </div>
            <div className="summary-row total">
              <span className="summary-label">Total</span>
              <span className="summary-value">฿{paymentSummary.sponsorship}</span>
            </div>
          </div>
        </div>

        <div className="sponsor-form-footer">
          <button className="previous-button" onClick={handlePreviousClick}>ย้อนกลับ</button>
          <button className="next-button confirm-button" onClick={handleConfirmPayment}>ยืนยันการชำระเงิน</button>
        </div>
      </div>
    </div>
  );
};
export default SponsorPaymentPage;