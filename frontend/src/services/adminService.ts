import { httpClient } from "./http";
import type {
  ResetOwnerPasswordRequest,
  ResetOwnerPasswordResponse,
  SalonAdminItem,
  UpdateSubscriptionRequest,
} from "../types/salon";
import type { Subscription } from "../types/salon";

export const adminService = {
  getSalons: async (search?: string): Promise<SalonAdminItem[]> => {
    const { data } = await httpClient.get<SalonAdminItem[]>("/admin/salons", {
      params: search ? { search } : undefined,
    });
    return data;
  },

  getSalon: async (id: string): Promise<SalonAdminItem> => {
    const { data } = await httpClient.get<SalonAdminItem>(`/admin/salons/${id}`);
    return data;
  },

  getSubscription: async (id: string): Promise<Subscription> => {
    const { data } = await httpClient.get<Subscription>(`/admin/salons/${id}/subscription`);
    return data;
  },

  updateSubscription: async (id: string, payload: UpdateSubscriptionRequest): Promise<Subscription> => {
    const { data } = await httpClient.put<Subscription>(`/admin/salons/${id}/subscription`, payload);
    return data;
  },

  activateSubscription: async (id: string): Promise<Subscription> => {
    const { data } = await httpClient.post<Subscription>(`/admin/salons/${id}/activate`);
    return data;
  },

  suspendSalon: async (id: string): Promise<SalonAdminItem> => {
    const { data } = await httpClient.post<SalonAdminItem>(`/admin/salons/${id}/suspend`);
    return data;
  },

  deleteSalon: async (id: string): Promise<void> => {
    await httpClient.delete(`/admin/salons/${id}`);
  },

  resetOwnerPassword: async (id: string, payload: ResetOwnerPasswordRequest): Promise<ResetOwnerPasswordResponse> => {
    const { data } = await httpClient.post<ResetOwnerPasswordResponse>(`/admin/salons/${id}/reset-owner-password`, payload);
    return data;
  },
};
