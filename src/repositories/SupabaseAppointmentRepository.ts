
import { supabase } from '@/integrations/supabase/client';
import { IAppointmentRepository } from './IAppointmentRepository';
import { Appointment, AppointmentBookingData } from '@/types/appointment';

export class SupabaseAppointmentRepository implements IAppointmentRepository {
  async save(appointmentData: AppointmentBookingData): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        customer_name: appointmentData.customerName,
        customer_email: appointmentData.customerEmail,
        appointment_date: appointmentData.appointmentDate.toISOString().split('T')[0],
        appointment_time: appointmentData.appointmentTime,
        offer_id: appointmentData.offerId,
        notes: appointmentData.notes,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async getAll(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  }

  async updateStatus(appointmentId: string, status: string): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async delete(appointmentId: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId);

    if (error) {
      throw error;
    }
  }
}
