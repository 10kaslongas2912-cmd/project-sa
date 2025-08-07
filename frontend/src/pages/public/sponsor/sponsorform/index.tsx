import React from 'react';
import { useNavigate } from 'react-router-dom';
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
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back to Dogs
          </button>
          <h1 className="sponsor-title-form">Sponsor Luna</h1>
          <p className="sponsor-subtitle-form">Help us provide the best care for Luna with your generous sponsorship</p>
        </div>

        <div className="sponsor-progress">
          <div className="progress-bar">
            <div className="progress-step done">1</div>
            <div className="progress-line done-line"></div>
            <div className="progress-step active">2</div>
            <div className="progress-line"></div>
            <div className="progress-step">3</div>
          </div>
        </div>

        <div className="sponsor-form-content">
          <h3 className="section-title">Sponsor Information</h3>
          
          <div className="form-group">
            <label htmlFor="title" className="form-label">Title</label>
            <select id="title" className="form-input">
              <option value="">Select title</option>
              <option value="mr">Mr.</option>
              <option value="ms">Ms.</option>
              <option value="mrs">Mrs.</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="firstName" className="form-label">First Name</label>
            <input id="firstName" type="text" className="form-input" placeholder="Enter first name" />
          </div>

          <div className="form-group">
            <label htmlFor="lastName" className="form-label">Last Name</label>
            <input id="lastName" type="text" className="form-input" placeholder="Enter last name" />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input id="email" type="email" className="form-input" placeholder="Enter email address" />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone Number</label>
            <input id="phone" type="tel" className="form-input" placeholder="Enter phone number" />
          </div>

          <div className="checkbox-group">
            <input type="checkbox" id="updates" className="form-checkbox" />
            <label htmlFor="updates" className="checkbox-label">Would you like to receive updates about the dog you sponsor?</label>
          </div>

        </div>

        <div className="sponsor-form-footer">
          <button className="previous-button" onClick={handlePreviousClick}>Previous</button>
          <button className="next-button" onClick={handleNextClick}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default SponsorFormPage;