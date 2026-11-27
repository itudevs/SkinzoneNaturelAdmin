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

export interface TreatmentCategoryDto {
  treatmentCategory: string;
  numberOfTreatments: number;
}

export interface TreatmentUndetailedDto {
  id: number;
  name: string;
  retailPrice: number;
}

export interface TreatmentDto {
  name: string;
  category: string;
  retailPrice: number;
  discount: number;
  numberOfPeopleTreated: number;
}
