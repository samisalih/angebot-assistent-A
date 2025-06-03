
import { SupabaseAppointmentRepository } from '@/repositories/SupabaseAppointmentRepository';
import { IAppointmentRepository } from '@/repositories/IAppointmentRepository';
import { Appointment, AppointmentBookingData } from '@/types/appointment';

class AppointmentsService {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async saveAppointment(appointmentData: AppointmentBookingData): Promise<Appointment> {
    return this.appointmentRepository.save(appointmentData);
  }

  async getAppointments(): Promise<Appointment[]> {
    return this.appointmentRepository.getAll();
  }

  async updateAppointmentStatus(appointmentId: string, status: string): Promise<Appointment> {
    return this.appointmentRepository.updateStatus(appointmentId, status);
  }

  async deleteAppointment(appointmentId: string): Promise<void> {
    return this.appointmentRepository.delete(appointmentId);
  }
}

// Create singleton instance
const appointmentsService = new AppointmentsService(new SupabaseAppointmentRepository());

// Export individual functions for backward compatibility
export const saveAppointment = (appointmentData: AppointmentBookingData) => 
  appointmentsService.saveAppointment(appointmentData);
export const getAppointments = () => appointmentsService.getAppointments();
export const updateAppointmentStatus = (appointmentId: string, status: string) => 
  appointmentsService.updateAppointmentStatus(appointmentId, status);
export const deleteAppointment = (appointmentId: string) => 
  appointmentsService.deleteAppointment(appointmentId);

// Export types
export type { Appointment };
