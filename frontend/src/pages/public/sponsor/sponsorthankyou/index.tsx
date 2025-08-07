import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
          <button className="done-button" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default SponsorThankYouPage;