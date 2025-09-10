import React from "react";
import { volunteerAPI } from "../../../services/apis";
import "./style.css";

/** Keep the type light and tolerant to BE shapes */
type StatusKind = "pending" | "approved" | "rejected" | "none" | "unknown";

type Volunteer = {
  id: number;
  user?: {
    id: number;
    username?: string;
    firstname?: string;
    lastname?: string;
  };
  address?: string;
  another_contact?: string;
  working_date?: string;   // expects "YYYY-MM-DD" or ISO string
  working_time?: string;
  skill?: string | null;
  note?: string;
  status_fv?: { id: number; status: string }; // preloaded on BE
  created_at?: string;
};

const statusOf = (v: Volunteer): StatusKind => {
  const s = String(v?.status_fv?.status ?? "").toLowerCase();
  if (s === "pending" || s === "approved" || s === "rejected") return s;
  return "unknown";
};

const displayName = (v: Volunteer) => {
  const fn = v.user?.firstname ?? "";
  const ln = v.user?.lastname ?? "";
  const uname = v.user?.username ?? "";
  const full = [fn, ln].filter(Boolean).join(" ").trim();
  return full || uname || `User#${v.user?.id ?? "-"}`;
};

/** ---------- Weekday helpers ---------- */
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Parse "YYYY-MM-DD" (or ISO-ish) to a Date without TZ shift for plain Y-M-D
function parseYMDToLocalDate(s?: string): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) {
    const y = Number(m[1]), mo = Number(m[2]) - 1, d = Number(m[3]);
    const dt = new Date(y, mo, d); // local date (avoids UTC shift)
    return isNaN(dt.getTime()) ? null : dt;
  }
  const dt = new Date(s);
  return isNaN(dt.getTime()) ? null : dt;
}

function weekdayOf(dateStr?: string): string {
  const dt = parseYMDToLocalDate(dateStr);
  return dt ? WEEKDAYS[dt.getDay()] : "-";
}
/** ------------------------------------ */

const VolunteerApprovalsPage: React.FC = () => {
  const [list, setList] = React.useState<Volunteer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updatingId, setUpdatingId] = React.useState<number | null>(null);
  const [filter, setFilter] = React.useState<StatusKind | "all">("pending");
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await volunteerAPI.getAll();
      const raw = (res as any)?.data?.data ?? (res as any)?.data ?? res;
      const arr: Volunteer[] = Array.isArray(raw)
        ? raw.map((x: any) => ({
            id: Number(x.id ?? x.ID ?? 0),
            user: x.user ?? x.User,
            address: x.address ?? x.Address,
            another_contact: x.another_contact ?? x.AnotherContact,
            working_date: x.working_date ?? x.WorkingDate,
            working_time: x.working_time ?? x.WorkingTime,
            skill: x.skill ?? x.Skill,
            note: x.note ?? x.Note,
            status_fv: x.status_fv ?? x.StatusFV,
            created_at: x.created_at ?? x.CreatedAt,
          }))
        : [];
      // newest first
      arr.sort((a, b) => {
        const ta = new Date(a.created_at ?? 0).getTime();
        const tb = new Date(b.created_at ?? 0).getTime();
        if (ta && tb) return tb - ta;
        return b.id - a.id;
      });
      setList(arr);
    } catch (e: any) {
      console.error("load volunteers failed:", e?.response?.data ?? e);
      setError("โหลดรายชื่ออาสาสมัครไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const doUpdate = async (id: number, status: "approved" | "rejected" | "pending") => {
    setUpdatingId(id);
    setError(null);
    try {
      await volunteerAPI.updateStatus(id, status);
      // optimistic update
      setList((prev) =>
        prev.map((v) =>
          v.id === id ? { ...v, status_fv: { ...(v.status_fv ?? { id: 0 }), status } } : v
        )
      );
    } catch (e: any) {
      console.error("updateStatus failed:", e?.response?.data ?? e);
      setError(e?.response?.data?.error ?? "อัปเดตสถานะไม่สำเร็จ");
      alert(e?.response?.data?.error ?? "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = list.filter((v) => (filter === "all" ? true : statusOf(v) === filter));

  return (
    <>
      <div className="volunteer-page-container admin-approvals">
        <div className="volunteer-form">
          <h1 className="volunteer-title">อนุมัติอาสาสมัคร</h1>

          {/* toolbar */}
          <div className="admin-toolbar">
            <div className="filter-group">
              <label>แสดง:</label>
              <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
                <option value="pending">รออนุมัติ</option>
                <option value="approved">อนุมัติแล้ว</option>
                <option value="rejected">ไม่อนุมัติ</option>
                <option value="all">ทั้งหมด</option>
              </select>
            </div>
            <button className="submit-btn" onClick={load} disabled={loading}>
              รีเฟรช
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">กำลังโหลด...</div>
          ) : filtered.length === 0 ? (
            <div className="empty">ไม่พบรายการ</div>
          ) : (
            <div className="cards">
              {filtered.map((v) => {
                const s = statusOf(v);
                return (
                  <div key={v.id} className="card">
                    <div className="card-row head">
                      <div className="name">{displayName(v)}</div>
                      <span className={`badge ${s}`}>{s.toUpperCase()}</span>
                    </div>

                    <div className="card-row">
                      <div className="label">วันที่สะดวก</div>
                      <div className="value">
                        {weekdayOf(v.working_date)}
                        {v.working_time ? ` • ${v.working_time}` : ""}
                      </div>
                    </div>

                    <div className="card-row">
                      <div className="label">ทักษะ</div>
                      <div className="value">{v.skill || "-"}</div>
                    </div>

                    <div className="card-row">
                      <div className="label">ที่อยู่</div>
                      <div className="value">{v.address || "-"}</div>
                    </div>

                    <div className="card-row">
                      <div className="label">ติดต่อฉุกเฉิน</div>
                      <div className="value">{v.another_contact || "-"}</div>
                    </div>

                    <div className="actions">
                      <button
                        className="btn reject"
                        onClick={() => doUpdate(v.id, "rejected")}
                        disabled={updatingId === v.id || s === "rejected"}
                        title="Reject"
                      >
                        ไม่อนุมัติ
                      </button>
                      <button
                        className="btn approve"
                        onClick={() => doUpdate(v.id, "approved")}
                        disabled={updatingId === v.id || s === "approved"}
                        title="Approve"
                      >
                        อนุมัติ
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VolunteerApprovalsPage;
