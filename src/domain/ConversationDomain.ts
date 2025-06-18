
import { Message } from '@/types/message';

export class ConversationDomain {
  private static readonly MAX_MESSAGES = 50;
  private static readonly MAX_OFFERS_PER_CHAT = 3;
  private static readonly MIN_USER_MESSAGES_FOR_OFFER = 5;
  private static readonly MIN_WORDS_PER_MESSAGE = 50;

  static canSendMessage(currentMessageCount: number): boolean {
    return currentMessageCount < this.MAX_MESSAGES;
  }

  static canCreateOffer(messages: Message[], offersGenerated: number): boolean {
    if (offersGenerated >= this.MAX_OFFERS_PER_CHAT) {
      return false;
    }

    const userMessages = messages.filter(msg => msg.sender === "user");
    if (userMessages.length < this.MIN_USER_MESSAGES_FOR_OFFER) {
      return false;
    }

    return userMessages.every(msg => this.countWords(msg.content) > this.MIN_WORDS_PER_MESSAGE);
  }

  static getMessageLimitWarning(messageCount: number): string | null {
    const WARNING_THRESHOLD = 45;
    if (messageCount >= WARNING_THRESHOLD) {
      return `Diese Unterhaltung hat ${messageCount} von maximal ${this.MAX_MESSAGES} Nachrichten. Sie können bald keine weiteren Nachrichten hinzufügen.`;
    }
    return null;
  }

  static getOfferLimitWarning(offersGenerated: number): string | null {
    if (offersGenerated >= this.MAX_OFFERS_PER_CHAT) {
      return `Sie haben bereits ${this.MAX_OFFERS_PER_CHAT} Angebote in dieser Unterhaltung erstellt. Starten Sie eine neue Unterhaltung für weitere Angebote.`;
    }
    return null;
  }

  private static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
}
