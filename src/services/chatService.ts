
import { supabase } from "@/integrations/supabase/client";

// This service will handle the AI chat functionality using endpoints from Supabase

interface ChatResponse {
  message: string;
  offer?: any;
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

interface AIEndpoint {
  id: string;
  name: string;
  provider: string;
  endpoint_url: string;
  model: string;
  api_key_name: string;
  is_active: boolean;
  max_tokens: number;
  temperature: number;
  system_prompt: string;
}

class ChatService {
  private async getActiveEndpoint(): Promise<AIEndpoint | null> {
    try {
      const { data, error } = await supabase
        .from('ai_endpoints')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching active endpoint:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getActiveEndpoint:', error);
      return null;
    }
  }

  async sendMessage(message: string, context: Message[]): Promise<ChatResponse> {
    const endpoint = await this.getActiveEndpoint();
    
    if (!endpoint) {
      // Fallback to mock response if no endpoint is configured
      return this.getMockResponse(message, context);
    }

    try {
      // Call the AI endpoint via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message,
          context: context.slice(-5), // Send last 5 messages for context
          endpointId: endpoint.id
        }
      });

      if (error) throw error;

      return {
        message: data.message,
        offer: data.offer
      };
    } catch (error) {
      console.error('Error calling AI endpoint:', error);
      // Fallback to mock response on error
      return this.getMockResponse(message, context);
    }
  }

  private async getMockResponse(message: string, context: Message[]): Promise<ChatResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("angebot") || lowerMessage.includes("preis") || 
        lowerMessage.includes("kosten") || context.length > 3) {
      // Generate a mock offer
      const mockOffer = {
        id: `offer-${Date.now()}`,
        title: "Maßgeschneiderte Beratungslösung",
        description: "Basierend auf Ihren Anforderungen haben wir folgendes Angebot zusammengestellt:",
        items: [
          {
            name: "Initial-Beratung",
            description: "Umfassende Analyse Ihrer aktuellen Situation",
            price: 150,
            quantity: 2,
          },
          {
            name: "Strategieentwicklung",
            description: "Entwicklung einer maßgeschneiderten Strategie",
            price: 300,
            quantity: 1,
          },
          {
            name: "Implementierungsunterstützung",
            description: "Begleitung bei der Umsetzung",
            price: 200,
            quantity: 3,
          },
        ],
        totalPrice: 1500,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };

      return {
        message: "Perfekt! Basierend auf unserer Unterhaltung habe ich ein maßgeschneidertes Angebot für Sie erstellt. Sie finden alle Details im Angebots-Bereich rechts. Gerne können wir die Leistungen noch anpassen oder Sie können direkt einen Beratungstermin vereinbaren.",
        offer: mockOffer,
      };
    }

    // Mock responses for different topics
    const responses = [
      "Das verstehe ich. Können Sie mir mehr Details zu Ihren spezifischen Anforderungen geben?",
      "Interessant! Um Ihnen das beste Angebot erstellen zu können, benötige ich noch einige Informationen. Was sind Ihre wichtigsten Ziele?",
      "Vielen Dank für diese Informationen. Welches Budget haben Sie sich für dieses Projekt vorgestellt?",
      "Das klingt nach einem spannenden Projekt. Gibt es bestimmte Zeitrahmen oder Deadlines, die wir beachten sollten?",
      "Perfekt! Lassen Sie mich ein paar weitere Fragen stellen, um sicherzustellen, dass wir alle Ihre Bedürfnisse abdecken.",
    ];

    return {
      message: responses[Math.floor(Math.random() * responses.length)],
    };
  }
}

export const chatService = new ChatService();
