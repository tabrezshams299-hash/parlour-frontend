export type CommissionType = "PERCENTAGE" | "FIXED";

export interface StaffEarningRecord {
  id: string;
  staffId: string;
  appointmentId: string;
  serviceId: string;
  serviceName: string;
  earningDate: string;
  serviceAmount: number;
  commissionType: CommissionType;
  commissionValue: number;
  commissionAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StaffEarningsSummaryDto {
  staffId: string;
  periodStart: string;
  periodEnd: string;
  appointmentsCount: number;
  totalServiceAmount: number;
  totalCommissionAmount: number;
  records: StaffEarningRecord[];
}
