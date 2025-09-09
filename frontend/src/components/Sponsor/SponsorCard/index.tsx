import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { DollarOutlined, HeartOutlined, CalendarOutlined } from "@ant-design/icons";
import { useSponsorship } from "../../../hooks/sponsorship/useSponsorship";
import { useDog } from "../../../hooks/useDog";
import { ageText } from "../../../utils/date";
import type { DogInterface } from "../../../interfaces/Dog";
import "./style.css";

type Props = {
  dog?: DogInterface | null;  
  showNote?: boolean;
};

const SponsorDogCard: React.FC<Props> = ({ dog: dogProp, showNote = true }) => {
const { id } = useParams();
  // ถ้าไม่ได้ส่ง dog มา และมี :id ใน URL → ค่อยเรียก useDog
  const dogId = !dogProp && id ? Number(id) : null;
  const { dog: dogFetched } = useDog(dogId);
  const dog = dogProp ?? dogFetched;

  const { planType, frequency, amount } = useSponsorship();

  const planText = useMemo(() => {
    if (planType === "subscription") return "ต่อเนื่อง";
    if (planType === "one-time") return "ครั้งเดียว";
    return planType ?? "-";
  }, [planType]);

  const frequencyText = useMemo(() => {
    switch (frequency) {
      case "monthly":
        return "รายเดือน";
      case "quarterly":
        return "รายไตรมาส";
      case "yearly":
        return "รายปี";
      default:
        return "-";
    }
  }, [frequency]);

  const amountText = useMemo(() => {
    if (!amount || Number.isNaN(amount)) return "-";
    return new Intl.NumberFormat("th-TH").format(amount);
  }, [amount]);

  const imgSrc = dog?.photo_url || "https://via.placeholder.com/120x120?text=%F0%9F%90%95";
  const imgAlt = dog?.name ? `รูปของ ${dog.name}` : "รูปสุนัข";

  return (
    <div className="sponsor-header">
      <div className="sponsor-header-content">
        <div className="dog-info-section">
          <div className="dog-image-container">
            <img src={imgSrc} alt={imgAlt} className="dog-image" />
            <div className="heart-overlay">
              <HeartOutlined />
            </div>
          </div>

          <div className="dog-details">
            <h1 className="dog-name">{dog?.name || "น้องหมา"}</h1>
            <p className="sponsor-action-text">คุณกำลังจะอุปถัมภ์น้องคนนี้</p>

            {dog?.breed?.name && (
              <div className="dog-breed">
                <span className="breed-label">พันธุ์: </span>
                <span className="breed-value">{dog.breed.name}</span>
              </div>
            )}

            {dog?.date_of_birth && (
              <div className="dog-age">
                <span className="age-label">อายุ: </span>
                <span className="age-value">{ageText(dog.date_of_birth)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="sponsorship-summary">
          <h2 className="summary-title">รายละเอียดการอุปถัมภ์</h2>

          <div className="summary-cards">
            <div className="summary-card plan-card">
              <div className="card-icon">
                <HeartOutlined />
              </div>
              <div className="card-content">
                <div className="card-label">รูปแบบ</div>
                <div className="card-value">{planText}</div>
              </div>
            </div>

            {planType === "subscription" && (
              <div className="summary-card frequency-card">
                <div className="card-icon">
                  <CalendarOutlined />
                </div>
                <div className="card-content">
                  <div className="card-label">ความถี่</div>
                  <div className="card-value">{frequencyText}</div>
                </div>
              </div>
            )}

            <div className="summary-card amount-card">
              <div className="card-icon">
                <DollarOutlined />
              </div>
              <div className="card-content">
                <div className="card-label">จำนวนเงิน</div>
                <div className="card-value">฿{amountText}</div>
              </div>
            </div>
          </div>

          {showNote && planType === "subscription" && (
            <div className="subscription-note">
              <p>💡 การอุปถัมภ์แบบรายงวดช่วยให้น้องได้รับการดูแลต่อเนื่อง</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SponsorDogCard;
