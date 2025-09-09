// src/interfaces/sponsorship.ts  <-- แนะนำแก้ชื่อไฟล์/โฟลเดอร์ให้ถูกด้วยนะ (interfaces/ + sponsorship.ts)

import type { UserInterface } from "./User";
import type { GenderInterface } from "./Gender";

/* ---------- Core models ---------- */

export interface SponsorInterface {
  ID?: number;
  kind: "user" | "guest";           // ชัดเจนขึ้น
  user_id?: number;
  user?: UserInterface;

  title?: string | null;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;

  gender_id?: number | null;
  gender?: GenderInterface;

  note?: string;
}

/* ---------- Updates preference ---------- */

export interface UpdatesSettings {
  enabled: boolean;
  channel: "email" | "sms" | "line" | null;
  frequency: "weekly" | "biweekly" | "monthly" | "quarterly" | null;
}

/* ---------- Create/Update/Delete Sponsor ---------- */

// ใช้ type สำหรับ union (interface ใช้กับ single shape เท่านั้น)
export type CreateSponsorRequest =
  | { kind: "user"; user_id: number; title?: string | null }
  | {
      kind: "guest";
      title?: string | null;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      gender_id?: number | null;
    };

export interface CreateSponsorshipRequest {
  sponsor_data: CreateSponsorRequest;
  dog_id: number;
  plan_type: "one-time" | "subscription";
  frequency: "monthly" | "quarterly" | "yearly" | null;
  amount: number;
  payment_method_id: number;
  status: "Active" | "Paided";
  update?: UpdatesSettings; // ⬅️ NEW (ตรงกับ controller: json:"updates,omitempty")
}

export interface DeleteSponsorRequest {
  ID: number;
}

/* ---------- Sponsorship (donation) ---------- */

export interface CreateSponsorshipRequest {
  sponsor_data: CreateSponsorRequest;
  dog_id: number;
  plan_type: "one-time" | "subscription";
  frequency: "monthly" | "quarterly" | "yearly" | null;
  amount: number;
  payment_method_id: number;
  status: "Active" | "Paided"; // ตรงกับฝั่ง BE ตอนนี้
}
