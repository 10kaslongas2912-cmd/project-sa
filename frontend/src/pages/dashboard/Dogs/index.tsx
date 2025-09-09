import React, { useState, useRef } from 'react';

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
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>จัดการข้อมูลสุนัข</h1>
        <div style={styles.headerActions}>
          <input
            type="text"
            placeholder="ค้นหาสุนัข..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            style={styles.addButton}
          >
            + เพิ่มสุนัขใหม่
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Dog List */}
        <div style={styles.dogGrid}>
          {filteredDogs.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🐕</div>
              <p style={styles.emptyText}>ยังไม่มีข้อมูลสุนัข</p>
              <p style={styles.emptySubtext}>เริ่มต้นด้วยการเพิ่มสุนัขตัวแรกของคุณ</p>
            </div>
          ) : (
            filteredDogs.map(dog => (
              <div key={dog.id} style={styles.dogCard}>
                <div style={styles.dogImageContainer}>
                  {dog.image ? (
                    <img src={dog.image} alt={dog.name} style={styles.dogImage} />
                  ) : (
                    <div style={styles.noImage}>
                      <span style={styles.noImageIcon}>📷</span>
                      <span>ไม่มีรูปภาพ</span>
                    </div>
                  )}
                </div>
                
                <div style={styles.dogInfo}>
                  <h3 style={styles.dogName}>{dog.name}</h3>
                  
                  <div style={styles.dogDetails}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>สายพันธุ์:</span>
                      <span style={styles.detailValue}>{dog.breed || 'ไม่ระบุ'}</span>
                    </div>
                    
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>เพศ:</span>
                      <span style={styles.detailValue}>
                        {dog.gender === 'male' ? '♂ ผู้' : '♀ เมีย'}
                      </span>
                    </div>
                    
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>ขนาด:</span>
                      <span style={styles.detailValue}>
                        {dog.size === 'small' ? '🐕 เล็ก' : 
                         dog.size === 'medium' ? '🐕‍🦺 กลาง' : '🐕‍🦮 ใหญ่'}
                      </span>
                    </div>
                    
                    {dog.birthDate && (
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>อายุ:</span>
                        <span style={styles.detailValue}>{calculateAge(dog.birthDate)}</span>
                      </div>
                    )}
                    
                    {dog.personalities.length > 0 && (
                      <div style={styles.personalitySection}>
                        <span style={styles.detailLabel}>บุคลิก:</span>
                        <div style={styles.personalityTags}>
                          {dog.personalities.map(personalityId => {
                            const personality = personalities.find(p => p.id === personalityId);
                            return personality ? (
                              <span key={personalityId} style={styles.personalityTag}>
                                {personality.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div style={styles.cardActions}>
                    <button
                      onClick={() => handleEditDog(dog)}
                      style={styles.editButton}
                    >
                      ✏️ แก้ไข
                    </button>
                    <button
                      onClick={() => handleDeleteDog(dog.id)}
                      style={styles.deleteButton}
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
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  {editingDog ? 'แก้ไขข้อมูลสุนัข' : 'เพิ่มสุนัขใหม่'}
                </h2>
                <button
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                  style={styles.closeButton}
                >
                  ✕
                </button>
              </div>

              <div style={styles.formContainer}>
                <div style={styles.formGrid}>
                  {/* Image Upload Section */}
                  <div style={styles.imageUploadSection}>
                    <label style={styles.label}>รูปภาพ</label>
                    <div style={styles.imageUploadContainer}>
                      {formData.image ? (
                        <div style={styles.imagePreviewContainer}>
                          <img src={formData.image} alt="Preview" style={styles.previewImage} />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({...prev, image: ''}))}
                            style={styles.removeImageButton}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div style={styles.uploadPlaceholder}>
                          <span style={styles.uploadIcon}>📷</span>
                          <span>คลิกเพื่อเพิ่มรูปภาพ</span>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={styles.hiddenFileInput}
                      />
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div style={styles.formFields}>
                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>ชื่อ *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="ชื่อสุนัข"
                          style={styles.input}
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>วันเกิด</label>
                        <input
                          type="date"
                          name="birthDate"
                          value={formData.birthDate}
                          onChange={handleInputChange}
                          style={styles.input}
                        />
                      </div>
                    </div>

                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>สายพันธุ์</label>
                        <select
                          name="breed"
                          value={formData.breed}
                          onChange={handleInputChange}
                          style={styles.select}
                        >
                          {breeds.map(breed => (
                            <option key={breed} value={breed}>{breed}</option>
                          ))}
                        </select>
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>เพศ</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          style={styles.select}
                        >
                          <option value="male">♂ ผู้</option>
                          <option value="female">♀ เมีย</option>
                        </select>
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>ขนาด</label>
                        <select
                          name="size"
                          value={formData.size}
                          onChange={handleInputChange}
                          style={styles.select}
                        >
                          <option value="small">เล็ก</option>
                          <option value="medium">กลาง</option>
                          <option value="large">ใหญ่</option>
                        </select>
                      </div>
                    </div>

                    {/* Personalities Section */}
                    <div style={styles.personalitiesSection}>
                      <label style={styles.label}>ลักษณะนิสัย</label>
                      <div style={styles.checkboxGrid}>
                        {personalities.map(personality => (
                          <label key={personality.id} style={styles.checkboxLabel}>
                            <input
                              type="checkbox"
                              checked={formData.personalities.includes(personality.id)}
                              onChange={(e) => handlePersonalityChange(personality.id, e.target.checked)}
                              style={styles.checkbox}
                            />
                            <span style={styles.checkboxText}>{personality.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={styles.formActions}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      resetForm();
                    }}
                    style={styles.cancelButton}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={editingDog ? handleUpdateDog : handleCreateDog}
                    style={styles.submitButton}
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

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    padding: '2rem',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#1e293b'
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap' as const,
    gap: '1rem'
  },
  
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  
  headerActions: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap' as const
  },
  
  searchInput: {
    padding: '0.75rem 1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    minWidth: '250px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
    ':focus': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    }
  },
  
  addButton: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
    ':hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)'
    }
  },
  
  content: {
    position: 'relative' as const
  },
  
  dogGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '2rem',
    width: '100%'
  },
  
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    backgroundColor: 'white',
    borderRadius: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  
  emptyText: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#64748b',
    margin: '0 0 0.5rem 0'
  },
  
  emptySubtext: {
    fontSize: '1rem',
    color: '#94a3b8',
    margin: 0
  },
  
  dogCard: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
    }
  },
  
  dogImageContainer: {
    height: '220px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative' as const
  },
  
  dogImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  },
  
  noImage: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.5rem',
    color: '#94a3b8',
    fontSize: '0.875rem'
  },
  
  noImageIcon: {
    fontSize: '2rem',
    opacity: 0.5
  },
  
  dogInfo: {
    padding: '1.5rem'
  },
  
  dogName: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 1rem 0'
  },
  
  dogDetails: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    marginBottom: '1.5rem'
  },
  
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  
  detailLabel: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#64748b',
    minWidth: '60px'
  },
  
  detailValue: {
    fontSize: '0.875rem',
    color: '#334155',
    fontWeight: '500'
  },
  
  personalitySection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  },
  
  personalityTags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem'
  },
  
  personalityTag: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#e0e7ff',
    color: '#3730a3',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '500'
  },
  
  cardActions: {
    display: 'flex',
    gap: '0.75rem'
  },
  
  editButton: {
    flex: 1,
    padding: '0.625rem 1rem',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'transform 0.1s'
  },
  
  deleteButton: {
    flex: 1,
    padding: '0.625rem 1rem',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'transform 0.1s'
  },
  
  modal: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  },
  
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
  },
  
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    borderBottom: '1px solid #e2e8f0'
  },
  
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#0f172a',
    margin: 0
  },
  
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#64748b',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    transition: 'color 0.2s, background-color 0.2s',
    ':hover': {
      color: '#ef4444',
      backgroundColor: '#fef2f2'
    }
  },
  
  formContainer: {
    padding: '2rem'
  },
  
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '2rem',
    marginBottom: '2rem'
  },
  
  imageUploadSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem'
  },
  
  imageUploadContainer: {
    position: 'relative' as const,
    cursor: 'pointer'
  },
  
  imagePreviewContainer: {
    position: 'relative' as const,
    width: '100%',
    height: '300px',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    border: '2px solid #e2e8f0'
  },
  
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  },
  
  removeImageButton: {
    position: 'absolute' as const,
    top: '0.5rem',
    right: '0.5rem',
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  uploadPlaceholder: {
    width: '100%',
    height: '300px',
    border: '2px dashed #cbd5e1',
    borderRadius: '0.75rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    color: '#64748b',
    fontSize: '0.875rem',
    transition: 'border-color 0.2s',
    ':hover': {
      borderColor: '#3b82f6'
    }
  },
  
  uploadIcon: {
    fontSize: '2rem',
    opacity: 0.5
  },
  
  hiddenFileInput: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer'
  },
  
  formFields: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem'
  },
  
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  },
  
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  },
  
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151'
  },
  
  input: {
    padding: '0.75rem 1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    transition: 'border-color 0.2s',
    outline: 'none',
    ':focus': {
      borderColor: '#3b82f6'
    }
  },
  
  select: {
    padding: '0.75rem 1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    outline: 'none',
    ':focus': {
      borderColor: '#3b82f6'
    }
  },
  
  personalitiesSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem'
  },
  
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.75rem'
  },
  
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '0.375rem',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f8fafc'
    }
  },
  
  checkbox: {
    width: '1.125rem',
    height: '1.125rem',
    cursor: 'pointer',
    accentColor: '#3b82f6'
  },
  
  checkboxText: {
    color: '#374151',
    fontWeight: '500'
  },
  
  formActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    paddingTop: '1.5rem',
    borderTop: '1px solid #e2e8f0'
  },
  
  cancelButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  
  submitButton: {
    padding: '0.75rem 2rem',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.1s, box-shadow 0.2s',
    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
    ':hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)'
    }
  }
};

export default DogManagementSystem;