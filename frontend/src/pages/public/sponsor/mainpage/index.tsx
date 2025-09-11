import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style.css";
import sponsorImage from "../../../../assets/sponsor/ChatGPT Image Jul 31, 2025, 08_14_47 PM.png";
import type { DogInterface } from "../../../../interfaces/Dog";
import { ageText } from "../../../../utils/date";
import { useDogs } from "../../../../hooks/useDogs";
import { publicUrl } from "../../../../utils/publicUrl";
type DogCardProps = {
  dog: DogInterface;
};

function DogCard({ dog }: DogCardProps) {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`${dog.ID}/dog-info`);
  };

  return (
    <div className="card info">
      <div className="card img">
        {dog.photo_url ? (
          <Link to={`${dog.ID}/dog-info`}>
            <img src={publicUrl(dog.photo_url)} alt={`รูปภาพของ ${dog.name}`} className="dog-image" loading="lazy" />
          </Link>
        ) : (
          <div className="dog-image-placeholder">
            <span className="placeholder-text">ไม่มีรูป</span>
          </div>
        )}
      </div>

      <div className="card text">
        <Link to={`${dog.ID}/dog-info`}>
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
          อุปถัมภ์น้อง
        </button>
      </div>
    </div>
  );
}

/* -------------------- หน้า Sponsor -------------------- */
const SponsorPage: React.FC = () => {
  const { dogs, loading, error } = useDogs();

  return (
    <div className="sponsor-page-wrapper">
      <div className="top-section">
        <div className="image-box">
          <img src={sponsorImage} alt="Sponsor a Dog" />
        </div>
        <div className="text-box">
          <div className="content">
            <h1>ร่วมอุปถัมภ์น้องๆ</h1>
            <p>
              <br/>
              <br/>
              <br/>
              <br/>
              <br/>
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
        {error && <p className="text-center text-red-600">โหลดข้อมูลไม่สำเร็จ: {error}</p>}
        {!loading && !error && dogs.length === 0 && (
          <p className="text-center">ยังไม่มีข้อมูลน้องหมา</p>
        )}
        {!loading && !error && dogs.length > 0 && (
          <div className="card wrapper">
            <div className="card container">
              {dogs.map((dog) => (
                <DogCard key={dog.ID} dog={dog} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorPage;
