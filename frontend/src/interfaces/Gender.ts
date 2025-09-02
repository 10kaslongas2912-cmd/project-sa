export interface GenderInterface {
  ID: number;
  name: string;
}


export interface UpdateGenderRequest {
  ID?: number;
  name?: string;
}

export interface CreateGenderRequest {
  ID: number;
  name: string;
}