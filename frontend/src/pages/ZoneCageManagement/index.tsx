import './style.css';
import React from 'react';
import NavigationBar from '../../components/NavigationBar';

const ZoneCageManagementPage = () => {
const [selectedZone, setSelectedZone] = React.useState('');
const [selectedCage, setSelectedCage] = React.useState('');
const [isEditing, setIsEditing] = React.useState(false);
const [showLoader, setShowLoader] = React.useState(false);

const zones = [
  { value: 'zone1', label: 'Zone 1' },
  { value: 'zone2', label: 'Zone 2' },
  { value: 'zone3', label: 'Zone 3' },
];

const cages = [
  { value: 'cage1', label: 'Cage A' },
  { value: 'cage2', label: 'Cage B' },
  { value: 'cage3', label: 'Cage C' },
];

React.useEffect(() => {
  if (selectedZone && selectedCage) {
    setShowLoader(true);
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1500); // 1.5 seconds

    return () => clearTimeout(timer); // Cleanup timer
  } else {
    setShowLoader(false);
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
  console.log('Add clicked');
};

const handleDelete = () => {
  console.log('Delete clicked');
};

const bothSelected = selectedZone && selectedCage;
const showEdit = bothSelected && !isEditing;
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
             <button onClick={handleAdd}>Add </button>
             <button onClick={handleDelete}>Delete </button>
           </>
         )}
       </div>

        <div className='information-zone-container'>
          <div className='information-form' > 
              <h2>Information</h2>
              <div className='box'></div>
              {showLoader && <div className='loader-container'>
                <div className="loader"></div>
                <span>Loading...</span>
              </div>}
          </div>
        </div>
     </div>

     
   </>
);
};

export default ZoneCageManagementPage;