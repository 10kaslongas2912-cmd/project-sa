import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCardOutlined, DollarOutlined, SmileOutlined, SolutionOutlined } from '@ant-design/icons';
import { Steps } from 'antd';
import './style.css'; 

interface Dog {
  name: string;
}

const donationAmounts = [100, 300, 500, 1000];

const SponsorAmountPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dog = location.state as Dog;
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(''); 
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(null); 
  };

  const handleNextClick = () => {
    let amountToSponsor: number | null = null;
    if (selectedAmount) {
      amountToSponsor = selectedAmount;
    } else if (customAmount) {
      amountToSponsor = parseInt(customAmount, 10);
    }

    if (!amountToSponsor || isNaN(amountToSponsor)) {
      alert('กรุณาเลือกหรือระบุจำนวนเงินที่ต้องการอุปถัมภ์');
      return;
    }


    navigate('../form', { state: { dogName: dog?.name, amount: amountToSponsor } });
  };

  return (
    <div className="sponsor-container">
      <div className="sponsor-card">

        <div className="sponsor-header">
          <button className="back-button" onClick={() => navigate('/sponsor')}>
            ← กลับไปหน้าอุปถัมภ์
          </button>
          <h1 className="sponsor-title">อุปถัมภ์น้องหมา</h1>
          <p className="sponsor-subtitle">ช่วยให้เราดูแลสุนัขได้ดีที่สุด ด้วยการอุปถัมภ์อย่างมีน้ำใจของคุณ</p>
        </div>

        <div className="sponsor-progress">
            <Steps
                items={[
                {
                    title: 'Select Amount',
                    status: 'process',
                    icon: <DollarOutlined />,
                },
                {
                    title: 'Verification',
                    status: 'wait',
                    icon: <SolutionOutlined />,
                },
                {
                    title: 'Pay',
                    status: 'wait',
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

        <div className="sponsor-content">
          <h3 className="section-title">เลือกจำนวนเงิน</h3>
          <div className="donation-options">
            {donationAmounts.map((amount) => (
              <button
                key={amount}
                className={`donation-button ${selectedAmount === amount ? 'selected' : ''}`}
                onClick={() => handleAmountClick(amount)}
              >
                ฿{amount}
              </button>
            ))}
          </div>

          <h3 className="section-title custom-amount-title">ระบุจำนวนเงิน (บาท)</h3>
          <input
            type="number"
            className="custom-amount-input"
            placeholder="กรอกจำนวนเงิน"
            value={customAmount}
            onChange={handleCustomAmountChange}
          />
        </div>

        {/* Footer */}
        <div className="sponsor-footer">
          <button className="next-button" onClick={handleNextClick}>ถัดไป</button>
        </div>
      </div>
    </div>
  );
};

export default SponsorAmountPage;