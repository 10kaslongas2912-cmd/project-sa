import { useEffect, useState } from "react";
import { adopterAPI } from "../../../../services/apis";
import type { MyCurrentAdoption } from "../../../../interfaces/Adoption";
import { useAuthUser } from "../../../../hooks/useAuth";
import "./style.css";

export default function MyAdoptionsPage() {
  const { user, loading: authLoading, isLoggedIn } = useAuthUser();
  const [adoptions, setAdoptions] = useState<MyCurrentAdoption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn || authLoading) return;

    (async () => {
      try {
        setLoading(true);
        const res = await adopterAPI.getMyCurrentAdoptions();
        setAdoptions(res?.data || []);
        setError(null);
      } catch (e: any) {
        setError(e?.message || "ไม่สามารถโหลดข้อมูลการรับเลี้ยงได้");
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoggedIn, authLoading]);

  if (authLoading || loading) return <p className="loading">กำลังโหลด...</p>;
  if (!isLoggedIn) return <p className="error">กรุณาเข้าสู่ระบบก่อน</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="my-adoptions-container">
      <h2 className="page-title">🐶 สุนัขที่ฉันรับเลี้ยง</h2>

      {adoptions.length === 0 ? (
        <p className="no-data">คุณยังไม่มีสุนัขที่กำลังรับเลี้ยง</p>
      ) : (
        <div className="dog-list">
          {adoptions.map((adoption) => (
            <div key={adoption.ID} className="dog-card">
              {adoption.dog ? (
                <>
                  <img
                    src={adoption.dog.photo_url || "/static/no-dog.png"}
                    alt={adoption.dog.name}
                    className="dog-photo"
                  />
                  <h3 className="dog-name">{adoption.dog.name}</h3>
                  
                  <p className="adoption-date">
                    วันที่รับเลี้ยง:{" "}
                    {new Date(adoption.CreatedAt).toLocaleDateString("th-TH")}
                  </p>
                </>
              ) : (
                <p>ไม่พบข้อมูลสุนัข</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
