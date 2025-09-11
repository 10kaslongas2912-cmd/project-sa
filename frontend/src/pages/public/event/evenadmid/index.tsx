import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Users,
  Clock,
  Stethoscope,
  Activity,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react';

// Import types (adjust import path as needed)
import type { 
  EventInterface, 
  CreateEventRequest, 
  UpdateEventRequest,
  EventFormData,
  VisitBasicInfo,
  MedicalRecordBasicInfo,
  ImageUploadResponse
} from '../../../../interfaces/Event';

// Import API (adjust import path as needed)
import { api } from '../../../../services/apis';

// Inline Styles
const styles = {
  eventManagement: {
    maxWidth: '1200px',
    margin: '40px auto',
    padding: '20px',
    fontFamily: 'Anakotmai, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    color: '#333',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    borderBottom: '2px solid #e1e5e9',
    padding: '25px 30px',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 24px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Anakotmai, sans-serif'
  },
  relatedDataOverview: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '25px',
    marginBottom: '35px',
    padding: '0 5px'
  },
  dataCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    padding: '25px',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    borderRadius: '16px',
    border: '1px solid #dee2e6',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(3px)'
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e1e5e9'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#6c757d',
    cursor: 'pointer',
    padding: '4px',
    lineHeight: 1,
    transition: 'color 0.2s ease'
  },
  eventForm: {
    padding: '24px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  formInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box',
    fontFamily: 'Anakotmai, sans-serif'
  },
  formInputDisabled: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box',
    backgroundColor: '#f5f5f5',
    color: '#999',
    cursor: 'not-allowed',
    fontFamily: 'Anakotmai, sans-serif'
  },
  formTextarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '80px',
    fontFamily: 'Anakotmai, sans-serif'
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #e1e5e9'
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    background: '#6c757d',
    color: 'white',
    transition: 'all 0.3s ease',
    fontFamily: 'Anakotmai, sans-serif'
  },
  // Image Upload Styles
  imageUploadContainer: {
    border: '2px dashed #dee2e6',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    transition: 'border-color 0.2s ease',
    marginTop: '10px'
  },
  imagePreview: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '15px'
  },
  previewImage: {
    maxWidth: '200px',
    maxHeight: '150px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  removeImageBtn: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  imageUploadPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    color: '#6c757d',
    marginBottom: '15px'
  },
  imageUploadActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  hiddenFileInput: {
    display: 'none'
  },
  uploadHint: {
    color: '#6c757d',
    fontSize: '12px',
    textAlign: 'center',
    margin: '5px 0 0 0',
    fontFamily: 'Anakotmai, sans-serif'
  },
  eventsList: {
    display: 'grid',
    gap: '20px'
  },
  eventCard: {
    background: 'white',
    border: '1px solid #e1e5e9',
    borderRadius: '12px',
    padding: '24px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  eventHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },
  eventActions: {
    display: 'flex',
    gap: '8px'
  },
  btnIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: '6px',
    background: '#f8f9fa',
    color: '#6c757d',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  deleteBtnIcon: {
    background: '#f8f9fa',
    color: '#6c757d',
  },
  eventDescription: {
    color: '#6c757d',
    margin: '0 0 16px 0',
    lineHeight: 1.5,
    fontFamily: 'Anakotmai, sans-serif'
  },
  eventDetails: {
    display: 'grid',
    gap: '8px',
    marginBottom: '16px'
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#495057',
    fontSize: '14px',
    fontFamily: 'Anakotmai, sans-serif'
  },
  relatedData: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '16px',
    margin: '16px 0',
    border: '1px solid #e9ecef'
  },
  relatedItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    fontSize: '14px',
    fontFamily: 'Anakotmai, sans-serif'
  },
  eventMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e9ecef',
    fontSize: '12px',
    color: '#6c757d',
    fontFamily: 'Anakotmai, sans-serif'
  },
  // Event Card Image
  eventImage: {
    marginBottom: '15px',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  eventCardImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    transition: 'transform 0.2s ease'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    color: '#6c757d',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    borderRadius: '16px',
    border: '2px dashed #dee2e6',
    margin: '20px 0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    fontFamily: 'Anakotmai, sans-serif'
  },
  eventLoading: {
    textAlign: 'center',
    padding: '60px',
    color: '#6c757d',
    fontSize: '18px',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    borderRadius: '16px',
    margin: '20px 0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    fontFamily: 'Anakotmai, sans-serif'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    color: '#374151',
    fontWeight: 500,
    fontSize: '14px',
    fontFamily: 'Anakotmai, sans-serif'
  },
  title: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '1.5rem',
    fontWeight: 600,
    fontFamily: 'Anakotmai, sans-serif'
  },
  cardTitle: {
    margin: '0 0 5px 0',
    color: '#2c3e50',
    fontSize: '1.1rem',
    fontWeight: 600,
    fontFamily: 'Anakotmai, sans-serif'
  },
  cardSubtitle: {
    margin: 0,
    color: '#6c757d',
    fontSize: '0.9rem',
    fontFamily: 'Anakotmai, sans-serif'
  },
  eventTitle: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '1.25rem',
    fontWeight: 600,
    fontFamily: 'Anakotmai, sans-serif'
  },
  relatedTitle: {
    margin: '0 0 12px 0',
    color: '#2c3e50',
    fontSize: '1rem',
    fontWeight: 600,
    fontFamily: 'Anakotmai, sans-serif'
  },
  emptyTitle: {
    margin: '0 0 10px 0',
    color: '#495057',
    fontSize: '1.4rem',
    fontWeight: 600,
    fontFamily: 'Anakotmai, sans-serif'
  },
  emptyText: {
    margin: 0,
    fontSize: '16px',
    opacity: 0.8,
    fontFamily: 'Anakotmai, sans-serif'
  },
  smallText: {
    color: '#dc3545',
    fontSize: '12px',
    marginTop: '4px',
    display: 'block',
    fontFamily: 'Anakotmai, sans-serif'
  },
  placeholderText: {
    margin: 0,
    fontSize: '14px',
    fontFamily: 'Anakotmai, sans-serif'
  }
};

const EventManagement: React.FC = () => {
  const [events, setEvents] = useState<EventInterface[]>([]);
  const [visits, setVisits] = useState<VisitBasicInfo[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecordBasicInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventInterface | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    organizer: '',
    contactInfo: '',
    capacity: '',
    imageFile: null,
    imageUrl: '',
    visitId: '',
    medicalRecordId: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchEventsWithRelatedData();
  }, []);

  const fetchEventsWithRelatedData = async () => {
    try {
      setLoading(true);
      const response = await api.eventAPI.getWithRelatedData();
      setEvents(response.events || []);
      setVisits(response.visits || []);
      setMedicalRecords(response.medical_records || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      alert('ไม่สามารถโหลดข้อมูลกิจกรรมได้');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle mutual exclusivity between visitId and medicalRecordId
    if (name === 'visitId' && value) {
      // Clear medical record when visit is selected
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        medicalRecordId: '' // Clear the other selection
      }));
      
      // Auto-update times based on selected visit
      const selectedVisit = visits.find(visit => visit.ID.toString() === value);
      if (selectedVisit) {
        const startDate = new Date(selectedVisit.start_at);
        const endDate = new Date(selectedVisit.end_at);
        
        setFormData(prev => ({
          ...prev,
          visitId: value,
          medicalRecordId: '',
          startDate: startDate.toISOString().split('T')[0],
          startTime: startDate.toTimeString().slice(0, 5),
          endDate: endDate.toISOString().split('T')[0],
          endTime: endDate.toTimeString().slice(0, 5)
        }));
      }
    } else if (name === 'medicalRecordId' && value) {
      // Clear visit when medical record is selected
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        visitId: '' // Clear the other selection
      }));
      
      // Auto-update times based on selected medical record
      const selectedRecord = medicalRecords.find(record => record.ID.toString() === value);
      if (selectedRecord) {
        const recordDate = new Date(selectedRecord.date_record);
        
        setFormData(prev => ({
          ...prev,
          medicalRecordId: value,
          visitId: '',
          startDate: recordDate.toISOString().split('T')[0],
          startTime: recordDate.toTimeString().slice(0, 5),
          endDate: recordDate.toISOString().split('T')[0],
          endTime: (recordDate.getHours() + 1).toString().padStart(2, '0') + ':' + recordDate.getMinutes().toString().padStart(2, '0')
        }));
      }
    } else {
      // Normal input handling
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      location: '',
      organizer: '',
      contactInfo: '',
      capacity: '',
      imageFile: null,
      imageUrl: '',
      visitId: '',
      medicalRecordId: ''
    });
    setEditingEvent(null);
    setShowForm(false);
    setImagePreview('');
  };

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('ขนาดไฟล์ใหญ่เกินไป กรุณาเลือกรูปภาพที่มีขนาดไม่เกิน 10MB');
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('ประเภทไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์ JPEG, PNG, GIF หรือ WebP');
        return;
      }

      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to server
  const uploadImage = async (): Promise<string> => {
    if (!formData.imageFile) return '';

    try {
      setUploadingImage(true);
      const response: ImageUploadResponse = await api.eventAPI.uploadImage(formData.imageFile);
      return response.image_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('ไม่สามารถอัปโหลดรูปภาพได้');
      return '';
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove image
  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageFile: null, imageUrl: '' }));
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Upload image first if there's one
      let imageUrl = formData.imageUrl;
      if (formData.imageFile) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          alert('ไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองใหม่อีกครั้ง');
          return;
        }
      }

      // Combine date and time
      const startDateTime = `${formData.startDate}T${formData.startTime}:00`;
      const endDateTime = `${formData.endDate}T${formData.endTime}:00`;
      
      const eventData: CreateEventRequest | UpdateEventRequest = {
        name: formData.name,
        description: formData.description || undefined,
        start_at: startDateTime,
        end_at: endDateTime,
        location: formData.location || undefined,
        organizer: formData.organizer || undefined,
        contact_info: formData.contactInfo || undefined,
        capacity: formData.capacity ? Number(formData.capacity) : undefined,
        image_url: imageUrl || undefined,
        visit_id: formData.visitId ? Number(formData.visitId) : undefined,
        medical_record_id: formData.medicalRecordId ? Number(formData.medicalRecordId) : undefined,
      };
      
      if (editingEvent) {
        await api.eventAPI.update(editingEvent.ID, eventData);
        alert('อัปเดตกิจกรรมเรียบร้อยแล้ว!');
      } else {
        await api.eventAPI.create(eventData as CreateEventRequest);
        alert('สร้างกิจกรรมเรียบร้อยแล้ว!');
      }
      
      resetForm();
      fetchEventsWithRelatedData();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('ไม่สามารถบันทึกกิจกรรมได้');
    }
  };

  const handleEdit = (event: EventInterface) => {
    setEditingEvent(event);
    
    // Parse datetime
    const startDate = new Date(event.start_at);
    const endDate = new Date(event.end_at);
    
    setFormData({
      name: event.name,
      description: event.description || '',
      startDate: startDate.toISOString().split('T')[0],
      startTime: startDate.toTimeString().slice(0, 5),
      endDate: endDate.toISOString().split('T')[0],
      endTime: endDate.toTimeString().slice(0, 5),
      location: event.location || '',
      organizer: event.organizer || '',
      contactInfo: event.contact_info || '',
      capacity: event.capacity?.toString() || '',
      imageFile: null,
      imageUrl: event.image_url || '',
      visitId: event.visit_id?.toString() || '',
      medicalRecordId: event.medical_record_id?.toString() || ''
    });

    // Set image preview if exists
    if (event.image_url) {
      setImagePreview(event.image_url);
    }
    
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่ต้องการลบกิจกรรมนี้?')) {
      return;
    }
    try {
      await api.eventAPI.remove(id);
      alert('ลบกิจกรรมเรียบร้อยแล้ว!');
      fetchEventsWithRelatedData();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('ไม่สามารถลบกิจกรรมได้');
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div style={styles.eventLoading}>กำลังโหลดกิจกรรม...</div>;
  }
  
  return (
    <div style={styles.eventManagement}>
      <div style={styles.header}>
        <h1 style={styles.title}>จัดการกิจกรรม</h1>
        <button 
          style={styles.btnPrimary}
          onClick={() => setShowForm(true)}
        >
          <Plus size={20} />
          สร้างกิจกรรม
        </button>
      </div>

      {/* Related Data Overview */}
      <div style={styles.relatedDataOverview}>
        <div style={styles.dataCard}>
          <Activity size={24} />
          <div className="data-info">
            <h3 style={styles.cardTitle}>การนัดหมายทั้งหมด</h3>
            <p style={styles.cardSubtitle}>{visits.length} การนัดหมายที่มีอยู่</p>
          </div>
        </div>
        <div style={styles.dataCard}>
          <Stethoscope size={24} />
          <div className="data-info">
            <h3 style={styles.cardTitle}>บันทึกการรักษา</h3>
            <p style={styles.cardSubtitle}>{medicalRecords.length} บันทึกที่มีอยู่</p>
          </div>
        </div>
      </div>

      {/* Event Form Modal */}
      {showForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.title}>{editingEvent ? 'แก้ไขกิจกรรม' : 'สร้างกิจกรรมใหม่'}</h2>
              <button style={styles.closeBtn} onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} style={styles.eventForm}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="name">ชื่อกิจกรรม *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={styles.formInput}
                  placeholder="กรอกชื่อกิจกรรม"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="description">รายละเอียด</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  style={styles.formTextarea}
                  placeholder="กรอกรายละเอียดกิจกรรม"
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="startDate">วันที่เริ่มต้น *</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="startTime">เวลาเริ่มต้น *</label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="endDate">วันที่สิ้นสุด *</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="endTime">เวลาสิ้นสุด *</label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="location">สถานที่</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    style={styles.formInput}
                    placeholder="สถานที่จัดกิจกรรม"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="organizer">ผู้จัดกิจกรรม</label>
                  <input
                    type="text"
                    id="organizer"
                    name="organizer"
                    value={formData.organizer}
                    onChange={handleInputChange}
                    style={styles.formInput}
                    placeholder="ชื่อผู้จัดกิจกรรม"
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="contactInfo">ข้อมูลติดต่อ</label>
                  <input
                    type="text"
                    id="contactInfo"
                    name="contactInfo"
                    value={formData.contactInfo}
                    onChange={handleInputChange}
                    style={styles.formInput}
                    placeholder="เบอร์โทร, อีเมล หรือข้อมูลติดต่อ"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="capacity">จำนวนที่รับ</label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="0"
                    style={styles.formInput}
                    placeholder="จำนวนผู้เข้าร่วมสูงสุด"
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="visitId">การนัดหมาย (ถ้ามี)</label>
                  <select
                    id="visitId"
                    name="visitId"
                    value={formData.visitId}
                    onChange={handleInputChange}
                    style={formData.medicalRecordId ? styles.formInputDisabled : styles.formInput}
                    disabled={!!formData.medicalRecordId}
                  >
                    <option value="">เลือกการนัดหมาย</option>
                    {visits.map(visit => (
                      <option key={visit.ID} value={visit.ID}>
                        {visit.visit_name} ({formatDateTime(visit.start_at)})
                      </option>
                    ))}
                  </select>
                  {formData.medicalRecordId && (
                    <small style={styles.smallText}>
                      ปิดการใช้งานเพราะได้เลือกบันทึกการรักษาแล้ว
                    </small>
                  )}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="medicalRecordId">บันทึกการรักษา (ถ้ามี)</label>
                  <select
                    id="medicalRecordId"
                    name="medicalRecordId"
                    value={formData.medicalRecordId}
                    onChange={handleInputChange}
                    style={formData.visitId ? styles.formInputDisabled : styles.formInput}
                    disabled={!!formData.visitId}
                  >
                    <option value="">เลือกบันทึกการรักษา</option>
                    {medicalRecords.map(record => (
                      <option key={record.ID} value={record.ID}>
                        {record.dog?.name || 'ไม่ทราบชื่อ'} - {record.diagnosis} ({formatDateTime(record.date_record)})
                      </option>
                    ))}
                  </select>
                  {formData.visitId && (
                    <small style={styles.smallText}>
                      ปิดการใช้งานเพราะได้เลือกการนัดหมายแล้ว
                    </small>
                  )}
                </div>
              </div>

              {/* Image Upload Section */}
              <div style={styles.formGroup}>
                <label style={styles.label}>รูปภาพกิจกรรม (ถ้ามี)</label>
                <div style={styles.imageUploadContainer}>
                  {imagePreview ? (
                    <div style={styles.imagePreview}>
                      <img src={imagePreview} alt="ตัวอย่างรูปกิจกรรม" style={styles.previewImage} />
                      <button
                        type="button"
                        style={styles.removeImageBtn}
                        onClick={removeImage}
                        title="ลบรูปภาพ"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div style={styles.imageUploadPlaceholder}>
                      <ImageIcon size={48} style={{ color: '#dee2e6' }} />
                      <p style={styles.placeholderText}>ยังไม่ได้เลือกรูปภาพ</p>
                    </div>
                  )}
                  
                  <div style={styles.imageUploadActions}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={styles.hiddenFileInput}
                    />
                    <button
                      type="button"
                      style={styles.btnSecondary}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      <Upload size={16} />
                      {uploadingImage ? 'กำลังอัปโหลด...' : 'เลือกรูปภาพ'}
                    </button>
                    <small style={styles.uploadHint}>
                      ขนาดไฟล์สูงสุด: 10MB รองรับ: JPEG, PNG, GIF, WebP
                    </small>
                  </div>
                </div>
              </div>

              <div style={styles.formActions}>
                <button type="button" style={styles.btnSecondary} onClick={resetForm}>
                  ยกเลิก
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  {editingEvent ? 'อัปเดตกิจกรรม' : 'สร้างกิจกรรม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events List */}
      <div style={styles.eventsList}>
        {events.length === 0 ? (
          <div style={styles.emptyState}>
            <Calendar size={64} />
            <h3 style={styles.emptyTitle}>ไม่พบกิจกรรม</h3>
            <p style={styles.emptyText}>สร้างกิจกรรมแรกของคุณเพื่อเริ่มต้น</p>
          </div>
        ) : (
          events.map(event => (
            <div key={event.ID} style={styles.eventCard}>
              {/* Event Image */}
              {event.image_url && (
                <div style={styles.eventImage}>
                  <img 
                    src={event.image_url} 
                    alt={event.name} 
                    style={styles.eventCardImage}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                </div>
              )}

              <div style={styles.eventHeader}>
                <h3 style={styles.eventTitle}>{event.name}</h3>
                <div style={styles.eventActions}>
                  <button 
                    style={styles.btnIcon}
                    onClick={() => handleEdit(event)}
                    title="แก้ไขกิจกรรม"
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#e9ecef';
                      e.currentTarget.style.color = '#495057';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                      e.currentTarget.style.color = '#6c757d';
                    }}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    style={{...styles.btnIcon, ...styles.deleteBtnIcon}}
                    onClick={() => handleDelete(event.ID)}
                    title="ลบกิจกรรม"
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc3545';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                      e.currentTarget.style.color = '#6c757d';
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {event.description && (
                <p style={styles.eventDescription}>{event.description}</p>
              )}

              <div style={styles.eventDetails}>
                <div style={styles.detailItem}>
                  <Clock size={16} />
                  <span>
                    {formatDateTime(event.start_at)} - {formatDateTime(event.end_at)}
                  </span>
                </div>
                {event.location && (
                  <div style={styles.detailItem}>
                    <MapPin size={16} />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.organizer && (
                  <div style={styles.detailItem}>
                    <User size={16} />
                    <span>{event.organizer}</span>
                  </div>
                )}
                {event.contact_info && (
                  <div style={styles.detailItem}>
                    <Phone size={16} />
                    <span>{event.contact_info}</span>
                  </div>
                )}
                {event.capacity && (
                  <div style={styles.detailItem}>
                    <Users size={16} />
                    <span>จำนวนที่รับ: {event.capacity} คน</span>
                  </div>
                )}
              </div>

              {/* Related Data Display */}
              {(event.visit || event.medical_record) && (
                <div style={styles.relatedData}>
                  <h4 style={styles.relatedTitle}>ข้อมูลที่เกี่ยวข้อง:</h4>
                  
                  {event.visit && (
                    <div style={{...styles.relatedItem, color: '#495057'}}>
                      <Activity size={16} style={{ color: '#28a745' }} />
                      <span>
                        การนัดหมาย: {event.visit.visit_name} 
                        ({formatDateTime(event.visit.start_at)} - {formatDateTime(event.visit.end_at)})
                      </span>
                    </div>
                  )}

                  {event.medical_record && (
                    <div style={{...styles.relatedItem, marginBottom: '0', color: '#495057'}}>
                      <Stethoscope size={16} style={{ color: '#dc3545' }} />
                      <span>
                        บันทึกการรักษา: {event.medical_record.diagnosis} 
                        ({formatDateTime(event.medical_record.date_record)})
                        {event.medical_record.dog && ` - ${event.medical_record.dog.name}`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div style={styles.eventMeta}>
                <span>สร้างเมื่อ: {formatDateTime(event.CreatedAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventManagement;