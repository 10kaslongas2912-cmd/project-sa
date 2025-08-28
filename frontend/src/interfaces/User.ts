export interface UserInterface {
  ID?: number;
  FirstName?: string;
  LastName?: string;
  DateOfBirth?: string;
  Email?: string;
  PhoneNumber?: string;
  Username?: string;
  Password?: string;
  GenderID?: number;
}

export interface LoginUserRequest {
  Email?: string;
  UserName?: string;
  Password?: string;
}