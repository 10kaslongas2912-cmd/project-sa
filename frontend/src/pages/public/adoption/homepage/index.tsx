import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style.css";
import type { DogInterface } from "../../../../interfaces/Dog";
import { ageText } from "../../../../utils/date";
import { useDogs } from "../../../../hooks/useDogs";

type DogCardProps = {
    dog: DogInterface;
};

function DogCard({ dog }: DogCardProps) {
    const navigate = useNavigate();
    const handleClick = () => {
        // ✅ แก้ไข: ปรับ path ให้ถูกต้องตามโครงสร้าง Route
        navigate(`doglist/${dog.ID}`);
    };

    return (
        <div className="card info">
            <div className="card img">
                {dog.photo_url ? (
                    <Link to={`/adoption/doglist/${dog.ID}`}>
                        <img
                            src={dog.photo_url}
                            alt={`รูปภาพของ ${dog.name}`}
                            className="dog-image"
                        />
                    </Link>
                ) : (
                    <div className="dog-image-placeholder">
                        <span className="placeholder-text">ไม่มีรูป</span>
                    </div>
                )}
            </div>

            <div className="card text">
                <Link to={`/adoption/doglist/${dog.ID}`}>
                    <h3 className="dogname">{dog.name}</h3>
                </Link>
                <p className="dog-info">
                    {dog.animal_sex?.name}・ขนาด {dog.animal_size?.name}
                    {dog.date_of_birth && (
                        <>
                            <br />
                            อายุ {ageText(dog.date_of_birth)}
                        </>
                    )}
                </p>
            </div>

            <div className="card-button">
                <button className="btn-new" onClick={handleClick}>
                    ดูรายละเอียด
                </button>
            </div>
        </div>
    );
}

/* -------------------- หน้า Adoption -------------------- */
const AdoptionPage: React.FC = () => {
    const { dogs, loading, error } = useDogs();

    // ✅ เพิ่ม: กรองข้อมูลสุนัขที่ยังไม่มีคนรับเลี้ยง (is_adopted = false)
    const availableDogs = dogs.filter(dog => !dog.is_adopted);

    return (
        <div className="sponsor-page-wrapper">
            <div className="bottom-section">
                <br />
                <br />
                <br />
                <h2 className="bottom-title text-4xl font-bold mb-10 text-center">
                    น้องหมาต้องการบ้านใหม่
                </h2>

                {loading && <p className="text-center">กำลังโหลดข้อมูล...</p>}
                {error && <p className="text-center text-red-600">โหลดข้อมูลไม่สำเร็จ: {error}</p>}
                
                {/* ✅ แก้ไข: เช็คจาก availableDogs.length */}
                {!loading && !error && availableDogs.length === 0 && (
                    <p className="text-center">ยังไม่มีน้องหมาที่รอการรับเลี้ยงในขณะนี้</p>
                )}

                {!loading && !error && availableDogs.length > 0 && (
                    <div className="card wrapper">
                        <div className="card container">
                            {/* ✅ แก้ไข: เปลี่ยนไปใช้ availableDogs.map */}
                            {availableDogs.map((dog) => (
                                <DogCard key={dog.ID} dog={dog} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdoptionPage;
