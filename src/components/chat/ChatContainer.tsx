
import { useState, useEffect } from "react";
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
  resetKey?: number;
}

export const ChatContainer = ({ onOfferGenerated, resetKey }: ChatContainerProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { messages, addMessage, canSendMessage, resetConversation } = useConversationManager();
  const { offersGenerated, canCreateOffer, incrementOfferCount, resetOfferCount } = useOfferLimits();

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

    // Additional security validation
    if (messageText.length > 2000) {
      toast({
        title: "Nachricht zu lang",
        description: "Nachrichten dürfen maximal 2000 Zeichen lang sein.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: "user",
      timestamp: new Date()
    };
    
    addMessage(userMessage);
    setIsLoading(true);
    
    try {
      console.log('Sending message to chat service:', messageText);
      const response = await chatService.sendMessage(messageText, messages);
      console.log('Received response from chat service:', response);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: "ai",
        timestamp: new Date()
      };
      
      addMessage(assistantMessage);

      // Check if an offer was generated
      if (response.offer) {
        console.log('Offer detected in response:', response.offer);
        if (canCreateOffer) {
          const validatedOffer = OfferValidationService.ensureValidUntilDate(response.offer);
          console.log('Calling onOfferGenerated with validated offer:', validatedOffer);
          onOfferGenerated(validatedOffer);
          incrementOfferCount();
        } else {
          console.log('Cannot create offer - limit reached');
        }
      } else {
        console.log('No offer in response');
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      // Enhanced error handling with specific error messages
      let errorMessage = "Entschuldigung, es gab einen Fehler. Bitte versuchen Sie es erneut.";
      
      if (error.message?.includes('Zu viele Anfragen')) {
        errorMessage = error.message;
      } else if (error.message?.includes('nicht erlaubte Inhalte')) {
        errorMessage = "Ihre Nachricht enthält nicht erlaubte Inhalte. Bitte formulieren Sie sie neu.";
      } else if (error.message?.includes('zu lang')) {
        errorMessage = "Ihre Nachricht ist zu lang. Bitte kürzen Sie sie.";
      }
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        sender: "ai",
        timestamp: new Date()
      };
      addMessage(errorResponse);

      toast({
        title: "Fehler",
        description: errorMessage,
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
