// src/pages/public/sponsor/SponsorThankyou/index.tsx
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Steps } from 'antd';
import { CreditCardOutlined, DollarOutlined, SmileOutlined, SolutionOutlined } from '@ant-design/icons';
import Confetti from '../../../../components/Confetti/Confetti';

// ✅ ใช้ actions hook (มี reset)
import { useSponsorshipActions } from '../../../../hooks/sponsorship/useSponsorship';
// ✅ ล้างฟอร์มที่ persist ไว้ด้วย
import { useSponsorForm } from '../../../../hooks/sponsorship/useSponsorForm';

import './style.css';

const SponsorThankYouPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const dogId = id ? Number(id) : null;

  // สมมติส่งชื่อน้องหม้ามาจากหน้าก่อนหน้า
  const dog = location.state as { name?: string } | undefined;

  const { reset: resetSponsorship } = useSponsorshipActions();
  const { reset: resetForm } = useSponsorForm(dogId);

  useEffect(() => {
    resetSponsorship();
    resetForm();
  }, [resetSponsorship, resetForm]);

  return (
    <div className="thankyou-container">
      <Confetti />

      <div className="thankyou-card">
        <div className="thankyou-header">
          <h1 className="thankyou-title">Sponsor {dog?.name || 'a Dog'}</h1>
          <p className="thankyou-subtitle">
            Help us provide the best care for {dog?.name || 'the dog'} with your generous sponsorship
          </p>
        </div>

        <div className="sponsor-progress">
          <Steps
            items={[
              { title: 'Select Amount', status: 'finish',  icon: <DollarOutlined /> },
              { title: 'Verification',  status: 'finish',  icon: <SolutionOutlined /> },
              { title: 'Pay',           status: 'finish',  icon: <CreditCardOutlined /> },
              { title: 'Done',          status: 'finish',  icon: <SmileOutlined /> },
            ]}
          />
        </div>

        <div className="thankyou-content">
          <div className="thankyou-icon">🎉</div>
          <h2 className="thankyou-message">Thank you!</h2>
          <p className="thankyou-description">
            Your sponsorship for {dog?.name || 'the dog'} is complete.
            <br />
            You will receive a confirmation email shortly.
          </p>
        </div>

        <div className="thankyou-footer">
          <Link to="/">
            <button className="done-button">Back to Home</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SponsorThankYouPage;
