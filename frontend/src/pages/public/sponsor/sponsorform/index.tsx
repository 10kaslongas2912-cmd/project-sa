import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCardOutlined, DollarOutlined, SmileOutlined, SolutionOutlined } from '@ant-design/icons';
import { Steps } from 'antd';
import './style.css';

const SponsorFormPage: React.FC = () => {
  const navigate = useNavigate();

  // --- NEW: states สำหรับ UX ข่าวสาร ---
  const [wantsUpdates, setWantsUpdates] = useState<'no' | 'yes'>('no');
  const [updateChannel, setUpdateChannel] = useState<'email' | 'sms' | 'line' | 'whatsapp'>('email');
  const [updateFrequency, setUpdateFrequency] = useState<'weekly' | 'biweekly' | 'monthly' | 'quarterly'>('monthly');

  const handleNextClick = () => {
    // คุณอาจส่งข้อมูลไป global/store ก่อน navigate ก็ได้
    // ตัวอย่าง payload:
    // const payload = {
    //   wantsUpdates,
    //   updateChannel: wantsUpdates === 'yes' ? updateChannel : null,
    //   updateFrequency: wantsUpdates === 'yes' ? updateFrequency : null,
    // };
    navigate('../payment');
  };

  const handlePreviousClick = () => navigate(-1);

  return (
    <div className="sponsor-container">
      <div className="sponsor-card">
        <div className="sponsor-header">
          <button className="back-button" onClick={() => navigate('/sponsor')}>← กลับไปหน้าอุปถัมภ์</button>
          <h1 className="sponsor-title-form">Sponsor</h1>
          <p className="sponsor-subtitle-form">ช่วยให้เราดูแลสุนัขได้ดีที่สุด ด้วยการอุปถัมภ์อย่างมีน้ำใจของคุณ</p>
        </div>

        <div className="sponsor-body-warpper">
          <div className="sponsor-progress">
            <Steps
              items={[
                { title: 'Select Amount', status: 'finish', icon: <DollarOutlined /> },
                { title: 'Verification', status: 'process', icon: <SolutionOutlined /> },
                { title: 'Pay', status: 'wait', icon: <CreditCardOutlined /> },
                { title: 'Done', status: 'wait', icon: <SmileOutlined /> },
              ]}
            />
          </div>

          <div className="sponsor-form-content">
            <h3 className="section-title">Sponsor Information</h3>

            {/* ฟิลด์เดิมๆ */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">นาย/นาง/นางสาว</label>
              <select id="title" className="form-input">
                <option value=""> </option>
                <option value="mr">นาย</option>
                <option value="ms">นาง</option>
                <option value="mrs">นางสาว</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="firstName" className="form-label">ชื่อ</label>
              <input id="firstName" type="text" className="form-input" placeholder="Enter first name" />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">นามสกุล</label>
              <input id="lastName" type="text" className="form-input" placeholder="Enter last name" />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">อีเมล</label>
              <input id="email" type="email" className="form-input" placeholder="Enter email address" />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">หมายเลขโทรศัพท์</label>
              <input id="phone" type="tel" className="form-input" placeholder="Enter phone number" />
            </div>

            {/* --- NEW: กล่อง “การรับข่าวสาร” แบบมีเมนูเด้งลง --- */}
            <div className="form-group updates-card">
              <div className="updates-card__header">
                <div>
                  <div className="updates-title">การรับข่าวสาร</div>
                  <div className="updates-subtitle">อัปเดตความคืบหน้าสุนัขที่คุณอุปถัมภ์แบบที่คุณสะดวก</div>
                </div>
              </div>

              {/* เลือก ต้องการ/ไม่ต้องการ */}
              <div className="updates-row">
                <label htmlFor="wantsUpdates" className="form-label">ต้องการรับข่าวสารหรือไม่?</label>
                <select
                  id="wantsUpdates"
                  className="form-input"
                  value={wantsUpdates}
                  onChange={(e) => setWantsUpdates(e.target.value as 'no' | 'yes')}
                >
                  <option value="no">ไม่ต้องการ</option>
                  <option value="yes">ต้องการ</option>
                </select>
              </div>

              {/* เมนูเด้งลง เฉพาะเมื่อเลือก “ต้องการ” */}
              {wantsUpdates === 'yes' && (
                <div className="updates-collapse">
                  <div className="updates-row">
                    <label htmlFor="updateChannel" className="form-label">ช่องทางที่ต้องการ</label>
                    <select
                      id="updateChannel"
                      className="form-input"
                      value={updateChannel}
                      onChange={(e) => setUpdateChannel(e.target.value as any)}
                    >
                      <option value="email">อีเมล</option>
                      <option value="sms">SMS</option>
                      <option value="line">LINE</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>

                  <div className="updates-row">
                    <label htmlFor="updateFrequency" className="form-label">ความถี่</label>
                    <select
                      id="updateFrequency"
                      className="form-input"
                      value={updateFrequency}
                      onChange={(e) => setUpdateFrequency(e.target.value as any)}
                    >
                      <option value="weekly">รายสัปดาห์</option>
                      <option value="biweekly">ทุก 2 สัปดาห์</option>
                      <option value="monthly">รายเดือน</option>
                      <option value="quarterly">รายไตรมาส</option>
                    </select>
                  </div>

                  <p className="updates-hint">
                    * คุณสามารถเปลี่ยนการตั้งค่าภายหลังได้ทุกเมื่อ
                  </p>
                </div>
              )}
            </div>
            {/* --- END NEW --- */}

          </div>
        </div>

        <div className="sponsor-form-footer">
          <button className="previous-button" onClick={handlePreviousClick}>ย้อนกลับ</button>
          <button className="next-button" onClick={handleNextClick}>ถัดไป</button>
        </div>
      </div>
    </div>
  );
};

export default SponsorFormPage;
