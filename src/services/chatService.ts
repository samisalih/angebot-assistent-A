import { Message } from "@/types/message";
import { Offer } from "@/types/offer";
import { supabase } from "@/integrations/supabase/client";

// Input sanitization function
const sanitizeInput = (input: string): string => {
  // Remove potentially dangerous HTML/script content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, 2000); // Limit input length
};

// Input validation function
const validateChatInput = (message: string): { isValid: boolean; error?: string } => {
  if (!message || typeof message !== 'string') {
    return { isValid: false, error: 'Nachricht ist erforderlich' };
  }

  const sanitizedMessage = sanitizeInput(message);
  
  if (sanitizedMessage.length === 0) {
    return { isValid: false, error: 'Nachricht darf nicht leer sein' };
  }

  if (sanitizedMessage.length > 2000) {
    return { isValid: false, error: 'Nachricht ist zu lang (max. 2000 Zeichen)' };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(message)) {
      return { isValid: false, error: 'Nachricht enthält nicht erlaubte Inhalte' };
    }
  }

  return { isValid: true };
};

// Rate limiting check (simple client-side implementation)
const checkRateLimit = (): { allowed: boolean; error?: string } => {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10; // 10 requests per minute
  
  const requests = JSON.parse(localStorage.getItem('chat_requests') || '[]');
  const recentRequests = requests.filter((timestamp: number) => now - timestamp < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return { allowed: false, error: 'Zu viele Anfragen. Bitte warten Sie einen Moment.' };
  }

  // Store the current request
  recentRequests.push(now);
  localStorage.setItem('chat_requests', JSON.stringify(recentRequests));
  
  return { allowed: true };
};

class ChatService {
  async sendMessage(message: string, context: Message[]): Promise<{ message: string; offer?: Offer }> {
    console.log('ChatService: Sending message:', message);
    
    // Input validation
    const validation = validateChatInput(message);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Rate limiting check
    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      throw new Error(rateLimit.error);
    }

    // Sanitize input
    const sanitizedMessage = sanitizeInput(message);
    
    // Sanitize context messages
    const sanitizedContext = context.map(msg => ({
      ...msg,
      content: sanitizeInput(msg.content)
    }));

    try {
      console.log('ChatService: Invoking chat-with-ai function');
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: { 
          message: sanitizedMessage, 
          context: sanitizedContext 
        }
      });

      if (error) {
        console.error('ChatService: Edge function error:', error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!data) {
        throw new Error('Keine Antwort vom KI-Service erhalten');
      }

      console.log('ChatService: Received response:', data);
      
      // Validate response structure
      if (typeof data.message !== 'string') {
        throw new Error('Ungültige Antwort vom KI-Service');
      }

      // Sanitize response message
      const sanitizedResponse = sanitizeInput(data.message);

      return {
        message: sanitizedResponse,
        offer: data.offer
      };
    } catch (error: any) {
      console.error('ChatService: Error:', error);
      
      // Don't expose internal errors to the user
      if (error.message?.includes('Edge function error')) {
        throw error;
      }
      
      throw new Error('Ein Fehler ist bei der Kommunikation mit dem KI-Service aufgetreten. Bitte versuchen Sie es erneut.');
    }
  }

  async generateConversationTitle(messages: Message[]): Promise<string> {
    console.log('ChatService: Generating conversation title');
    
    // Get first few user messages for context
    const userMessages = messages
      .filter(msg => msg.sender === "user")
      .slice(0, 3)
      .map(msg => msg.content)
      .join(". ");

    if (!userMessages) {
      return 'Chat mit KI-Berater';
    }

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: { 
          message: `Erstelle einen kurzen, prägnanten Titel (max. 50 Zeichen) für diese Unterhaltung basierend auf dem Inhalt: "${userMessages}". Antworte nur mit dem Titel, ohne Anführungszeichen.`,
          context: []
        }
      });

      if (error) {
        console.error('ChatService: Error generating title:', error);
        throw new Error(`Title generation error: ${error.message}`);
      }

      if (!data?.message) {
        throw new Error('Keine Antwort für Titel-Generierung erhalten');
      }

      // Clean and limit the title
      const title = sanitizeInput(data.message).slice(0, 50);
      return title || 'Chat mit KI-Berater';
    } catch (error: any) {
      console.error('ChatService: Error generating conversation title:', error);
      
      // Fallback to first user message
      const firstUserMessage = messages.find(msg => msg.sender === "user")?.content;
      if (firstUserMessage) {
        return firstUserMessage.length > 50 
          ? firstUserMessage.substring(0, 47) + "..." 
          : firstUserMessage;
      }
      
      return 'Chat mit KI-Berater';
    }
  }
}

export const chatService = new ChatService();
