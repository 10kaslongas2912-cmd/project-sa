// src/pages/dashboard/Dogs.tsx
import React, { useMemo, useRef, useState } from "react";
import { useDogs } from "../../../hooks/useDogs";
import { usePersonalities } from "../../../hooks/usePersonalities";
import type { PersonalityInterface } from "../../../interfaces/Personality";
import type { DogInterface } from "../../../interfaces/Dog";
import "./style.css";

/** ฟอร์มของหน้าจอนี้ใช้ชื่อฟิลด์ "ตามฐานข้อมูลจริง" */
type FormData = {
  photo_url: string;
  name: string;
  date_of_birth: string;
  breed_id: number | "";        // เลือกพันธุ์ควรมีลิสต์พันธุ์จาก API (ยังไม่ทราบ endpoint)
  animal_sex_id: number | "";   // ควรมีลิสต์เพศจาก API (ยังไม่ทราบ endpoint)
  animal_size_id: number | "";  // ควรมีลิสต์ขนาดจาก API (ยังไม่ทราบ endpoint)
  personality_ids: string[];    // เก็บเป็น string ID ของ personality
};

const DogManagementSystem: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ดึงข้อมูลสุนัข & บุคลิกจาก API
  const { dogs: apiDogs, loading, error } = useDogs();
  const {
    personalities: allPersonalities,
    loading: loadingP,
    error: errorP,
  } = usePersonalities();

  // ค้นหา
  const [searchTerm, setSearchTerm] = useState("");

  // โมดอลฟอร์ม
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDog, setEditingDog] = useState<DogInterface | null>(null);

  // ฟอร์มใช้ชื่อฟิลด์ตามฐานข้อมูลตรงๆ
  const [formData, setFormData] = useState<FormData>({
    photo_url: "",
    name: "",
    date_of_birth: "",
    breed_id: "",
    animal_sex_id: "",
    animal_size_id: "",
    personality_ids: [],
  });

  // แปลงข้อมูล “สำหรับแสดงผล” อย่างเบาๆ โดยไม่เปลี่ยนชื่อฟิลด์ต้นทาง
  const viewDogs = useMemo(() => {
    const list = Array.isArray(apiDogs) ? apiDogs : [];
    return list.map((d) => ({
      id: d.ID,
      name: d.name,
      photo_url: d.photo_url || "",
      breed_name: d.breed?.name || "ไม่ระบุ",
      sex_name: d.animal_sex?.name || "-",
      size_name: d.animal_size?.name || "-",
      date_of_birth: d.date_of_birth || "",
      personality_names: (d.dog_personalities || [])
        .map((dp) => dp?.personality?.name)
        .filter(Boolean) as string[],
    }));
  }, [apiDogs]);

  // ค้นหาจาก ชื่อ / พันธุ์
  const filteredDogs = useMemo(() => {
    if (!searchTerm.trim()) return viewDogs;
    const q = searchTerm.toLowerCase();
    return viewDogs.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.breed_name.toLowerCase().includes(q)
    );
  }, [viewDogs, searchTerm]);

  // ----- ฟังก์ชันฟอร์ม (ใช้ค่าฐานข้อมูลตรงๆ) -----
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      // ตัวเลขบางช่อง (id) เก็บเป็น number หรือ "" (ว่าง)
      if (["breed_id", "animal_sex_id", "animal_size_id"].includes(name)) {
        return {
          ...prev,
          [name]: value === "" ? "" : Number(value),
        } as FormData;
      }
      return { ...prev, [name]: value } as FormData;
    });
  };

  const handlePersonalityChange = (idStr: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      personality_ids: checked
        ? [...prev.personality_ids, idStr]
        : prev.personality_ids.filter((x) => x !== idStr),
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setFormData((prev) => ({
        ...prev,
        photo_url: reader.result as string,
      }));
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData({
      photo_url: "",
      name: "",
      date_of_birth: "",
      breed_id: "",
      animal_sex_id: "",
      animal_size_id: "",
      personality_ids: [],
    });
    setEditingDog(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEditDog = (dog: DogInterface) => {
    setEditingDog(dog);
    setFormData({
      photo_url: dog.photo_url || "",
      name: dog.name || "",
      date_of_birth: dog.date_of_birth || "",
      breed_id: dog.breed_id ?? "",
      animal_sex_id: dog.animal_sex_id ?? "",
      animal_size_id: dog.animal_size_id ?? "",
      personality_ids: (dog.dog_personalities || [])
        .map((dp) => dp?.personality?.ID)
        .filter(Boolean)
        .map(String),
    });
    setIsFormOpen(true);
  };

  // TODO: ต่อ API จริงเมื่อพร้อม
  const handleCreateDog = async () => {
    if (!formData.name.trim()) {
      alert("กรุณากรอกชื่อสุนัข");
      return;
    }
    // await dogAPI.create(formData)
    // หลังบันทึก: ปิด modal และรีเฟรชรายการ (แล้วแต่กลยุทธ์ refresh)
    setIsFormOpen(false);
    resetForm();
  };

  const handleUpdateDog = async () => {
    if (!formData.name.trim() || !editingDog) return;
    // await dogAPI.update(editingDog.ID, formData)
    setIsFormOpen(false);
    resetForm();
  };

  const handleDeleteDog = async (id: number) => {
    if (!window.confirm("คุณต้องการลบข้อมูลสุนัขนี้ใช่หรือไม่?")) return;
    // await dogAPI.delete(id)
    // รีเฟรชรายการ
  };

  // เครื่องคิดอายุ (โชว์ได้ถ้ามี date_of_birth)
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "";
    const today = new Date();
    const birth = new Date(birthDate);
    const diffDays = Math.ceil(
      Math.abs(today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months > 0 ? `${months} เดือน` : `${diffDays} วัน`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return remainingMonths > 0 ? `${years} ปี ${remainingMonths} เดือน` : `${years} ปี`;
    }
  };

  return (
    <div className="dms-container">
      {/* Header */}
      <div className="dms-header">
        <h1 className="dms-title">จัดการข้อมูลสุนัข</h1>
        <div className="dms-header-actions">
          <input
            type="text"
            placeholder="ค้นหาสุนัข..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dms-search"
          />
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="dms-btn dms-btn-primary"
          >
            + เพิ่มสุนัขใหม่
          </button>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="dms-empty">
          <div className="dms-empty-icon">⏳</div>
          <p className="dms-empty-text">กำลังโหลดข้อมูลน้องหมา...</p>
          <p className="dms-empty-sub">ดึงข้อมูลจากฐานข้อมูล</p>
        </div>
      )}
      {!loading && error && (
        <div className="dms-empty" role="alert">
          <div className="dms-empty-icon">⚠️</div>
          <p className="dms-empty-text">{error}</p>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <div className="dms-content">
          <div className="dms-grid">
            {filteredDogs.length === 0 ? (
              <div className="dms-empty">
                <div className="dms-empty-icon">🐕</div>
                <p className="dms-empty-text">ยังไม่มีข้อมูลสุนัข</p>
                <p className="dms-empty-sub">
                  เพิ่มข้อมูลจากฝั่งแอดมิน หรือเช็ค API
                </p>
              </div>
            ) : (
              filteredDogs.map((dog) => (
                <div key={dog.id} className="dms-card">
                  <div className="dms-card-imgwrap">
                    {dog.photo_url ? (
                      <img
                        src={dog.photo_url}
                        alt={dog.name}
                        className="dms-card-img"
                      />
                    ) : (
                      <div className="dms-noimg">
                        <span className="dms-noimg-icon">📷</span>
                        <span>ไม่มีรูปภาพ</span>
                      </div>
                    )}
                  </div>

                  <div className="dms-card-body">
                    <h3 className="dms-dog-name">{dog.name}</h3>

                    <div className="dms-details">
                      <div className="dms-detail">
                        <span className="dms-detail-label">สายพันธุ์:</span>
                        <span className="dms-detail-val">
                          {dog.breed_name}
                        </span>
                      </div>

                      <div className="dms-detail">
                        <span className="dms-detail-label">เพศ:</span>
                        <span className="dms-detail-val">{dog.sex_name}</span>
                      </div>

                      <div className="dms-detail">
                        <span className="dms-detail-label">ขนาด:</span>
                        <span className="dms-detail-val">{dog.size_name}</span>
                      </div>

                      {dog.date_of_birth && (
                        <div className="dms-detail">
                          <span className="dms-detail-label">อายุ:</span>
                          <span className="dms-detail-val">
                            {calculateAge(dog.date_of_birth)}
                          </span>
                        </div>
                      )}

                      {dog.personality_names.length > 0 && (
                        <div className="dms-personality">
                          <span className="dms-detail-label">บุคลิก:</span>
                          <div className="dms-tags">
                            {dog.personality_names.map((nm, idx) => (
                              <span key={idx} className="dms-tag">
                                {nm}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="dms-card-actions">
                      <button
                        onClick={() =>
                          apiDogs &&
                          handleEditDog(
                            apiDogs.find((d) => d.ID === dog.id) as DogInterface
                          )
                        }
                        className="dms-btn dms-btn-edit"
                      >
                        ✏️ แก้ไข
                      </button>
                      <button
                        onClick={() => handleDeleteDog(dog.id)}
                        className="dms-btn dms-btn-danger"
                      >
                        🗑️ ลบ
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form Modal */}
          {isFormOpen && (
            <div className="dms-modal">
              <div className="dms-modal-content">
                <div className="dms-modal-header">
                  <h2 className="dms-modal-title">
                    {editingDog ? "แก้ไขข้อมูลสุนัข" : "เพิ่มสุนัขใหม่"}
                  </h2>
                  <button
                    onClick={() => {
                      setIsFormOpen(false);
                      resetForm();
                    }}
                    className="dms-btn dms-btn-close"
                  >
                    ✕
                  </button>
                </div>

                <div className="dms-form">
                  <div className="dms-form-grid">
                    {/* Image Upload */}
                    <div className="dms-upload-col">
                      <label className="dms-label">รูปภาพ</label>
                      <div className="dms-upload">
                        {formData.photo_url ? (
                          <div className="dms-preview">
                            <img
                              src={formData.photo_url}
                              alt="Preview"
                              className="dms-preview-img"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((p) => ({ ...p, photo_url: "" }))
                              }
                              className="dms-btn dms-btn-imgremove"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="dms-upload-placeholder">
                            <span className="dms-upload-icon">📷</span>
                            <span>คลิกเพื่อเพิ่มรูปภาพ</span>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="dms-file"
                        />
                      </div>
                    </div>

                    {/* Fields */}
                    <div className="dms-fields">
                      <div className="dms-row">
                        <div className="dms-group">
                          <label className="dms-label">ชื่อ *</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="ชื่อสุนัข"
                            className="dms-input"
                          />
                        </div>

                        <div className="dms-group">
                          <label className="dms-label">วันเกิด</label>
                          <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleInputChange}
                            className="dms-input"
                          />
                        </div>
                      </div>

                      {/* หมายเหตุ: ดรอปดาวน์ 3 ตัวนี้ควรได้ลิสต์จาก API จริง (breed/sex/size) */}
                      <div className="dms-row">
                        <div className="dms-group">
                          <label className="dms-label">สายพันธุ์ (breed_id)</label>
                          <input
                            type="number"
                            name="breed_id"
                            value={formData.breed_id}
                            onChange={handleInputChange}
                            placeholder="เช่น 1, 2, 3 ..."
                            className="dms-input"
                          />
                        </div>

                        <div className="dms-group">
                          <label className="dms-label">เพศ (animal_sex_id)</label>
                          <input
                            type="number"
                            name="animal_sex_id"
                            value={formData.animal_sex_id}
                            onChange={handleInputChange}
                            placeholder="เช่น 1=ผู้, 2=เมีย (ตามตารางจริง)"
                            className="dms-input"
                          />
                        </div>

                        <div className="dms-group">
                          <label className="dms-label">ขนาด (animal_size_id)</label>
                          <input
                            type="number"
                            name="animal_size_id"
                            value={formData.animal_size_id}
                            onChange={handleInputChange}
                            placeholder="เช่น 1=เล็ก, 2=กลาง, 3=ใหญ่"
                            className="dms-input"
                          />
                        </div>
                      </div>

                      <div className="dms-personalities">
                        <label className="dms-label">ลักษณะนิสัย</label>
                        {loadingP && (
                          <div style={{ color: "#64748b" }}>
                            กำลังโหลดลิสต์บุคลิก…
                          </div>
                        )}
                        {errorP && (
                          <div style={{ color: "#b91c1c" }}>{errorP}</div>
                        )}
                        {!loadingP && !errorP && (
                          <div className="dms-checkgrid">
                            {allPersonalities.map((p: PersonalityInterface) => {
                              const idStr = String(p.ID);
                              const checked =
                                formData.personality_ids.includes(idStr);
                              return (
                                <label key={p.ID} className="dms-checklabel">
                                  <input
                                    type="checkbox"
                                    className="dms-checkbox"
                                    checked={checked}
                                    onChange={(e) =>
                                      handlePersonalityChange(
                                        idStr,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <span className="dms-checktext">{p.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="dms-form-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFormOpen(false);
                        resetForm();
                      }}
                      className="dms-btn dms-btn-gray"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={editingDog ? handleUpdateDog : handleCreateDog}
                      className="dms-btn dms-btn-primary"
                    >
                      {editingDog ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มสุนัข"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* End Modal */}
        </div>
      )}
    </div>
  );
};

export default DogManagementSystem;
