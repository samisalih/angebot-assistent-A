
export class SecurityValidator {
  private static readonly MAX_MESSAGE_LENGTH = 4000;
  private static readonly MAX_CONTEXT_ITEMS = 20;
  private static readonly BLOCKED_PATTERNS = [
    /script\s*:/i,
    /javascript\s*:/i,
    /data\s*:/i,
    /vbscript\s*:/i,
    /<script[^>]*>/i,
    /<\/script>/i,
    /on\w+\s*=/i,
  ];

  static validateMessageInput(message: string): { isValid: boolean; error?: string } {
    if (!message || typeof message !== 'string') {
      return { isValid: false, error: 'Message must be a non-empty string' };
    }

    if (message.length > this.MAX_MESSAGE_LENGTH) {
      return { 
        isValid: false, 
        error: `Message too long. Maximum ${this.MAX_MESSAGE_LENGTH} characters allowed.` 
      };
    }

    // Check for potentially malicious patterns
    for (const pattern of this.BLOCKED_PATTERNS) {
      if (pattern.test(message)) {
        return { isValid: false, error: 'Message contains potentially harmful content' };
      }
    }

    return { isValid: true };
  }

  static validateContextArray(context: any[]): { isValid: boolean; error?: string } {
    if (!Array.isArray(context)) {
      return { isValid: false, error: 'Context must be an array' };
    }

    if (context.length > this.MAX_CONTEXT_ITEMS) {
      return { 
        isValid: false, 
        error: `Too many context items. Maximum ${this.MAX_CONTEXT_ITEMS} allowed.` 
      };
    }

    // Validate each context item
    for (const item of context) {
      if (!item || typeof item !== 'object' || !item.role || !item.content) {
        return { isValid: false, error: 'Invalid context item format' };
      }

      if (typeof item.content !== 'string' || item.content.length > this.MAX_MESSAGE_LENGTH) {
        return { isValid: false, error: 'Context item content too long' };
      }
    }

    return { isValid: true };
  }

  static sanitizeInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  static validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    
    // Use the same validation logic as AppointmentDomain
    if (email.length === 0 || email.length > 254) return false;
    
    const atIndex = email.indexOf('@');
    if (atIndex === -1 || atIndex !== email.lastIndexOf('@')) return false;
    
    const localPart = email.substring(0, atIndex);
    const domainPart = email.substring(atIndex + 1);
    
    if (localPart.length === 0 || localPart.length > 64) return false;
    if (domainPart.length === 0 || domainPart.length > 253) return false;
    if (!domainPart.includes('.')) return false;
    
    return this.isValidLocalPart(localPart) && this.isValidDomainPart(domainPart);
  }

  private static isValidLocalPart(localPart: string): boolean {
    for (let i = 0; i < localPart.length; i++) {
      const char = localPart.charAt(i);
      const code = char.charCodeAt(0);
      
      const isLetter = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
      const isDigit = code >= 48 && code <= 57;
      const isAllowedSpecial = char === '.' || char === '_' || char === '%' || char === '+' || char === '-';
      
      if (!isLetter && !isDigit && !isAllowedSpecial) {
        return false;
      }
    }
    
    return !localPart.startsWith('.') && !localPart.endsWith('.');
  }

  private static isValidDomainPart(domainPart: string): boolean {
    const parts = domainPart.split('.');
    
    if (parts.length < 2) return false;
    
    for (const part of parts) {
      if (part.length === 0 || part.length > 63) return false;
      
      for (let i = 0; i < part.length; i++) {
        const char = part.charAt(i);
        const code = char.charCodeAt(0);
        
        const isLetter = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
        const isDigit = code >= 48 && code <= 57;
        const isHyphen = char === '-';
        
        if (!isLetter && !isDigit && !isHyphen) return false;
        if (isHyphen && (i === 0 || i === part.length - 1)) return false;
      }
    }
    
    const tld = parts[parts.length - 1];
    if (tld.length < 2) return false;
    
    for (let i = 0; i < tld.length; i++) {
      const code = tld.charCodeAt(i);
      const isLetter = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
      if (!isLetter) return false;
    }
    
    return true;
  }
}
