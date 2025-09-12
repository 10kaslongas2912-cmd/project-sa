import './style.css';
import React from 'react';

import type { ZoneInterface } from '../../../interfaces/Zone';
import type { KennelInterface } from '../../../interfaces/Kennel';
import type { DogInterface } from '../../../interfaces/Dog';
import { Get } from '../../../services/https';
import { zcManagementAPI } from '../../../services/apis';

import { useStaffMe } from "../../../hooks/useStaffsMe"; 

interface Box {
  id: number;      // dog id
  zone: string;    // zoneId (string)
  cage: string;    // cageId (string)
  data: string;    // dog name
  photo?: string;  // dog photo url (optional)
}

/* ------------ helpers ------------ */
const getId = (o: any): string => String(o?.ID ?? o?.id ?? '').trim();

const getZoneIdFromCage = (c: any): string =>
  String(
    c?.zone?.ID ??
      c?.zone?.id ??
      c?.zone_id ??
      c?.ZoneID ??
      c?.zoneId ??
      c?.zones ??
      c?.Zones ??
      ''
  ).trim();

const getDogId = (d: any): string => String(d?.ID ?? d?.id ?? '').trim();
const getDogName = (d: any): string => String(d?.name ?? `Dog #${getDogId(d)}`);
const getDogPhoto = (d: any): string =>
  String(
    d?.photo_url ??
      d?.PhotoURL ??
      d?.photoURL ??
      d?.image_url ??
      d?.ImageURL ??
      d?.avatar ??
      ''
  ).trim();

const getDogKennelIdRaw = (d: any) =>
  d?.kennel_id ??
  d?.KennelID ??
  d?.kennelId ??
  d?.kennel?.ID ??
  d?.kennel?.id ??
  d?.Kennel?.ID ??
  d?.Kennel?.id;

// loader paint helpers
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const nextFrame = () =>
  new Promise<void>((r) => requestAnimationFrame(() => r()));
const MIN_SPINNER_MS = 700; // 👈 adjust loader minimum visible time (ms)

const ZoneCageManagementPage = () => {
  // selections (string IDs)
  const { staff, loading: staffLoading } = useStaffMe();
  // unwrap axios shapes (res / res.data / res.data.data)
  const rawStaff = React.useMemo(() => {
    const s: any = staff;
    if (!s) return null;
    const lvl1 = s?.data ?? s;
    return (lvl1?.data ?? lvl1) || null;
  }, [staff]);

  // stable numeric staff id (supports ID/id/staff_id/staffId)
  const staffId = React.useMemo(() => {
    const v: any = rawStaff?.ID ?? rawStaff?.id ?? rawStaff?.staff_id ?? rawStaff?.staffId ?? null;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [rawStaff]);

  const staffReady = !staffLoading && !!staffId;

  const [selectedZone, setSelectedZone] = React.useState<string | null>(null);
  const [selectedCage, setSelectedCage] = React.useState<string | null>(null);
  // UI state
  const [isEditing, setIsEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [showLoader, setShowLoader] = React.useState(false);
  const [loadingComplete, setLoadingComplete] = React.useState(false);
  const [boxes, setBoxes] = React.useState<Box[]>([]);

  // master data
  const [zones, setZones] = React.useState<ZoneInterface[]>([]);
  const [cages, setCages] = React.useState<KennelInterface[]>([]);
  const [k00Id, setK00Id] = React.useState<number | null>(null); // kennel "00" id

  // Add modal (now multi-select)
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [addLoading, setAddLoading] = React.useState(false);
  const [unassignedDogs, setUnassignedDogs] = React.useState<DogInterface[]>([]);
  const [selectedDogIdsForAdd, setSelectedDogIdsForAdd] = React.useState<Set<string>>(new Set());

  // original dogs in current cage (for diff on Save)
  const originalDogIdsRef = React.useRef<Set<number>>(new Set());
  // which cards are marked for deletion (so user can Undo before Save)
  const [markedForDeletion, setMarkedForDeletion] = React.useState<Set<number>>(new Set());

  /* -------------------------- load zones + kennels -------------------------- */
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await zcManagementAPI.getAll();
        const payload = res && 'data' in (res as any) ? (res as any).data : res;
        const zs = (payload?.zones ?? []) as ZoneInterface[];
        const ks = (payload?.kennels ?? []) as KennelInterface[];

        // resolve kennel "00" id
        const k00 = ks.find((k: any) => String((k?.name ?? '')).trim() === '00');
        const _id = k00 ? Number(getId(k00)) : 0;

        if (!cancelled) {
          setZones(zs);
          setCages(ks);
          setK00Id(_id > 0 ? _id : null);
        }
      } catch (e) {
        console.error('load zc management', e);
        if (!cancelled) {
          setZones([]);
          setCages([]);
          setK00Id(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* -------------------------- maps for display names & capacity ------------- */
  const zoneNameById = React.useMemo(
    () => new Map(zones.map((z) => [getId(z), String((z as any)?.name ?? '')])),
    [zones]
  );
  const cageNameById = React.useMemo(
    () => new Map(cages.map((c) => [getId(c), String((c as any)?.name ?? '')])),
    [cages]
  );
  const capacityById = React.useMemo(
    () => new Map(cages.map((c) => [getId(c), Number((c as any)?.capacity ?? 0)])),
    [cages]
  );

  /* ----------------------- cages filtered by selected zone ------------------ */
  // Hide kennel "00" from the dropdown
  const filteredCages = React.useMemo(() => {
    if (!selectedZone) return [];
    return cages
      .filter((c: any) => getZoneIdFromCage(c) === selectedZone)
      .filter((c: any) => String((c?.name ?? '')).trim() !== '00');
  }, [selectedZone, cages]);

  /* ------------------ when zone changes, auto-pick first cage --------------- */
  React.useEffect(() => {
    if (!selectedZone) {
      setSelectedCage(null);
      setIsEditing(false);
      setLoadingComplete(false);
      setBoxes([]);
      originalDogIdsRef.current = new Set();
      setMarkedForDeletion(new Set());
      return;
    }
    const first = filteredCages[0] ? Number(getId(filteredCages[0] as any)) : NaN;
    setSelectedCage(Number.isFinite(first) ? String(first) : null);
    setIsEditing(false);
    setLoadingComplete(false);
    setBoxes([]);
    originalDogIdsRef.current = new Set();
    setMarkedForDeletion(new Set());
  }, [selectedZone, filteredCages]);

  /* ----------------- load dogs when zone & cage both chosen ----------------- */
  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (selectedZone == null || selectedCage == null) {
        setShowLoader(false);
        setLoadingComplete(false);
        setBoxes([]);
        originalDogIdsRef.current = new Set();
        setMarkedForDeletion(new Set());
        return;
      }
      try {
        // turn spinner on and clear content
        setShowLoader(true);
        setLoadingComplete(false);
        await nextFrame(); // ensure the spinner paints at least once

        const started = performance.now();

        const res = await zcManagementAPI.getDogsInKennel(Number(selectedCage));
        const dogs: DogInterface[] =
          Array.isArray(res) ? (res as any) : (res as any)?.data ?? [];

        if (cancelled) return;

        const mapped = dogs.map((d: any) => ({
          id: Number(getDogId(d)),
          zone: selectedZone!,
          cage: selectedCage!,
          data: getDogName(d),
          photo: getDogPhoto(d),
        }));
        setBoxes(mapped);
        // capture original set for this cage
        originalDogIdsRef.current = new Set(mapped.map((m) => m.id));
        setMarkedForDeletion(new Set());

        // keep spinner visible for a minimum time
        const elapsed = performance.now() - started;
        if (elapsed < MIN_SPINNER_MS) await sleep(MIN_SPINNER_MS - elapsed);

        if (cancelled) return;
        setLoadingComplete(true);
      } catch (e) {
        console.error('load dogs', e);
        if (!cancelled) {
          setBoxes([]);
          originalDogIdsRef.current = new Set();
          setMarkedForDeletion(new Set());
          setLoadingComplete(false);
        }
      } finally {
        if (!cancelled) setShowLoader(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [selectedZone, selectedCage]);

  /* ------------------------------- helpers --------------------------------- */
  // Treat kennel "00" as unassigned (and accept legacy 0/null/'' just in case)
  const isUnassigned = React.useCallback(
    (d: any) => {
      const raw = getDogKennelIdRaw(d);
      const kid = Number(raw ?? 0);
      if (k00Id && kid === k00Id) return true;
      if (!raw) return true; // legacy null/undefined
      const s = String(raw).trim();
      return s === '' || s === '0';
    },
    [k00Id]
  );

  // Convert axios "resolved error" into real rejection for allSettled
  const guardAssign = async (kennelIdNum: number, dogId: number) => {
    const res: any = await zcManagementAPI.assignDogToKennel(kennelIdNum, dogId);
    if (res && typeof res.status === 'number' && res.status >= 400) {
      const msg = res?.data?.error || res?.data?.message || 'Assign failed';
      throw new Error(msg);
    }
    return res;
  };
  const guardRemove = async (kennelIdNum: number, dogId: number) => {
    const res: any = await zcManagementAPI.removeDogFromKennel(kennelIdNum, dogId);
    if (res && typeof res.status === 'number' && res.status >= 400) {
      const msg = res?.data?.error || res?.data?.message || 'Remove failed';
      throw new Error(msg);
    }
    return res;
  };

  /* ------------------------------- capacity logic --------------------------- */
  const capacityForSelected = React.useMemo(() => {
    if (!selectedCage) return Infinity;
    const cap = capacityById.get(selectedCage);
    return Number.isFinite(cap ?? NaN) ? (cap as number) : Infinity;
  }, [selectedCage, capacityById]);

  // dogs that will remain in this cage after local toggles (before Save)
  const plannedKeepIds = React.useMemo(() => {
    return new Set(
      boxes
        .filter((b) => b.cage === selectedCage && !markedForDeletion.has(b.id))
        .map((b) => String(b.id))
    );
  }, [boxes, markedForDeletion, selectedCage]);

  const plannedCount = React.useMemo(() => plannedKeepIds.size, [plannedKeepIds]);

  /* ------------------------------- handlers -------------------------------- */
  const handleEdit = () => setIsEditing(true);

  const handleRedo = () => {
    // revert UI back to original (no server call)
    setBoxes((prev) => prev.filter((b) => originalDogIdsRef.current.has(b.id)));
    setMarkedForDeletion(new Set());
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!selectedCage) return;

    if (staffLoading) { alert('กำลังโหลดข้อมูลพนักงาน โปรดลองอีกครั้ง'); return; }
    if (!staffReady)  { alert('ไม่พบข้อมูลพนักงาน กรุณาเข้าสู่ระบบใหม่'); return; }

    // capacity check (unchanged)
    const originalCount = originalDogIdsRef.current.size;
    const removed = Array.from(markedForDeletion);

    const currentIds = new Set(boxes.map((b) => b.id));
    const added: number[] = [];
    currentIds.forEach((id) => {
      if (!originalDogIdsRef.current.has(id) && !markedForDeletion.has(id)) added.push(id);
    });

    const after = originalCount - removed.length + added.length;
    if (after > capacityForSelected) {
      alert(`กรงนี้รองรับได้ ${capacityForSelected} ตัว แต่คุณกำลังจะเก็บไว้ทั้งหมด ${after} ตัว`);
      return;
    }

    setSaving(true);
    try {
      const kennelIdNum = Number(selectedCage);
      const ops: Promise<any>[] = [];

      // assign ops + logs
      for (const id of added) {
        ops.push(guardAssign(kennelIdNum, id));
        ops.push(
          zcManagementAPI.createLog({
            kennel: { id: kennelIdNum },
            dog:    { ID: id },
            staff:  { ID: staffId },
            action: "assign",
          }).catch(() => null) // <- don't block on log
        );
      }

      // remove ops + logs
      for (const id of removed) {
        ops.push(guardRemove(kennelIdNum, id));
        ops.push(
          zcManagementAPI.createLog({
            kennel: { id: kennelIdNum },
            dog:    { ID: id },
            staff:  { ID: staffId },
            action: "remove",
          }).catch(() => null)
        );
      }

      const results = await Promise.allSettled(ops);
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length) {
        console.error('Some kennel updates failed:', failed);
        alert('บางรายการบันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
        return;
      }

      // refresh baseline (unchanged)
      const ref = await zcManagementAPI.getDogsInKennel(kennelIdNum);
      const dogs: DogInterface[] = Array.isArray(ref) ? (ref as any) : (ref as any)?.data ?? [];
      const mapped = dogs.map((d: any) => ({
        id: Number(getDogId(d)),
        zone: selectedZone!,
        cage: selectedCage!,
        data: getDogName(d),
        photo: getDogPhoto(d),
      }));
      setBoxes(mapped);
      originalDogIdsRef.current = new Set(mapped.map(m => m.id));
      setMarkedForDeletion(new Set());
      setIsEditing(false);
    } catch (e) {
      console.error('save failed', e);
      alert('บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  // Toggle mark for deletion (instead of removing immediately)
  const handleDelete = (boxId: number) => {
    setMarkedForDeletion((prev) => {
      const next = new Set(prev);
      if (next.has(boxId)) next.delete(boxId);
      else next.add(boxId);
      return next;
    });
  };

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const zoneId = (e.target.value ?? '').trim();
    setSelectedZone(zoneId || null);
  };

  const handleCageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedZone) return;
    const cageId = (e.target.value ?? '').trim();
    setSelectedCage(cageId || null);
  };

  /* -------------------- Add flow: fetch unassigned dogs --------------------- */
  const fetchUnassignedDogs = React.useCallback(async () => {
    setAddLoading(true);
    try {
      let arr: any[] = [];

      // Prefer kennel "00"
      if (k00Id) {
        const res = await zcManagementAPI.getDogsInKennel(k00Id);
        arr = Array.isArray(res) ? (res as any) : (res as any)?.data ?? [];
      }

      // Fallbacks (legacy data where "unassigned" still had 0 or null)
      if (!arr.length) {
        let r: any = await Get('/dogs?unassigned=1');
        arr = Array.isArray(r) ? (r as any) : (r?.data ?? []);
      }
      if (!arr.length) {
        let r: any = await Get('/dogs?kennel_id=null');
        arr = Array.isArray(r) ? (r as any) : (r?.data ?? []);
      }
      if (!arr.length) {
        let r: any = await Get('/dogs');
        arr = Array.isArray(r) ? (r as any) : (r?.data ?? []);
      }

      // Keep only truly unassigned…
      arr = arr.filter(isUnassigned);
      // …and remove any already staged to keep in this cage
      arr = arr.filter((d: any) => !plannedKeepIds.has(getDogId(d)));

      setUnassignedDogs(arr);
    } catch (e) {
      console.error('load unassigned dogs', e);
      setUnassignedDogs([]);
    } finally {
      setAddLoading(false);
    }
  }, [k00Id, isUnassigned, plannedKeepIds]);

  const openAddModal = async () => {
    if (!selectedZone || !selectedCage) return;
    if (plannedCount >= capacityForSelected) {
      alert('กรงนี้เต็มแล้ว');
      return;
    }
    setSelectedDogIdsForAdd(new Set());
    setIsAddModalOpen(true);
    await fetchUnassignedDogs(); // always refresh list to reflect staged changes
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setSelectedDogIdsForAdd(new Set());
  };

  const handleConfirmAdd = () => {
    if (!selectedZone || !selectedCage) return;

    const selectedIds = Array.from(selectedDogIdsForAdd);
    const remainingCapacity = Math.max(0, Number(capacityForSelected) - plannedCount);

    if (selectedIds.length === 0) return;
    if (selectedIds.length > remainingCapacity) {
      alert(`เลือกได้สูงสุด ${remainingCapacity} ตัว (ตามความจุคงเหลือ)`);
      return;
    }

    const dogById = new Map(unassignedDogs.map((d) => [getDogId(d), d]));

    const toAppend = selectedIds
      .map((id) => dogById.get(id))
      .filter(Boolean)
      .filter((dog) => !boxes.some((b) => String(b.id) === getDogId(dog)));

    if (toAppend.length === 0) { closeAddModal(); return; }

    setBoxes((prev) => [
      ...prev,
      ...toAppend.map((dog: any) => ({
        id: Number(getDogId(dog)),
        zone: selectedZone!,
        cage: selectedCage!,
        data: getDogName(dog),
        photo: getDogPhoto(dog),
      })),
    ]);

    setUnassignedDogs((prev) => prev.filter((d) => !selectedDogIdsForAdd.has(getDogId(d))));
    closeAddModal();
  };

  /* -------------------------------- render ---------------------------------- */
  const bothSelected = selectedZone != null && selectedCage != null;
  const showEdit = bothSelected && !isEditing && loadingComplete;
  const showOtherButtons = bothSelected && isEditing;

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAddModal();
    };
    if (isAddModalOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAddModalOpen]);

  const imgStyle: React.CSSProperties = {
    width: 56,
    height: 56,
    borderRadius: '50%',
    objectFit: 'cover',
    flex: '0 0 auto',
    background: '#eee',
  };
  const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 };
  const nameStyle: React.CSSProperties = { fontWeight: 700 };

  const selectedCount = selectedDogIdsForAdd.size;
  const remainingCapacity = Math.max(0, Number(capacityForSelected) - plannedCount);

  return (
    <>
      <div className="zone-cage-management-container">
        {/* Top form section */}
        <div className="zone-cage-management-form">
          <h1>จัดการโซนและกรง</h1>

          {/* Zone and Cage dropdowns on the same line */}
          <div className="form-controls-row">
            <div className="form-group">
              <label>โซน :</label>
              <select value={selectedZone ?? ''} onChange={handleZoneChange}>
                <option key="__zph" value="">
                  เลือกโซน
                </option>
                {zones.map((zone) => {
                  const zId = getId(zone);
                  return (
                    <option key={zId || String((zone as any).name)} value={zId}>
                      {(zone as any).name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label>กรง :</label>
              <select
                value={selectedCage ?? ''}
                onChange={handleCageChange}
                disabled={!selectedZone}
                aria-disabled={!selectedZone}
                title={!selectedZone ? 'กรุณาเลือกโซนก่อน' : undefined}
              >
                <option key="__cph" value="">
                  {!selectedZone ? 'กรุณาเลือกโซนก่อน' : 'เลือกกรง'}
                </option>
                {filteredCages.map((c: any) => {
                  const cId = getId(c);
                  return (
                    <option key={cId || String(c?.name)} value={cId}>
                      {String(c?.name ?? '')}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Capacity and buttons section */}
          <div className="form-bottom-section">
            {bothSelected && (
              <span className="capacity-pill">
                ความจุ: {Number.isFinite(capacityForSelected)
                  ? `${plannedCount}/${capacityForSelected}`
                  : 'ไม่ทราบ'}
              </span>
            )}

            {showEdit && <button onClick={handleEdit}>แก้ไข</button>}
            {showOtherButtons && (
              <>
                <button onClick={handleRedo} disabled={saving}>
                  ย้อนกลับ
                </button>
                <button onClick={handleSave} disabled={saving}>
                  {saving ? 'กำลังบันทึก…' : 'บันทึก'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bottom information section */}
        <div className="information-zone-container">
          <div className="information-form">
            <h2>ข้อมูล</h2>

            {loadingComplete && (
              <div className="boxes-container">
                {boxes.map((box) => {
                  const pending = markedForDeletion.has(box.id);
                  const fallbackInitial = (box.data || '').trim().slice(0, 1).toUpperCase() || '?';

                  return (
                    <div key={box.id} className={`info-box ${pending ? 'pending-remove' : ''}`}>
                      <div style={rowStyle}>
                        {box.photo ? (
                          <img
                            src={box.photo}
                            alt={box.data}
                            style={imgStyle}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              ...imgStyle,
                              display: 'grid',
                              placeItems: 'center',
                              fontWeight: 700,
                            }}
                          >
                            {fallbackInitial}
                          </div>
                        )}
                        <div>
                          <div style={nameStyle}>{box.data}</div>
                        </div>
                      </div>

                      {showOtherButtons && (
                        <button
                          className={`delete-btn ${pending ? 'undo' : ''}`}
                          onClick={() => handleDelete(box.id)}
                        >
                          {pending ? 'ยกเลิก' : 'นำออก'}
                        </button>
                      )}
                    </div>
                  );
                })}

                {showOtherButtons && (
                  <div className="info-box">
                    <div style={rowStyle}>
                      <div
                        style={{ ...imgStyle, display: 'grid', placeItems: 'center', fontWeight: 700 }}
                      >
                        +
                      </div>
                      <div>
                        <div style={nameStyle}>เพิ่มสุนัข</div>
                        <div style={{ opacity: 0.7, fontSize: 12 }}>
                          {zoneNameById.get(selectedZone!) ?? selectedZone} ·{' '}
                          {cageNameById.get(selectedCage!) ?? selectedCage}
                        </div>
                      </div>
                    </div>
                    <button
                      className="add-btn"
                      onClick={openAddModal}
                      disabled={plannedCount >= capacityForSelected}
                    >
                      เพิ่ม
                    </button>
                  </div>
                )}
              </div>
            )}

            {showLoader && (
              <div className="loader-container">
                <div className="loader"></div>
                <span>กำลังโหลด...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ----------------------------- ADD MODAL ----------------------------- */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={closeAddModal}>
          <div
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-dog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="add-dog-title">เลือกสุนัขที่ยังไม่มีกรง</h3>

            {addLoading ? (
              <div style={{ padding: 16 }}>กำลังโหลด…</div>
            ) : unassignedDogs.length === 0 ? (
              <div style={{ padding: 16 }}>ไม่มีสุนัขที่ยังไม่มีกรง</div>
            ) : (
              <div className="dog-grid">
                {unassignedDogs.map((d) => {
                  const id = getDogId(d);
                  const name = getDogName(d);
                  const photo = getDogPhoto(d);
                  const selected = selectedDogIdsForAdd.has(id);

                  const toggle = () => {
                    setSelectedDogIdsForAdd((prev) => {
                      const next = new Set(prev);
                      if (next.has(id)) next.delete(id);
                      else next.add(id);
                      return next;
                    });
                  };

                  return (
                    <button
                      key={id}
                      className={`dog-card ${selected ? 'selected' : ''}`}
                      onClick={toggle}
                      aria-pressed={selected}
                      title={name}
                    >
                      {photo ? (
                        <img
                          src={photo}
                          alt={name}
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 8,
                            objectFit: 'cover',
                            marginBottom: 8,
                          }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 8,
                            background: '#eee',
                            display: 'grid',
                            placeItems: 'center',
                            fontWeight: 700,
                            marginBottom: 8,
                          }}
                        >
                          {name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="dog-card-name">{name}</div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="modal-actions">
              <div className="left">
                {selectedCount > 0 ? (
                  <span className="selection-info">
                    เลือกแล้ว {selectedCount} • เหลือที่ว่าง {remainingCapacity}
                  </span>
                ) : (
                  <span className="selection-info dim">เลือกได้สูงสุด {remainingCapacity} ตัว</span>
                )}
              </div>
              <div className="right">
                <button onClick={closeAddModal} className="ghost">
                  ยกเลิก
                </button>
                <button
                  onClick={handleConfirmAdd}
                  disabled={selectedCount === 0 || selectedCount > remainingCapacity}
                  title={selectedCount > remainingCapacity ? `เหลือที่ว่าง ${remainingCapacity}` : undefined}
                >
                  เพิ่ม{selectedCount ? ` (${selectedCount})` : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ZoneCageManagementPage;