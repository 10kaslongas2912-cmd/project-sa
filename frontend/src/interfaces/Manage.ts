// interfaces/Manage.ts

// Import Building interface
import type { BuildingInterface } from './Building';

// ✅ ใช้ union type แทน enum (compatible กับ erasableSyntaxOnly)
export type TaskType = "ดูแลความสะอาด" | "การบำรุงรักษา" | "การตรวจสอบ" | "การซ่อมแซม" | "อื่นๆ";

// ✅ ใช้สำหรับเวลาสร้าง (POST /manages) - แก้ type ให้ตรงกับ backend
export interface CreateManageRequest {
  date_task: string;   // "YYYY-MM-DD"
  type_task: TaskType;
  detail_task?: string;
  staff_id: number;    // ใน TypeScript ใช้ number แต่จะแปลงเป็น uint ใน Go
  building_id: number; // ใน TypeScript ใช้ number แต่จะแปลงเป็น uint ใน Go
}

// ✅ Entity Staff (ดึงมาจาก backend entity.Staff แค่ field สำคัญ)
export interface Staff {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  // Helper computed properties
  name?: string;
  position?: string;
  department?: string;
}

// ✅ Entity Manage (map จาก Go entity.Manage)
export interface Manage {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  date_task: string; // ISO date string เช่น "2025-09-10T00:00:00Z"
  type_task: TaskType;
  detail_task?: string;

  staff_id: number;
  staff?: Staff;
  Staff?: Staff; // Backend อาจใช้ capitalized field name

  building_id: number;
  building?: BuildingInterface;
  Building?: BuildingInterface; // Backend อาจใช้ capitalized field name
}

export interface ManageTableParams {
  pagination?: {
    current?: number;
    pageSize?: number;
  };
  sorter?: any;
  filters?: any;
}

export interface UpdateManageRequest {
  date_task?: string;   // "YYYY-MM-DD"
  type_task?: TaskType;
    detail_task?: string;
    staff_id?: number;    // ใน TypeScript ใช้ number แต่จะแปลงเป็น uint ใน Go
    building_id?: number; // ใน TypeScript ใช้ number แต่จะแปลงเป็น uint ใน Go
}

// Helper function to get staff display name
export const getStaffDisplayName = (staff: Staff): string => {
  if (staff.name) return staff.name;
  return `${staff.first_name || ''} ${staff.last_name || ''}`.trim();
};

// Helper function to get building display name (ใช้จาก Building interface แทน)
export const getBuildingDisplayName = (building: BuildingInterface): string => {
  return building.building_name || building.BuildingName || 'Unknown Building';
};

// Helper function to get building display info (ใช้จาก Building interface แทน)
export const getBuildingDisplayInfo = (building: BuildingInterface): string => {
  const name = getBuildingDisplayName(building);
  const size = building.size ? ` (${building.size})` : '';
  return `${name}${size}`;
};