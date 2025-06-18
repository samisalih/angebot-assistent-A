
import { SupabaseAppointmentRepository } from '@/repositories/SupabaseAppointmentRepository';
import { AppointmentDomain } from '@/domain/AppointmentDomain';
import { Appointment, AppointmentBookingData } from '@/types/appointment';

// Dependency injection
const appointmentRepository = new SupabaseAppointmentRepository();
const appointmentDomain = new AppointmentDomain(appointmentRepository);

// Export individual functions for backward compatibility
export const saveAppointment = (appointmentData: AppointmentBookingData): Promise<Appointment> => 
  appointmentDomain.saveAppointment(appointmentData);

export const getAppointments = (): Promise<Appointment[]> => 
  appointmentDomain.getAppointments();

export const updateAppointmentStatus = (appointmentId: string, status: string): Promise<Appointment> => 
  appointmentDomain.updateAppointmentStatus(appointmentId, status);

export const deleteAppointment = (appointmentId: string): Promise<void> => 
  appointmentDomain.deleteAppointment(appointmentId);

// Export types
export type { Appointment };
