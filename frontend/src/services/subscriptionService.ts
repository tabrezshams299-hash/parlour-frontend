import { httpClient } from "./http";
import type { Subscription } from "../types/salon";

export const subscriptionService = {
  getCurrentSubscription: async (): Promise<Subscription> => {
    const { data } = await httpClient.get<Subscription>("/salons/me/subscription");
    return data;
  },
};
