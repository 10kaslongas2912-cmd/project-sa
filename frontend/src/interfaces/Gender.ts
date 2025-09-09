export interface GenderInterface {
  ID: number;
  code: string;
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