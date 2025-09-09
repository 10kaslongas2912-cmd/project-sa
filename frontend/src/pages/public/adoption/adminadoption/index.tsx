import React, { useState, useEffect } from 'react';
import { api } from '../../../../services/apis'; // <-- ตรวจสอบ path
import type { AdoptionWithDetails } from '../../../../interfaces/Adoption'; // <-- ตรวจสอบ path
import './style.css';

type Tab = 'pending' | 'reviewed';

const AdminAdoptionPage: React.FC = () => {
    const [adoptions, setAdoptions] = useState<AdoptionWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('pending');

    const fetchAdoptions = async () => {
        try {
            setLoading(true);
            const res = await api.adopterAPI.getAll();
            // Sort data by creation date, newest first
            const sortedData = (res.data || []).sort((a: AdoptionWithDetails, b: AdoptionWithDetails) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime());
            setAdoptions(sortedData);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdoptions();
    }, []);

    // --- ส่วนที่แก้ไข ---
    // ปรับปรุงฟังก์ชันเพื่อแสดงข้อความ Error จาก Backend โดยตรง
    const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected') => {
        try {
            // เราจะใช้ try-catch เพื่อดักจับ Error ที่ส่งมาจาก service
            // โดย service ควรจะ throw error ที่มี message จาก backend
            await api.adopterAPI.updateStatus(id, { status });

            // เมื่อสำเร็จ, แสดงข้อความและโหลดข้อมูลใหม่ทั้งหมด
            // การโหลดใหม่ทั้งหมดเป็นวิธีที่ปลอดภัยที่สุด เพราะการอนุมัติ 1 รายการ
            // จะส่งผลให้รายการอื่นถูกปฏิเสธ (ตาม Logic ของ Backend)
            alert('อัปเดตสถานะสำเร็จแล้ว');
            fetchAdoptions();

        } catch (err: any) {
            // แสดงข้อความ Error ที่ได้รับจาก Backend โดยตรงผ่าน alert
            // err.message ควรจะมีข้อความที่เราตั้งไว้ เช่น "คุณยังไม่ได้เลือกคืน..."
            if (err && err.message) {
                alert(err.message);
                setError(err.message);
            } else {
                const errorMessage = "เกิดข้อผิดพลาดที่ไม่รู้จัก aoifjoasidjfoiasjdfoi";
                alert(errorMessage);
                setError(errorMessage);
            }
        }
    };

    // ปรับปรุงฟังก์ชันการลบให้คล้ายกัน
    const handleDelete = async (id: number) => {
        if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบคำขอนี้? การกระทำนี้ไม่สามารถย้อนกลับได้")) {
            return;
        }
        
        try {
            await api.adopterAPI.remove(id);
            alert('ลบคำขอสำเร็จแล้ว');
            // โหลดข้อมูลใหม่หลังจากลบสำเร็จ
            fetchAdoptions();
        } catch (err: any) {
            // แสดงข้อความ Error ที่ได้รับจาก Backend (ถ้ามี)
            if (err && err.message) {
                alert(err.message);
                setError(err.message);
            } else {
                const errorMessage = "ไม่สามารถลบข้อมูลได้";
                alert(errorMessage);
                setError(errorMessage);
            }
        }
    };
    // --- จบส่วนที่แก้ไข ---
    
    const handleRowClick = (id: number) => {
        setExpandedRowId(prevId => (prevId === id ? null : id));
    };

    // Filter data based on status
    const pendingAdoptions = adoptions.filter(ad => ad.status === 'pending');
    const reviewedAdoptions = adoptions.filter(ad => ad.status !== 'pending');
    
    const displayedAdoptions = activeTab === 'pending' ? pendingAdoptions : reviewedAdoptions;

    if (loading) return <div className="admin-loading">กำลังโหลดข้อมูลคำขอ...</div>;
    if (error && adoptions.length === 0) return <div className="admin-error">เกิดข้อผิดพลาด: {error}</div>;

    return (
        <div className="admin-container">
            <h1>จัดการคำขอรับเลี้ยงสุนัข</h1>

            {/* --- โค้ดส่วน JSX ที่เหลือเหมือนเดิมทั้งหมด --- */}
            <div className="admin-tabs">
                <button 
                    className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    รายการรอพิจารณา ({pendingAdoptions.length})
                </button>
                <button 
                    className={`tab-button ${activeTab === 'reviewed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviewed')}
                >
                    รายการที่พิจารณาแล้ว ({reviewedAdoptions.length})
                </button>
            </div>

            <div className="table-wrapper">
                <table className="adoption-table">
                    <thead>
                        <tr>
                            <th>วันที่ส่งคำขอ</th>
                            <th>ชื่อผู้ขอ</th>
                            <th>ชื่อสุนัข</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedAdoptions.length > 0 
                            ? displayedAdoptions.map((adoption) => (
                                <React.Fragment key={adoption.ID}>
                                    <tr className="adoption-row" onClick={() => handleRowClick(adoption.ID)}>
                                        <td>{new Date(adoption.CreatedAt).toLocaleDateString('th-TH')}</td>
                                        <td>{`${adoption.first_name} ${adoption.last_name}`}</td>
                                        <td>{adoption.dog?.name || 'N/A'}</td>
                                        <td>
                                            <span className={`status-badge status-${adoption.status}`}>
                                                {adoption.status === 'pending' ? 'รอพิจารณา' : adoption.status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            {activeTab === 'pending' ? (
                                                <>
                                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(adoption.ID, 'approved'); }} className="action-btn approve">อนุมัติ</button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(adoption.ID, 'rejected'); }} className="action-btn reject">ปฏิเสธ</button>
                                                </>
                                            ) : (
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(adoption.ID); }} className="action-btn delete">ลบ</button>
                                            )}
                                        </td>
                                    </tr>
                                    {expandedRowId === adoption.ID && (
                                        <tr className="details-row">
                                            <td colSpan={5}>
                                                <div className="adoption-details">
                                                    <h4>ข้อมูลผู้ขอรับเลี้ยงเพิ่มเติม</h4>
                                                    <div className="details-grid">
                                                        <p><strong>เบอร์โทรศัพท์:</strong> {adoption.phone_number}</p>
                                                        <p><strong>อาชีพ:</strong> {adoption.job}</p>
                                                        <p><strong>รายได้ต่อปี:</strong> {adoption.income > 0 ? adoption.income.toLocaleString('th-TH') + ' บาท' : 'ไม่ระบุ'}</p>
                                                        <p><strong>ที่อยู่:</strong> {`${adoption.address}, ต.${adoption.district}, อ.${adoption.city}, จ.${adoption.province} ${adoption.zip_code}`}</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )) 
                            : <tr><td colSpan={5}>ไม่มีข้อมูลในหมวดหมู่นี้</td></tr>
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminAdoptionPage;
