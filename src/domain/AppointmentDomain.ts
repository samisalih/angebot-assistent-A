
import { Appointment, AppointmentBookingData } from '@/types/appointment';

export interface IAppointmentRepository {
  save(appointmentData: AppointmentBookingData): Promise<Appointment>;
  getAll(): Promise<Appointment[]>;
  updateStatus(appointmentId: string, status: string): Promise<Appointment>;
  delete(appointmentId: string): Promise<void>;
}

export class AppointmentDomain {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async saveAppointment(appointmentData: AppointmentBookingData): Promise<Appointment> {
    this.validateAppointmentData(appointmentData);
    return this.appointmentRepository.save(appointmentData);
  }

  async getAppointments(): Promise<Appointment[]> {
    return this.appointmentRepository.getAll();
  }

  async updateAppointmentStatus(appointmentId: string, status: string): Promise<Appointment> {
    if (!appointmentId || !status) {
      throw new Error('Appointment ID and status are required');
    }
    return this.appointmentRepository.updateStatus(appointmentId, status);
  }

  async deleteAppointment(appointmentId: string): Promise<void> {
    if (!appointmentId) {
      throw new Error('Appointment ID is required');
    }
    return this.appointmentRepository.delete(appointmentId);
  }

  private validateAppointmentData(data: AppointmentBookingData): void {
    if (!data.customerName?.trim()) {
      throw new Error('Customer name is required');
    }

    if (!data.customerEmail?.trim() || !this.isValidEmail(data.customerEmail)) {
      throw new Error('Valid customer email is required');
    }

    if (!data.appointmentDate || data.appointmentDate < new Date()) {
      throw new Error('Valid future appointment date is required');
    }

    if (!data.appointmentTime?.trim()) {
      throw new Error('Appointment time is required');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
