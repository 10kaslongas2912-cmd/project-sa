// Read model (what the API returns)
export interface VolunteerInterface {
  user?: {
    id: number;
    username: string;
  };
  skills: string;
  role: string;                 // admin, staff, vet, caretaker
  notes: string;
  address: string;
  phone_number: string;
  another_contact: string;
  health_detail: string;
  working_date: string;         // ISO date string (YYYY-MM-DD or full ISO)
  working_time: string;         // e.g. "morning" | "afternoon" | ...
  skill?: string | null;        // matches *string in Go
  note: string;
  photo_adr: string;
}

// Creation payload you should send (JSON or FormData text parts)
// IMPORTANT: the backend expects user_id, not nested user.
export interface CreateVolunteerPayload {
  user_id: number;

  skills: string;
  role: string;                 // use "none" if unknown
  notes: string;
  address: string;
  phone_number: string;
  another_contact: string;
  health_detail: string;

  working_date: string;         // YYYY-MM-DD
  working_time: string;         // "morning" | "afternoon" | "evening" | "flexible"

  // optional/extra fields the backend has:
  skill?: string | null;
  note?: string;
  // photo_adr is set by server after it saves the uploaded file
  // so you do NOT send photo_adr in the request
}
