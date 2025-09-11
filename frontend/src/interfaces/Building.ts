// interfaces/Building.ts

// ✅ ใช้ PascalCase และ GORM conventions ให้ตรงกับ backend entity.Building
// ✅ Building interface ที่ตรงกับ entity.Building
export interface BuildingInterface {
  ID: number;          // เปลี่ยนจาก id เป็น ID (ตาม GORM convention)
  CreatedAt: string;   // เพิ่ม GORM fields
  UpdatedAt: string;
  DeletedAt?: string | null;
  
  BuildingName: string; // เปลี่ยนจาก building_name เป็น BuildingName
  Size: string;        // เปลี่ยนจาก size เป็ Size
  
  // Backward compatibility
  building_name?: string;
  size?: string;
}