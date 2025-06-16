
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
  system_prompt: string | null;
  uses_secret_key: boolean | null;
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
      console.log('=== GETTING ACTIVE AI SERVICE ===');
      // Get available services that have working API keys
      const { data: allServices, error: allError } = await supabase
        .from('ai_service_config')
        .select('*')
        .order('service_name');

      if (allError) {
        console.error('Error fetching AI services:', allError);
        return null;
      }

      if (!allServices || allServices.length === 0) {
        console.log('No AI services configured');
        return null;
      }

      // Prefer OpenAI if available (since we know we have that key)
      let preferredConfig = allServices.find(config => 
        config.service_name.toLowerCase().includes('openai')
      );

      // If no OpenAI config, use the first one
      if (!preferredConfig) {
        preferredConfig = allServices[0];
      }

      console.log('Using service configuration:', preferredConfig.service_name);
      console.log('Service endpoint:', preferredConfig.endpoint_url);
      console.log('Service API key name:', preferredConfig.api_key_name);
      
      return this.formatServiceConfig(preferredConfig);
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
        system_prompt: config.system_prompt,
        uses_secret_key: config.uses_secret_key,
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
      
      // Convert messages to the format expected by the API (with string timestamps)
      const contextForApi = messages.slice(-5).map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: msg.timestamp.toISOString()
      }));
      
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: `Erstellen Sie einen kurzen, prägnanten Titel (maximal 5 Wörter) für eine Unterhaltung basierend auf diesem Inhalt: "${userMessages}". Antworten Sie nur mit dem Titel, keine zusätzlichen Erklärungen.`,
          context: contextForApi,
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
    console.log('=== CHAT SERVICE: SEND MESSAGE ===');
    console.log('Message preview:', message.substring(0, 50) + '...');
    console.log('Context length:', context.length);
    
    const activeService = await this.getActiveService();
    
    if (!activeService) {
      console.warn('=== NO AI SERVICE CONFIGURED ===');
      console.warn('Falling back to mock response');
      return this.getMockResponse(message, context);
    }

    try {
      console.log('=== CALLING AI SERVICE VIA EDGE FUNCTION ===');
      console.log('Provider:', activeService.provider);
      console.log('Config name:', activeService.config.name);
      
      // Get knowledge base content
      const knowledgeBase = await this.getKnowledgeBase();
      console.log('Knowledge base loaded, length:', knowledgeBase.length);
      
      // Convert messages to the format expected by the API (with string timestamps)
      const contextForApi = context.slice(-5).map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: msg.timestamp.toISOString()
      }));
      
      console.log('Context for API prepared, messages count:', contextForApi.length);
      
      // Call the AI service via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message,
          context: contextForApi,
          provider: activeService.provider,
          config: {
            ...activeService.config,
            system_prompt: (activeService.config.system_prompt || 'Sie sind ein hilfsreicher KI-Berater.') + knowledgeBase
          },
          knowledgeBase
        }
      });

      if (error) {
        console.error('=== EDGE FUNCTION ERROR ===');
        console.error('Error details:', error);
        console.log('Falling back to mock response due to Edge Function error');
        return this.getMockResponse(message, context);
      }

      if (!data) {
        console.error('=== NO RESPONSE FROM AI SERVICE ===');
        console.log('Falling back to mock response due to no data');
        return this.getMockResponse(message, context);
      }

      // Check if the response indicates we should use mock (no API key available)
      if (data.shouldUseMock || data.error?.includes('NO_API_KEY')) {
        console.warn('=== API KEY NOT AVAILABLE, USING MOCK ===');
        console.warn('Edge function indicates API key not available:', data.error);
        return this.getMockResponse(message, context);
      }

      console.log('=== AI RESPONSE RECEIVED ===');
      console.log('Response has message:', !!data.message);
      console.log('Response has offer:', !!data.offer);
      console.log('Message preview:', data.message ? data.message.substring(0, 100) + '...' : 'No message');

      if (data && data.message) {
        const offer = data.offer;
        if (offer) {
          console.log('=== PROCESSING OFFER ===');
          console.log('Offer title:', offer.title);
          console.log('Offer items:', offer.items?.length || 0);
          
          let validUntilDate;
          if (offer.validUntil) {
            validUntilDate = new Date(offer.validUntil);
          }

          // Check if validUntilDate is invalid or in the past
          if (!validUntilDate || isNaN(validUntilDate.getTime()) || validUntilDate < new Date()) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 14); // Set to 14 days in the future
            offer.validUntil = futureDate.toISOString();
            console.log('Updated offer validUntil to:', offer.validUntil);
          } else {
            // Ensure it's an ISO string if it was a valid date object or string
            offer.validUntil = validUntilDate.toISOString();
          }
        }
        
        console.log('=== RETURNING SUCCESSFUL RESPONSE ===');
        return {
          message: data.message,
          offer: offer
        };
      }

      console.error('Invalid response format from AI service');
      return this.getMockResponse(message, context);
    } catch (error) {
      console.error('=== CATCH BLOCK ERROR ===');
      console.error('Error calling AI service:', error);
      // Fallback to mock response on error
      console.log('Falling back to mock response due to catch block');
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
        message: "Perfekt! Basierend auf unserer Unterhaltung habe ich ein maßgeschneidertes Angebot für Sie erstellt. Sie finden alle Details im Angebots-Bereich rechts. Gerne können wir die Leistungen noch anpassen oder Sie können direkt einen Beratungstermin vereinbaren. (HINWEIS: Dies ist eine Mock-Antwort, da der AI-Service einen Fehler hat)",
        offer: mockOffer,
      };
    }

    // Mock responses for different topics
    const responses = [
      "Das verstehe ich. Können Sie mir mehr Details zu Ihren spezifischen Anforderungen geben? (HINWEIS: Dies ist eine Mock-Antwort, da der AI-Service einen Fehler hat)",
      "Interessant! Um Ihnen das beste Angebot erstellen zu können, benötige ich noch einige Informationen. Was sind Ihre wichtigsten Ziele? (HINWEIS: Dies ist eine Mock-Antwort, da der AI-Service einen Fehler hat)",
      "Vielen Dank für diese Informationen. Welches Budget haben Sie sich für dieses Projekt vorgestellt? (HINWEIS: Dies ist eine Mock-Antwort, da der AI-Service einen Fehler hat)",
      "Das klingt nach einem spannenden Projekt. Gibt es bestimmte Zeitrahmen oder Deadlines, die wir beachten sollten? (HINWEIS: Dies ist eine Mock-Antwort, da der AI-Service einen Fehler hat)",
      "Perfekt! Lassen Sie mich ein paar weitere Fragen stellen, um sicherzustellen, dass wir alle Ihre Bedürfnisse abdecken. (HINWEIS: Dies ist eine Mock-Antwort, da der AI-Service einen Fehler hat)",
    ];

    return {
      message: responses[Math.floor(Math.random() * responses.length)],
    };
  }
}

export const chatService = new ChatService();
