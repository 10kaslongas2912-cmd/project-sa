import React, { useState, useEffect } from 'react'; // เพิ่ม useEffect เข้ามา
import { useParams, useNavigate } from 'react-router-dom';
import { useDog } from "../../../../hooks/useDog";
import type { CreateAdoptionRequest } from '../../../../interfaces/Adoption';
import './style.css';
import { useAuthUser } from "../../../../hooks/useAuth"; // <-- 1. Import hook useAuthUser

const AdoptionForm: React.FC = () => {
    const { dogId } = useParams<{ dogId: string }>();
    const navigate = useNavigate();
    
    // --- ส่วนที่เพิ่มเข้ามา ---
    const { user, isLoggedIn } = useAuthUser(); // <-- 2. เรียกใช้ hook เพื่อดึงข้อมูล user
    // ----------------------

    const { dog, loading: loadingDog, error: dogFetchError } = useDog(dogId ? Number(dogId) : null);

    const [formData, setFormData] = useState<CreateAdoptionRequest>({
        first_name: '', last_name: '', phone_number: '',
        address: '', district: '', city: '', province: '',
        zip_code: '', job: '', income: 0,
        dog_id: parseInt(dogId || '0'),
    });
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [formError, setFormError] = useState('');

    // --- ส่วนที่เพิ่มเข้ามา (แนะนำ) ---
    // ทำให้ข้อมูลในฟอร์มถูกเติมอัตโนมัติเมื่อ user โหลดเสร็จ
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone_number: user.phone || '',
            }));
        }
    }, [user]); // ทำงานเมื่อ user เปลี่ยน
    // ---------------------------------

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'income' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        // --- ส่วนที่แก้ไข ---
        // 3. ตรวจสอบว่า user login หรือยัง
        if (!user || !isLoggedIn) {
            setFormError('กรุณาเข้าสู่ระบบก่อนทำการขอรับเลี้ยง');
            // อาจจะ navigate ไปหน้า login
            // navigate('/login');
            return;
        }

        setLoadingSubmit(true);

        // 4. สร้างข้อมูลที่จะส่ง โดยเพิ่ม user_id เข้าไป
        const submissionData = {
            ...formData,
            user_id: user.ID, 
        };
        // -------------------

        try {
            const response = await fetch('http://localhost:8000/adoptions', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    // หาก API ต้องการ token ให้ใส่ Authorization header ด้วย
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(submissionData), // <-- 5. ส่งข้อมูลใหม่ที่มี user_id
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
            }
            alert('ส่งคำขอรับเลี้ยงสำเร็จแล้ว!');
            navigate('/');
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
                <br />
                <br />  
                <br />
                <br />
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
                    <form onSubmit={handleSubmit} autoComplete="off"></form>
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