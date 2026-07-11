export type CustomerGender = "MALE" | "FEMALE" | "OTHER";

export interface CustomerDto {
  id: string;
  name: string;
  mobile: string;
  gender: CustomerGender;
  notes: string | null;
  salonId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  mobile: string;
  gender: CustomerGender;
  notes?: string;
}

export interface UpdateCustomerRequest {
  name: string;
  mobile: string;
  gender: CustomerGender;
  notes?: string;
}
