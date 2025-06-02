
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

interface AIServiceConfig {
  id: string;
  openai_name: string | null;
  openai_endpoint_url: string | null;
  openai_model: string | null;
  openai_api_key_name: string | null;
  openai_is_active: boolean | null;
  openai_max_tokens: number | null;
  openai_temperature: number | null;
  openai_system_prompt: string | null;
  anthropic_name: string | null;
  anthropic_endpoint_url: string | null;
  anthropic_model: string | null;
  anthropic_api_key_name: string | null;
  anthropic_is_active: boolean | null;
  anthropic_max_tokens: number | null;
  anthropic_temperature: number | null;
  anthropic_system_prompt: string | null;
  gemini_name: string | null;
  gemini_endpoint_url: string | null;
  gemini_model: string | null;
  gemini_api_key_name: string | null;
  gemini_is_active: boolean | null;
  gemini_max_tokens: number | null;
  gemini_temperature: number | null;
  gemini_system_prompt: string | null;
}

class ChatService {
  private async getActiveService(): Promise<{
    provider: string;
    config: any;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('ai_service_config')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching service config:', error);
        return null;
      }

      const config = data as AIServiceConfig;
      
      // Check which service is active (prioritize OpenAI, then Anthropic, then Gemini)
      if (config.openai_is_active) {
        return {
          provider: 'openai',
          config: {
            id: config.id,
            name: config.openai_name,
            endpoint_url: config.openai_endpoint_url,
            model: config.openai_model,
            api_key_name: config.openai_api_key_name,
            max_tokens: config.openai_max_tokens,
            temperature: config.openai_temperature,
            system_prompt: config.openai_system_prompt,
          }
        };
      }
      
      if (config.anthropic_is_active) {
        return {
          provider: 'anthropic',
          config: {
            id: config.id,
            name: config.anthropic_name,
            endpoint_url: config.anthropic_endpoint_url,
            model: config.anthropic_model,
            api_key_name: config.anthropic_api_key_name,
            max_tokens: config.anthropic_max_tokens,
            temperature: config.anthropic_temperature,
            system_prompt: config.anthropic_system_prompt,
          }
        };
      }
      
      if (config.gemini_is_active) {
        return {
          provider: 'gemini',
          config: {
            id: config.id,
            name: config.gemini_name,
            endpoint_url: config.gemini_endpoint_url,
            model: config.gemini_model,
            api_key_name: config.gemini_api_key_name,
            max_tokens: config.gemini_max_tokens,
            temperature: config.gemini_temperature,
            system_prompt: config.gemini_system_prompt,
          }
        };
      }

      return null;
    } catch (error) {
      console.error('Error in getActiveService:', error);
      return null;
    }
  }

  async sendMessage(message: string, context: Message[]): Promise<ChatResponse> {
    const activeService = await this.getActiveService();
    
    if (!activeService) {
      // Fallback to mock response if no service is configured
      return this.getMockResponse(message, context);
    }

    try {
      // Call the AI service via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message,
          context: context.slice(-5), // Send last 5 messages for context
          provider: activeService.provider,
          config: activeService.config
        }
      });

      if (error) throw error;

      return {
        message: data.message,
        offer: data.offer
      };
    } catch (error) {
      console.error('Error calling AI service:', error);
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
