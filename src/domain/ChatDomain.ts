
export interface IChatRepository {
  sendMessage(message: string, context: any[]): Promise<{ message: string; offer?: any }>;
  generateTitle(messages: any[]): Promise<string>;
}

export interface IInputValidator {
  validate(input: string): { isValid: boolean; error?: string };
  sanitize(input: string): string;
}

export interface IRateLimiter {
  checkLimit(): { allowed: boolean; error?: string };
}

export class ChatDomain {
  constructor(
    private chatRepository: IChatRepository,
    private inputValidator: IInputValidator,
    private rateLimiter: IRateLimiter
  ) {}

  async processMessage(message: string, context: any[]) {
    // Validate input
    const validation = this.inputValidator.validate(message);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Check rate limit
    const rateLimit = this.rateLimiter.checkLimit();
    if (!rateLimit.allowed) {
      throw new Error(rateLimit.error);
    }

    // Sanitize and process
    const sanitizedMessage = this.inputValidator.sanitize(message);
    const sanitizedContext = context.map(msg => ({
      ...msg,
      content: this.inputValidator.sanitize(msg.content)
    }));

    return this.chatRepository.sendMessage(sanitizedMessage, sanitizedContext);
  }

  async generateConversationTitle(messages: any[]): Promise<string> {
    return this.chatRepository.generateTitle(messages);
  }
}
