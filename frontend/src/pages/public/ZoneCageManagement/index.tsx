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
    zone: string;
    cage: string;
    data: string;
  }

  const ZoneCageManagementPage = () => {
    const [selectedZone, setSelectedZone] = React.useState<string | null>(null);
    const [selectedCage, setSelectedCage] = React.useState<string | null>(null);

    const [isEditing, setIsEditing] = React.useState(false);
    const [showLoader, setShowLoader] = React.useState(false);
    const [loadingComplete, setLoadingComplete] = React.useState(false);
    const [boxes, setBoxes] = React.useState<Box[]>([]);

    const [zones, setZones] = React.useState<ZoneInterface[]>([]);
    const [cages, setCages] = React.useState<KennelInterface[]>([]);

    // ---------------- load from zcManagement: zones + kennels ----------------
    React.useEffect(() => {
      let cancelled = false;

      (async () => {
        try {
          const res = await zcManagementAPI.getAll();
          // Gin returns { data: {...} }
          const payload = (res && 'data' in res) ? (res as any).data : res;

          const zs = (payload?.zones ?? []) as ZoneInterface[];
          const ks = (payload?.kennels ?? []) as KennelInterface[];
          console.log("Cages:", ks);
          if (!cancelled) {
            console.log("Zones:", zs);
            setZones(zs);
            setCages(ks);
          }
        } catch (e) {
          console.error('load zc management', e);
          if (!cancelled) {
            setZones([]);
            setCages([]);
          }
        }
      })();

      return () => { cancelled = true; };
    }, []);

    // ---------------- dogs load when kennel selected ----------------
    React.useEffect(() => {
      let cancelled = false;

      const run = async () => {
        if (selectedZone == null || selectedCage == null) {
          setShowLoader(false);
          setLoadingComplete(false);
          setBoxes([]);
          return;
        }

        try {
          setShowLoader(true);
          setLoadingComplete(false);

          const res = await Get(`/dogs?kennel_id=${selectedCage}`);
          const dogs: DogInterface[] = Array.isArray(res) ? res : (res?.data ?? []);
          setBoxes(dogs.map(d => ({ id: d.id, zone: selectedZone!, cage: selectedCage!, data: d.name ?? `Dog #${d.id}` })));

          if (!cancelled) {
            setBoxes(dogs.map((d) => ({
              id: d.id,
              zone: selectedZone,
              cage: selectedCage,
              data: d.name ?? `Dog #${d.id}`,
            })));
            setLoadingComplete(true);
          }
        } catch (e) {
          console.error('load dogs', e);
          if (!cancelled) setBoxes([]);
        } finally {
          if (!cancelled) setShowLoader(false);
        }
      };

      run();
      return () => { cancelled = true; };
    }, [selectedZone, selectedCage]);

    // ---------------- handlers ----------------
    const handleEdit = () => setIsEditing(true);
    const handleRedo = () => setIsEditing(false);
    const handleSave = () => { console.log('Save clicked'); setIsEditing(false); };

    const handleAdd = () => {
      if (selectedZone == null || selectedCage == null) return;
      const newBox: Box = {
        id: Date.now(),
        zone: selectedZone,
        cage: selectedCage,
        data: `Box ${boxes.length + 1}`,
      };
      setBoxes(prev => [...prev, newBox]);
    };

    const handleDelete = (boxId: number) => {
      setBoxes(prev => prev.filter(box => box.id !== boxId));
    };

    // zone change → auto pick a kennel in that zone (if any)
    const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const zoneName = e.target.value;
      console.log("Raw zone value:", zoneName);
      setSelectedZone(zoneName);

      if (!zoneName) {
        setSelectedCage(null);
        return;
      }

      const cagesInZone = cages.filter((cage) => {
        const cageZoneName = (cage as any)?.zone?.name ?? (cage as any)?.zone_name;
        return cageZoneName === zoneName;
      });

      const firstCageId = cagesInZone[0]?.id ?? null;
      setSelectedCage(firstCageId ? String(firstCageId) : null);
    };


    const handleCageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cageId = e.target.value ? String(e.target.value) : null;
        setSelectedCage(cageId);

        
      };

    const filteredCages = React.useMemo(() => {
      if (!selectedZone) return [];

      // find the zone object for the selected name
      const z = zones.find(z => z.name === selectedZone);
      if (!z) return [];

      const zid = String(z.id);

      // support both shapes: cage.zone.id OR cage.zone_id
      return cages.filter((c) => {
        const cageZoneId = (c as any)?.zone?.id ?? (c as any)?.zone_id;
        return String(cageZoneId) === zid;
      });
    }, [selectedZone, zones, cages]);
    
    const bothSelected = selectedZone != null && selectedCage != null;
    const showEdit = bothSelected && !isEditing && loadingComplete;
    const showOtherButtons = bothSelected && isEditing;

    React.useEffect(() => {
      if (!selectedZone) { setSelectedCage(null); return; }
      const first = filteredCages[0]?.id;
      setSelectedCage(first ? String(first) : null);
    }, [selectedZone, filteredCages]);
    // ---------------- render ----------------
    return (
      <>
        <NavigationBar />

        <div className="zone-cage-management-container">
          <div className="zone-cage-management-form">
            <h1>Zone and Cage management</h1>

            <div className="form-group">
              <label>Zone : </label>
              <select 
                value={selectedZone ?? ''}
                onChange={handleZoneChange}
              >
                <option value="">Select zone</option>
                {zones.map((zone) => (
                  <option key={zone.name} value={zone.name}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Cage : </label>
              <select 
                value={selectedCage ?? ''}
                onChange={handleCageChange}
              >
                <option value="">Select cage</option>
                {cages
                  .filter((cage) => {
                    const cageZoneName = (cage as any)?.zone?.name;
                    const cageZoneId = (cage as any)?.zone?.id ?? cage?.zones;

                    const matchingZone = zones.find(z => z.name === selectedZone);
                    const selectedZoneId = matchingZone?.id;

                    return cageZoneName === selectedZone || cageZoneId === selectedZoneId;
                  })
                  .map((cage) => (
                    <option key={cage.id} value={String(cage.id)}>
                      {cage.name}
                    </option>
                  ))}
              </select>


            </div>

            {showEdit && <button onClick={handleEdit}>Edit</button>}
            {showOtherButtons && (
              <>
                <button onClick={handleRedo}>Redo</button>
                <button onClick={handleSave}>Save</button>
              </>
            )}
          </div>

          <div className="information-zone-container">
            <div className="information-form">
              <h2>Information</h2>

              {loadingComplete && (
                <div className="boxes-container">
                  {boxes.map((box) => (
                    <div key={box.id} className="info-box">
                      <p>Zone: {box.zone}</p>
                      <p>Cage: {box.cage}</p>
                      <p>{box.data}</p>
                      {showOtherButtons && (
                        <button className="delete-btn" onClick={() => handleDelete(box.id)}>
                          Delete
                        </button>
                      )}
                    </div>
                  ))}

                  {showOtherButtons && (
                    <div className="info-box">
                      <p>Zone: {selectedZone}</p>
                      <p>Cage: {selectedCage}</p>
                      <button className="add-btn" onClick={handleAdd}>Add</button>
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
      </>
    );
  };

  export default ZoneCageManagementPage;