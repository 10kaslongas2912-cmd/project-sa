import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDog } from "../../../../hooks/useDog"; // Hook สำหรับดึงข้อมูลสุนัข
import type { CreateAdoptionRequest } from '../../../../interfaces/Adoption';
import './style.css'; // ไฟล์สำหรับตกแต่งหน้าตา

const AdoptionForm: React.FC = () => {
    // 1. ดึง dogId จาก URL parameter
    const { dogId } = useParams<{ dogId: string }>();
    const navigate = useNavigate();

    // 2. ใช้ useDog hook เพื่อดึงข้อมูลสุนัข, สถานะ loading, และ error
    const { dog, loading: loadingDog, error: dogFetchError } = useDog(dogId ? Number(dogId) : null);

    // 3. State สำหรับจัดการข้อมูลในฟอร์ม
    const [formData, setFormData] = useState<CreateAdoptionRequest>({
        first_name: '', last_name: '', phone_number: '',
        address: '', district: '', city: '', province: '',
        zip_code: '', job: '', income: 0,
        dog_id: parseInt(dogId || '0'), // กำหนด dog_id ให้ฟอร์มล่วงหน้า
    });
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [formError, setFormError] = useState('');

    // 4. ฟังก์ชันสำหรับอัปเดต state เมื่อผู้ใช้กรอกข้อมูล
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'income' ? parseFloat(value) || 0 : value,
        }));
    };

    // 5. ฟังก์ชันสำหรับส่งข้อมูลฟอร์มไปหา Backend
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setLoadingSubmit(true);

        try {
            // Endpoint นี้ต้องตรงกับที่ตั้งค่าไว้ใน Go router
            const response = await fetch('http://localhost:8000/adoptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (!response.ok) {
                // แสดง error ที่ได้รับมาจาก Backend
                throw new Error(result.error || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
            }
            alert('ส่งคำขอรับเลี้ยงสำเร็จแล้ว!');
            navigate('/'); // กลับไปหน้าหลักหลังส่งสำเร็จ
        } catch (err: unknown) {
            if (err instanceof Error) {
                setFormError(err.message);
            } else {
                setFormError('เกิดข้อผิดพลาดที่ไม่รู้จัก');
            }
        } finally {
            setLoadingSubmit(false);
        }
    };

    // แสดงสถานะ "กำลังโหลด" ขณะดึงข้อมูลสุนัข
    if (loadingDog) {
        return <div className="loading-container">กำลังโหลดข้อมูลสุนัข...</div>;
    }

    // แสดงข้อผิดพลาด หากดึงข้อมูลสุนัขไม่สำเร็จ
    if (dogFetchError) {
        return <div className="error-message">เกิดข้อผิดพลาด: {dogFetchError}</div>;
    }

    // แสดงผลฟอร์มหลัก
    return (
        <div className="adoption-container">
            <div className="adoption-header">
                <h1>ท่านมีความประสงค์จะรับเลี้ยง</h1>
            </div>
            <div className="adoption-content">
                <div className="dog-section">
                    {dog ? (
                        <>
                            <div
                                className="dog-photo"
                                style={{ backgroundImage: `url(${dog.photo_url || 'https://via.placeholder.com/200/cccccc/ffffff?text=🐕'})` }}
                            />
                            <h2 className="dog-name">{dog.name}</h2>
                        </>
                    ) : (
                        <p>ไม่พบข้อมูลสุนัขที่ท่านเลือก</p>
                    )}
                </div>
                <div className="form-section">
                    <h2 className="form-title">โปรดกรอกข้อมูลของท่าน</h2>
                    {formError && <div className="error-message">{formError}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>ชื่อ*</label>
                                <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>นามสกุล*</label>
                                <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>เบอร์มือถือ*</label>
                            <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleInputChange} required />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>อาชีพ*</label>
                                <input type="text" name="job" value={formData.job} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>รายได้ต่อปี (บาท)</label>
                                <input type="number" name="income" value={formData.income || ''} onChange={handleInputChange} min="0" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>ที่อยู่*</label>
                            <input type="text" name="address" value={formData.address} onChange={handleInputChange} required />
                        </div>
                        <div className="form-row three-columns">
                            <div className="form-group">
                                <label>ตำบล/แขวง*</label>
                                <input type="text" name="district" value={formData.district} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>อำเภอ/เขต*</label>
                                <input type="text" name="city" value={formData.city} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>จังหวัด*</label>
                                <input type="text" name="province" value={formData.province} onChange={handleInputChange} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>รหัสไปรษณีย์*</label>
                            <input type="text" name="zip_code" value={formData.zip_code} onChange={handleInputChange} maxLength={5} required />
                        </div>
                        <button type="submit" className="submit-button" disabled={loadingSubmit || !dog}>
                            {loadingSubmit ? 'กำลังส่ง...' : 'ยืนยันการขอรับเลี้ยง'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdoptionForm;