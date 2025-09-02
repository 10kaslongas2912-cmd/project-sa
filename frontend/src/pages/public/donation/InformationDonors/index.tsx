import React, { useState, useEffect } from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";

// ============ Types & Consts ============
type DonorFormData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

const STORAGE_KEYS = {
  donorForm: "donationInfoFormData",
  prefill: "prefillUserData",
} as const;

// รองรับหลายรูปแบบชื่อคีย์จากแหล่ง prefill แล้ว normalize เป็น camelCase
const normalizePrefill = (u: any): Partial<DonorFormData> => ({
  firstName: u?.firstName ?? u?.firstname ?? u?.first_name,
  lastName:  u?.lastName  ?? u?.lastname  ?? u?.last_name,
  phone:     u?.phone     ?? u?.phonenumber ?? u?.phone_number,
  email:     u?.email,
});

// อ่านค่าเริ่มต้นจาก sessionStorage (คีย์ camelCase ให้คงที่)
const readInitial = (): DonorFormData => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.donorForm);
    const j = raw ? JSON.parse(raw) : {};
    return {
      firstName: j.firstName ?? "",
      lastName:  j.lastName  ?? "",
      phone:     j.phone     ?? "",
      email:     j.email     ?? "",
    };
  } catch {
    return { firstName: "", lastName: "", phone: "", email: "" };
  }
};

// ============ Component ============
const InformationDonors: React.FC = () => {
  const navigate = useNavigate();
  const initial = readInitial();

  // Controlled states (camelCase)
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName,  setLastName]  = useState(initial.lastName);
  const [phone,     setPhone]     = useState(initial.phone);
  const [email,     setEmail]     = useState(initial.email);

  // เติมข้อมูลอัตโนมัติจาก prefillUserData (ครั้งเดียว)
  useEffect(() => {
    const prefillRaw = sessionStorage.getItem(STORAGE_KEYS.prefill);
    if (!prefillRaw) return;

    try {
      const u = JSON.parse(prefillRaw);
      const n = normalizePrefill(u);
      if (n.firstName != null) setFirstName(n.firstName);
      if (n.lastName  != null) setLastName(n.lastName);
      if (n.phone     != null) setPhone(n.phone);
      if (n.email     != null) setEmail(n.email);
    } catch (e) {
      console.error("Error parsing prefillUserData:", e);
    } finally {
      // ลบทิ้งหลังใช้ เพื่อไม่ให้เติมซ้ำรอบถัดไป
      sessionStorage.removeItem(STORAGE_KEYS.prefill);
    }
  }, []);

  // บันทึกฟอร์มลง sessionStorage ทุกครั้งที่พิมพ์ (คีย์ camelCase)
  useEffect(() => {
    const formData: DonorFormData = { firstName, lastName, phone, email };
    sessionStorage.setItem(STORAGE_KEYS.donorForm, JSON.stringify(formData));
  }, [firstName, lastName, phone, email]);

  // ส่งฟอร์ม → ไปหน้าถัดไปตาม donationType
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const donationType = sessionStorage.getItem("donationType");
    if (donationType === "money") navigate("/donation/money");
    else if (donationType === "item") navigate("/donation/item");
    else navigate("/donation/options");
  };

  return (
    <div className="form-page-container">
      <div className="form-card">
        <button onClick={() => navigate("/donation/options")} className="back-link">
          &lt; ย้อนกลับ
        </button>

        <h1 className="form-title">ข้อมูลการบริจาค</h1>
        <h2 className="form-subtitle">ผู้บริจาค</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="ชื่อ"
            className="form-input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="นามสกุล"
            className="form-input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="เบอร์โทรศัพท์"
            className="form-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="อีเมล"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="submit-button">
            ต่อไป
          </button>
        </form>
      </div>
    </div>
  );
};

export default InformationDonors;
