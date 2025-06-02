
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, FileText } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { chatService } from "@/services/chatService";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

interface ChatInterfaceProps {
  onOfferGenerated: (offer: any) => void;
}

export const ChatInterface = ({ onOfferGenerated }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hallo! Ich bin Ihr KI-Berater. Erzählen Sie mir von Ihren Bedürfnissen und ich helfe Ihnen dabei, das perfekte Angebot zu erstellen. Womit kann ich Ihnen heute helfen?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper function to count words in a message
  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Check if user can create an offer
  const canCreateOffer = (): boolean => {
    const userMessages = messages.filter(msg => msg.sender === "user");
    
    if (userMessages.length <= 4) {
      return false;
    }

    // Check if all user messages have more than 50 words
    return userMessages.every(msg => countWords(msg.content) > 50);
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(textToSend, messages);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Check if an offer was generated
      if (response.offer) {
        onOfferGenerated(response.offer);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Entschuldigung, es gab einen Fehler. Bitte versuchen Sie es erneut.",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOffer = async () => {
    const offerRequest = "Basierend auf unserer Unterhaltung, erstellen Sie mir bitte ein detailliertes Angebot mit allen besprochenen Leistungen und Preisen.";
    await handleSend(offerRequest);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isOfferCreationEnabled = canCreateOffer() && !isLoading;

  return (
    <div className="h-full flex flex-col bg-card shadow-lg rounded-lg border">
      {/* Messages */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Bot className="h-4 w-4 animate-pulse" />
                <span className="text-sm">Der Assistent tippt...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 space-y-3 flex-shrink-0">
        {/* Create Offer Button */}
        <div className="flex justify-center">
          <Button 
            onClick={handleCreateOffer}
            disabled={!isOfferCreationEnabled}
            variant="outline"
            className="border-accent/50 text-accent hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed"
            title={!canCreateOffer() ? "Bitte senden Sie mindestens 5 Nachrichten mit jeweils mehr als 50 Wörtern, um ein Angebot zu erstellen." : ""}
          >
            <FileText className="h-4 w-4 mr-2" />
            Explizit Angebot anfordern
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Beschreiben Sie Ihre Bedürfnisse... (Shift+Enter für neue Zeile)"
            disabled={isLoading}
            className="flex-1 min-h-[60px] max-h-[120px] resize-none"
            rows={2}
          />
          <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()} className="self-end">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
