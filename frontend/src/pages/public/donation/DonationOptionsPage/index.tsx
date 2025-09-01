import React, { useEffect } from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";
import { useAuthUser } from "../../../../hooks/useAuth";
import { userAPI } from "../../../../services/apis";

const DonationOptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuthUser();
  const prefillUser = async () => {
  if (!isLoggedIn || !user?.id) return;  // เช็ค login และมี user.ID จริง
  try {
    const res = await userAPI.getById(user.id); // 👈 ไม่ต้องไป localStorage
    if (res.status === 200) {
      sessionStorage.setItem("prefillUserData", JSON.stringify(res.data));
    }
  } catch (err) {
    console.error("Error fetching user data:", err);
  }
};

  useEffect(() => {
    sessionStorage.removeItem("donationItemsFormData");
    sessionStorage.removeItem("createAccount");
  }, []);

  const handleDonationMoneyClick = async () => {
    sessionStorage.setItem("donationType", "money");
    await prefillUser();
    navigate("/donation/information");
  };

  const handleDonationItemClick = async () => {
    sessionStorage.setItem("donationType", "item");
    await prefillUser();
    navigate("/donation/information");
  };
  return (
    <div
      className="page-container"
      style={{
        visibility: "visible",
        opacity: 1,
        transition: "opacity 0.3s ease-in-out",
      }}
    >
      <div className="card">
        <button
          className="button orange-button"
          onClick={handleDonationMoneyClick}
        >
          <h1>บริจาคเงิน</h1>
          <h2>ร่วมมอบโอกาสครั้งที่สองให้สุนัขที่เจ็บป่วยและถูกทอดทิ้ง</h2>
        </button>
        <button
          className="button blue-button"
          onClick={handleDonationItemClick}
        >
          <h1>บริจาคสิ่งของ</h1>
          <h2>ของใช้เล็กๆจากคุณ อาจหมายถึงทั้งโลกสำหรับพวกเขา</h2>
        </button>
      </div>
    </div>
  );
};
export default DonationOptionsPage;
