// src/interfaces/Dog.ts
import type { AnimalSexInterface } from "./AnimalSex";
import type { AnimalSizeInterface } from "./AnimalSize";
export interface DogInterface {
  id: number;
  name: string;
  animal_sex_id: number;
  animal_size_id: number
  animal_sex?: AnimalSexInterface;
  animal_size?: AnimalSizeInterface;
  photo_url?: string;
  date_of_birth?: string;
  date_of_arrived?: string;
  sterilized_at?: string;
  character?: string;
  is_adopted?: boolean;
  breed_name?: string;

}