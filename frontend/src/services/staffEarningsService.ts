import { httpClient } from "./http";
import type { StaffEarningsSummaryDto } from "../types/staffEarnings";

export const staffEarningsService = {
  daily: async (staffId: string, date: string): Promise<StaffEarningsSummaryDto> => {
    const { data } = await httpClient.get<StaffEarningsSummaryDto>(
      `/staff/${staffId}/earnings/daily`,
      {
        params: { date },
      }
    );
    return data;
  },
  weekly: async (staffId: string, weekStartDate: string): Promise<StaffEarningsSummaryDto> => {
    const { data } = await httpClient.get<StaffEarningsSummaryDto>(
      `/staff/${staffId}/earnings/weekly`,
      {
        params: { weekStartDate },
      }
    );
    return data;
  },
  monthly: async (staffId: string, year: number, month: number): Promise<StaffEarningsSummaryDto> => {
    const { data } = await httpClient.get<StaffEarningsSummaryDto>(
      `/staff/${staffId}/earnings/monthly`,
      {
        params: { year, month },
      }
    );
    return data;
  },
};
