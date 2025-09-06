import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreditCardOutlined, DollarOutlined, SmileOutlined, SolutionOutlined } from '@ant-design/icons';
import { Steps } from 'antd';
import { useDog } from '../../../../hooks/useDog';
import { useSponsorship, useSponsorshipActions } from '../../../../hooks/sponsorship/useSponsorship';
import './style.css';

type PlanType = 'one-time' | 'subscription';
type Frequency = 'monthly' | 'quarterly' | 'yearly';

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
  const { id } = useParams();
  const dogId = id ? Number(id) : null;

  // โหลดข้อมูลน้องไว้แสดงชื่อ
  const { dog, loading, error } = useDog(dogId);

  // ---- Global sponsorship state ----
  const state = useSponsorship();
  const { setDog, setPlan, setFrequency, setAmount, validateForFormDraft } = useSponsorshipActions();

  // ---- Local UI states (เริ่มจาก global ถ้ามี) ----
  const [planType, setPlanType] = useState<PlanType>(state.planType ?? 'one-time');
  const [frequency, setFrequencyLocal] = useState<Frequency>(state.frequency ?? 'monthly');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(state.amount ?? null);
  const [customAmount, setCustomAmount] = useState<string>('');

  // sync dogId/dogName เข้า global ทันทีที่รู้
  useEffect(() => {
    if (dogId) setDog(dogId, dog?.name);
  }, [dogId, dog?.name, setDog]);

  // ทุกครั้งที่ local เปลี่ยน → sync เข้า global
  useEffect(() => { setPlan(planType); }, [planType, setPlan]);
  useEffect(() => { setFrequency(planType === 'subscription' ? frequency : null); }, [planType, frequency, setFrequency]);

  // ----- helpers -----
  const isSub = planType === 'subscription';
  const suffix = isSub ? periodSuffixMap[frequency] : '';

  const activeAmounts = useMemo(() => {
    if (!isSub) return oneTimeAmounts;
    const k = freqFactor[frequency];
    return baseMonthlySubAmounts.map(m => m * k);
  }, [isSub, frequency]);

  const minAmount = useMemo(() => {
    if (!isSub) return 500;
    return baseMinMonthly * freqFactor[frequency];
  }, [isSub, frequency]);

  const customPlaceholder = isSub
    ? `ขั้นต่ำ ฿${minAmount} ${suffix}`
    : `ขั้นต่ำ ฿${minAmount}`;

  const handlePlanClick = (type: PlanType) => {
    setPlanType(type);
    setSelectedAmount(null);
    setCustomAmount('');
  };

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const f = e.target.value as Frequency;
    setFrequencyLocal(f);
    setSelectedAmount(null);
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
    // 1) ใช้ค่าล่าสุดจาก UI โดยตรง
    const amountToSponsor = amountValue ?? null;

    // 2) ตรวจด้วยค่าท้องถิ่น (ไม่พึ่ง state กลาง)
    if (!dogId) { alert('ไม่พบรหัสสุนัข'); return; }
    if (!amountToSponsor || isNaN(amountToSponsor) || amountToSponsor < minAmount) {
      alert(`กรุณาเลือกหรือระบุจำนวนเงินให้ถูกต้อง (ขั้นต่ำ ${minAmount}฿)`);
      return;
    }

    // 3) ตรวจแบบ draft (ไม่ต้องรอ state อัปเดต)
    const err = validateForFormDraft({
      dogId,
      amount: amountToSponsor,
      planType,
      frequency: isSub ? frequency : null,
    });
    if (err) { alert(err); return; }

    // 4) เซ็ตเข้า context แล้วไปต่อได้เลย
    setAmount(amountToSponsor);
    navigate(`/sponsor/${dogId}/form`);
  };

  if (loading) return <div className="sponsor-container"><p>กำลังโหลดข้อมูลน้อง...</p></div>;
  if (error)   return <div className="sponsor-container"><p className="text-red-600">เกิดข้อผิดพลาด: {error}</p></div>;
  if (!dog)    return <div className="sponsor-container"><p>ไม่พบน้องหมา</p></div>;

  return (
    <div className="sponsor-container">
      <div className="sponsor-card">

        <div className="sponsor-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← ย้อนกลับ
          </button>
          <h1 className="sponsor-title">{`อุปถัมภ์น้อง ${dog.name}`}</h1>
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
