// src/interfaces/Dog.ts
import type { AnimalSexInterface } from "./AnimalSex";
import type { AnimalSizeInterface } from "./AnimalSize";
import type { BreedInterface } from "./Breed";
import type { DogPersonalityInterface } from "./Personality";
import type { KennelInterface } from "./Kennel";

export interface DogInterface {
  ID: number;
  name: string;

  // ไอดีที่ฝั่ง BE อาจส่ง null ได้ และฝั่งฟอร์มบางครั้งส่ง undefined
  animal_sex_id?: number | null;
  animal_size_id?: number | null;
  breed_id?: number | null;

  // ความสัมพันธ์ (อาจไม่มี preload)
  animal_sex?: AnimalSexInterface | null;
  animal_size?: AnimalSizeInterface | null;
  breed?: BreedInterface | null;

  // รูปภาพและวันเวลา—มักว่างได้
  photo_url?: string | null;
  date_of_birth?: string | null;
  sterilized_at?: string | null;

  character?: string | null;
  story?: string | null;
  is_adopted?: boolean;              // ปล่อยเป็น boolean ก็ได้ (ถ้ามี default false จาก BE)

  dog_personalities?: DogPersonalityInterface[] | null;

  kennel_id?: number | null;
  kennel?: KennelInterface | null;

  // ถ้าจะเก็บไว้ใช้ฝั่ง UI อย่างเดียว ให้ทำเป็น optional และไม่พึ่งจาก API
  // age?: number | string;
}


export interface CreateDogRequest {
  name: string;
  animal_sex_id?: number;
  animal_size_id?: number;
  breed_id?: number;
  kennel_id?: number;
  date_of_birth?: string;
  is_adopted?: boolean;
  photo_url?: string;
  character?: string;
  personality_ids?: number[];
}

export interface UpdateDogRequest {
  name?: string;
  animal_sex_id?: number | null;
  animal_size_id?: number | null;
  breed_id?: number | null;
  date_of_birth?: string | null;
  photo_url?: string | null;
  character?: string | null;
  personality_ids?: number[];
  kennel_id?: number | null;
}

export interface DogFilters{
  name?: string;
  animal_sex_id?: number;
  animal_size_id?: number;
  breed_id?: number;
  kennel_id?: number;
}