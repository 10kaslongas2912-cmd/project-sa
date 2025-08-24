import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Steps } from 'antd';
import { CreditCardOutlined, DollarOutlined, SmileOutlined, SolutionOutlined } from '@ant-design/icons';
import './style.css';
import Confetti from '../../../../components/Confetti/Confetti';

const SponsorThankYouPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // สมมติว่าส่งข้อมูลชื่อน้องหมามาจากหน้าก่อนหน้า
  const dog = location.state as { name?: string };

  return (
    <div className="thankyou-container">
      {/* Confetti Animation Component */}
      <Confetti />

      <div className="thankyou-card">
        <div className="thankyou-header">
          <h1 className="thankyou-title">Sponsor {dog?.name || 'a Dog'}</h1>
          <p className="thankyou-subtitle">Help us provide the best care for {dog?.name || 'the dog'} with your generous sponsorship</p>
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
                  status: 'finish',
                  icon: <CreditCardOutlined />,
              },
              {
                  title: 'Done',
                  status: 'finish',
                  icon: <SmileOutlined />,
              },
              ]}
          />
        </div>
        <div className="thankyou-content">
          <div className="thankyou-icon">
            {/* สามารถใช้รูปภาพหรือ SVG แทน Icon ได้ */}
            🎉
          </div>
          <h2 className="thankyou-message">Thank you!</h2>
          <p className="thankyou-description">
            Your sponsorship for {dog?.name || 'the dog'} is complete.
            <br />
            You will receive a confirmation email shortly.
          </p>
        </div>

        <div className="thankyou-footer">
          <Link to="/">
            <button className="done-button">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SponsorThankYouPage;