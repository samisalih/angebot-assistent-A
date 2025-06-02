
// This service will handle the AI chat functionality
// In the final implementation, this will connect to your backend/Supabase

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

class ChatService {
  async sendMessage(message: string, context: Message[]): Promise<ChatResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Mock response based on message content
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
