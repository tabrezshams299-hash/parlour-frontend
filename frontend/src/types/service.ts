export interface ServiceDto {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  active: boolean;
  salonId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequest {
  name: string;
  price: number;
  durationMinutes: number;
  active: boolean;
}

export interface UpdateServiceRequest {
  name: string;
  price: number;
  durationMinutes: number;
  active: boolean;
}
