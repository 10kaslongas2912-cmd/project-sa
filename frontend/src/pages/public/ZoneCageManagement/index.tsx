import './style.css';
import React from 'react';
import NavigationBar from '../../../components/NavigationBar';

const ZoneCageManagementPage = () => {
const [selectedZone, setSelectedZone] = React.useState('');
const [selectedCage, setSelectedCage] = React.useState('');
const [isEditing, setIsEditing] = React.useState(false);
const [showLoader, setShowLoader] = React.useState(false);
const [loadingComplete, setLoadingComplete] = React.useState(false);
const [boxes, setBoxes] = React.useState<Box[]>([]);

const zones = [
  { value: 'zone1', label: 'Zone 1' },
];

const cages = [
  { value: 'cage1', label: 'Cage A' },
];

// Add this interface before your component
interface Box {
  id: number;
  zone: string;
  cage: string;
  data: string;
}

// Then update your state:


React.useEffect(() => {
  if (selectedZone && selectedCage) {
    setShowLoader(true);
    setLoadingComplete(false);
    const timer = setTimeout(() => {
      setShowLoader(false);
      setLoadingComplete(true);
      // Check if boxes exist for this zone/cage combination
      // Replace with actual API call
    }, 1500);
    return () => clearTimeout(timer);
  } else {
    setShowLoader(false);
    setLoadingComplete(false);
  }
}, [selectedZone, selectedCage]);

const handleEdit = () => {
  setIsEditing(true);
};

const handleRedo = () => {
  setIsEditing(false);
};

const handleSave = () => {
  console.log('Save clicked');
  setIsEditing(false);
};

const handleAdd = () => {
  const newBox = {
    id: Date.now(), // Simple ID generation
    zone: selectedZone,
    cage: selectedCage,
    data: `Box ${boxes.length + 1}` // Sample data
  };
  setBoxes([...boxes, newBox]);
};

const handleDelete = (boxId: number) => {
  setBoxes(boxes.filter(box => box.id !== boxId));
};

const bothSelected = selectedZone && selectedCage;
const showEdit = bothSelected && !isEditing && loadingComplete;
const showOtherButtons = bothSelected && isEditing;

return (
   <>
     <NavigationBar />
     
     <div className="zone-cage-management-container">
        
        <div className="zone-cage-management-form">      
             
           <h1>Zone and Cage management</h1>
           <div className="form-group">
              <label>Zone :  </label>
            <select 
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
            >
              <option value="">Select zone</option>
              {zones.map((zone) => (
                <option key={zone.value} value={zone.value}>
                  {zone.label}
                </option>
              ))}
            </select>
            </div>

          <div className="form-group">
            <label>Cage :  </label>
            <select 
              value={selectedCage}
              onChange={(e) => setSelectedCage(e.target.value)}
            >
              <option value="">Select cage</option>
              {cages.map((cage) => (
                <option key={cage.value} value={cage.value}>
                  {cage.label}
                </option>
              ))}
            </select>
          </div>

         {showEdit && (
           <button onClick={handleEdit}>Edit </button>
         )}

         {showOtherButtons && (
           <>
             <button onClick={handleRedo}>Redo </button>
             <button onClick={handleSave}>Save </button>
           </>
         )}
       </div>

        <div className='information-zone-container'>
          <div className='information-form' > 
              <h2>Information</h2>
              
              {/* Box in upper left corner with conditional button */}
              {loadingComplete &&(
                <div className='boxes-container'>
                  {boxes.map((box: Box) => (
                      <div key={box.id} className='info-box'>
                        <p>Zone: {box.zone}</p>
                        <p>Cage: {box.cage}</p>
                        <p>{box.data}</p>
                        {(showOtherButtons) && <button className="delete-btn" onClick={() => handleDelete(box.id)}>
                          Delete
                        </button>}
                      </div>
                    ))}
                  
                  {/* Always show an Add button in a new box */}
                  
                    {(showOtherButtons) && 
                    <div className='info-box'>
                    <p>Zone: {selectedZone}</p>
                    <p>Cage: {selectedCage}</p>
                      <button className="add-btn" onClick={handleAdd}>Add</button>
                    </div>}
                </div>
              )}
              
              {showLoader && (
                <div className='loader-container'>
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