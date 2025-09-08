import React from 'react';
import './style.css';
import NavigationBar from '../../../../components/NavigationBar';
import { volunteerAPI } from '../../../../services/apis';
import { useAuthUser } from '../../../../hooks/useAuth';

const VolunteerPage: React.FC = () => {
  const { user: authUser, loading: authLoading, isLoggedIn } = useAuthUser();

  const [formData, setFormData] = React.useState({
    user: { id: 0, firstName: '', lastName: '' }, // internal camelCase is fine
    gender: '',
    phoneNumber: '',
    emergencyContact: '',
    dayForWork: '',
    experience: '',
    motivation: '',
    motivationReason: '',
    profileImage: null as File | null
  });

  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error,   setError]   = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // ---------- utils ----------
  const normalizeGender = (
    raw?: any,
    id?: any
  ): '' | 'male' | 'female' | 'other' => {
    const s = String(raw ?? '').trim().toLowerCase();
    if (['male', 'm', 'ชาย'].includes(s)) return 'male';
    if (['female', 'f', 'หญิง'].includes(s)) return 'female';
    if (s) return 'other';
    const n = Number(id);
    if (n === 1) return 'male';
    if (n === 2) return 'female';
    if (Number.isFinite(n) && n > 0) return 'other';
    return '';
  };

  // ---------- pull auth user into form (id / names / phone / dob / gender) ----------
  React.useEffect(() => {
    if (!authUser) return;

    const id    = Number((authUser as any).ID ?? (authUser as any).id ?? 0);
    const first = (authUser as any).first_name ?? (authUser as any).firstname ?? '';
    const last  = (authUser as any).last_name  ?? (authUser as any).lastname  ?? '';
    const genderName = (authUser as any).gender?.name ?? (authUser as any).gender; // supports object or string
    const genderId   = (authUser as any).gender_id;

    setFormData(prev => ({
      ...prev,
      user: { id: Number.isFinite(id) ? id : 0, firstName: first, lastName: last },
      phoneNumber: prev.phoneNumber || (authUser as any).phone || '',
      gender:      prev.gender || normalizeGender(genderName, genderId),
    }));
  }, [authUser]);

  // ---------- handlers ----------
  type FlatField =
    | 'gender'
    | 'phoneNumber'
    | 'emergencyContact'
    | 'experience'
    | 'motivation'
    | 'motivationReason';

  const handleFlatChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as FlatField]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, profileImage: file }));
  };

  // preview URL (cleanup)
  React.useEffect(() => {
    if (!formData.profileImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(formData.profileImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [formData.profileImage]);

  // ---------- submit ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!isLoggedIn || !formData.user.id) {
        setError('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบ');
        setLoading(false);
        return;
      }
      if (!formData.profileImage) {
        setError('โปรดอัปโหลดรูป');
        setLoading(false);
        return;
      }

      const fd = new FormData();
      // match Go `Volunteer` fields
      fd.append('user_id', String(formData.user.id));
      fd.append('skills', formData.motivation);             // ความถนัด
      fd.append('role', 'none');                            // ปรับถ้ามี role ให้เลือก
      fd.append('notes', formData.motivationReason);        // แรงจูงใจ
      fd.append('address', '');
      fd.append('phone_number', formData.phoneNumber);
      fd.append('another_contact', formData.emergencyContact);
      fd.append('health_detail', '');
      fd.append('working_time', formData.experience);        // morning/afternoon/evening/flexible
      fd.append('skill', '');
      fd.append('note', '');
      fd.append('photo', formData.profileImage);             // backend should read this key

      await volunteerAPI.create(fd); // volunteerAPI must accept FormData

      setSuccess('ลงทะเบียนสำเร็จ!');
      setFormData({
        user: { id: 0, firstName: '', lastName: '' },
        gender: '',
        phoneNumber: '',
        emergencyContact: '',
        dayForWork: '',
        experience: '',
        motivation: '',
        motivationReason: '',
        profileImage: null,
      });
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavigationBar />
      <div className="volunteer-page-container">
        <form className="volunteer-form" onSubmit={handleSubmit}>
          <h1 className="volunteer-title">ลงทะเบียนอาสาสมัคร</h1>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>ชื่อ</label>
              <input type="text" value={formData.user.firstName} readOnly disabled />
            </div>
            <div className="form-group">
              <label>นามสกุล</label>
              <input type="text" value={formData.user.lastName} readOnly disabled />
            </div>
          </div>

          <div className="form-row form-row-3">
            <div className="form-group">
              <label htmlFor="gender">เพศ <span className="required">*</span></label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleFlatChange} required>
                <option value="">เลือกเพศ</option>
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">เบอร์โทรศัพท์ <span className="required">*</span></label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleFlatChange}
                pattern="^0\\d{9}$"
                inputMode="numeric"
                maxLength={10}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="emergencyContact">ช่องทางติดต่อฉุกเฉิน</label>
              <input
                type="text"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleFlatChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dayForWork">วันที่สะดวก <span className="required">*</span></label>
              <select id="dayForWork" name="dayForWork" value={formData.dayForWork} onChange={handleFlatChange} required>
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
              <label htmlFor="experience">ช่วงเวลา <span className="required">*</span></label>
              <select id="experience" name="experience" value={formData.experience} onChange={handleFlatChange} required>
                <option value="">เลือกช่วงเวลา</option>
                <option value="morning">เช้า (6:00-12:00)</option>
                <option value="afternoon">บ่าย (12:00-18:00)</option>
                <option value="evening">เย็น (18:00-20:00)</option>
                <option value="flexible">ยืดหยุ่นได้</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="motivation">ความถนัด <span className="required">*</span></label>
            <textarea
              id="motivation"
              name="motivation"
              value={formData.motivation}
              onChange={handleFlatChange}
              rows={4}
              placeholder="บอกเล่าเกี่ยวกับความถนัดของคุณในการเป็นอาสาสมัคร"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="motivationReason">แรงจูงใจในการเป็นอาสาสมัคร <span className="required">*</span></label>
            <textarea
              id="motivationReason"
              name="motivationReason"
              value={formData.motivationReason}
              onChange={handleFlatChange}
              rows={4}
              placeholder="เล่าเกี่ยวกับแรงจูงใจของคุณเพื่อการตัดสินใจ"
              required
            />
          </div>

          <div className="form-group profile-section">
            <div className="profile-image-container">
              <div className="profile-image-placeholder">
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile" className="profile-preview" />
                ) : (authUser as any)?.photo_url ? (
                  <img src={(authUser as any).photo_url} alt="Profile" className="profile-preview" />
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
              disabled={loading}
            >
              อัปโหลดรูปจากอุปกรณ์
            </button>
          </div>

          <button type="submit" className="submit-btn" disabled={loading || authLoading}>
            {loading ? "กำลังส่ง..." : "ยืนยันการลงทะเบียน"}
          </button>
        </form>
      </div>
    </>
  );
};

export default VolunteerPage;
