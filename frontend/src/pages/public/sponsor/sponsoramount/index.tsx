import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './style.css'; // Import CSS สำหรับหน้านี้

interface Dog {
  name: string;
  // คุณสามารถเพิ่ม properties อื่นๆ ของ Dog ได้ที่นี่
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
    setCustomAmount(''); // ล้างค่าในช่อง Custom Amount เมื่อเลือกปุ่ม
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(null); // ล้างค่าที่เลือกไว้เมื่อพิมพ์ในช่อง Custom Amount
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

    // ส่งข้อมูลไปยังหน้าถัดไป
    navigate('../form', { state: { dogName: dog?.name, amount: amountToSponsor } });
  };

  return (
    <div className="sponsor-container">
      <div className="sponsor-card">
        {/* Header */}
        <div className="sponsor-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back to Dogs
          </button>
          <h1 className="sponsor-title">Sponsor {dog?.name || 'a Dog'}</h1>
          <p className="sponsor-subtitle">Help us provide the best care for {dog?.name || 'the dog'} with your generous sponsorship</p>
        </div>

        {/* Progress Bar */}
        <div className="sponsor-progress">
          <div className="progress-bar">
            <div className="progress-step active">1</div>
            <div className="progress-line"></div>
            <div className="progress-step">2</div>
            <div className="progress-line"></div>
            <div className="progress-step">3</div>
          </div>
        </div>

        {/* Content */}
        <div className="sponsor-content">
          <h3 className="section-title">Select Donation Amount</h3>
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

          <h3 className="section-title custom-amount-title">Custom Amount (THB)</h3>
          <input
            type="number"
            className="custom-amount-input"
            placeholder="Enter amount"
            value={customAmount}
            onChange={handleCustomAmountChange}
          />
        </div>

        {/* Footer */}
        <div className="sponsor-footer">
          <button className="next-button" onClick={handleNextClick}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default SponsorAmountPage;