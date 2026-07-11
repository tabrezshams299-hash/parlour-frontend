import { httpClient } from "./http";
import type { CreateServiceRequest, ServiceDto, UpdateServiceRequest } from "../types/service";

export const serviceService = {
  list: async (): Promise<ServiceDto[]> => {
    const { data } = await httpClient.get<ServiceDto[]>("/services");
    return data;
  },
  getById: async (id: string): Promise<ServiceDto> => {
    const { data } = await httpClient.get<ServiceDto>(`/services/${id}`);
    return data;
  },
  create: async (payload: CreateServiceRequest): Promise<ServiceDto> => {
    const { data } = await httpClient.post<ServiceDto>("/services", payload);
    return data;
  },
  update: async (id: string, payload: UpdateServiceRequest): Promise<ServiceDto> => {
    const { data } = await httpClient.put<ServiceDto>(`/services/${id}`, payload);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await httpClient.delete(`/services/${id}`);
  },
};
