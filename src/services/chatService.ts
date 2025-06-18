
import { Message } from "@/types/message";
import { Offer } from "@/types/offer";
import { ChatDomain } from "@/domain/ChatDomain";
import { InputValidator } from "@/infrastructure/InputValidator";
import { ClientRateLimiter } from "@/infrastructure/RateLimiter";
import { SupabaseChatRepository } from "@/infrastructure/SupabaseChatRepository";

// Dependency injection setup
const inputValidator = new InputValidator();
const rateLimiter = new ClientRateLimiter();
const chatRepository = new SupabaseChatRepository();
const chatDomain = new ChatDomain(chatRepository, inputValidator, rateLimiter);

class ChatService {
  async sendMessage(message: string, context: Message[]): Promise<{ message: string; offer?: Offer }> {
    return chatDomain.processMessage(message, context);
  }

  async generateConversationTitle(messages: Message[]): Promise<string> {
    return chatDomain.generateConversationTitle(messages);
  }
}

export const chatService = new ChatService();
