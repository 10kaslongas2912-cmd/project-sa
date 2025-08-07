import React from 'react';
import './style.css'; // ไฟล์ CSS เดิมของคุณ
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


import sponsorImage from '../../../assets/sponsor/ChatGPT Image Jul 31, 2025, 08_14_47 PM.png';
import frameImage1 from '../../../assets/sponsor/HD-wallpaper-1-month-year-old-pup-dog-german-shepherd-thumbnail.jpg';
import frameImage2 from '../../../assets/sponsor/images (1).jpg';
import frameImage3 from '../../../assets/sponsor/images.jpg';


interface Dog {
  id: number;
  name: string;
  age: string;
  size: string;
  image: string;
}

// ข้อมูลที่นำมาแสดงผล
const dogData: Dog[] = [
  { id: 1, name: 'น้อง H2K', age: '7 ปี 3 เดือน', size: 'ขนาดกลาง', image: frameImage1 },
  { id: 2, name: 'น้อง H2K', age: '7 ปี 3 เดือน', size: 'ขนาดกลาง', image: frameImage2 },
  { id: 3, name: 'น้อง H2K', age: '7 ปี 3 เดือน', size: 'ขนาดกลาง', image: frameImage3 },
  { id: 4, name: 'น้อง H2K', age: '7 ปี 3 เดือน', size: 'ขนาดกลาง', image: frameImage1 },
  { id: 5, name: 'น้อง H2K', age: '7 ปี 3 เดือน', size: 'ขนาดกลาง', image: frameImage2 },
  { id: 6, name: 'น้อง H2K', age: '7 ปี 3 เดือน', size: 'ขนาดกลาง', image: frameImage3 },
];

const SponsorPage: React.FC = () => {
  const navigate = useNavigate();
  const handleClick = (data:Dog) => {
    navigate('dog-info', {
      state: data,
    });
  };
  
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
                ไม่ใช่เพราะเราสงสาร<br />
                แต่เพราะเขาคือพระเจ้าชีวิตใหม่ให้แก่เรา<br />
                และคุณ...คือบทผู้กอบกู้ของเขาในวันนี้
              </p>
            </div>
          </div>
        </div>

        {/* ส่วนนี้คือ bottom-section ที่ถูกแก้ไข */}
        <div className="bottom-section">
          <h2 className="bottom-title text-4xl font-bold mb-10 text-center">น้องหมาที่รอคุณอุปถัมภ์</h2>
          <div className="card wrapper">
            <div className="card container ">
                {dogData.map((dog) => (
                  <div key={dog.id} className="card info">
                    <div className="card img">
                      <Link to = 'dog-info'>
                        <img src={dog.image} alt={`รูปภาพของ ${dog.name}`} className="w-full h-full object-cover" /> 
                      </Link>
                    </div>
                  
                    <div className="card text">
                      <h3 className="dogname">{dog.name}</h3>
                        <p className="dog-info">
                          อายุ {dog.age}<br />
                          {dog.size}
                        </p>
                        <p className="dog-info">
                          
                        </p>
                    </div>
                    <div className="card-button">
                      <button className="primary-button" onClick={() => handleClick(dog)}>
                        อุปถัมภ์น้อง
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SponsorPage;