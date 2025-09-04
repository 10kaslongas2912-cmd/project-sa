export interface HealthRecord {
  MedID: number;
  dogId: number;
  dogName: string;
  weight: number;
  temperature: number;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  medication: string;
  vaccination: string;
  notes: string;
  recordDate: string | undefined;
  nextAppointment: string | undefined;
}