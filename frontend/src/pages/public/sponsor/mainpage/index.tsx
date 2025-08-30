// โค้ดที่แก้ไขแล้ว
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style.css";
import sponsorImage from "../../../../assets/sponsor/ChatGPT Image Jul 31, 2025, 08_14_47 PM.png";
import type { DogInterface } from "../../../../interfaces/Dog";
import { ageText } from "../../../../utils/date";
import { dogAPI } from "../../../../services/api"

/* ----- DogCard Component ที่แก้ไขแล้ว ----- */
type DogCardProps = {
  dog: DogInterface;
};

function DogCard({ dog }: DogCardProps) {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`dog-info/${dog.id}`);
  };

  return (
    <div className="card info">
      <div className="card img">
        {dog.photo_url ? ( // เปลี่ยนจาก photoURL เป็น photo_url
          <Link to={`dog-info/${dog.id}`}>
            <img
              src={dog.photo_url} // เปลี่ยนจาก photoURL เป็น photo_url
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
            <h3 className="dogname">{dog.name}</h3>
              <p className="dog-info">
                {dog.animal_sex?.name}・ขนาด {dog.animal_size?.name}
                {dog.date_of_birth && <><br/>อายุ {ageText(dog.date_of_birth)}</>}
              </p>
        </div>

      <div className="card-button">
        <button className="btn-new" onClick={handleClick}>
          อุปถัมภ์น้อง
        </button>
      </div>
    </div>
  );
}

/* -------------------- หน้า Sponsor -------------------- */
const SponsorPage: React.FC = () => {
  const [dogs, setDogs] = useState<DogInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);


useEffect(() => {
  (async () => {
    try {
      setLoading(true);
      const res = await dogAPI.getAll(); // => รูปแบบ { data: DogInterface[] }
      setDogs(Array.isArray(res.data) ? res.data : []);
      setErr(null);
    } catch (e: any) {
      setErr(e?.message || "fetch failed");
    } finally {
      setLoading(false);
    }
  })();
}, []);


  return (
    <>
      <div className="sponsor-page-wrapper">
        <div className="top-section">
          <div className="image-box">
            <img src={sponsorImage} alt="Sponsor a Dog" />
          </div>
          <div className="text-box">
            <div className="content">
              <h1>ร่วมอุปถัมภ์น้องๆ</h1>
              <p>
                สำหรับพวกเขา เราอาจเป็นแค่ช่วงหนึ่งของชีวิต <br />
                แต่สำหรับเรา พวกเขากลับเป็นดวงใจหัวใจ <br />
                จงเปิดใจให้ปังปอนด์ได้เข้ามาในความรักของคุณ <br />
                ไม่ใช่เพราะเราสงสาร
                <br />
                แต่เพราะเขาคือพระเจ้าชีวิตใหม่ให้แก่เรา
                <br />
                และคุณ...คือบทผู้กอบกู้ของเขาในวันนี้
              </p>
            </div>
          </div>
        </div>

        <div className="bottom-section">
          <h2 className="bottom-title text-4xl font-bold mb-10 text-center">
            น้องหมาที่รอคุณอุปถัมภ์
          </h2>

          {loading && <p className="text-center">กำลังโหลดข้อมูล...</p>}
          {err && !loading && (
            <p className="text-center text-red-600">โหลดข้อมูลไม่สำเร็จ: {err}</p>
          )}
          {!loading && !err && dogs.length === 0 && (
            <p className="text-center">ยังไม่มีข้อมูลน้องหมา</p>
          )}

          {!loading && !err && dogs.length > 0 && (
            <div className="card wrapper">
              <div className="card container">
                {dogs.map((dog) => (
                  <DogCard key={dog.id} dog={dog} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SponsorPage;