
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
    // Use a more secure approach to prevent ReDoS attacks
    // First check basic structure without vulnerable regex
    if (!email || email.length > 254) {
      return false;
    }

    // Check for exactly one @ symbol
    const atIndex = email.indexOf('@');
    if (atIndex === -1 || atIndex !== email.lastIndexOf('@')) {
      return false;
    }

    // Split into local and domain parts
    const localPart = email.substring(0, atIndex);
    const domainPart = email.substring(atIndex + 1);

    // Validate local part (before @)
    if (localPart.length === 0 || localPart.length > 64) {
      return false;
    }

    // Validate domain part (after @)
    if (domainPart.length === 0 || domainPart.length > 253) {
      return false;
    }

    // Check for at least one dot in domain
    if (!domainPart.includes('.')) {
      return false;
    }

    // Use simple, non-backtracking regex for final validation
    const safeEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return safeEmailRegex.test(email);
  }
}
