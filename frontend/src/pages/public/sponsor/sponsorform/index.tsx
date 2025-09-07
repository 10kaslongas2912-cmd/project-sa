// src/pages/public/sponsor/SponsorForm/index.tsx
import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CreditCardOutlined, DollarOutlined, SmileOutlined, SolutionOutlined } from "@ant-design/icons";
import { Steps, message } from "antd";

import { useSponsorship } from "../../../../hooks/sponsorship/useSponsorship";
import { useAuthUser } from "../../../../hooks/useAuth";
import { useDog } from "../../../../hooks/useDog";
import SponsorDogCard from "../../../../components/Sponsor/SponsorCard";
import { useGenders } from "../../../../hooks/useGenders";
import { useSponsorForm } from "../../../../hooks/sponsorship/useSponsorForm";
import "./style.css";

const SponsorFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dogId = id ? Number(id) : null;

  const { dog } = useDog(dogId);

  // จากหน้า Amount
  const { planType, amount } = useSponsorship();

  // ผู้ใช้/ล็อกอิน
  const { user, isLoggedIn, loading: authLoading, refresh } = useAuthUser();

  const { genders, loading: gLoading } = useGenders();

  // ฟอร์มผู้สนับสนุน (guest/user)
const {
  state: form,
  allowedTitles,
  setGenderId,
  setTitleWithSync,
  setField,
  prefillFromUser,
  validate,
  sponsorData,
  updatesPreference,
} = useSponsorForm(dogId, genders);

  useEffect(() => {
    if (form.title === "mr" && form.gender_id !== 1) {
      setField("gender_id", 1);
    }
    if ((form.title === "mrs" || form.title === "ms") && form.gender_id !== 2) {
      setField("gender_id", 2);
    }
  }, [form.title, form.gender_id, setField]);

  // ---------------- Auto-reset title ถ้าเลือกเพศไม่ match ----------------
  useEffect(() => {
    if (form.gender_id === 1 && form.title && form.title !== "mr") {
      setField("title", "mr");
    }
    if (form.gender_id === 2 && form.title && !["mrs", "ms"].includes(form.title)) {
      setField("title", "");
    }
  }, [form.gender_id, form.title, setField]);
  // ----- Guards: ทำให้ “ไม่เด้ง” ก่อนโหลดเสร็จ -----
  useEffect(() => {
    // ไม่มี dogId จริง ๆ → กลับหน้า main
    if (!dogId) {
      message.error("ไม่พบรหัสสุนัข");
      navigate("/sponsor");
      return;
    }

    // ถ้า plan/amount ยังไม่พร้อม ไม่ต้องรีบเด้งออก main → พาไปหน้าเลือกจำนวนของน้องตัวนี้แทน
    if (!planType || !amount) {
      // แทนที่จะเด้งออก layout ให้พากลับไป step ก่อนหน้าใน flow เดิม
      navigate(`/sponsor/${dogId}/amount`, { replace: true });
      return;
    }

    // สำหรับ subscription ต้องล็อกอิน แต่ “รอให้ authLoading จบก่อน”
    if (planType === "subscription" && !authLoading && !isLoggedIn) {
      sessionStorage.setItem("returnTo", `/sponsor/${dogId}/form`);
      navigate("/auth");
    }
  }, [dogId, planType, amount, isLoggedIn, authLoading, navigate]);

  // ถ้ายังไม่มี user แต่ล็อกอินอยู่ → ดึง me (หลัง authLoading จบ)
  useEffect(() => {
    if (planType === "subscription" && !authLoading && isLoggedIn && !user) {
      refresh();
    }
  }, [planType, isLoggedIn, user, authLoading, refresh]);

  // Prefill เมื่อมี user จริง ๆ แล้ว (กันเคสยัง loading)
  useEffect(() => {
    if (user && !authLoading) prefillFromUser(user);
  }, [user, authLoading, prefillFromUser]);

  // ล็อกฟิลด์แค่เมื่อ “สมัครแบบ subscription + ล็อกอิน + user โหลดแล้ว”
  const lockIdentity = useMemo(
    () => planType === "subscription" && isLoggedIn && !authLoading && !!user,
    [planType, isLoggedIn, authLoading, user]
  );

  const handleNextClick = () => {
    // ถ้ายังโหลด auth อยู่ (หลังเพิ่ง login/signup) อย่าเพิ่งไปหน้า payment
    if (planType === "subscription" && authLoading) {
      message.loading("กำลังตรวจสอบสถานะเข้าสู่ระบบ...");
      return;
    }
    if (!dogId) {
      message.error("ไม่พบรหัสสุนัข");
      return;
    }

    const err = validate();
    if (err) {
      message.error(err);
      return;
    }

    // ส่งข้อมูลไปหน้า payment ผ่าน route state (หรือเก็บใน context ก็ได้)
    navigate(`/sponsor/${dogId}/payment`, {
      state: {
        donor: sponsorData,
        updates: updatesPreference,
      },
    });
  };

  const handlePreviousClick = () => navigate(-1);

  // แสดง UI ได้ตามปกติ (ถ้าอยากกันกระพริบช่วง authLoading จะโชว์ skeleton ก็ได้)
  return (
    <div className="sponsor-container">
      <div className="sponsor-card">
        <SponsorDogCard dog={dog} />

        <div className="sponsor-body-warpper">
          <div className="sponsor-progress">
            <Steps
              items={[
                { title: "Select Amount", status: "finish",  icon: <DollarOutlined /> },
                { title: "Verification",  status: "process", icon: <SolutionOutlined /> },
                { title: "Pay",           status: "wait",    icon: <CreditCardOutlined /> },
                { title: "Done",          status: "wait",    icon: <SmileOutlined /> },
              ]}
            />
          </div>

          <div className="sponsor-form-content">
            <h3 className="section-title">ข้อมูลผู้อุปถัมภ์</h3>

            {/* เพศ (Gender) - ไม่บังคับ */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">ระบุเพศ</label>
               <select
                id="gender"
                className="form-input"
                value={form.gender_id ?? ""}
                onChange={(e) => setGenderId(e.target.value ? Number(e.target.value) : null)}
                disabled={gLoading}
              >
                <option value="">-- ไม่ระบุ --</option>
                {genders.map(g => (
                  <option key={g.ID} value={g.ID}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="title" className="form-label">คำนำหน้า</label>
              <select
                id="title"
                className="form-input"
                value={form.title}
                onChange={(e) => setTitleWithSync(e.target.value as "mr" | "mrs" | "ms" | "")}
              >
                <option value="">เลือกคำนำหน้า</option>
                {allowedTitles.includes("mr")   && <option value="mr">นาย</option>}
                {allowedTitles.includes("mrs")  && <option value="mrs">นาง</option>}
                {allowedTitles.includes("ms")   && <option value="ms">นางสาว</option>}
              </select>
            </div>

            {/* ชื่อ-นามสกุล */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">ชื่อ *</label>
                <input
                  id="firstName"
                  type="text"
                  className="form-input"
                  placeholder="กรอกชื่อจริง"
                  value={form.first_name}
                  onChange={(e) => setField("first_name", e.target.value)}
                  disabled={lockIdentity}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">นามสกุล *</label>
                <input
                  id="lastName"
                  type="text"
                  className="form-input"
                  placeholder="กรอกนามสกุล"
                  value={form.last_name}
                  onChange={(e) => setField("last_name", e.target.value)}
                  disabled={lockIdentity}
                />
              </div>
            </div>

            {/* อีเมล / โทรศัพท์ */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">อีเมล *</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="example@email.com"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                disabled={lockIdentity}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">หมายเลขโทรศัพท์ *</label>
              <input
                id="phone"
                type="tel"
                className="form-input"
                placeholder="08X-XXX-XXXX"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                disabled={lockIdentity}
              />
            </div>

            {/* การรับข่าวสาร */}
            <div className="form-group updates-card">
              <div className="updates-card__header">
                <div>
                  <div className="updates-title">การรับข่าวสาร</div>
                  <div className="updates-subtitle">อัปเดตความคืบหน้าสุนัขที่คุณอุปถัมภ์แบบที่คุณสะดวก</div>
                </div>
              </div>

              <div className="updates-row">
                <label htmlFor="wantsUpdates" className="form-label">ต้องการรับข่าวสารหรือไม่?</label>
                <select
                  id="wantsUpdates"
                  className="form-input"
                  value={form.wantsUpdates}
                  onChange={(e) => setField("wantsUpdates", e.target.value as any)}
                >
                  <option value="no">ไม่ต้องการ</option>
                  <option value="yes">ต้องการ</option>
                </select>
              </div>

              {form.wantsUpdates === "yes" && (
                <div className="updates-collapse">
                  <div className="updates-row">
                    <label htmlFor="updateChannel" className="form-label">ช่องทางที่ต้องการ</label>
                    <select
                      id="updateChannel"
                      className="form-input"
                      value={form.updateChannel}
                      onChange={(e) => setField("updateChannel", e.target.value as any)}
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="line">LINE</option>
                    </select>
                  </div>

                  <div className="updates-row">
                    <label htmlFor="updateFrequency" className="form-label">ความถี่</label>
                    <select
                      id="updateFrequency"
                      className="form-input"
                      value={form.updateFrequency}
                      onChange={(e) => setField("updateFrequency", e.target.value as any)}
                    >
                      <option value="weekly">รายสัปดาห์</option>
                      <option value="biweekly">ทุก 2 สัปดาห์</option>
                      <option value="monthly">รายเดือน</option>
                      <option value="quarterly">รายไตรมาส</option>
                    </select>
                  </div>

                  <p className="updates-hint">* คุณสามารถเปลี่ยนการตั้งค่าภายหลังได้ทุกเมื่อ</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sponsor-form-footer">
          <button className="previous-button" onClick={handlePreviousClick}>ย้อนกลับ</button>
          <button
            className="next-button"
            onClick={handleNextClick}
            type="button"
            // ✅ อย่าปิดปุ่มด้วย lockIdentity — ใช้เฉพาะฟิลด์
            disabled={planType === "subscription" && authLoading}
          >
            ดำเนินการต่อ
          </button>
        </div>
      </div>
    </div>
  );
};

export default SponsorFormPage;
