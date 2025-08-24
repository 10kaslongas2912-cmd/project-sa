import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCardOutlined, DollarOutlined, SmileOutlined, SolutionOutlined } from '@ant-design/icons';
import { Steps } from 'antd';
import './style.css';
import { CreditCard, Building2, QrCode } from 'lucide-react'; // Icon จาก lucide-react
import CreditCardForm from '../../../../components/Payment/Creditcard';
const SponsorPaymentPage: React.FC = () => {
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [promptPayNumber, setPromptPayNumber] = useState<string>('');
  const [promptPayNote, setPromptPayNote] = useState<string>('');
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
      if (!selectedBank) {
        alert('กรุณาเลือกธนาคารสำหรับการโอนเงิน');
        return;
      }
      navigate('thankyou');
      return;
    }
    if (selectedMethod === 'PromptPay') {
      if (!promptPayNumber) {
        alert('กรุณากรอกหมายเลข PromptPay');
        return;
      }
      navigate('thankyou');
      return;
    }
    if (selectedMethod === 'Credit Card') {
      navigate('thankyou');
      return;
    }
  }

  const banks = [
    { id: 'kbank', name: 'ธนาคารกสิกรไทย', color: '#4CAF50' },
    { id: 'scb', name: 'ธนาคารไทยพาณิชย์', color: '#9C27B0' },
    { id: 'bbl', name: 'ธนาคารกรุงเทพ', color: '#2196F3' },
    { id: 'ktb', name: 'ธนาคารกรุงไทย', color: '#FF5722' },
    { id: 'ttb', name: 'ธนาคารทหารไทย', color: '#FF9800' },
    { id: 'gsb', name: 'ธนาคารออมสิน', color: '#E91E63' }
  ];

  // สมมติว่ามีข้อมูล Payment Summary
  const paymentSummary = {
    sponsorship: 1000000,
  };

  const renderPaymentMethodDetails = () => {
    if (!selectedMethod) return null;

    switch (selectedMethod) {
      case 'Credit Card':
        return (
          <div className="payment-method-details">
            <div className="credit-card-form-container">
              {/* Component สำหรับ Credit Card Form ที่มีอยู่แล้ว */}
              <CreditCardForm />
            </div>
          </div>
        );

      case 'Bank Transfer':
        return (
          <div className="payment-method-details">
            <h4>เลือกธนาคาร</h4>
            <div className="bank-selection">
              {banks.map((bank) => (
                <button
                  key={bank.id}
                  className={`bank-button ${selectedBank === bank.id ? 'selected' : ''}`}
                  onClick={() => setSelectedBank(bank.id)}
                  style={{ borderColor: selectedBank === bank.id ? bank.color : '#ddd' }}
                >
                  <div 
                    className="bank-color" 
                    style={{ backgroundColor: bank.color }}
                  ></div>
                  <span>{bank.name}</span>
                </button>
              ))}
            </div>
            {/* {selectedBank && (
              <div className="bank-transfer-info">
                <div className="account-info">
                  <p><strong>ชื่อบัญชี:</strong> มูลนิธิช่วยเหลือสุนัข</p>
                  <p><strong>เลขที่บัญชี:</strong> 123-4-56789-0</p>
                  <p><strong>จำนวนเงิน:</strong> ฿{paymentSummary.sponsorship}</p>
                </div>
              </div>
            )} */}
          </div>
        );

      case 'PromptPay':
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
              {/* <div className="form-group">
                <label htmlFor="promptpay-note">หมายเหตุ (ไม่บังคับ)</label>
                <textarea
                  id="promptpay-note"
                  placeholder="หมายเหตุเพิ่มเติม"
                  value={promptPayNote}
                  onChange={(e) => setPromptPayNote(e.target.value)}
                  className="form-textarea"
                  rows={3}
                />
              </div> */}
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
            
            {selectedMethod === 'Credit Card' && renderPaymentMethodDetails()}
            
            <button
              className={`payment-button ${selectedMethod === 'Bank Transfer' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('Bank Transfer')}
            >
              <Building2 className="payment-icon" />
              <span>Bank Transfer</span>
            </button>
            
            {selectedMethod === 'Bank Transfer' && renderPaymentMethodDetails()}
            
            <button
              className={`payment-button ${selectedMethod === 'PromptPay' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('PromptPay')}
            >
              <QrCode className="payment-icon" />
              <span>PromptPay</span>
            </button>
            
            {selectedMethod === 'PromptPay' && renderPaymentMethodDetails()}
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