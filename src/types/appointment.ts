
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

export interface AppointmentBookingData {
  customerName: string;
  customerEmail: string;
  appointmentDate: Date;
  appointmentTime: string;
  offerId?: string;
  notes?: string;
}
