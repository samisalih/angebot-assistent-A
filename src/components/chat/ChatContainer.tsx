
import { useState, useEffect } from "react";
import { simpleChatService } from "@/services/simpleChatService";
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
  resetKey?: number;
}

export const ChatContainer = ({ onOfferGenerated, resetKey }: ChatContainerProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { messages, addMessage, canSendMessage, resetConversation } = useConversationManager();
  const { canCreateOffer, incrementOfferCount, resetOfferCount } = useOfferLimits();

  // Reset when resetKey changes
  useEffect(() => {
    if (resetKey && resetKey > 0) {
      console.log('Resetting chat container due to resetKey change:', resetKey);
      const performReset = async () => {
        await resetConversation();
        resetOfferCount();
      };
      performReset();
    }
  }, [resetKey, resetConversation, resetOfferCount]);

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
      console.log('ChatContainer: Sending message to simplified service');
      const response = await simpleChatService.sendMessage(messageText, messages);
      console.log('ChatContainer: Received response:', response);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: "ai",
        timestamp: new Date()
      };
      
      addMessage(assistantMessage);

      // Handle offer generation
      if (response.offer) {
        console.log('ChatContainer: Offer detected:', response.offer);
        if (canCreateOffer) {
          const validatedOffer = OfferValidationService.ensureValidUntilDate(response.offer);
          console.log('ChatContainer: Calling onOfferGenerated with validated offer');
          onOfferGenerated(validatedOffer);
          incrementOfferCount();
        } else {
          console.log('ChatContainer: Cannot create offer - limit reached');
        }
      }
    } catch (error: any) {
      console.error("ChatContainer: Error sending message:", error);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: error.message || "Entschuldigung, es gab einen Fehler. Bitte versuchen Sie es erneut.",
        sender: "ai",
        timestamp: new Date()
      };
      addMessage(errorResponse);

      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Senden der Nachricht",
        variant: "destructive",
      });
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
