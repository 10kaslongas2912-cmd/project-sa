export interface GenderInterface {
  id: number;
  name: string;
}


export interface UpdateGenderRequest {
  id?: number;
  name?: string;
}

export interface CreateGenderRequest {
  id: number;
  name: string;
}