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
  update?: UpdatesSettings; 
}

export interface DeleteSponsorRequest {
  ID: number;
}


/* ---------- My Sponsorship History ---------- */
export type PlanType = "one-time" | "subscription";
export type Interval = "monthly" | "quarterly" | "yearly";
export type Channel = "email" | "sms" | "line" | null;
export type UpdateFrequency = "weekly" | "biweekly" | "monthly" | "quarterly" | null;

// ตามโดเมนใน BE: PENDING, ACTIVE, COMPLETED, CANCELED
export type SponsorshipStatus = "pending" | "active" | "completed" | "canceled";

// ตามโดเมนใน BE: PENDING, SUCCEEDED, FAILED, REFUNDED
export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";

/* ---------- Items (ย่อ ใช้แสดงผล) ---------- */
export interface MySponsorshipPayment {
  ID: number;
  amount: number;
  status: PaymentStatus;
  payment_method_id: number;
  CreatedAt: string; // ISO
  transaction_ref: string;
}

export interface MySponsorshipSubscription {
  ID: number;
  interval: Interval; 
  status: string;
  next_payment_at: string; 
  current_period_end: string
}

export interface MySponsorshipItem {
  ID: number;
  dog_id: number;
  dog_name: string;
  photo_url: string;
  plan_type: PlanType;
  amount: number;
  status: SponsorshipStatus;

  enabled: boolean;
  channel?: Channel;
  frequency?: UpdateFrequency;

  CreatedAt: string; 

  payment_count: number;
  last_payment?: MySponsorshipPayment;
  subscription?: MySponsorshipSubscription;
}

export interface MySponsorshipSummary {
  total_one_time: number;
  total_subscription: number;
  total_all: number;
}

/* ---------- Responses ---------- */

export interface GetMySponsorshipsResponse {
  items: MySponsorshipItem[];
  summary: MySponsorshipSummary;
}





// ----------------------AdminDTO-----------------//
export interface AdminSponsorshipListResponse {
  items: AdminSponsorshipItem[];
}
export interface AdminSponsorshipItem {
  ID: number;
  CreatedAt: string;
  plan_type: 'one-time' | 'subscription';
  amount: number;
  status: string; // active | completed | canceled | ...
  note?: string | null;

  sponsor: {
    ID: number;
    kind: 'user' | 'guest';
    // ถ้า kind=user ให้มี user ด้วย
    user?: { first_name?: string; last_name?: string; email?: string; phone?: string };
    // ถ้า kind=guest field ด้านล่างจะมี
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
  };

  dog: { ID: number; name: string; image_url?: string | null };

  subscription?: {
    ID: number;
    interval: 'monthly' | 'quarterly' | 'yearly';
    status: string;
    next_payment_at?: string | null;
  };

  sponsorship_payments?: Array<{
    ID: number;
    Amount?: number; // เผื่อกรณีสะกดต่าง
    amount?: number;
    status: 'SUCCEEDED' | 'PENDING' | 'FAILED' | string;
    CreatedAt: string;
    transaction_ref?: string | null;
  }>;

  // ค่าการรับข่าวสารระดับ sponsorship
  enabled: boolean;
  channel?: 'email' | 'sms' | 'line' | null;
  frequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | null;
}