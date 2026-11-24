export interface RegisterUserDto {
  Uid: string;
  Email: string;
  Name: string;
  Surname: string;
  ContactNumber: string;
}

export interface LoginUserDto {
  Email: string;
  Name: string;
  Surname: string;
  ContactNumber: string;
}
