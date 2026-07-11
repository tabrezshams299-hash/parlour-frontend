export type AppointmentStatus = "BOOKED" | "COMPLETED" | "CANCELLED";
export type AppointmentPaymentMode = "CASH" | "UPI" | "CARD";

export interface AppointmentDto {
  id: string;
  customerId: string;
  customerName: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  salonId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  paymentMode: AppointmentPaymentMode | null;
  paid: boolean;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  customerId: string;
  serviceId: string;
  staffId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  paymentMode: AppointmentPaymentMode;
  paid: boolean;
  status: AppointmentStatus;
}

export interface UpdateAppointmentRequest {
  customerId: string;
  serviceId: string;
  staffId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  paymentMode: AppointmentPaymentMode;
  paid: boolean;
  status: AppointmentStatus;
}
