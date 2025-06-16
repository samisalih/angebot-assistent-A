
import { useState, useEffect } from 'react';
import { Message } from '@/types/message';
import { useAuth } from '@/contexts/AuthContext';
import { getUserConversation, updateConversation, saveConversation } from '@/services/conversationsService';
import { ConversationService } from '@/domain/ConversationService';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'chat_messages';

const INITIAL_MESSAGE: Message = {
  id: "1",
  content: "Hallo! Ich bin Ihr KI-Berater. Erzählen Sie mir von Ihren Bedürfnissen und ich helfe Ihnen dabei, das perfekte Angebot zu erstellen. Womit kann ich Ihnen heute helfen?",
  sender: "ai",
  timestamp: new Date()
};

export const useConversationManager = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Load existing conversation when user is authenticated
  useEffect(() => {
    const loadUserConversation = async () => {
      if (isAuthenticated && user) {
        try {
          const conversation = await getUserConversation();
          if (conversation) {
            setConversationId(conversation.id);
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

      const warning = ConversationService.getMessageLimitWarning(messages.length);
      if (warning) {
        toast({
          title: "Nachrichtenlimit erreicht",
          description: warning,
          variant: "destructive"
        });
      }

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

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const resetConversation = () => {
    setMessages([INITIAL_MESSAGE]);
    setConversationId(null);
    
    // Clear localStorage for current user
    if (user) {
      const userStorageKey = `${STORAGE_KEY}_${user.id}`;
      localStorage.removeItem(userStorageKey);
    }
  };

  const canSendMessage = ConversationService.canSendMessage(messages.length);

  return {
    messages,
    addMessage,
    canSendMessage,
    conversationId,
    resetConversation
  };
};
