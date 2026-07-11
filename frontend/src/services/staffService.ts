import { httpClient } from "./http";
import type { StaffDto, StaffOption } from "../types/staff";

function isActiveStaff(staff: StaffDto): boolean {
  if (typeof staff.active === "boolean") {
    return staff.active;
  }

  if (typeof staff.status === "string") {
    return staff.status.toUpperCase() === "ACTIVE";
  }

  return true;
}

export const staffService = {
  list: async (): Promise<StaffDto[]> => {
    const { data } = await httpClient.get<StaffDto[]>("/staff");
    return data;
  },
  listOptions: async (): Promise<StaffOption[]> => {
    const staff = await staffService.list();
    return staff
      .filter((item) => isActiveStaff(item))
      .map((item) => ({
        id: item.id,
        name: item.name,
      }));
  },
};
