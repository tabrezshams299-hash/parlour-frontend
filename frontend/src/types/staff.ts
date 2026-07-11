export interface StaffDto {
  id: string;
  name: string;
  mobile?: string;
  role?: string;
  active?: boolean;
  status?: string;
  salonId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffOption {
  id: string;
  name: string;
}
