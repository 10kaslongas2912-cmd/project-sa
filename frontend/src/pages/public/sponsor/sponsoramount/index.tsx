import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCardOutlined, DollarOutlined, SmileOutlined, SolutionOutlined } from '@ant-design/icons';
import { Steps } from 'antd';
import './style.css';

type PlanType = 'one-time' | 'subscription';
type Frequency = 'monthly' | 'quarterly' | 'yearly';

interface Dog { name?: string }

// One-time แนะนำเดิม
const oneTimeAmounts = [500, 800, 1000, 2000];

// Subscription: “ฐานต่อเดือน” แล้วคูณตามความถี่
const baseMonthlySubAmounts = [300, 500, 800, 1000];
const baseMinMonthly = 300;

const periodSuffixMap: Record<Frequency, string> = {
  monthly: '/ เดือน',
  quarterly: '/ ไตรมาส',
  yearly: '/ ปี',
};

const freqFactor: Record<Frequency, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

const SponsorAmountPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dog = (location.state as Dog) || {};

  const [planType, setPlanType] = useState<PlanType>('one-time');
  const [frequency, setFrequency] = useState<Frequency>('monthly');

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');

  const isSub = planType === 'subscription';
  const suffix = isSub ? periodSuffixMap[frequency] : '';

  // คำนวณรายการจำนวนเงินแนะนำตามความถี่
  const activeAmounts = useMemo(() => {
    if (!isSub) return oneTimeAmounts;
    const k = freqFactor[frequency];
    return baseMonthlySubAmounts.map((m) => m * k);
  }, [isSub, frequency]);

  // ขั้นต่ำตามแผน/ความถี่
  const minAmount = useMemo(() => {
    if (!isSub) return 500;
    return baseMinMonthly * freqFactor[frequency];
  }, [isSub, frequency]);

  const customPlaceholder = isSub
    ? `ขั้นต่ำ ${minAmount}฿ ${suffix}`
    : `ขั้นต่ำ ${minAmount}฿`;

  const handlePlanClick = (type: PlanType) => {
    setPlanType(type);
    setSelectedAmount(null);
    setCustomAmount('');
  };

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFrequency(e.target.value as Frequency);
    setSelectedAmount(null); // เคลียร์เพื่อไม่ให้เลือกค่าที่ไม่ตรงความถี่
  };

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(null);
  };

  // ค่าจริงที่ผู้ใช้เลือก/กรอก
  const amountValue = useMemo(() => {
    if (selectedAmount != null) return selectedAmount;
    const n = parseInt(customAmount || '', 10);
    return isNaN(n) ? null : n;
  }, [selectedAmount, customAmount]);

  const handleNextClick = () => {
    const amountToSponsor = amountValue ?? null;
    if (!amountToSponsor || isNaN(amountToSponsor) || amountToSponsor < minAmount) {
      alert(`กรุณาเลือกหรือระบุจำนวนเงินให้ถูกต้อง (ขั้นต่ำ ${minAmount}฿)`);
      return;
    }

    navigate('../form', {
      state: {
        dogName: dog?.name,
        amount: amountToSponsor,                // จำนวนเงินตาม “ความถี่ที่เลือก”
        planType,                               // 'one-time' | 'subscription'
        frequency: isSub ? frequency : null,    // ส่งความถี่ไป backend
      },
    });
  };

  return (
    <div className="sponsor-container">
      <div className="sponsor-card">

        <div className="sponsor-header">
          <button className="back-button" onClick={() => navigate('/sponsor')}>
            ← กลับไปหน้าอุปถัมภ์
          </button>
          <h1 className="sponsor-title">อุปถัมภ์น้องหมา</h1>
          <p className="sponsor-subtitle">
            ช่วยให้เราดูแลสุนัขได้ดีที่สุด ด้วยการอุปถัมภ์อย่างมีน้ำใจของคุณ
          </p>
        </div>

        <div className="sponsor-progress">
          <Steps
            items={[
              { title: 'Select Amount', status: 'process', icon: <DollarOutlined /> },
              { title: 'Verification', status: 'wait', icon: <SolutionOutlined /> },
              { title: 'Pay', status: 'wait', icon: <CreditCardOutlined /> },
              { title: 'Done', status: 'wait', icon: <SmileOutlined /> },
            ]}
          />
        </div>

        <div className="sponsor-content">
          <h3 className="section-title">รูปแบบการอุปถัมภ์</h3>

          <div className="plan-row">
            <div className="plan-toggle" role="tablist" aria-label="เลือกแผนการอุปถัมภ์">
              <button
                type="button"
                className={`plan-chip ${!isSub ? 'active' : ''}`}
                onClick={() => handlePlanClick('one-time')}
                aria-pressed={!isSub}
              >
                One-time
              </button>
              <button
                type="button"
                className={`plan-chip ${isSub ? 'active' : ''}`}
                onClick={() => handlePlanClick('subscription')}
                aria-pressed={isSub}
              >
                Subscription
              </button>
            </div>

            {/* ความถี่ (สไลด์จากขวา) */}
            <div className={`freq-panel ${isSub ? 'open' : ''}`} aria-hidden={!isSub}>
              <label htmlFor="frequency" className="freq-label">ความถี่</label>
              <select
                id="frequency"
                className="freq-select"
                value={frequency}
                onChange={handleFrequencyChange}
              >
                <option value="monthly">รายเดือน</option>
                <option value="quarterly">รายไตรมาส (ทุก 3 เดือน)</option>
                <option value="yearly">รายปี</option>
              </select>
            </div>
          </div>

          <h3 className="section-title">เลือกจำนวนเงิน</h3>
          <div className="donation-options">
            {activeAmounts.map((amount) => (
              <button
                key={`${planType}-${frequency}-${amount}`}
                className={`donation-button ${selectedAmount === amount ? 'selected' : ''}`}
                onClick={() => handleAmountClick(amount)}
              >
                ฿{amount}{isSub ? ` ${suffix}` : ''}
              </button>
            ))}
          </div>

          <h3 className="section-title custom-amount-title">ระบุจำนวนเงิน (บาท)</h3>
          <input
            type="number"
            className="custom-amount-input"
            placeholder={customPlaceholder}
            value={customAmount}
            onChange={handleCustomAmountChange}
            min={minAmount}
          />
          {isSub && <p className="amount-hint">* ยอดนี้จะถูกเรียกเก็บ {suffix}</p>}
        </div>

        <div className="sponsor-footer">
          <button className="next-button" onClick={handleNextClick}>ถัดไป</button>
        </div>
      </div>
    </div>
  );
};

export default SponsorAmountPage;
