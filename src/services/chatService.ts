
import { supabase } from "@/integrations/supabase/client";

// This service will handle the AI chat functionality using endpoints from Supabase

interface ChatResponse {
  message: string;
  offer?: any;
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface AIServiceConfig {
  id: string;
  service_name: string;
  endpoint_url: string;
  api_key_name: string;
  api_key: string | null;
  system_prompt: string | null;
}

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
}

class ChatService {
  private async getActiveService(): Promise<{
    provider: string;
    config: any;
  } | null> {
    try {
      // First, try to find a service with an API key stored in the database
      const { data: servicesWithKeys, error: keyError } = await supabase
        .from('ai_service_config')
        .select('*')
        .not('api_key', 'is', null)
        .order('service_name')
        .limit(1);

      if (!keyError && servicesWithKeys && servicesWithKeys.length > 0) {
        const config = servicesWithKeys[0] as AIServiceConfig;
        console.log('Using service with stored API key:', config.service_name);
        return this.formatServiceConfig(config);
      }

      // If no service with stored API key, try to find any service and check environment
      const { data: allServices, error: allError } = await supabase
        .from('ai_service_config')
        .select('*')
        .order('service_name')
        .limit(1);

      if (allError || !allServices || allServices.length === 0) {
        console.error('No AI services configured');
        return null;
      }

      const config = allServices[0] as AIServiceConfig;
      console.log('Using service (will check environment for API key):', config.service_name);
      return this.formatServiceConfig(config);
    } catch (error) {
      console.error('Error in getActiveService:', error);
      return null;
    }
  }

  private async getKnowledgeBase(): Promise<string> {
    try {
      const { data: knowledgeItems, error } = await supabase
        .from('knowledge_base')
        .select('title, content, category')
        .order('created_at', { ascending: false });

      if (error || !knowledgeItems || knowledgeItems.length === 0) {
        return '';
      }

      const knowledgeText = knowledgeItems
        .map((item: KnowledgeItem) => `### ${item.title} (${item.category})\n${item.content}`)
        .join('\n\n---\n\n');

      return `\n\nACHTUNG: Hier ist wichtiges Unternehmenswissen, das Sie bei Ihren Antworten berücksichtigen MÜSSEN:\n\n${knowledgeText}\n\nBitte nutzen Sie diese Informationen für präzise und unternehmenskonforme Antworten.`;
    } catch (error) {
      console.error('Error loading knowledge base:', error);
      return '';
    }
  }

  private formatServiceConfig(config: AIServiceConfig) {
    // Determine provider type based on service name
    let provider = 'openai'; // default
    if (config.service_name.toLowerCase().includes('anthropic')) {
      provider = 'anthropic';
    } else if (config.service_name.toLowerCase().includes('gemini')) {
      provider = 'gemini';
    }

    return {
      provider,
      config: {
        id: config.id,
        name: config.service_name,
        endpoint_url: config.endpoint_url,
        api_key_name: config.api_key_name,
        api_key: config.api_key,
        system_prompt: config.system_prompt,
      }
    };
  }

  async generateConversationTitle(messages: Message[]): Promise<string> {
    const activeService = await this.getActiveService();
    
    if (!activeService) {
      // Fallback title if no service is configured
      const userMessages = messages.filter(msg => msg.sender === "user");
      if (userMessages.length > 0) {
        const firstMessage = userMessages[0].content;
        return firstMessage.length > 50 ? firstMessage.substring(0, 50) + "..." : firstMessage;
      }
      return "Chat Conversation";
    }

    try {
      // Get the first few user messages to generate a title
      const userMessages = messages
        .filter(msg => msg.sender === "user")
        .slice(0, 3)
        .map(msg => msg.content)
        .join(" ");

      if (!userMessages) {
        return "Chat Conversation";
      }

      console.log('Generating conversation title via Edge Function');
      
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: `Erstellen Sie einen kurzen, prägnanten Titel (maximal 5 Wörter) für eine Unterhaltung basierend auf diesem Inhalt: "${userMessages}". Antworten Sie nur mit dem Titel, keine zusätzlichen Erklärungen.`,
          context: [],
          provider: activeService.provider,
          config: {
            ...activeService.config,
            system_prompt: "Sie sind ein Experte darin, prägnante Titel für Unterhaltungen zu erstellen. Erstellen Sie kurze, aussagekräftige Titel mit maximal 5 Wörtern auf Deutsch."
          }
        }
      });

      if (error) {
        console.error('Error generating title:', error);
        throw error;
      }

      if (data && data.message) {
        // Clean up the response and ensure it's not too long
        let title = data.message.trim().replace(/['"]/g, '');
        if (title.length > 50) {
          title = title.substring(0, 50) + "...";
        }
        return title;
      }

      throw new Error('No title generated');
    } catch (error) {
      console.error('Error generating conversation title:', error);
      // Fallback to first user message
      const userMessages = messages.filter(msg => msg.sender === "user");
      if (userMessages.length > 0) {
        const firstMessage = userMessages[0].content;
        return firstMessage.length > 50 ? firstMessage.substring(0, 50) + "..." : firstMessage;
      }
      return "Chat Conversation";
    }
  }

  async sendMessage(message: string, context: Message[]): Promise<ChatResponse> {
    const activeService = await this.getActiveService();
    
    if (!activeService) {
      // Fallback to mock response if no service is configured
      console.warn('No AI service configured, using mock response');
      return this.getMockResponse(message, context);
    }

    try {
      console.log('Calling AI service via Edge Function:', activeService.config.name);
      
      // Get knowledge base content
      const knowledgeBase = await this.getKnowledgeBase();
      
      // Call the AI service via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message,
          context: context.slice(-5), // Send last 5 messages for context
          provider: activeService.provider,
          config: {
            ...activeService.config,
            system_prompt: (activeService.config.system_prompt || 'Sie sind ein hilfsreicher KI-Berater.') + knowledgeBase
          },
          knowledgeBase
        }
      });

      if (error) {
        console.error('Edge Function error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No response from AI service');
      }

      console.log('AI response received:', data);

      if (data && data.message) {
        const offer = data.offer;
        if (offer) {
          let validUntilDate;
          if (offer.validUntil) {
            validUntilDate = new Date(offer.validUntil);
          }

          // Check if validUntilDate is invalid or in the past
          if (!validUntilDate || isNaN(validUntilDate.getTime()) || validUntilDate < new Date()) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 14); // Set to 14 days in the future
            offer.validUntil = futureDate.toISOString();
          } else {
            // Ensure it's an ISO string if it was a valid date object or string
            offer.validUntil = validUntilDate.toISOString();
          }
        }
        return {
          message: data.message,
          offer: offer
        };
      }

      throw new Error('No response from AI service');
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
        message: "Perfekt! Basierend auf unserer Unterhaltung habe ich ein maßgeschneidertes Angebot für Sie erstellt. Sie finden alle Details im Angebots-Bereich rechts. Gerne können wir die Leistungen noch anpassen oder Sie können direkt einen Beratungstermin vereinbaren. (HINWEIS: Dies ist eine Mock-Antwort, da kein AI-Service konfiguriert ist)",
        offer: mockOffer,
      };
    }

    // Mock responses for different topics
    const responses = [
      "Das verstehe ich. Können Sie mir mehr Details zu Ihren spezifischen Anforderungen geben? (HINWEIS: Dies ist eine Mock-Antwort, da kein AI-Service konfiguriert ist)",
      "Interessant! Um Ihnen das beste Angebot erstellen zu können, benötige ich noch einige Informationen. Was sind Ihre wichtigsten Ziele? (HINWEIS: Dies ist eine Mock-Antwort, da kein AI-Service konfiguriert ist)",
      "Vielen Dank für diese Informationen. Welches Budget haben Sie sich für dieses Projekt vorgestellt? (HINWEIS: Dies ist eine Mock-Antwort, da kein AI-Service konfiguriert ist)",
      "Das klingt nach einem spannenden Projekt. Gibt es bestimmte Zeitrahmen oder Deadlines, die wir beachten sollten? (HINWEIS: Dies ist eine Mock-Antwort, da kein AI-Service konfiguriert ist)",
      "Perfekt! Lassen Sie mich ein paar weitere Fragen stellen, um sicherzustellen, dass wir alle Ihre Bedürfnisse abdecken. (HINWEIS: Dies ist eine Mock-Antwort, da kein AI-Service konfiguriert ist)",
    ];

    return {
      message: responses[Math.floor(Math.random() * responses.length)],
    };
  }
}

export const chatService = new ChatService();
