
import { IChatRepository } from '@/domain/ChatDomain';
import { Message } from "@/types/message";
import { Offer } from "@/types/offer";
import { supabase } from "@/integrations/supabase/client";
import { SecurityValidator } from './SecurityValidator';
import { PerformanceMonitor } from './PerformanceMonitor';

export class SupabaseChatRepository implements IChatRepository {
  async sendMessage(message: string, context: any[]): Promise<{ message: string; offer?: Offer }> {
    const timer = PerformanceMonitor.startTimer('chat_send_message');
    
    try {
      console.log('SupabaseChatRepository: Starting sendMessage with:', {
        messageLength: message.length,
        contextLength: context.length,
        message: message.substring(0, 100) + '...'
      });
      
      // Enhanced input validation
      const messageValidation = SecurityValidator.validateMessageInput(message);
      if (!messageValidation.isValid) {
        console.error('Message validation failed:', messageValidation.error);
        throw new Error(messageValidation.error);
      }

      const contextValidation = SecurityValidator.validateContextArray(context);
      if (!contextValidation.isValid) {
        console.error('Context validation failed:', contextValidation.error);
        throw new Error(contextValidation.error);
      }

      // Sanitize message content
      const sanitizedMessage = SecurityValidator.sanitizeInput(message);
      
      console.log('SupabaseChatRepository: About to call edge function with:', {
        sanitizedMessageLength: sanitizedMessage.length,
        contextLength: context.length
      });

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: { 
          message: sanitizedMessage, 
          context: context 
        }
      });

      console.log('SupabaseChatRepository: Edge function response received:', { 
        hasData: !!data, 
        hasError: !!error,
        data: data,
        error: error 
      });

      if (error) {
        console.error('SupabaseChatRepository: Edge function error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          fullError: error
        });
        PerformanceMonitor.recordError('chat_send_message');
        
        // Provide more specific error messages based on error type
        if (error.message?.includes('fetch')) {
          throw new Error('Netzwerkfehler: Bitte überprüfen Sie Ihre Internetverbindung.');
        }
        
        if (error.message?.includes('timeout')) {
          throw new Error('Zeitüberschreitung: Der AI-Service antwortet nicht. Bitte versuchen Sie es erneut.');
        }
        
        if (error.message?.includes('rate limit')) {
          throw new Error('Zu viele Anfragen. Bitte warten Sie einen Moment.');
        }
        
        throw new Error(`KI-Service Fehler: ${error.message || 'Unbekannter Fehler'}`);
      }

      if (!data) {
        console.error('SupabaseChatRepository: No data received from edge function');
        PerformanceMonitor.recordError('chat_send_message');
        throw new Error('Keine Antwort vom KI-Service erhalten');
      }

      console.log('SupabaseChatRepository: Processing successful response:', {
        hasMessage: !!data.message,
        messageType: typeof data.message,
        hasOffer: !!data.offer
      });

      if (typeof data.message !== 'string') {
        console.error('SupabaseChatRepository: Invalid response format:', data);
        PerformanceMonitor.recordError('chat_send_message');
        throw new Error('Ungültige Antwort vom KI-Service');
      }

      const duration = timer.stop();
      console.log(`Chat message processed successfully in ${duration.toFixed(2)}ms`);

      return {
        message: data.message,
        offer: data.offer
      };
    } catch (error: any) {
      console.error('SupabaseChatRepository: Detailed error analysis:', {
        errorType: typeof error,
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
        errorDetails: error
      });
      
      PerformanceMonitor.recordError('chat_send_message');
      timer.stop();
      
      // Re-throw specific errors without modification
      if (error.message?.includes('KI-Service Fehler') || 
          error.message?.includes('Netzwerkfehler') || 
          error.message?.includes('Zeitüberschreitung') || 
          error.message?.includes('Zu viele Anfragen') ||
          error.message?.includes('Keine Antwort') ||
          error.message?.includes('Ungültige Antwort')) {
        throw error;
      }
      
      // Generic fallback error for unexpected errors
      throw new Error('Ein Fehler ist bei der Kommunikation mit dem KI-Service aufgetreten. Bitte versuchen Sie es erneut.');
    }
  }

  async generateTitle(messages: Message[]): Promise<string> {
    const timer = PerformanceMonitor.startTimer('chat_generate_title');
    
    try {
      console.log('SupabaseChatRepository: Generating conversation title');
      
      const userMessages = messages
        .filter(msg => msg.sender === "user")
        .slice(0, 3)
        .map(msg => msg.content)
        .join(". ");

      if (!userMessages) {
        timer.stop();
        return 'Chat mit KI-Berater';
      }

      // Validate and sanitize the input
      const messageValidation = SecurityValidator.validateMessageInput(userMessages);
      if (!messageValidation.isValid) {
        timer.stop();
        return 'Chat mit KI-Berater';
      }

      const sanitizedMessages = SecurityValidator.sanitizeInput(userMessages);
      const titlePrompt = `Erstelle einen kurzen, prägnanten Titel (max. 50 Zeichen) für diese Unterhaltung basierend auf dem Inhalt: "${sanitizedMessages}". Antworte nur mit dem Titel, ohne Anführungszeichen.`;

      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: { 
          message: titlePrompt,
          context: []
        }
      });

      if (error) {
        console.error('SupabaseChatRepository: Error generating title:', error);
        PerformanceMonitor.recordError('chat_generate_title');
        throw new Error(`Title generation error: ${error.message}`);
      }

      if (!data?.message) {
        PerformanceMonitor.recordError('chat_generate_title');
        throw new Error('Keine Antwort für Titel-Generierung erhalten');
      }

      const title = data.message.trim().slice(0, 50);
      const duration = timer.stop();
      console.log(`Title generated in ${duration.toFixed(2)}ms`);
      
      return title || 'Chat mit KI-Berater';
    } catch (error: any) {
      console.error('SupabaseChatRepository: Error generating conversation title:', error);
      PerformanceMonitor.recordError('chat_generate_title');
      timer.stop();
      
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
