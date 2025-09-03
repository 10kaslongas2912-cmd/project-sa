// src/interfaces/Dog.ts
import type { AnimalSexInterface } from "./AnimalSex";
import type { AnimalSizeInterface } from "./AnimalSize";
import type { BreedInterface } from "./Breed";

export interface DogInterface {
  ID: number;
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
  breed_id?: number;
  breed?: BreedInterface
  story?: string;
  personality?: string[];
}

export interface CreateDogRequest {
  name: string;
  animal_sex_id: number;
  animal_size_id: number
  breed_id: number;
  photo_url?: string;
  date_of_birth: string;
  date_of_arrived: string;
  sterilized_at?: string;
  character?: string;
  is_adopted?: boolean;
}

export interface UpdateDogRequest {
  name?: string;
  animal_sex_id?: number;
  animal_size_id?: number
  breed_id?: number;
  photo_url?: string;
  date_of_birth?: string;
  date_of_arrived?: string;
  sterilized_at?: string;
  character?: string;
  is_adopted?: boolean;
}

export interface DogFilters{
  name?: string;
  animal_sex_id?: number;
  animal_size_id?: number;
  breed_id?: number;
  kennel_id?: number;
}