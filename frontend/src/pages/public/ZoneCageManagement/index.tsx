import './style.css';
import React from 'react';
import NavigationBar from '../../../components/NavigationBar';
import type { ZoneInterface } from '../../../interfaces/Zone';
import type { KennelInterface } from '../../../interfaces/Kennel';
import type { DogInterface } from '../../../interfaces/Dog';
import { Get } from '../../../services/https';
import { zcManagementAPI } from '../../../services/apis';

interface Box {
  id: number;
  zone: string;  // zoneId (string)
  cage: string;  // cageId (string)
  data: string;  // dog name (or label)
}

/* ------------ robust extractors (tolerate different backend shapes) ------------ */
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

const getDogKennelIdRaw = (d: any) =>
  d?.kennel_id ?? d?.KennelID ?? d?.kennelId ??
  d?.kennel?.ID ?? d?.kennel?.id ?? d?.Kennel?.ID ?? d?.Kennel?.id;

const getDogKennelId = (d: any): string => {
  const v = getDogKennelIdRaw(d);
  if (v === undefined || v === null) return '';
  const s = String(v).trim();
  return (s === '' || s === '0') ? '' : s; // change '0' if 0 is valid
};
const isUnassignedDog = (d: any) => getDogKennelId(d) === '';

/* -------------------------------- Component -------------------------------- */
const ZoneCageManagementPage = () => {
  // selections (string IDs)
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

  // Add modal
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [addLoading, setAddLoading] = React.useState(false);
  const [unassignedDogs, setUnassignedDogs] = React.useState<DogInterface[]>([]);
  const [selectedDogIdForAdd, setSelectedDogIdForAdd] = React.useState<string>('');

  // track original dogs in current cage (for diff on Save)
  const originalDogIdsRef = React.useRef<Set<number>>(new Set());
  // NEW: track which cards are marked for deletion (so user can Undo before Save)
  const [markedForDeletion, setMarkedForDeletion] = React.useState<Set<number>>(new Set());

  /* -------------------------- load zones + kennels -------------------------- */
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await zcManagementAPI.getAll();
        const payload = (res && 'data' in res) ? (res as any).data : res;
        const zs = (payload?.zones ?? []) as ZoneInterface[];
        const ks = (payload?.kennels ?? []) as KennelInterface[];
        if (!cancelled) { setZones(zs); setCages(ks); }
      } catch (e) {
        console.error('load zc management', e);
        if (!cancelled) { setZones([]); setCages([]); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* -------------------------- maps for display names ------------------------ */
  const zoneNameById = React.useMemo(
    () => new Map(zones.map(z => [getId(z), String((z as any)?.name ?? '')])),
    [zones]
  );
  const cageNameById = React.useMemo(
    () => new Map(cages.map(c => [getId(c), String((c as any)?.name ?? '')])),
    [cages]
  );

  /* ----------------------- cages filtered by selected zone ------------------ */
  const filteredCages = React.useMemo(() => {
    if (!selectedZone) return [];
    return cages.filter((c: any) => getZoneIdFromCage(c) === selectedZone);
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
        setShowLoader(true);
        setLoadingComplete(false);
        const res = await Get(`/dogs?kennel_id=${selectedCage}`);
        const dogs: DogInterface[] = Array.isArray(res) ? res : (res?.data ?? []);
        if (!cancelled) {
          const mapped = dogs.map(d => ({
            id: Number(getDogId(d)),
            zone: selectedZone!,
            cage: selectedCage!,
            data: getDogName(d),
          }));
          setBoxes(mapped);
          // capture original set for this cage
          originalDogIdsRef.current = new Set(mapped.map(m => m.id));
          setMarkedForDeletion(new Set());
          setLoadingComplete(true);
        }
      } catch (e) {
        console.error('load dogs', e);
        if (!cancelled) {
          setBoxes([]);
          originalDogIdsRef.current = new Set();
          setMarkedForDeletion(new Set());
        }
      } finally {
        if (!cancelled) setShowLoader(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [selectedZone, selectedCage]);

  /* ------------------------------- handlers -------------------------------- */
  const handleEdit = () => setIsEditing(true);

  const handleRedo = () => {
    // revert UI back to original (no server call)
    setBoxes(prev => prev.filter(b => originalDogIdsRef.current.has(b.id)));
    setMarkedForDeletion(new Set());
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!selectedCage) return;
    setSaving(true);
    try {
      const currentIds = new Set(boxes.map(b => b.id));
      const originalIds = originalDogIdsRef.current;

      // Added = in UI but not in original AND not marked to remove
      const added: number[] = [];
      currentIds.forEach(id => {
        if (!originalIds.has(id) && !markedForDeletion.has(id)) added.push(id);
      });

      // Removed = everything user marked for deletion
      const removed: number[] = Array.from(markedForDeletion);

      const kennelIdNum = Number(selectedCage);

      const ops: Promise<any>[] = [];
      for (const id of added) {
        ops.push(zcManagementAPI.assignDogToKennel(kennelIdNum, id));
      }
      for (const id of removed) {
        ops.push(zcManagementAPI.removeDogFromKennel(kennelIdNum, id));
      }

      const results = await Promise.allSettled(ops);
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length) {
        console.error('Some kennel updates failed:', failed);
        return; // keep edit mode so user can retry
      }

      // success → apply UI + baseline
      setBoxes(prev => prev.filter(b => !markedForDeletion.has(b.id)));
      const nextBaseline = new Set<number>([
        ...Array.from(originalIds).filter(id => !markedForDeletion.has(id)),
        ...added,
      ]);
      originalDogIdsRef.current = nextBaseline;

      setMarkedForDeletion(new Set());
      setIsEditing(false);
    } catch (e) {
      console.error('save failed', e);
    } finally {
      setSaving(false);
    }
  };

  // Toggle mark for deletion (instead of removing immediately)
  const handleDelete = (boxId: number) => {
    setMarkedForDeletion(prev => {
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
      let res: any = await Get('/dogs?unassigned=1');
      let arr: any[] = Array.isArray(res) ? res : (res?.data ?? []);
      arr = arr.filter(isUnassignedDog);

      if (!arr.length) {
        res = await Get('/dogs?kennel_id=null');
        arr = Array.isArray(res) ? res : (res?.data ?? []);
        arr = arr.filter(isUnassignedDog);
      }

      if (!arr.length) {
        res = await Get('/dogs');
        const all: any[] = Array.isArray(res) ? res : (res?.data ?? []);
        arr = all.filter(isUnassignedDog);
      }

      setUnassignedDogs(arr);
    } catch (e) {
      console.error('load unassigned dogs', e);
      setUnassignedDogs([]);
    } finally {
      setAddLoading(false);
    }
  }, []);

  const openAddModal = async () => {
    if (!selectedZone || !selectedCage) return;
    setSelectedDogIdForAdd('');
    setIsAddModalOpen(true);
    if (unassignedDogs.length === 0) await fetchUnassignedDogs();
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setSelectedDogIdForAdd('');
  };

  const handleConfirmAdd = () => {
    if (!selectedZone || !selectedCage || !selectedDogIdForAdd) return;
    const dog = unassignedDogs.find(d => getDogId(d) === selectedDogIdForAdd);
    if (!dog) return;

    const dogNumericId = Number(getDogId(dog));
    // prevent duplicates in UI
    if (boxes.some(b => b.id === dogNumericId)) {
      closeAddModal();
      return;
    }

    setBoxes(prev => [
      ...prev,
      {
        id: dogNumericId,
        zone: selectedZone,
        cage: selectedCage,
        data: getDogName(dog),
      },
    ]);

    setUnassignedDogs(prev => prev.filter(d => getDogId(d) !== selectedDogIdForAdd));
    closeAddModal();
  };

  /* -------------------------------- render ---------------------------------- */
  const bothSelected = selectedZone != null && selectedCage != null;
  const showEdit = bothSelected && !isEditing && loadingComplete;
  const showOtherButtons = bothSelected && isEditing;

  // close modal on ESC
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAddModal(); };
    if (isAddModalOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAddModalOpen]);

  return (
    <>
      <NavigationBar />

      <div className="zone-cage-management-container">
        <div className="zone-cage-management-form">
          <h1>Zone and Cage management</h1>

          <div className="form-group">
            <label>Zone : </label>
            <select value={selectedZone ?? ''} onChange={handleZoneChange}>
              <option key="__zph" value="">Select zone</option>
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
            <label>Cage : </label>
            <select
              value={selectedCage ?? ''}
              onChange={handleCageChange}
              disabled={!selectedZone}
              aria-disabled={!selectedZone}
              title={!selectedZone ? 'Select a zone first' : undefined}
            >
              <option key="__cph" value="">
                {!selectedZone ? 'Select a zone first' : 'Select cage'}
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

          {showEdit && (
            <button onClick={handleEdit}>Edit</button>
          )}
          {showOtherButtons && (
            <>
              <button onClick={handleRedo} disabled={saving}>Redo</button>
              <button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          )}
        </div>

        <div className="information-zone-container">
          <div className="information-form">
            <h2>Information</h2>

            {loadingComplete && (
              <div className="boxes-container">
                {boxes.map((box) => {
                  const pending = markedForDeletion.has(box.id);
                  return (
                    <div key={box.id} className={`info-box ${pending ? 'pending-remove' : ''}`}>
                      <p>Zone: {zoneNameById.get(box.zone) ?? box.zone}</p>
                      <p>Cage: {cageNameById.get(box.cage) ?? box.cage}</p>
                      <p>{box.data}</p>
                      {showOtherButtons && (
                        <button
                          className={`delete-btn ${pending ? 'undo' : ''}`}
                          onClick={() => handleDelete(box.id)}
                        >
                          {pending ? 'Undo' : 'Remove'}
                        </button>
                      )}
                    </div>
                  );
                })}

                {showOtherButtons && (
                  <div className="info-box">
                    <p>Zone: {zoneNameById.get(selectedZone!) ?? selectedZone}</p>
                    <p>Cage: {cageNameById.get(selectedCage!) ?? selectedCage}</p>
                    <button className="add-btn" onClick={openAddModal}>Add</button>
                  </div>
                )}
              </div>
            )}

            {showLoader && (
              <div className="loader-container">
                <div className="loader"></div>
                <span>Loading...</span>
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
            <h3 id="add-dog-title">Select a dog without cage</h3>

            {addLoading ? (
              <div style={{ padding: 16 }}>Loading…</div>
            ) : unassignedDogs.length === 0 ? (
              <div style={{ padding: 16 }}>No unassigned dogs.</div>
            ) : (
              <div className="dog-grid">
                {unassignedDogs.map((d) => {
                  const id = getDogId(d);
                  const name = getDogName(d);
                  const selected = id === selectedDogIdForAdd;
                  return (
                    <button
                      key={id}
                      className={`dog-card ${selected ? 'selected' : ''}`}
                      onClick={() => setSelectedDogIdForAdd(id)}
                      title={name}
                    >
                      <div className="dog-card-name">{name}</div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="modal-actions">
              <button onClick={closeAddModal} className="ghost">Cancel</button>
              <button onClick={handleConfirmAdd} disabled={!selectedDogIdForAdd}>Add</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ZoneCageManagementPage;
