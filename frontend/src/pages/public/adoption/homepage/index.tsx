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
    navigate(`doglist/${dog.ID}`);
  };

  return (
    <div className="card info">
      <div className="card img">
        {dog.photo_url ? (
          <Link to={`doglist/${dog.ID}`}>
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
        <Link to={`doglist/${dog.ID}`}>
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
          รับเลี้ยง
        </button>
      </div>
    </div>
  );
}

/* -------------------- หน้า Sponsor -------------------- */
const AdoptionPage: React.FC = () => {
  const { dogs, loading, error } = useDogs();

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

export default AdoptionPage;
