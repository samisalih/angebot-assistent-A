import { useState, useEffect } from "react";
import { chatService } from "@/services/chatService";
import { useAuth } from "@/contexts/AuthContext";
import { saveConversation, updateConversation, getUserConversation } from "@/services/conversationsService";
import { useToast } from "@/hooks/use-toast";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { OfferRequestButton } from "./OfferRequestButton";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface ChatInterfaceProps {
  onOfferGenerated: (offer: any) => void;
}

const STORAGE_KEY = 'chat_messages';
const MAX_OFFERS_PER_CHAT = 3;

export const ChatInterface = ({
  onOfferGenerated
}: ChatInterfaceProps) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([{
    id: "1",
    content: "Hallo! Ich bin Ihr KI-Berater. Erzählen Sie mir von Ihren Bedürfnissen und ich helfe Ihnen dabei, das perfekte Angebot zu erstellen. Womit kann ich Ihnen heute helfen?",
    sender: "ai",
    timestamp: new Date()
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [offersGenerated, setOffersGenerated] = useState(0);

  // Load existing conversation when user is authenticated
  useEffect(() => {
    const loadUserConversation = async () => {
      if (isAuthenticated && user) {
        try {
          const conversation = await getUserConversation();
          if (conversation) {
            setConversationId(conversation.id);
            // Properly cast the messages from JSON to array
            const conversationMessages = Array.isArray(conversation.messages) ? conversation.messages : [];
            const messagesWithDates = conversationMessages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }));
            setMessages(messagesWithDates);
          }
        } catch (error) {
          console.error('Error loading conversation:', error);
        }
      }
    };
    loadUserConversation();
  }, [isAuthenticated, user]);

  // Save messages to localStorage and database when messages change and user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && messages.length > 1) {
      const userStorageKey = `${STORAGE_KEY}_${user.id}`;
      localStorage.setItem(userStorageKey, JSON.stringify(messages));

      // Check if we're approaching the message limit
      if (messages.length >= 45) {
        toast({
          title: "Nachrichtenlimit erreicht",
          description: `Diese Unterhaltung hat ${messages.length} von maximal 50 Nachrichten. Sie können bald keine weiteren Nachrichten hinzufügen.`,
          variant: "destructive"
        });
      }

      // Save to database - convert timestamps to strings for the API
      const saveToDatabase = async () => {
        try {
          const messagesForApi = messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString()
          }));
          
          if (conversationId) {
            await updateConversation(conversationId, messagesForApi);
          } else {
            try {
              const conversation = await saveConversation(messagesForApi);
              setConversationId(conversation.id);
            } catch (error: any) {
              console.error('Error saving conversation:', error);
            }
          }
        } catch (error: any) {
          console.error('Error saving conversation to database:', error);
          if (error.message?.includes('Conversation cannot have more than 50 messages')) {
            toast({
              title: "Nachrichtenlimit erreicht",
              description: "Diese Unterhaltung hat das Maximum von 50 Nachrichten erreicht.",
              variant: "destructive"
            });
          }
        }
      };
      saveToDatabase();
    }
  }, [messages, isAuthenticated, user, conversationId, toast]);

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

  const handleSend = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    // Check message limit for current conversation
    if (messages.length >= 50) {
      toast({
        title: "Nachrichtenlimit erreicht",
        description: "Diese Unterhaltung hat das Maximum von 50 Nachrichten erreicht.",
        variant: "destructive"
      });
      return;
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: "user",
      timestamp: new Date()
    };
    
    console.log('Adding user message:', userMessage);
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      console.log('Calling chat service...');
      const response = await chatService.sendMessage(messageText, messages);
      console.log('Chat service response:', response);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: "ai",
        timestamp: new Date()
      };
      
      console.log('Adding AI message:', assistantMessage);
      setMessages(prev => [...prev, assistantMessage]);

      // Check if an offer was generated
      if (response.offer) {
        if (offersGenerated >= MAX_OFFERS_PER_CHAT) {
          toast({
            title: "Angebotslimit erreicht",
            description: `Sie können maximal ${MAX_OFFERS_PER_CHAT} Angebote pro Unterhaltung erstellen. Starten Sie eine neue Unterhaltung für weitere Angebote.`,
            variant: "destructive"
          });
          return;
        }
        
        setOffersGenerated(prev => prev + 1);
        onOfferGenerated(response.offer);
        
        if (offersGenerated + 1 >= MAX_OFFERS_PER_CHAT) {
          toast({
            title: "Letztes Angebot erstellt",
            description: "Sie haben das Maximum von 3 Angeboten pro Unterhaltung erreicht.",
            variant: "default"
          });
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
      console.log('Adding error message:', errorMessage);
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOffer = async () => {
    if (offersGenerated >= MAX_OFFERS_PER_CHAT) {
      toast({
        title: "Angebotslimit erreicht",
        description: `Sie können maximal ${MAX_OFFERS_PER_CHAT} Angebote pro Unterhaltung erstellen. Starten Sie eine neue Unterhaltung für weitere Angebote.`,
        variant: "destructive"
      });
      return;
    }

    const offerRequest = "Basierend auf unserer Unterhaltung, erstellen Sie mir bitte ein detailliertes Angebot mit allen besprochenen Leistungen und Preisen.";
    await handleSend(offerRequest);
  };

  const isOfferCreationEnabled = canCreateOffer() && !isLoading && messages.length < 50 && offersGenerated < MAX_OFFERS_PER_CHAT;
  const isInputDisabled = messages.length >= 50;
  const inputPlaceholder = messages.length >= 50 
    ? "Nachrichtenlimit erreicht..." 
    : "Beschreiben Sie Ihre Bedürfnisse... (Shift+Enter für neue Zeile)";

  return (
    <div className="h-full flex flex-col bg-card shadow-lg rounded-lg border">
      <MessageList messages={messages} isLoading={isLoading} />

      {/* Input Section */}
      <div className="border-t border-border p-4 space-y-3 flex-shrink-0">
        <OfferRequestButton 
          onRequestOffer={handleCreateOffer}
          isEnabled={isOfferCreationEnabled}
          isLoading={isLoading}
          messageCount={messages.length}
          canCreateOffer={canCreateOffer()}
          offersGenerated={offersGenerated}
          maxOffers={MAX_OFFERS_PER_CHAT}
        />
        
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
