import React, { useState, useRef } from 'react';
import './style.css'; // ⬅️ เพิ่มบรรทัดนี้
import { useDogs } from "../../../hooks/useDogs";

interface Personality {
  id: string;
  name: string;
}
interface Dog {
  id: string;
  image: string;
  name: string;
  birthDate: string;
  breed: string;
  gender: 'male' | 'female';
  size: 'small' | 'medium' | 'large';
  personalities: string[];
}

const DogManagementSystem: React.FC = () => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Omit<Dog, 'id'>>({
    image: '', name: '', birthDate: '', breed: '', gender: 'male', size: 'medium', personalities: []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { dogs, loading, error } = useDogs();     // ✅ ใช้ข้อมูลจาก API ตรงๆ

  const filteredDogs = dogs.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePersonalityChange = (personalityId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      personalities: checked
        ? [...prev.personalities, personalityId]
        : prev.personalities.filter(id => id !== personalityId)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFormData(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({ image: '', name: '', birthDate: '', breed: '', gender: 'male', size: 'medium', personalities: [] });
    setEditingDog(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateDog = () => {
    if (!formData.name.trim()) { alert('กรุณากรอกชื่อสุนัข'); return; }
    const newDog: Dog = { ...formData, id: Date.now().toString() };
    setDogs(prev => [...prev, newDog]);
    setIsFormOpen(false);
    resetForm();
  };

  const handleUpdateDog = () => {
    if (!formData.name.trim() || !editingDog) return;
    setDogs(prev => prev.map(d => d.id === editingDog.id ? { ...formData, id: editingDog.id } : d));
    setIsFormOpen(false);
    resetForm();
  };

  const handleDeleteDog = (id: string) => {
    if (window.confirm('คุณต้องการลบข้อมูลสุนัขนี้ใช่หรือไม่?')) {
      setDogs(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleEditDog = (dog: Dog) => {
    setFormData({
      image: dog.image, name: dog.name, birthDate: dog.birthDate, breed: dog.breed,
      gender: dog.gender, size: dog.size, personalities: dog.personalities
    });
    setEditingDog(dog);
    setIsFormOpen(true);
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    const diffDays = Math.ceil(Math.abs(today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months > 0 ? `${months} เดือน` : `${diffDays} วัน`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return remainingMonths > 0 ? `${years} ปี ${remainingMonths} เดือน` : `${years} ปี`;
    }
  };

  return (
    <div className="dms-container">
      {/* Header */}
      <div className="dms-header">
        <h1 className="dms-title">จัดการข้อมูลสุนัข</h1>
        <div className="dms-header-actions">
          <input
            type="text"
            placeholder="ค้นหาสุนัข..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dms-search"
          />
          <button
            onClick={() => { resetForm(); setIsFormOpen(true); }}
            className="dms-btn dms-btn-primary"
          >
            + เพิ่มสุนัขใหม่
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dms-content">
        <div className="dms-grid">
        {loading && (
          <div className="dms-empty">
            <div className="dms-empty-icon">⏳</div>
            <p className="dms-empty-text">กำลังโหลดข้อมูล...</p>
            <p className="dms-empty-sub">ดึงข้อมูลจากฐานข้อมูล</p>
          </div>
        )}

        {!loading && error && (
  <div className="dms-empty" role="alert">
    <div className="dms-empty-icon">⚠️</div>
    <p className="dms-empty-text">{error}</p>
    <p className="dms-empty-sub">ลองรีเฟรชหน้าอีกครั้ง</p>
  </div>
)}
          ) : (
            filteredDogs.map(dog => (
              <div key={dog.id} className="dms-card">
                <div className="dms-card-imgwrap">
                  {dog.image ? (
                    <img src={dog.image} alt={dog.name} className="dms-card-img" />
                  ) : (
                    <div className="dms-noimg">
                      <span className="dms-noimg-icon">📷</span>
                      <span>ไม่มีรูปภาพ</span>
                    </div>
                  )}
                </div>

                <div className="dms-card-body">
                  <h3 className="dms-dog-name">{dog.name}</h3>

                  <div className="dms-details">
                    <div className="dms-detail">
                      <span className="dms-detail-label">สายพันธุ์:</span>
                      <span className="dms-detail-val">{dog.breed || 'ไม่ระบุ'}</span>
                    </div>
                    <div className="dms-detail">
                      <span className="dms-detail-label">เพศ:</span>
                      <span className="dms-detail-val">{dog.gender === 'male' ? '♂ ผู้' : '♀ เมีย'}</span>
                    </div>
                    <div className="dms-detail">
                      <span className="dms-detail-label">ขนาด:</span>
                      <span className="dms-detail-val">
                        {dog.size === 'small' ? '🐕 เล็ก' : dog.size === 'medium' ? '🐕‍🦺 กลาง' : '🐕‍🦮 ใหญ่'}
                      </span>
                    </div>
                    {dog.birthDate && (
                      <div className="dms-detail">
                        <span className="dms-detail-label">อายุ:</span>
                        <span className="dms-detail-val">{calculateAge(dog.birthDate)}</span>
                      </div>
                    )}

                    {dog.personalities.length > 0 && (
                      <div className="dms-personality">
                        <span className="dms-detail-label">บุคลิก:</span>
                        <div className="dms-tags">
                          {dog.personalities.map(pid => (
                            <span key={pid} className="dms-tag">
                              {personalities.find(p => p.id === pid)?.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="dms-card-actions">
                    <button onClick={() => handleEditDog(dog)} className="dms-btn dms-btn-edit">✏️ แก้ไข</button>
                    <button onClick={() => handleDeleteDog(dog.id)} className="dms-btn dms-btn-danger">🗑️ ลบ</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <div className="dms-modal">
            <div className="dms-modal-content">
              <div className="dms-modal-header">
                <h2 className="dms-modal-title">{editingDog ? 'แก้ไขข้อมูลสุนัข' : 'เพิ่มสุนัขใหม่'}</h2>
                <button
                  onClick={() => { setIsFormOpen(false); resetForm(); }}
                  className="dms-btn dms-btn-close"
                >
                  ✕
                </button>
              </div>

              <div className="dms-form">
                <div className="dms-form-grid">
                  {/* Image Upload */}
                  <div className="dms-upload-col">
                    <label className="dms-label">รูปภาพ</label>
                    <div className="dms-upload">
                      {formData.image ? (
                        <div className="dms-preview">
                          <img src={formData.image} alt="Preview" className="dms-preview-img" />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                            className="dms-btn dms-btn-imgremove"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="dms-upload-placeholder">
                          <span className="dms-upload-icon">📷</span>
                          <span>คลิกเพื่อเพิ่มรูปภาพ</span>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="dms-file"
                      />
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="dms-fields">
                    <div className="dms-row">
                      <div className="dms-group">
                        <label className="dms-label">ชื่อ *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="ชื่อสุนัข"
                          className="dms-input"
                        />
                      </div>

                      <div className="dms-group">
                        <label className="dms-label">วันเกิด</label>
                        <input
                          type="date"
                          name="birthDate"
                          value={formData.birthDate}
                          onChange={handleInputChange}
                          className="dms-input"
                        />
                      </div>
                    </div>

                    <div className="dms-row">
                      <div className="dms-group">
                        <label className="dms-label">สายพันธุ์</label>
                        <select name="breed" value={formData.breed} onChange={handleInputChange} className="dms-select">
                          {breeds.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>

                      <div className="dms-group">
                        <label className="dms-label">เพศ</label>
                        <select name="gender" value={formData.gender} onChange={handleInputChange} className="dms-select">
                          <option value="male">♂ ผู้</option>
                          <option value="female">♀ เมีย</option>
                        </select>
                      </div>

                      <div className="dms-group">
                        <label className="dms-label">ขนาด</label>
                        <select name="size" value={formData.size} onChange={handleInputChange} className="dms-select">
                          <option value="small">เล็ก</option>
                          <option value="medium">กลาง</option>
                          <option value="large">ใหญ่</option>
                        </select>
                      </div>
                    </div>

                    <div className="dms-personalities">
                      <label className="dms-label">ลักษณะนิสัย</label>
                      <div className="dms-checkgrid">
                        {personalities.map(p => (
                          <label key={p.id} className="dms-checklabel">
                            <input
                              type="checkbox"
                              checked={formData.personalities.includes(p.id)}
                              onChange={(e) => handlePersonalityChange(p.id, e.target.checked)}
                              className="dms-checkbox"
                            />
                            <span className="dms-checktext">{p.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="dms-form-actions">
                  <button
                    type="button"
                    onClick={() => { setIsFormOpen(false); resetForm(); }}
                    className="dms-btn dms-btn-gray"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={editingDog ? handleUpdateDog : handleCreateDog}
                    className="dms-btn dms-btn-primary"
                  >
                    {editingDog ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มสุนัข'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DogManagementSystem;
