// interfaces/SponsorshipStaff.ts

export interface AdminSponsorshipPayment {
  ID: number;
  amount: number;
  status: string;                // "SUCCEEDED" | "FAILED" | ...
  CreatedAt: string;             // ISO
  transaction_ref?: string | null;
}

export interface AdminSponsor {
  ID: number;
  kind: 'user' | 'guest' | string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface AdminDog {
  ID: number;
  name: string;
  photo_url?: string | null;
}

export interface AdminSubscription {
  ID: number;
  interval: 'monthly' | 'quarterly' | 'yearly' | string;
  status: string;                // "active" | "canceled" | ...
  next_payment_at?: string | null;
}

export interface AdminSponsorshipItem {
  ID: number;
  CreatedAt: string;             // ISO
  plan_type: 'one-time' | 'subscription';
  amount: number;
  status: string;                // "completed" | "active" | "canceled" | ...
  note?: string | null;

  sponsor: AdminSponsor;
  dog: AdminDog;

  enabled: boolean;
  channel?: 'email' | 'sms' | 'line' | null;
  frequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | null;

  subscription?: AdminSubscription | null;
  sponsorship_payments: AdminSponsorshipPayment[];
}

export interface SponsorshipListResponse {
  items: AdminSponsorshipItem[];
}
