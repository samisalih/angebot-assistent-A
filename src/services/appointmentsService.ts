
import { supabase } from '@/integrations/supabase/client';

export interface Appointment {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
  offer_id: string | null;
  created_at: string;
  updated_at: string;
}

export const saveAppointment = async (appointmentData: {
  customerName: string;
  customerEmail: string;
  appointmentDate: Date;
  appointmentTime: string;
  offerId?: string;
  notes?: string;
}) => {
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
};

export const getAppointments = async () => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('appointment_date', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
};

export const updateAppointmentStatus = async (appointmentId: string, status: string) => {
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
};

export const deleteAppointment = async (appointmentId: string) => {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId);

  if (error) {
    throw error;
  }
};
