// src/pages/dashboard/Dogs.tsx
import React, { useMemo, useRef, useState } from "react";
import { useDogs } from "../../../hooks/useDogs";
import { usePersonalities } from "../../../hooks/usePersonalities";
import { useBreeds } from "../../../hooks/useBreeds";
import { useAnimalSexes } from "../../../hooks/useAnimalSexes";
import { useAnimalSizes } from "../../../hooks/useAnimalSizes";
import type { PersonalityInterface } from "../../../interfaces/Personality";
import type { DogInterface } from "../../../interfaces/Dog";
import { ageText } from "../../../utils/date";
import { dogAPI } from "../../../services/apis"; // ⬅️ เชื่อม API ที่นี่
import "./style.css";

type FormData = {
  photo_url: string;
  name: string;
  date_of_birth: string;
  breed_id: number | "";
  animal_sex_id: number | "";
  animal_size_id: number | "";
  personality_ids: string[]; // เก็บเป็น string ในฟอร์ม
};

const DogManagementSystem: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ดึงข้อมูลหลัก
  const { dogs: apiDogs, loading: loadingDogs, error: errorDogs, refetch } = useDogs();
  const { personalities: allPersonalities, loading: loadingP, error: errorP } = usePersonalities();

  // ดึงตัวเลือก dropdown จาก DB
  const { breeds, loading: loadingBreeds, error: errorBreeds } = useBreeds();
  const { sexes,  loading: loadingSexes,  error: errorSexes  } = useAnimalSexes();
  const { sizes,  loading: loadingSizes,  error: errorSizes  } = useAnimalSizes();

  // ค้นหา
  const [searchTerm, setSearchTerm] = useState("");

  // โมดอลฟอร์ม
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDog, setEditingDog] = useState<DogInterface | null>(null);

  // สถานะส่งฟอร์ม
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    photo_url: "",
    name: "",
    date_of_birth: "",
    breed_id: "",
    animal_sex_id: "",
    animal_size_id: "",
    personality_ids: [],
  });

  // แปลงข้อมูลสำหรับแสดงผล (เบาๆ)
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

  // ฟิลเตอร์ชื่อ/พันธุ์
  const filteredDogs = useMemo(() => {
    if (!searchTerm.trim()) return viewDogs;
    const q = searchTerm.toLowerCase();
    return viewDogs.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.breed_name.toLowerCase().includes(q)
    );
  }, [viewDogs, searchTerm]);

  // ----- ฟังก์ชันฟอร์ม -----
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (["breed_id", "animal_sex_id", "animal_size_id"].includes(name)) {
        return { ...prev, [name]: value === "" ? "" : Number(value) } as FormData;
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

  // ---------- Helpers: สร้าง payload ให้ตรง backend ----------
  const toNumberArray = (arr: string[]) =>
    arr.map((x) => Number(x)).filter((n) => Number.isFinite(n)) as number[];

  // สร้าง payload สำหรับ POST /dogs
  const buildCreatePayload = () => {
    const payload: any = {
      name: formData.name.trim(),
      animal_sex_id: formData.animal_sex_id || undefined,
      animal_size_id: formData.animal_size_id || undefined,
      breed_id: formData.breed_id || undefined,
      kennel_id: 1, // ถ้ามีหน้าเลือก kennel ใส่จริงแทนค่า default นี้
      date_of_birth: formData.date_of_birth || undefined,
      // ถ้าคุณมีช่องรับวันรับเข้า ให้แมปเป็น date_arrived ที่ backend รับ
      // date_arrived: ...,
      is_adopted: false,
      photo_url: formData.photo_url || "",
      character: "",
      personality_ids: toNumberArray(formData.personality_ids),
    };
    // ลบ key ที่เป็น undefined ออก (กันส่งค่า null/ว่างเกินจำเป็น)
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
    return payload;
  };

  // เปรียบเทียบเพื่อ PATCH เฉพาะฟิลด์ที่เปลี่ยน
  const buildUpdatePayload = (original: DogInterface) => {
    const patch: any = {};
    const setIfChanged = <T,>(key: string, oldVal: T, newVal: T) => {
      if (newVal !== oldVal) patch[key] = newVal;
    };

    setIfChanged("name", original.name || "", formData.name.trim());
    setIfChanged("animal_sex_id", original.animal_sex_id ?? null, (formData.animal_sex_id as number) ?? null);
    setIfChanged("animal_size_id", original.animal_size_id ?? null, (formData.animal_size_id as number) ?? null);
    setIfChanged("breed_id", original.breed_id ?? null, (formData.breed_id as number) ?? null);
    setIfChanged("date_of_birth", original.date_of_birth || "", formData.date_of_birth || "");
    setIfChanged("photo_url", original.photo_url || "", formData.photo_url || "");

    // personalities: เทียบเป็น set
    const before = new Set<string>(
      (original.dog_personalities || [])
        .map((dp) => dp?.personality?.ID)
        .filter(Boolean)
        .map(String)
    );
    const after = new Set<string>(formData.personality_ids);
    let diff = false;
    if (before.size !== after.size) diff = true;
    else {
      for (const v of before) if (!after.has(v)) { diff = true; break; }
    }
    if (diff) {
      patch.personality_ids = toNumberArray(formData.personality_ids);
    }

    // ลบ key ที่เป็น "", null, undefined ที่ไม่ใช่ pointer
    Object.keys(patch).forEach((k) => {
      if (patch[k] === "" || patch[k] === undefined) delete patch[k];
    });
    return patch;
  };

  // ---------- CRUD ----------
  const handleCreateDog = async () => {
    if (!formData.name.trim()) {
      alert("กรุณากรอกชื่อสุนัข");
      return;
    }
    try {
      setSubmitting(true);
      const payload = buildCreatePayload();
      await dogAPI.create(payload); // POST /dogs  → backend ส่ง object ตรง ๆ
      alert("เพิ่มสุนัขสำเร็จ");
      await refetch();
      setIsFormOpen(false);
      resetForm();
    } catch (e: any) {
      alert(e?.message || "เพิ่มสุนัขไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateDog = async () => {
    if (!editingDog) return;
    if (!formData.name.trim()) {
      alert("กรุณากรอกชื่อสุนัข");
      return;
    }
    try {
      setSubmitting(true);
      const patch = buildUpdatePayload(editingDog);
      if (Object.keys(patch).length === 0) {
        alert("ไม่มีข้อมูลที่เปลี่ยนแปลง");
        return;
      }
      await dogAPI.update(editingDog.ID, patch); // PATCH /dogs/:id
      alert("บันทึกการเปลี่ยนแปลงสำเร็จ");
      setIsFormOpen(false);
      resetForm();
      window.location.reload();
    } catch (e: any) {
      alert(e?.message || "อัปเดตไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDog = async (id: number) => {
    if (!window.confirm("คุณต้องการลบข้อมูลสุนัขนี้ใช่หรือไม่?")) return;
    try {
      setSubmitting(true);
      await dogAPI.delete(id); // DELETE /dogs/:id → 204 No Content
      alert("ลบสำเร็จ");
      window.location.reload();
    } catch (e: any) {
      alert(e?.message || "ลบไม่สำเร็จ");
    } finally {
      setSubmitting(false);
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
            onClick={() => { resetForm(); setIsFormOpen(true); }}
            className="dms-btn dms-btn-primary"
            disabled={submitting}
          >
            + เพิ่มสุนัขใหม่
          </button>
        </div>
      </div>

      {/* Loading / Error */}
      {loadingDogs && (
        <div className="dms-empty">
          <div className="dms-empty-icon">⏳</div>
          <p className="dms-empty-text">กำลังโหลดข้อมูลน้องหมา...</p>
          <p className="dms-empty-sub">ดึงข้อมูลจากฐานข้อมูล</p>
        </div>
      )}
      {!loadingDogs && errorDogs && (
        <div className="dms-empty" role="alert">
          <div className="dms-empty-icon">⚠️</div>
          <p className="dms-empty-text">{errorDogs}</p>
        </div>
      )}

      {/* Main Content */}
      {!loadingDogs && !errorDogs && (
        <div className="dms-content">
          <div className="dms-grid">
            {filteredDogs.length === 0 ? (
              <div className="dms-empty">
                <div className="dms-empty-icon">🐕</div>
                <p className="dms-empty-text">ยังไม่มีข้อมูลสุนัข</p>
                <p className="dms-empty-sub">เพิ่มข้อมูลจากฝั่งแอดมิน หรือเช็ค API</p>
              </div>
            ) : (
              filteredDogs.map((dog) => (
                <div key={dog.id} className="dms-card">
                  <div className="dms-card-imgwrap">
                    {dog.photo_url ? (
                      <img src={dog.photo_url} alt={dog.name} className="dms-card-img" />
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
                        <span className="dms-detail-val">{dog.breed_name}</span>
                      </div>

                      <div className="dms-detail">
                        <span className="dms-detail-label">เพศ:</span>
                        <span className="dms-detail-val">{dog.sex_name}</span>
                      </div>

                      <div className="dms-detail">
                        <span className="dms-detail-label">ขนาด:</span>
                        <span className="dms-detail-val">{dog.size_name}</span>
                      </div>

                      <div className="dms-detail">
                        <span className="dms-detail-label">อายุ:</span>
                        <span className="dms-detail-val">{ageText(dog.date_of_birth)}</span>
                      </div>

                      <div className="dms-detail">
                        <span className="dms-detail-label">วันเกิด:</span>
                        <span className="dms-detail-val">{dog.date_of_birth}</span>
                      </div>

                      {dog.personality_names.length > 0 && (
                        <div className="dms-personality">
                          <span className="dms-detail-label">บุคลิก:</span>
                          <div className="dms-tags">
                            {dog.personality_names.map((nm, idx) => (
                              <span key={idx} className="dms-tag">{nm}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="dms-card-actions">
                      <button
                        onClick={() =>
                          apiDogs && handleEditDog(apiDogs.find((d) => d.ID === dog.id) as DogInterface)
                        }
                        className="dms-btn dms-btn-edit"
                        disabled={submitting}
                      >
                        ✏️ แก้ไข
                      </button>
                      <button
                        onClick={() => handleDeleteDog(dog.id)}
                        className="dms-btn dms-btn-danger"
                        disabled={submitting}
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
                    onClick={() => { setIsFormOpen(false); resetForm(); }}
                    className="dms-btn dms-btn-close"
                    disabled={submitting}
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
                            <img src={formData.photo_url} alt="Preview" className="dms-preview-img" />
                            <button
                              type="button"
                              onClick={() => setFormData((p) => ({ ...p, photo_url: "" }))}
                              className="dms-btn dms-btn-imgremove"
                              disabled={submitting}
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
                          disabled={submitting}
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
                            disabled={submitting}
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
                            disabled={submitting}
                          />
                        </div>
                      </div>

                      {/* ✅ Dropdown จากฐานข้อมูลจริง */}
                      <div className="dms-row">
                        {/* Breed */}
                        <div className="dms-group">
                          <label className="dms-label">สายพันธุ์</label>
                          {errorBreeds && <div style={{ color: "#b91c1c" }}>{errorBreeds}</div>}
                          <select
                            name="breed_id"
                            value={formData.breed_id}
                            onChange={handleInputChange}
                            className="dms-select"
                            disabled={loadingBreeds || submitting}
                          >
                            <option value="">-- เลือกสายพันธุ์ --</option>
                            {(breeds ?? []).map((b) => (
                              <option key={b.ID} value={b.ID}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Sex */}
                        <div className="dms-group">
                          <label className="dms-label">เพศ</label>
                          {errorSexes && <div style={{ color: "#b91c1c" }}>{errorSexes}</div>}
                          <select
                            name="animal_sex_id"
                            value={formData.animal_sex_id}
                            onChange={handleInputChange}
                            className="dms-select"
                            disabled={loadingSexes || submitting}
                          >
                            <option value="">-- เลือกเพศ --</option>
                            {(sexes ?? []).map((s) => (
                              <option key={s.ID} value={s.ID}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Size */}
                        <div className="dms-group">
                          <label className="dms-label">ขนาด</label>
                          {errorSizes && <div style={{ color: "#b91c1c" }}>{errorSizes}</div>}
                          <select
                            name="animal_size_id"
                            value={formData.animal_size_id}
                            onChange={handleInputChange}
                            className="dms-select"
                            disabled={loadingSizes || submitting}
                          >
                            <option value="">-- เลือกขนาด --</option>
                            {(sizes ?? []).map((z) => (
                              <option key={z.ID} value={z.ID}>
                                {z.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Personalities */}
                      <div className="dms-personalities">
                        <label className="dms-label">ลักษณะนิสัย</label>
                        {loadingP && <div style={{ color: "#64748b" }}>กำลังโหลดลิสต์บุคลิก…</div>}
                        {errorP && <div style={{ color: "#b91c1c" }}>{errorP}</div>}
                        {!loadingP && !errorP && (
                          <div className="dms-checkgrid">
                            {(allPersonalities ?? []).map((p: PersonalityInterface) => {
                              const idStr = String(p.ID);
                              const checked = formData.personality_ids.includes(idStr);
                              return (
                                <label key={p.ID} className="dms-checklabel">
                                  <input
                                    type="checkbox"
                                    className="dms-checkbox"
                                    checked={checked}
                                    onChange={(e) => handlePersonalityChange(idStr, e.target.checked)}
                                    disabled={submitting}
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
                      onClick={() => { setIsFormOpen(false); resetForm(); }}
                      className="dms-btn dms-btn-gray"
                      disabled={submitting}
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={editingDog ? handleUpdateDog : handleCreateDog}
                      className="dms-btn dms-btn-primary"
                      disabled={submitting}
                    >
                      {submitting
                        ? "กำลังบันทึก..."
                        : editingDog ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มสุนัข"}
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
