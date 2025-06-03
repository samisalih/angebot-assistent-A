
import { useState } from "react";
import { chatService } from "@/services/chatService";
import { useToast } from "@/hooks/use-toast";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useConversationManager } from "@/hooks/useConversationManager";
import { useOfferLimits } from "@/hooks/useOfferLimits";
import { Message } from "@/types/message";
import { Offer } from "@/types/offer";
import { OfferValidationService } from "@/domain/OfferValidationService";

interface ChatContainerProps {
  onOfferGenerated: (offer: Offer) => void;
}

export const ChatContainer = ({ onOfferGenerated }: ChatContainerProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { messages, addMessage, canSendMessage } = useConversationManager();
  const { offersGenerated, canCreateOffer, incrementOfferCount } = useOfferLimits();

  const handleSend = async (messageText: string) => {
    if (!messageText.trim() || isLoading || !canSendMessage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: "user",
      timestamp: new Date()
    };
    
    addMessage(userMessage);
    setIsLoading(true);
    
    try {
      const response = await chatService.sendMessage(messageText, messages);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: "ai",
        timestamp: new Date()
      };
      
      addMessage(assistantMessage);

      if (response.offer) {
        if (incrementOfferCount()) {
          const validatedOffer = OfferValidationService.ensureValidUntilDate(response.offer);
          onOfferGenerated(validatedOffer);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Entschuldigung, es gab einen Fehler. Bitte versuchen Sie es erneut.",
        sender: "ai",
        timestamp: new Date()
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isInputDisabled = !canSendMessage;
  const inputPlaceholder = !canSendMessage 
    ? "Nachrichtenlimit erreicht..." 
    : "Beschreiben Sie Ihre Bedürfnisse... (Shift+Enter für neue Zeile)";

  return (
    <div className="h-full flex flex-col bg-card shadow-lg rounded-lg border">
      <MessageList messages={messages} isLoading={isLoading} />
      <div className="border-t border-border p-4 flex-shrink-0">
        <MessageInput 
          onSend={handleSend}
          isLoading={isLoading}
          isDisabled={isInputDisabled}
          placeholder={inputPlaceholder}
        />
      </div>
    </div>
  );
};
