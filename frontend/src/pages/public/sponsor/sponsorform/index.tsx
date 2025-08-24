import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCardOutlined, DollarOutlined, SmileOutlined, SolutionOutlined } from '@ant-design/icons';
import { Steps } from 'antd';
import './style.css'; // ใช้ CSS แยกไฟล์สำหรับหน้านี้

const SponsorFormPage: React.FC = () => {
  const navigate = useNavigate();

  const handleNextClick = () => {
    // Logic สำหรับการไปหน้าถัดไป (Step 3)
    navigate('../payment');
  };

  const handlePreviousClick = () => {
    // Logic สำหรับการกลับไปหน้าเดิม (Step 1)
    navigate(-1);
  };

  return (
    <div className="sponsor-container">
      <div className="sponsor-card">
        <div className="sponsor-header">
          <button className="back-button" onClick={() => navigate('/sponsor')}>
            ← กลับไปหน้าอุปถัมภ์
          </button>
          <h1 className="sponsor-title-form">Sponsor</h1>
          <p className="sponsor-subtitle-form">ช่วยให้เราดูแลสุนัขได้ดีที่สุด ด้วยการอุปถัมภ์อย่างมีน้ำใจของคุณ</p>
        </div>
        <div className="sponsor-body-warpper">
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
                  status: 'process',
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

          <div className="sponsor-form-content">
            <h3 className="section-title">Sponsor Information</h3>
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

            <div className="checkbox-group">
              <input type="checkbox" id="updates" className="form-checkbox" />
              <label htmlFor="updates" className="checkbox-label">คุณต้องการรับข่าวสารเกี่ยวกับสุนัขที่คุณอุปถัมภ์หรือไม่?</label>
            </div>
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