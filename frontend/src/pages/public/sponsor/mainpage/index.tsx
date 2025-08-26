import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { ConfigProvider, Space } from 'antd';
import { createStyles } from 'antd-style';
import './style.css';

import sponsorImage from '../../../../assets/sponsor/ChatGPT Image Jul 31, 2025, 08_14_47 PM.png';

const API_BASE = 'http://localhost:8000'; // เปลี่ยนตาม env ของคุณ

const useStyle = createStyles(({ prefixCls, css }) => ({
  linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
      > span { position: relative; }
      &::before {
        content: '';
        background: linear-gradient(135deg, #ff8800, #ff6f43ff);
        position: absolute; inset: -1px; opacity: 1; transition: all 0.3s; border-radius: inherit;
      }
      &:hover::before { opacity: 0; }
    }
  `,
}));

/** ชนิดข้อมูลที่รับมาจาก API (ยืดหยุ่นหน่อย) */
type Dog = {
  id: number;
  name: string;
  photo_url?: string;
  date_of_birth?: string; // "YYYY-MM-DD" (ตามที่ backend ส่ง)
  breed?: { breed_name?: string } | any; // เผื่อกรณี preload แล้วชื่อ field ต่างกัน
};

/** แปลงวันเกิดเป็นอายุแบบไทย "X ปี Y เดือน" (ถ้าไม่ครบก็ข้าม) */
function ageText(dob?: string) {
  if (!dob) return '';
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return '';
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) { years -= 1; months += 12; }
  const y = years > 0 ? `${years} ปี` : '';
  const m = months > 0 ? `${months} เดือน` : (years === 0 ? 'น้อยกว่า 1 เดือน' : '');
  return [y, m].filter(Boolean).join(' ');
}

const SponsorPage: React.FC = () => {
  const { styles } = useStyle();
  const navigate = useNavigate();

  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/dogs`, { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        // backend ของคุณตอบ { data: [...] }
        setDogs(Array.isArray(json?.data) ? json.data : []);
        setErr(null);
      } catch (e: any) {
        if (e.name !== 'AbortError') setErr(e?.message || 'fetch failed');
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const handleClick = (dogId: number) => {
    // ส่งไปแบบใช้ path param เพื่อให้หน้า dog-info ไปโหลดจาก API เอง
    navigate(`dog-info/${dogId}`);
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

        <div className="bottom-section">
          <h2 className="bottom-title text-4xl font-bold mb-10 text-center">น้องหมาที่รอคุณอุปถัมภ์</h2>

          {loading && <p className="text-center">กำลังโหลดข้อมูล...</p>}
          {err && !loading && <p className="text-center text-red-600">โหลดข้อมูลไม่สำเร็จ: {err}</p>}
          {!loading && !err && dogs.length === 0 && <p className="text-center">ยังไม่มีข้อมูลน้องหมา</p>}

          {!loading && !err && dogs.length > 0 && (
            <div className="card wrapper">
              <div className="card container">
                {dogs.map((dog) => (
                  <div key={dog.id} className="card info">
                    <div className="card img">
                      <Link to={`dog-info/${dog.id}`}>
                        {dog.photo_url ? (
                          <img src={dog.photo_url} alt={`รูปภาพของ ${dog.name}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400">ไม่มีรูป</span>
                          </div>
                        )}
                      </Link>
                    </div>

                    <div className="card text">
                      <h3 className="dogname">{dog.name}</h3>
                      <p className="dog-info">
                        {dog.date_of_birth && <>อายุ {ageText(dog.date_of_birth)}<br /></>}
                        {dog?.breed?.breed_name && <>{dog.breed.breed_name}</>}
                      </p>
                    </div>

                    <div className="card-button">
                      <ConfigProvider button={{ className: styles.linearGradientButton }}>
                        <Space>
                          <button className="btn-new" onClick={() => handleClick(dog.id)}>
                            อุปถัมภ์น้อง
                          </button>
                        </Space>
                      </ConfigProvider>
                    </div>
                  </div>
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
