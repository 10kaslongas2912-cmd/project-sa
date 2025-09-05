export interface HealthRecord {
  ID: number;
  dog_id: number;
  staff_id: number; // Add this line
  weight: number;
  temperature: number;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  medication: string;
  vaccination: string;
  notes: string;
  date_record: string | undefined;
}

export interface vaccineRecord {
  ID : number;
  dose_number: number;
  lot_number: string;
  next_due_date: string | undefined;
  med_id: number;
  vaccine_id: number;
}

export interface CreateHealthRecordRequest {
  health_record: HealthRecord;
  vaccine_records?: vaccineRecord[];
}

export interface vaccine{
  ID : number | string;
  name : string;
  manufacturer : string;
}