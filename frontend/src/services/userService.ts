import { httpClient } from "./http";
import type { CreateUserRequest, UpdateUserRequest, UserDto } from "../types/user";

export const userService = {
  list: async (): Promise<UserDto[]> => {
    const { data } = await httpClient.get<UserDto[]>("/users");
    return data;
  },
  getById: async (id: string): Promise<UserDto> => {
    const { data } = await httpClient.get<UserDto>(`/users/${id}`);
    return data;
  },
  create: async (payload: CreateUserRequest): Promise<UserDto> => {
    const { data } = await httpClient.post<UserDto>("/users", payload);
    return data;
  },
  update: async (id: string, payload: UpdateUserRequest): Promise<UserDto> => {
    const { data } = await httpClient.put<UserDto>(`/users/${id}`, payload);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await httpClient.delete(`/users/${id}`);
  },
};
