import React from "react";
import "./style.css";
import NavigationBar from "../../../components/NavigationBar";
import { volunteerAPI, skillsAPI } from "../../../services/apis";
import { useAuthUser } from "../../../hooks/useAuth";

/* ---------------- Types ---------------- */

type Skill = { id: number; description: string };

type VolunteerCreatePayload = {
  user_id: number;
  role: string;                 // "none" ok
  address: string;
  another_contact: string;
  health_detail: string;        // optional, allow ""
  working_date: string;         // YYYY-MM-DD
  working_time: string;         // morning | afternoon | evening | flexible
  skill?: string;               // combined skills text
  note: string;                 // motivation reason
};

type FormDataState = {
  user: { id: number; firstName: string; lastName: string };
  address: string;
  emergencyContact: string;
  healthDetail: string;         // optional
  dayForWork: string;
  experience: string;
  motivationReason: string;
};

type StatusKind = "loading" | "none" | "pending" | "approved" | "rejected" | "unknown";

/* ---------------- Utils ---------------- */

const OTHER_TEXT = "อื่นๆ";

const fmtYmd = (d: Date) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

const nextDateForWeekday = (weekday: string): Date => {
  const map: Record<string, number> = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
  };
  const target = map[weekday?.toLowerCase() as keyof typeof map];
  const today = new Date();
  if (target == null) return today;
  const current = today.getDay();
  let diff = target - current;
  if (diff < 0) diff += 7;
  const result = new Date(today);
  result.setDate(today.getDate() + diff);
  return result;
};

/* --------------- Component --------------- */

const VolunteerPage: React.FC = () => {
  const { user: authUser, loading: authLoading, isLoggedIn } = useAuthUser();

  const [formData, setFormData] = React.useState<FormDataState>({
    user: { id: 0, firstName: "", lastName: "" },
    address: "",
    emergencyContact: "",
    healthDetail: "",
    dayForWork: "",
    experience: "",
    motivationReason: "",
  });

  const [skills, setSkills] = React.useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = React.useState<number[]>([]);
  const [otherSkill, setOtherSkill] = React.useState<string>("");

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // status of latest application for this user
  const [status, setStatus] = React.useState<StatusKind>("loading");

  // success overlay after submit
  const [showSuccess, setShowSuccess] = React.useState(false);

  /* -------- Load skills -------- */
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const arr = await skillsAPI.getAll();
        if (alive) setSkills(Array.isArray(arr) ? arr : []);
      } catch (e) {
        console.error("load skills failed", e);
        if (alive) setSkills([]);
      }
    })();
    return () => { alive = false; };
  }, []);

  /* -------- Prefill user -------- */
  React.useEffect(() => {
    if (!authUser) return;
    const id = Number((authUser as any).ID ?? (authUser as any).id ?? 0);
    const first = (authUser as any).first_name ?? (authUser as any).firstname ?? "";
    const last  = (authUser as any).last_name  ?? (authUser as any).lastname  ?? "";

    setFormData(prev => ({
      ...prev,
      user: { id: Number.isFinite(id) ? id : 0, firstName: String(first || ""), lastName: String(last || "") },
    }));
  }, [authUser]);

  /* -------- Fetch status for this user -------- */
  const refreshStatus = React.useCallback(async () => {
    try {
      if (!authUser) {
        setStatus("none");
        return;
      }
      const uid = Number((authUser as any).ID ?? (authUser as any).id ?? 0);
      if (!Number.isFinite(uid) || uid <= 0) {
        setStatus("none");
        return;
      }

      setStatus("loading");
      const res = await volunteerAPI.getStatusByUser(uid);
      const st: StatusKind =
        (res?.status as StatusKind) ??
        (typeof res === "string" ? (res as StatusKind) : "unknown");

      setStatus(st || "unknown");
    } catch {
      setStatus("unknown");
    }
  }, [authUser]);

  React.useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  /* -------- Handlers -------- */

  type FlatField =
    | "address"
    | "emergencyContact"
    | "healthDetail"
    | "dayForWork"
    | "experience"
    | "motivationReason";

  const handleFlatChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name as FlatField]: value }));
    },
    []
  );

  const toggleSkill = React.useCallback((id: number) => {
    setSelectedSkillIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  const isOtherSelected = React.useMemo(() => {
    const otherId = skills.find(s => s.description.trim() === OTHER_TEXT)?.id;
    return otherId != null && selectedSkillIds.includes(otherId);
  }, [skills, selectedSkillIds]);

  /* -------- Submit -------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setShowSuccess(false);

    try {
      if (!isLoggedIn || !formData.user.id) {
        setError("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบ");
        return;
      }
      if (!formData.address.trim()) return setError("โปรดกรอก 'ที่อยู่'");
      if (!formData.emergencyContact.trim()) return setError("โปรดกรอก 'ช่องทางติดต่อฉุกเฉิน'");
      if (!formData.dayForWork) return setError('โปรดเลือก "วันที่สะดวก"');
      if (!formData.experience) return setError('โปรดเลือก "ช่วงเวลา"');
      if (selectedSkillIds.length === 0) return setError("โปรดเลือกความถนัดอย่างน้อย 1 รายการ");
      if (!formData.motivationReason.trim()) return setError("โปรดกรอก 'แรงจูงใจ (note)'");
      if (isOtherSelected && !otherSkill.trim()) return setError("โปรดระบุความถนัด (อื่นๆ)");

      const chosen = selectedSkillIds
        .map(id => skills.find(s => s.id === id)?.description)
        .filter(Boolean) as string[];

      const withoutOther = chosen.filter(d => d !== OTHER_TEXT);
      const skillText = [...withoutOther, ...(otherSkill.trim() ? [otherSkill.trim()] : [])].join(", ");

      const workingDate = nextDateForWeekday(formData.dayForWork);

      const payload: VolunteerCreatePayload = {
        user_id: formData.user.id,
        role: "none",
        address: formData.address.trim(),
        another_contact: formData.emergencyContact.trim(),
        health_detail: formData.healthDetail.trim(), // optional
        working_date: fmtYmd(workingDate),
        working_time: formData.experience,
        skill: skillText,
        note: formData.motivationReason.trim(),
      };

      await volunteerAPI.create(payload as any);

      setStatus("pending");      // optimistic update
      setShowSuccess(true);
      setSelectedSkillIds([]);
      setOtherSkill("");
      setFormData(prev => ({
        user: prev.user,
        address: "",
        emergencyContact: "",
        healthDetail: "",
        dayForWork: "",
        experience: "",
        motivationReason: "",
      }));

      await refreshStatus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการลงทะเบียน");
    } finally {
      setSubmitting(false);
    }
  };

  /* -------- Visibility / Guards -------- */

  const showForm = isLoggedIn && (status === "none" || status === "unknown");

  if (authLoading) {
    return (
      <>
        <NavigationBar />
        <div className="volunteer-page-container">
          <div className="info-message">กำลังตรวจสอบสิทธิ์ผู้ใช้...</div>
        </div>
      </>
    );
  }

  // Guest: force login before access
  if (!isLoggedIn) {
    return (
      <>
        <NavigationBar />
        <div className="volunteer-page-container">
          <div className="status-card login-required">
            <div className="status-header">
              <span className="status-dot login-dot" />
              <h2 className="status-title">ต้องเข้าสู่ระบบก่อน</h2>
            </div>
            <p className="status-desc">คุณต้องเข้าสู่ระบบก่อนจึงจะลงทะเบียนอาสาสมัครได้</p>
            <div className="status-actions">
              <a href="/auth/users" className="submit-btn btn-inline">ไปหน้าเข้าสู่ระบบ</a>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* -------- Render (Logged-in) -------- */

  return (
    <>
      <NavigationBar />
      <div className="volunteer-page-container">
        <form className="volunteer-form" onSubmit={handleSubmit}>
          <h1 className="volunteer-title">ลงทะเบียนอาสาสมัคร</h1>

          {error && <div className="error-message" aria-live="polite">{error}</div>}

          {/* Success overlay card */}
          {showSuccess && (
            <div className="overlay-backdrop" role="dialog" aria-modal="true" onClick={() => setShowSuccess(false)}>
              <div className="overlay-card" onClick={(e) => e.stopPropagation()}>
                <h3 className="overlay-title">ลงทะเบียนสำเร็จ</h3>
                <p className="overlay-sub">ขอบคุณสำหรับการสมัครอาสาสมัคร</p>
                <div className="overlay-actions">
                  <button type="button" className="overlay-btn" onClick={() => setShowSuccess(false)}>
                    ปิด
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATUS CARD (blocks form if not "none"/"unknown") */}
          {status !== "loading" && !showForm && (
            <div className={`status-card ${status}`}>
              {status === "pending" && (
                <>
                  <h2>กำลังรอการอนุมัติ</h2>
                  <p>คำขอของคุณอยู่ในสถานะ <b>รอดำเนินการ</b></p>
                  <p>โดยปกติใช้เวลา 1–2 วันทำการ</p>
                  <p>กรุณาตรวจสอบหน้านี้อีกครั้ง</p>
                </>
              )}
              {status === "approved" && (
                <>
                  <h2>อนุมัติแล้ว</h2>
                  <p>ขอบคุณ! คำขอของคุณ <b>ได้รับการอนุมัติ</b> แล้ว</p>
                  <p>ทีมงานจะติดต่อกลับตามข้อมูลที่คุณระบุ</p>
                </>
              )}
              {status === "rejected" && (
                <>
                  <h2>คำขอไม่ผ่าน</h2>
                  <p>คำขอของคุณถูกระบุเป็น <b>ไม่ผ่านการอนุมัติ</b></p>
                  <p>คุณสามารถติดต่อทีมงานเพื่อขอข้อมูลเพิ่มเติมได้</p>
                </>
              )}

              <div className="status-actions">
                <button type="button" className="submit-btn btn-inline" onClick={refreshStatus}>
                  อัปเดตสถานะ
                </button>
              </div>
            </div>
          )}

          {/* Loading status hint */}
          {status === "loading" && (
            <div className="info-message">กำลังตรวจสอบสถานะการลงทะเบียน...</div>
          )}

          {/* FORM (only if not already registered) */}
          {showForm && (
            <>
              {/* Name (readonly) */}
              <div className="form-row">
                <div className="form-group">
                  <label>ชื่อ</label>
                  <input type="text" value={formData.user.firstName} readOnly disabled />
                </div>
                <div className="form-group">
                  <label>นามสกุล</label>
                  <input type="text" value={formData.user.lastName} readOnly disabled />
                </div>
              </div>

              {/* Address */}
              <div className="form-group">
                <label htmlFor="address">ที่อยู่ <span className="required">*</span></label>
                <input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleFlatChange}
                  type="text"
                  placeholder="ระบุที่อยู่"
                  required
                />
              </div>

              {/* Emergency + Health */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="emergencyContact">ช่องทางติดต่อฉุกเฉิน <span className="required">*</span></label>
                  <input
                    type="text"
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleFlatChange}
                    placeholder="ชื่อ/เบอร์/ช่องทาง"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="healthDetail">ข้อมูลสุขภาพ (ไม่บังคับ)</label>
                  <input
                    id="healthDetail"
                    name="healthDetail"
                    value={formData.healthDetail}
                    onChange={handleFlatChange}
                    type="text"
                    placeholder="เช่น แพ้อาหาร/ยา ฯลฯ (ถ้ามี)"
                  />
                </div>
              </div>

              {/* Day / Time */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dayForWork">วันที่สะดวก <span className="required">*</span></label>
                  <select
                    id="dayForWork"
                    name="dayForWork"
                    value={formData.dayForWork}
                    onChange={handleFlatChange}
                    required
                  >
                    <option value="">เลือกวัน</option>
                    <option value="sunday">วันอาทิตย์</option>
                    <option value="monday">วันจันทร์</option>
                    <option value="tuesday">วันอังคาร</option>
                    <option value="wednesday">วันพุธ</option>
                    <option value="thursday">วันพฤหัสบดี</option>
                    <option value="friday">วันศุกร์</option>
                    <option value="saturday">วันเสาร์</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="experience">ช่วงเวลา <span className="required">*</span></label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleFlatChange}
                    required
                  >
                    <option value="">เลือกช่วงเวลา</option>
                    <option value="morning">เช้า (6:00-12:00)</option>
                    <option value="afternoon">บ่าย (12:00-18:00)</option>
                    <option value="evening">เย็น (18:00-20:00)</option>
                    <option value="flexible">ยืดหยุ่นได้</option>
                  </select>
                </div>
              </div>

              {/* Skills chip selector */}
              <div className="form-group">
                <label>ความถนัด (เลือกได้หลายรายการ) <span className="required">*</span></label>

                <div className="skills-grid" role="group" aria-label="เลือกความถนัด">
                  {skills.length === 0 && (
                    <div className="info-message">กำลังโหลดรายการความถนัด หรือยังไม่มีรายการ</div>
                  )}
                  {skills.map((s) => {
                    const checked = selectedSkillIds.includes(s.id);
                    return (
                      <label key={s.id} className={`skill-pill ${checked ? "is-checked" : ""}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSkill(s.id)}
                        />
                        <span>{s.description}</span>
                      </label>
                    );
                  })}
                </div>

                {isOtherSelected && (
                  <input
                    type="text"
                    value={otherSkill}
                    onChange={(e) => setOtherSkill(e.target.value)}
                    placeholder="โปรดระบุ (อื่นๆ)"
                    className="other-skill-input"
                  />
                )}
              </div>

              {/* Motivation */}
              <div className="form-group">
                <label htmlFor="motivationReason">แรงจูงใจ (note) <span className="required">*</span></label>
                <textarea
                  id="motivationReason"
                  name="motivationReason"
                  value={formData.motivationReason}
                  onChange={handleFlatChange}
                  rows={4}
                  placeholder="เล่าเกี่ยวกับแรงจูงใจของคุณเพื่อการตัดสินใจ"
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={submitting || authLoading}>
                {submitting ? "กำลังส่ง..." : "ยืนยันการลงทะเบียน"}
              </button>
            </>
          )}
        </form>
      </div>
    </>
  );
};

export default VolunteerPage;
