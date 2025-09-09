import React, { useState, useRef } from 'react';
import './style.css';

// Types
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
  // Mock data for personalities
  const personalities: Personality[] = [
    { id: '1', name: 'เป็นมิตร' },
    { id: '2', name: 'ขี้เล่น' },
    { id: '3', name: 'อ่อนโยน' },
    { id: '4', name: 'กระตือรือร้น' },
    { id: '5', name: 'ปกป้อง' },
    { id: '6', name: 'ฉลาด' },
    { id: '7', name: 'สุขุม' },
    { id: '8', name: 'อดทน' },
    { id: '9', name: 'ซื่อสัตย์' },
    { id: '10', name: 'เอาแต่ใจ' }
  ];

  const breeds = [
    'ไม่ระบุ',
    'โกลเด้น รีทรีฟเวอร์',
    'ลาบราดอร์',
    'เยอรมันเชพเพิร์ด',
    'บีเกิล',
    'บูลด็อก',
    'พูเดิล',
    'ชิบะ อินุ',
    'ชิห์สุ',
    'หมาไทยบางแก้ว',
    'หมาไทยหลังอาน',
    'ปอมเมอเรเนียน',
    'ไซบีเรียน ฮัสกี้',
    'อื่นๆ'
  ];

  // State management
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Omit<Dog, 'id'>>({
    image: '',
    name: '',
    birthDate: '',
    breed: '',
    gender: 'male',
    size: 'medium',
    personalities: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter dogs based on search term
  const filteredDogs = dogs.filter(dog =>
    dog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dog.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle personality checkbox changes
  const handlePersonalityChange = (personalityId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      personalities: checked
        ? [...prev.personalities, personalityId]
        : prev.personalities.filter(id => id !== personalityId)
    }));
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      image: '',
      name: '',
      birthDate: '',
      breed: '',
      gender: 'male',
      size: 'medium',
      personalities: []
    });
    setEditingDog(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Create new dog
  const handleCreateDog = () => {
    if (!formData.name.trim()) {
      alert('กรุณากรอกชื่อสุนัข');
      return;
    }
    
    const newDog: Dog = {
      ...formData,
      id: Date.now().toString()
    };
    setDogs(prev => [...prev, newDog]);
    setIsFormOpen(false);
    resetForm();
  };

  // Update dog
  const handleUpdateDog = () => {
    if (!formData.name.trim()) {
      alert('กรุณากรอกชื่อสุนัข');
      return;
    }
    
    if (!editingDog) return;
    
    setDogs(prev => prev.map(dog => 
      dog.id === editingDog.id ? { ...formData, id: editingDog.id } : dog
    ));
    setIsFormOpen(false);
    resetForm();
  };

  // Delete dog
  const handleDeleteDog = (id: string) => {
    if (window.confirm('คุณต้องการลบข้อมูลสุนัขนี้ใช่หรือไม่?')) {
      setDogs(prev => prev.filter(dog => dog.id !== id));
    }
  };

  // Edit dog
  const handleEditDog = (dog: Dog) => {
    setFormData({
      image: dog.image,
      name: dog.name,
      birthDate: dog.birthDate,
      breed: dog.breed,
      gender: dog.gender,
      size: dog.size,
      personalities: dog.personalities
    });
    setEditingDog(dog);
    setIsFormOpen(true);
  };

  // Get personality names by IDs
  const getPersonalityNames = (personalityIds: string[]) => {
    return personalityIds
      .map(id => personalities.find(p => p.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  // Calculate age from birth date
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    
    const today = new Date();
    const birth = new Date(birthDate);
    const diffTime = Math.abs(today.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
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
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1 className="title">จัดการข้อมูลสุนัข</h1>
        <div className="header-actions">
          <input
            type="text"
            placeholder="ค้นหาสุนัข..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="add-button"
          >
            + เพิ่มสุนัขใหม่
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="content">
        {/* Dog List */}
        <div className="dog-grid">
          {filteredDogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🐕</div>
              <p className="empty-text">ยังไม่มีข้อมูลสุนัข</p>
              <p className="empty-subtext">เริ่มต้นด้วยการเพิ่มสุนัขตัวแรกของคุณ</p>
            </div>
          ) : (
            filteredDogs.map(dog => (
              <div key={dog.id} className="dog-card">
                <div className="dog-image-container">
                  {dog.image ? (
                    <img src={dog.image} alt={dog.name} className="dog-image" />
                  ) : (
                    <div className="no-image">
                      <span className="no-image-icon">📷</span>
                      <span>ไม่มีรูปภาพ</span>
                    </div>
                  )}
                </div>
                
                <div className="dog-info">
                  <h3 className="dog-name">{dog.name}</h3>
                  
                  <div className="dog-details">
                    <div className="detail-item">
                      <span className="detail-label">สายพันธุ์:</span>
                      <span className="detail-value">{dog.breed || 'ไม่ระบุ'}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">เพศ:</span>
                      <span className="detail-value">
                        {dog.gender === 'male' ? '♂ ผู้' : '♀ เมีย'}
                      </span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">ขนาด:</span>
                      <span className="detail-value">
                        {dog.size === 'small' ? '🐕 เล็ก' : 
                         dog.size === 'medium' ? '🐕‍🦺 กลาง' : '🐕‍🦮 ใหญ่'}
                      </span>
                    </div>
                    
                    {dog.birthDate && (
                      <div className="detail-item">
                        <span className="detail-label">อายุ:</span>
                        <span className="detail-value">{calculateAge(dog.birthDate)}</span>
                      </div>
                    )}
                    
                    {dog.personalities.length > 0 && (
                      <div className="personality-section">
                        <span className="detail-label">บุคลิก:</span>
                        <div className="personality-tags">
                          {dog.personalities.map(personalityId => {
                            const personality = personalities.find(p => p.id === personalityId);
                            return personality ? (
                              <span key={personalityId} className="personality-tag">
                                {personality.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="card-actions">
                    <button
                      onClick={() => handleEditDog(dog)}
                      className="edit-button"
                    >
                      ✏️ แก้ไข
                    </button>
                    <button
                      onClick={() => handleDeleteDog(dog.id)}
                      className="delete-button"
                    >
                      🗑️ ลบ
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">
                  {editingDog ? 'แก้ไขข้อมูลสุนัข' : 'เพิ่มสุนัขใหม่'}
                </h2>
                <button
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                  className="close-button"
                >
                  ✕
                </button>
              </div>

              <div className="form-container">
                <div className="form-grid">
                  {/* Image Upload Section */}
                  <div className="image-upload-section">
                    <label className="label">รูปภาพ</label>
                    <div className="image-upload-container">
                      {formData.image ? (
                        <div className="image-preview-container">
                          <img src={formData.image} alt="Preview" className="preview-image" />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({...prev, image: ''}))}
                            className="remove-image-button"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <span className="upload-icon">📷</span>
                          <span>คลิกเพื่อเพิ่มรูปภาพ</span>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden-file-input"
                      />
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="form-fields">
                    <div className="form-row">
                      <div className="form-group">
                        <label className="label">ชื่อ *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="ชื่อสุนัข"
                          className="input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="label">วันเกิด</label>
                        <input
                          type="date"
                          name="birthDate"
                          value={formData.birthDate}
                          onChange={handleInputChange}
                          className="input"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="label">สายพันธุ์</label>
                        <select
                          name="breed"
                          value={formData.breed}
                          onChange={handleInputChange}
                          className="select"
                        >
                          {breeds.map(breed => (
                            <option key={breed} value={breed}>{breed}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="label">เพศ</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="select"
                        >
                          <option value="male">♂ ผู้</option>
                          <option value="female">♀ เมีย</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="label">ขนาด</label>
                        <select
                          name="size"
                          value={formData.size}
                          onChange={handleInputChange}
                          className="select"
                        >
                          <option value="small">เล็ก</option>
                          <option value="medium">กลาง</option>
                          <option value="large">ใหญ่</option>
                        </select>
                      </div>
                    </div>

                    {/* Personalities Section */}
                    <div className="personalities-section">
                      <label className="label">ลักษณะนิสัย</label>
                      <div className="checkbox-grid">
                        {personalities.map(personality => (
                          <label key={personality.id} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={formData.personalities.includes(personality.id)}
                              onChange={(e) => handlePersonalityChange(personality.id, e.target.checked)}
                              className="checkbox"
                            />
                            <span className="checkbox-text">{personality.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      resetForm();
                    }}
                    className="cancel-button"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={editingDog ? handleUpdateDog : handleCreateDog}
                    className="submit-button"
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