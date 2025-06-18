
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
    // Complete non-regex approach to prevent ReDoS attacks
    if (!email || email.length === 0 || email.length > 254) {
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

    // Validate characters without regex
    return this.isValidLocalPart(localPart) && this.isValidDomainPart(domainPart);
  }

  private isValidLocalPart(localPart: string): boolean {
    // Check each character individually to avoid regex
    for (let i = 0; i < localPart.length; i++) {
      const char = localPart.charAt(i);
      const code = char.charCodeAt(0);
      
      // Allow a-z, A-Z, 0-9, and specific special characters
      const isLetter = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
      const isDigit = code >= 48 && code <= 57;
      const isAllowedSpecial = char === '.' || char === '_' || char === '%' || char === '+' || char === '-';
      
      if (!isLetter && !isDigit && !isAllowedSpecial) {
        return false;
      }
    }
    
    // Local part cannot start or end with a dot
    return !localPart.startsWith('.') && !localPart.endsWith('.');
  }

  private isValidDomainPart(domainPart: string): boolean {
    // Split domain by dots
    const parts = domainPart.split('.');
    
    // Must have at least 2 parts (e.g., "example.com")
    if (parts.length < 2) {
      return false;
    }
    
    // Check each part
    for (const part of parts) {
      if (part.length === 0 || part.length > 63) {
        return false;
      }
      
      // Check characters in each part
      for (let i = 0; i < part.length; i++) {
        const char = part.charAt(i);
        const code = char.charCodeAt(0);
        
        // Allow a-z, A-Z, 0-9, and hyphen (but not at start/end)
        const isLetter = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
        const isDigit = code >= 48 && code <= 57;
        const isHyphen = char === '-';
        
        if (!isLetter && !isDigit && !isHyphen) {
          return false;
        }
        
        // Hyphen cannot be at start or end of a part
        if (isHyphen && (i === 0 || i === part.length - 1)) {
          return false;
        }
      }
    }
    
    // Last part (TLD) must be at least 2 characters and contain only letters
    const tld = parts[parts.length - 1];
    if (tld.length < 2) {
      return false;
    }
    
    for (let i = 0; i < tld.length; i++) {
      const code = tld.charCodeAt(i);
      const isLetter = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
      if (!isLetter) {
        return false;
      }
    }
    
    return true;
  }
}
