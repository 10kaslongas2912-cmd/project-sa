export interface GenderInterface {
  id: number;
  gender: string;
}


export interface UpdateGenderRequest {
  id?: number;
  gender?: string;
}

export interface CreateGenderRequest {
  id: number;
  gender: string;
}