import React from 'react';
import './style.css';
import NavigationBar from '../../../../components/NavigationBar';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const VolunteerPage: React.FC = () => {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    gender: '',
    phoneNumber: '',
    emergencyContact: '',
    birthDate: null as Date | null,
    dayForWork: '',
    experience: '',
    motivation: '',
    profileImage: null as File | null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      profileImage: file
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission logic here
  };

  return (
    <>
      <NavigationBar />
      <div className="volunteer-page-container">
        <form className="volunteer-form" onSubmit={handleSubmit}>
          <h1 className="volunteer-title">ลงทะเบียนอาสาสมัคร</h1>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">
                ชื่อ <span className="required">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">
                นามสกุล <span className="required">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>


          <div className="form-row">
            
            <div className="form-group">
              <label htmlFor="gender">
                เพศ <span className="required">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="">เลือกเพศ</option>
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="birthDate">
                วันเกิด/ประจำตัว <span className="required">*</span>
              </label>
              <DatePicker
                id="birthDate"
                selected={formData.birthDate}
                onChange={(date) => setFormData({...formData, birthDate: date})}
                dateFormat="dd/MM/yyyy"
                placeholderText="เลือกวันที่"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                maxDate={new Date()}
                required
                className="date-picker-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phoneNumber">
                เบอร์โทรศัพท์ <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="emergencyContact">
                ช่องทางติดต่อฉุกเฉิน
              </label>
              <input
                type="text"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dayForwork">
                วันที่สะดวก <span className="required">*</span>
              </label>
              <select
                id="dayForWork"
                name="dayForWork"
                value={formData.dayForWork}
                onChange={handleInputChange}
                required
              >
                <option value="">เลือกวัน</option>
                <option value="sunday">วันอาทิตย์</option>
                <option value="monday">วันจันทร์</option>
                <option value="tuesday">วันอังคาร</option>
                <option value="wednesday">วันพุธ</option>
                <option value="thursday">วันพฤหัสบดี</option>
                <option value="friday">วันศุกร์</option>
                <option value="saturday">วันเสาร์</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="experience">
                ช่วงเวลา <span className="required">*</span>
              </label>
              <select
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                required
              >
                <option value="">เลือกช่วงเวลา</option>
                <option value="morning">เช้า (6:00-12:00)</option>
                <option value="afternoon">บ่าย (12:00-18:00)</option>
                <option value="evening">เย็น (18:00-20:00)</option>
                <option value="flexible">ยืดหยุ่นได้</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="motivation">
              ความถนัด <span className="required">*</span>
            </label>
            <textarea
              id="motivation"
              name="motivation"
              value={formData.motivation}
              onChange={handleInputChange}
              rows={4}
              placeholder="บอกเล่าเกี่ยวกับความถนัดของคุณในการเป็นอาสาสมัคร"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="motivation">
              แรงจูงใจในการเป็นอาสาสมัคร <span className="required">*</span>
            </label>
            <textarea
              id="motivationReason"
              name="motivationReason"
              rows={4}
              placeholder="เล่าเกี่ยวกับแรงจูงใจของคุณเพื่อการตัดสินใจ"
              required
            />
          </div>

          <div className="form-group profile-section">
            <div className="profile-image-container">
              <div className="profile-image-placeholder">
                {formData.profileImage ? (
                  <img 
                    src={URL.createObjectURL(formData.profileImage)} 
                    alt="Profile" 
                    className="profile-preview"
                  />
                ) : (
                  <div className="default-avatar">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="20" r="20" fill="#9CA3AF"/>
                      <circle cx="20" cy="16" r="6" fill="white"/>
                      <path d="M8 32c0-6.627 5.373-12 12-12s12 5.373 12 12" fill="white"/>
                    </svg>
                  </div>
                )}
              </div>
              <label htmlFor="profileImage" className="profile-label">
                อัปโหลดรูป <span className="required">*</span>
              </label>
            </div>
            
            <input
              type="file"
              id="profileImage"
              name="profileImage"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              required
            />
            
            <button 
              type="button" 
              className="upload-btn"
              onClick={() => document.getElementById('profileImage')?.click()}
            >
              อัปโหลดรูปจากอุปกรณ์
            </button>
          </div>

          <button type="submit" className="submit-btn">
            ยืนยันการลงทะเบียน
          </button>
        </form>
      </div>
    </>
  );
};

export default VolunteerPage;