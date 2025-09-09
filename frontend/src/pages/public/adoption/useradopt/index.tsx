import React, { useState, useEffect } from 'react';
import { api } from '../../../../services/apis'; // <-- ตรวจสอบ path
import type { MyCurrentAdoption } from '../../../../interfaces/Adoption';
import { useAuthUser } from "../../../../hooks/useAuth";
import './style.css';

const MyCurrentAdoptionsPage: React.FC = () => {
    const { isLoggedIn, loading: authLoading } = useAuthUser();
    const [myAdoptions, setMyAdoptions] = useState<MyCurrentAdoption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!isLoggedIn) {
            setLoading(false);
            return;
        }

        const fetchMyCurrentAdoptions = async () => {
            try {
                setLoading(true);
                const res = await api.adopterAPI.getMyCurrentAdoptions();
                setMyAdoptions(res.data || []);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
            } finally {
                setLoading(false);
            }
        };

        fetchMyCurrentAdoptions();
    }, [isLoggedIn, authLoading]);

    if (authLoading || loading) {
        return <div className="my-adoptions-message">กำลังโหลดข้อมูล...</div>;
    }

    if (!isLoggedIn) {
        return <div className="my-adoptions-message">กรุณาเข้าสู่ระบบเพื่อดูสุนัขในความดูแลของคุณ</div>;
    }

    if (error) {
        return <div className="my-adoptions-message error">เกิดข้อผิดพลาด: {error}</div>;
    }

    return (
        <div className="my-adoptions-container">
            <h1>สุนัขในความดูแลของคุณ</h1>
            {myAdoptions.length > 0 ? (
                <div className="adopted-dogs-grid">
                    {myAdoptions.map((adoption) => (
                        adoption.dog && (
                            <div key={adoption.ID} className="dog-card-adopted">
                                <img
                                    src={adoption.dog.photo_url || 'https://placehold.co/400x400/cccccc/ffffff?text=🐕'}
                                    alt={`รูปภาพของ ${adoption.dog.name}`}
                                    className="dog-image-adopted"
                                />
                                <div className="dog-info-adopted">
                                    <h2 className="dog-name-adopted">{adoption.dog.name}</h2>
                                    <p>วันที่เริ่มรับเลี้ยง: {new Date(adoption.CreatedAt).toLocaleDateString('th-TH')}</p>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            ) : (
                <div className="my-adoptions-message">คุณยังไม่มีสุนัขที่อยู่ในความดูแล</div>
            )}
        </div>
    );
};

export default MyCurrentAdoptionsPage;