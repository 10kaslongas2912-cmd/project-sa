import React, { useState, useEffect } from "react";
import './style.css';
import { useNavigate } from "react-router-dom";

interface DonationItem {
  id: string;
  itemName: string;
  quantity: string;
  unit: string;
}

interface DonationItemsFormProps {
  onSubmit?: (formData: object) => void;
}

// รายการสิ่งของที่สามารถบริจาคได้
const DONATION_ITEMS = [
  "ข้าว",
  "น้ำดื่ม",
  "อาหารกระป็อง",
  "เสื้อผ้า",
  "ผ้าห่ม",
  "ยา",
  "อุปกรณ์การเรียน",
  "ของเล่น",
  "หนังสือ",
  "อุปกรณ์อิเล็กทรอนิกส์",
  "อื่นๆ"
];

// หน่วยที่ใช้
const UNITS = [
  "กิโลกรัม (kg)",
  "กรัม (g)",
  "ชิ้น",
  "กล่อง",
  "ถุง",
  "ขวด",
  "แผ่น",
  "เล่ม",
  "คู่",
  "ตัว"
];

// Helper to get initial state from sessionStorage
const getInitialFormData = () => {
  try {
    const storedData = sessionStorage.getItem('donationItemsFormData');
    return storedData ? JSON.parse(storedData) : {
      donationItems: [{
        id: '1',
        itemName: '',
        quantity: '',
        unit: ''
      }]
    };
  } catch (error) {
    console.error("Error parsing stored form data:", error);
    return {
      donationItems: [{
        id: '1',
        itemName: '',
        quantity: '',
        unit: ''
      }]
    };
  }
};

const DonationItemsForm: React.FC<DonationItemsFormProps> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const initialData = getInitialFormData();
  
  const [donationItems, setDonationItems] = useState<DonationItem[]>(initialData.donationItems);

  // Use useEffect to save data to sessionStorage whenever state changes
  useEffect(() => {
    const formData = { donationItems };
    sessionStorage.setItem('donationItemsFormData', JSON.stringify(formData));
  }, [donationItems]);

  // เพิ่มรายการใหม่
  const addDonationItem = () => {
    const newItem: DonationItem = {
      id: Date.now().toString(),
      itemName: '',
      quantity: '',
      unit: ''
    };
    setDonationItems([...donationItems, newItem]);
  };

  // ลบรายการ
  const removeDonationItem = (id: string) => {
    if (donationItems.length > 1) {
      setDonationItems(donationItems.filter(item => item.id !== id));
    }
  };

  // อัพเดทข้อมูลรายการ
  const updateDonationItem = (id: string, field: keyof DonationItem, value: string) => {
    setDonationItems(donationItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // ตรวจสอบว่าทุกรายการมีข้อมูลครบถ้วน
    const isValid = donationItems.every(item => 
      item.itemName && item.quantity && item.unit
    );

    if (!isValid) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วนในทุกรายการ');
      return;
    }

    const formData = { donationItems };
    console.log('Donation Items Submitted:', formData);
    
    if (onSubmit) {
      onSubmit(formData);
    }
    navigate('/donation/summary');
  };

  return (
    <div className="form-page-container">
      <div className="form-card">
        {/* ปุ่มย้อนกลับ */}
        <button
          onClick={() => {
            navigate('/donation/information');
          }}
          className="back-link"
        >
          &lt; ย้อนกลับ
        </button>
        
        <h1 className="form-title">บริจาคสิ่งของ</h1>
        <h1 className="form-subtitle">เลือกสิ่งของที่ต้องการบริจาค</h1>

        {/* ฟอร์ม */}
        <form onSubmit={handleSubmit}>
          {donationItems.map((item, index) => (
            <div key={item.id} className="donation-item-group">
              <div className="item-header">
                <h3>รายการที่ {index + 1}</h3>
                {donationItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDonationItem(item.id)}
                    className="remove-item-button"
                    title="ลบรายการนี้"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* เลือกสิ่งของ */}
              <select
                className="form-input"
                value={item.itemName}
                onChange={(e) => updateDonationItem(item.id, 'itemName', e.target.value)}
                required
              >
                <option value="">เลือกสิ่งของที่ต้องการบริจาค</option>
                {DONATION_ITEMS.map((itemName) => (
                  <option key={itemName} value={itemName}>
                    {itemName}
                  </option>
                ))}
              </select>

              <div className="quantity-unit-row">
                {/* จำนวน */}
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="จำนวน"
                  className="form-input quantity-input"
                  value={item.quantity}
                  onChange={(e) => updateDonationItem(item.id, 'quantity', e.target.value)}
                  required
                />

                {/* หน่วย */}
                <select
                  className="form-input unit-input"
                  value={item.unit}
                  onChange={(e) => updateDonationItem(item.id, 'unit', e.target.value)}
                  required
                >
                  <option value="">หน่วย</option>
                  {UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* เพิ่มรายละเอียดเพิ่มเติมถ้าเลือก "อื่นๆ" */}
              {item.itemName === 'อื่นๆ' && (
                <input
                  type="text"
                  placeholder="ระบุสิ่งของที่บริจาค"
                  className="form-input"
                  onChange={(e) => updateDonationItem(item.id, 'itemName', e.target.value === '' ? 'อื่นๆ' : e.target.value)}
                  required
                />
              )}
            </div>
          ))}

          {/* ปุ่มเพิ่มรายการ */}
          <button
            type="button"
            onClick={addDonationItem}
            className="add-item-button"
          >
            + เพิ่มรายการบริจาค
          </button>

          {/* ปุ่มส่งฟอร์ม */}
          <button type="submit" className="submit-button">
            ยืนยันการบริจาค
          </button>
        </form>
      </div>
    </div>
  );
};

export default DonationItemsForm;