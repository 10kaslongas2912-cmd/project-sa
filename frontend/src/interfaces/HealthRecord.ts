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