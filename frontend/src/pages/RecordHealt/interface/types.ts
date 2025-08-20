// src/types.ts

export interface DogInfo {
  dog_id: number;
  Name: string;
  PhotoURL?: string;
}

export interface HealthRecord {
  MedID: number;
  dogId: number; // Changed to number to match backend dog_id
  dogName: string;
  weight: number;
  temperature: number;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  medication: string;
  vaccination: string; // Added vaccination field
  notes: string;
  recordDate: string; // Already a string from format()
  nextAppointment?: string; // Still keeping this for now, will map to backend later if needed
}