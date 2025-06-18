
import { IChatRepository } from '@/domain/ChatDomain';
import { Message } from "@/types/message";
import { Offer } from "@/types/offer";
import { supabase } from "@/integrations/supabase/client";

export class SupabaseChatRepository implements IChatRepository {
  async sendMessage(message: string, context: any[]): Promise<{ message: string; offer?: Offer }> {
    console.log('SupabaseChatRepository: Sending message:', message);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: { message, context }
      });

      if (error) {
        console.error('SupabaseChatRepository: Edge function error:', error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!data) {
        throw new Error('Keine Antwort vom KI-Service erhalten');
      }

      if (typeof data.message !== 'string') {
        throw new Error('Ungültige Antwort vom KI-Service');
      }

      return {
        message: data.message,
        offer: data.offer
      };
    } catch (error: any) {
      console.error('SupabaseChatRepository: Error:', error);
      
      if (error.message?.includes('Edge function error')) {
        throw error;
      }
      
      throw new Error('Ein Fehler ist bei der Kommunikation mit dem KI-Service aufgetreten. Bitte versuchen Sie es erneut.');
    }
  }

  async generateTitle(messages: Message[]): Promise<string> {
    console.log('SupabaseChatRepository: Generating conversation title');
    
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
        console.error('SupabaseChatRepository: Error generating title:', error);
        throw new Error(`Title generation error: ${error.message}`);
      }

      if (!data?.message) {
        throw new Error('Keine Antwort für Titel-Generierung erhalten');
      }

      const title = data.message.trim().slice(0, 50);
      return title || 'Chat mit KI-Berater';
    } catch (error: any) {
      console.error('SupabaseChatRepository: Error generating conversation title:', error);
      
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
