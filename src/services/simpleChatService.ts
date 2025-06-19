
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/message";
import { Offer } from "@/types/offer";

class SimpleChatService {
  private validateMessage(message: string): void {
    if (!message || typeof message !== 'string') {
      throw new Error('Nachricht ist erforderlich');
    }

    if (message.length > 2000) {
      throw new Error('Nachricht ist zu lang (max. 2000 Zeichen)');
    }

    // Basic XSS protection
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i
    ];

    if (dangerousPatterns.some(pattern => pattern.test(message))) {
      throw new Error('Nachricht enthält nicht erlaubte Inhalte');
    }
  }

  async sendMessage(message: string, context: Message[]): Promise<{ message: string; offer?: Offer }> {
    console.log('SimpleChatService: Starting sendMessage with:', {
      messageLength: message.length,
      contextLength: context.length
    });

    try {
      // Simple validation
      this.validateMessage(message);

      // Prepare context for API
      const apiContext = context.slice(-10).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      console.log('SimpleChatService: Calling edge function with context:', apiContext.length);

      // Call edge function directly
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: { 
          message: message.trim(), 
          context: apiContext 
        }
      });

      console.log('SimpleChatService: Edge function response:', { 
        hasData: !!data, 
        hasError: !!error,
        data,
        error 
      });

      if (error) {
        console.error('SimpleChatService: Edge function error:', error);
        throw new Error(`KI-Service Fehler: ${error.message || 'Unbekannter Fehler'}`);
      }

      if (!data || !data.message) {
        console.error('SimpleChatService: No valid response from edge function');
        throw new Error('Keine gültige Antwort vom KI-Service erhalten');
      }

      return {
        message: data.message,
        offer: data.offer
      };

    } catch (error: any) {
      console.error('SimpleChatService: Error in sendMessage:', error);
      
      // Return specific error messages
      if (error.message?.includes('Nachricht')) {
        throw error; // Re-throw validation errors as-is
      }
      
      throw new Error('Fehler beim Senden der Nachricht. Bitte versuchen Sie es erneut.');
    }
  }

  async generateConversationTitle(messages: Message[]): Promise<string> {
    try {
      const userMessages = messages
        .filter(msg => msg.sender === "user")
        .slice(0, 2)
        .map(msg => msg.content)
        .join(". ");

      if (!userMessages) {
        return 'Chat mit KI-Berater';
      }

      const titlePrompt = `Erstelle einen kurzen Titel (max. 40 Zeichen) für diese Unterhaltung: "${userMessages}". Nur der Titel, keine Anführungszeichen.`;

      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: { 
          message: titlePrompt,
          context: []
        }
      });

      if (error || !data?.message) {
        console.log('Title generation failed, using fallback');
        return userMessages.length > 40 
          ? userMessages.substring(0, 37) + "..." 
          : userMessages;
      }

      return data.message.trim().slice(0, 40) || 'Chat mit KI-Berater';
    } catch (error) {
      console.error('Error generating title:', error);
      return 'Chat mit KI-Berater';
    }
  }
}

export const simpleChatService = new SimpleChatService();
