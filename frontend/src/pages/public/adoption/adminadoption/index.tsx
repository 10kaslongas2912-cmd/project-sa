import React, { useState, useEffect } from 'react';
import { api } from '../../../../services/apis'; // <-- ตรวจสอบ path
import type { AdoptionWithDetails } from '../../../../interfaces/Adoption'; // <-- ตรวจสอบ path

import './style.css';

const AdminAdoptionPage: React.FC = () => {
    const [adoptions, setAdoptions] = useState<AdoptionWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const fetchAdoptions = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.adopterAPI.getAll();
            setAdoptions(response.data || []);
        } catch (err) {
            setError('ไม่สามารถโหลดข้อมูลคำขอได้');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdoptions();
    }, []);

    const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected') => {
        const confirmationText = `คุณแน่ใจหรือไม่ที่จะ "${status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}" คำขอนี้?`;
        if (!window.confirm(confirmationText)) {
            return;
        }

        try {
            await api.adopterAPI.updateStatus(id, { status });
            setMessage(`อัปเดตสถานะคำขอ #${id} สำเร็จ!`);
            fetchAdoptions();
        } catch (err: any) {
            setError(err.response?.data?.error || `เกิดข้อผิดพลาดในการอัปเดตสถานะ`);
            console.error(err);
        }
        setTimeout(() => setMessage(null), 5000);
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>จัดการคำขอรับเลี้ยงสุนัข</h1>
                <p>อนุมัติหรือปฏิเสธคำขอที่ส่งเข้ามาทั้งหมด</p>
            </div>

            {message && <div className="message-box success">{message}</div>}
            {error && <div className="message-box error">{error}</div>}

            <div className="table-wrapper">
                <table className="adoption-table">
                    <thead>
                        <tr>
                            <th>ID คำขอ</th>
                            <th>ชื่อสุนัข</th>
                            <th>ผู้ขอรับเลี้ยง</th>
                            <th>เบอร์โทร</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="loading-cell">กำลังโหลดข้อมูล...</td></tr>
                        ) : adoptions.length === 0 ? (
                            <tr><td colSpan={6} className="empty-cell">ยังไม่มีคำขอรับเลี้ยงเข้ามา</td></tr>
                        ) : (
                            adoptions.map(req => (
                                <tr key={req.ID}>
                                    <td>#{req.ID}</td>
                                    <td>{req.dog?.name || 'N/A'}</td>
                                    <td>{`${req.first_name} ${req.last_name}`}</td>
                                    <td>{req.phone_number}</td>
                                    <td><span className={`status-badge status-${req.status}`}>{req.status}</span></td>
                                    <td>
                                        {req.status === 'pending' ? (
                                            <div className="action-buttons">
                                                <button onClick={() => handleUpdateStatus(req.ID, 'approved')} className="btn approve">อนุมัติ</button>
                                                <button onClick={() => handleUpdateStatus(req.ID, 'rejected')} className="btn reject">ปฏิเสธ</button>
                                            </div>
                                        ) : (
                                            <span className="action-placeholder">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminAdoptionPage;

