import type { UserRole } from "./auth";

export interface UserDto {
  id: string;
  name: string;
  mobile: string;
  email: string;
  role: UserRole;
  salonId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  mobile: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
}

export interface UpdateUserRequest {
  name: string;
  mobile: string;
  email: string;
  password?: string;
  role: UserRole;
  active: boolean;
}
