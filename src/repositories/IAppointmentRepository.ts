
import { Appointment, AppointmentBookingData } from '@/types/appointment';

export interface IAppointmentRepository {
  save(appointmentData: AppointmentBookingData): Promise<Appointment>;
  getAll(): Promise<Appointment[]>;
  updateStatus(appointmentId: string, status: string): Promise<Appointment>;
  delete(appointmentId: string): Promise<void>;
}
