
import DOMPurify from 'dompurify';
import { IInputValidator } from '@/domain/ChatDomain';

export class InputValidator implements IInputValidator {
  private static readonly MAX_MESSAGE_LENGTH = 2000;
  private static readonly SUSPICIOUS_PATTERNS = [
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];

  validate(message: string): { isValid: boolean; error?: string } {
    if (!message || typeof message !== 'string') {
      return { isValid: false, error: 'Nachricht ist erforderlich' };
    }

    const sanitizedMessage = this.sanitize(message);
    
    if (sanitizedMessage.length === 0) {
      return { isValid: false, error: 'Nachricht darf nicht leer sein' };
    }

    if (sanitizedMessage.length > InputValidator.MAX_MESSAGE_LENGTH) {
      return { isValid: false, error: 'Nachricht ist zu lang (max. 2000 Zeichen)' };
    }

    for (const pattern of InputValidator.SUSPICIOUS_PATTERNS) {
      if (pattern.test(message)) {
        return { isValid: false, error: 'Nachricht enthält nicht erlaubte Inhalte' };
      }
    }

    return { isValid: true };
  }

  sanitize(input: string): string {
    // Use DOMPurify to safely remove HTML tags and scripts
    const sanitized = DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [], // Remove all HTML tags
      ALLOWED_ATTR: [], // Remove all attributes
      KEEP_CONTENT: true // Keep text content
    });
    
    return sanitized
      .trim()
      .slice(0, InputValidator.MAX_MESSAGE_LENGTH);
  }
}
