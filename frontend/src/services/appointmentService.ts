import { httpClient } from "./http";
import type {
  AppointmentDto,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from "../types/appointment";

export const appointmentService = {
  list: async (): Promise<AppointmentDto[]> => {
    const { data } = await httpClient.get<AppointmentDto[]>("/appointments");
    return data;
  },
  getById: async (id: string): Promise<AppointmentDto> => {
    const { data } = await httpClient.get<AppointmentDto>(`/appointments/${id}`);
    return data;
  },
  create: async (payload: CreateAppointmentRequest): Promise<AppointmentDto> => {
    const { data } = await httpClient.post<AppointmentDto>("/appointments", payload);
    return data;
  },
  update: async (id: string, payload: UpdateAppointmentRequest): Promise<AppointmentDto> => {
    const { data } = await httpClient.put<AppointmentDto>(`/appointments/${id}`, payload);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await httpClient.delete(`/appointments/${id}`);
  },
};
