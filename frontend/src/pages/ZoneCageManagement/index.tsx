import React from 'react';
import './style.css';
import NavigationBar from '../../components/NavigationBar';

// Type definitions
type EquipmentItem = {
  id: number;
  name: string;
  image: File | null;
  status: 'empty' | 'added';
};

type FormData = {
  selectedArea: string;
  selectedCage: string;
  totalCages: number;
  equipmentList: EquipmentItem[];
};

type Phase = 'setup' | 'editing';

const ZoneCageManagementPage: React.FC = () => {
  // State management
  const [currentPhase, setCurrentPhase] = React.useState<Phase>('setup');
  const [formData, setFormData] = React.useState<FormData>({
    selectedArea: '',
    selectedCage: '',
    totalCages: 4,
    equipmentList: []
  });

  // Debug logging
  React.useEffect(() => {
    console.log('Phase changed:', currentPhase);
    console.log('Form data updated:', formData);
  }, [currentPhase, formData]);

  // Initialize equipment list when totalCages changes
  React.useEffect(() => {
    const createEquipmentList = (): EquipmentItem[] => {
      return Array.from({ length: formData.totalCages }, (_, index) => ({
        id: index + 1,
        name: '',
        image: null,
        status: 'empty' as const
      }));
    };

    setFormData(prev => ({
      ...prev,
      equipmentList: createEquipmentList()
    }));
  }, [formData.totalCages]);

  // Form handlers
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, itemId: number) => {
    const file = e.target.files?.[0] || null;
    
    setFormData(prev => ({
      ...prev,
      equipmentList: prev.equipmentList.map(item =>
        item.id === itemId 
          ? { ...item, image: file, name: file?.name || '', status: 'added' as const }
          : item
      )
    }));
  };

  // Cage count management
  const setCageCount = (count: number): void => {
    // Validate cage count limits
    const validatedCount = Math.max(1, Math.min(20, count));
    
    setFormData(prev => ({
      ...prev,
      totalCages: validatedCount
    }));
  };

  const increaseCageCount = (): void => {
    if (formData.totalCages < 20) {
      setCageCount(formData.totalCages + 1);
    }
  };

  const decreaseCageCount = (): void => {
    if (formData.totalCages > 1) {
      setCageCount(formData.totalCages - 1);
    }
  };

  // Equipment management
  const openFileDialog = (equipmentId: number): void => {
    const fileInput = document.getElementById(`equipment-${equipmentId}`) as HTMLInputElement;
    fileInput?.click();
  };

  const removeEquipment = (equipmentId: number): void => {
    setFormData(prev => ({
      ...prev,
      equipmentList: prev.equipmentList.map(item =>
        item.id === equipmentId 
          ? { ...item, image: null, name: '', status: 'empty' as const }
          : item
      )
    }));
  };

  const handleEquipmentAction = (item: EquipmentItem): void => {
    if (item.status === 'added' || item.name) {
      removeEquipment(item.id);
    } else {
      openFileDialog(item.id);
    }
  };

  // Phase management
  const enterEditingMode = (): void => {
    setCurrentPhase('editing');
    
    // Add sample data for demonstration (first item only)
    setFormData(prev => ({
      ...prev,
      equipmentList: prev.equipmentList.map((item, index) =>
        index === 0 
          ? { ...item, name: 'สุนัข', status: 'added' as const }
          : item
      )
    }));
  };

  const resetToSetupMode = (): void => {
    setCurrentPhase('setup');
    
    // Clear all equipment data
    setFormData(prev => ({
      ...prev,
      equipmentList: prev.equipmentList.map(item => ({
        ...item,
        image: null,
        name: '',
        status: 'empty' as const
      }))
    }));
  };

  // Form submission
  const handleSave = (): void => {
    console.log('Saving data:', formData);
    // TODO: Implement actual save logic here
  };

  const handleFormSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // TODO: Implement form submission logic here
  };

  // Render helpers
  const renderEquipmentItem = (item: EquipmentItem) => (
    <div key={item.id} className="equipment-item">
      {/* Equipment image/icon display */}
      {item.image ? (
        <img 
          src={URL.createObjectURL(item.image)} 
          alt={item.name} 
          className="equipment-image"
        />
      ) : item.name && currentPhase === 'editing' ? (
        <div className="equipment-placeholder">
          <div className="equipment-icon">🐕</div>
        </div>
      ) : (
        <div className="equipment-placeholder"></div>
      )}
      
      {/* Action button (only in editing mode) */}
      {currentPhase === 'editing' && (
        <>
          <input
            type="file"
            id={`equipment-${item.id}`}
            accept="image/*"
            onChange={(e) => handleFileUpload(e, item.id)}
            style={{ display: 'none' }}
          />
          
          <button
            type="button"
            className="equipment-btn"
            onClick={() => handleEquipmentAction(item)}
          >
            {item.status === 'added' || item.name ? 'ลบ' : 'เพิ่ม'}
          </button>
        </>
      )}
    </div>
  );

  const renderActionButtons = () => (
    <div className="action-buttons">
      {currentPhase === 'setup' ? (
        <button 
          type="button" 
          className="btn btn-primary"
          onClick={enterEditingMode}
        >
          แก้ไข
        </button>
      ) : (
        <>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={resetToSetupMode}
          >
            Redo
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleSave}
          >
            บันทึก
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      <NavigationBar />
      <div className="zone-cage-management-container">
        <form className="zone-cage-management-form" onSubmit={handleFormSubmit}>
          {/* Header */}

          <h1 className="zone-cage-management-title">พื้นที่และกรงสุนัข</h1> 
          
          <div className="form-container">
            {/* Left Panel - Controls */}
            <div className="left-panel">
              {/* Area Selection */}
              <div className="form-group">
                <label htmlFor="selectedArea">พื้นที่</label>
                <select
                  id="selectedArea"
                  name="selectedArea"
                  value={formData.selectedArea}
                  onChange={handleSelectChange}
                  required
                >
                  <option value="">เลือกพื้นที่</option>
                  <option value="area-a">พื้นที่ A</option>
                  <option value="area-b">พื้นที่ B</option>
                  <option value="area-c">พื้นที่ C</option>
                </select>
              </div>
              
              {/* Cage Selection */}
              <div className="form-group">
                <label htmlFor="selectedCage">กรง</label>
                <select
                  id="selectedCage"
                  name="selectedCage"
                  value={formData.selectedCage}
                  onChange={handleSelectChange}
                  required
                >
                  <option value="">เลือกกรง</option>
                  <option value="cage-1">กรงที่ 1</option>
                  <option value="cage-2">กรงที่ 2</option>
                  <option value="cage-3">กรงที่ 3</option>
                </select>
              </div>

              {/* Cage Count Controls - Only show in editing mode */}
              {currentPhase === 'editing' && (
                <div className="form-group">
                  <label htmlFor="totalCages">จำนวนตัว</label>
                  <div className="cage-controls">
                    <button 
                      type="button" 
                      className="cage-btn"
                      onClick={decreaseCageCount}
                      disabled={formData.totalCages <= 1}
                      aria-label="ลดจำนวนกรง"
                    >
                      -
                    </button>
                    
                    <input
                      type="number"
                      value={formData.totalCages}
                      onChange={(e) => setCageCount(parseInt(e.target.value) || 1)}
                      min="1"
                      max="20"
                      className="cage-input"
                      aria-label="จำนวนกรง"
                    />
                    
                    <button 
                      type="button" 
                      className="cage-btn"
                      onClick={increaseCageCount}
                      disabled={formData.totalCages >= 20}
                      aria-label="เพิ่มจำนวนกรง"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {renderActionButtons()}
            </div>

            {/* Right Panel - Equipment Grid */}
            <div className="right-panel">
              <h3 className="panel-title">รายละเอียด</h3>
              
              <div className="equipment-grid">
                {formData.equipmentList.map(renderEquipmentItem)}
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ZoneCageManagementPage;