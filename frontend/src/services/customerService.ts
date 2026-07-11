import { httpClient } from "./http";
import type { CreateCustomerRequest, CustomerDto, UpdateCustomerRequest } from "../types/customer";

export const customerService = {
  list: async (): Promise<CustomerDto[]> => {
    const { data } = await httpClient.get<CustomerDto[]>("/customers");
    return data;
  },
  getById: async (id: string): Promise<CustomerDto> => {
    const { data } = await httpClient.get<CustomerDto>(`/customers/${id}`);
    return data;
  },
  create: async (payload: CreateCustomerRequest): Promise<CustomerDto> => {
    const { data } = await httpClient.post<CustomerDto>("/customers", payload);
    return data;
  },
  update: async (id: string, payload: UpdateCustomerRequest): Promise<CustomerDto> => {
    const { data } = await httpClient.put<CustomerDto>(`/customers/${id}`, payload);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await httpClient.delete(`/customers/${id}`);
  },
};
