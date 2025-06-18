
import { useState, useEffect } from 'react';
import { Message } from '@/types/message';
import { useAuth } from '@/contexts/AuthContext';
import { getUserConversation, updateConversation, saveConversation, deleteConversation } from '@/services/conversationsService';
import { ConversationDomain } from '@/domain/ConversationDomain';
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
  const [hasBeenReset, setHasBeenReset] = useState(false);

  const saveToDatabase = async () => {
    try {
      const messagesForApi = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }));
      
      if (conversationId) {
        await updateConversation(conversationId, messagesForApi);
      } else {
        const conversation = await saveConversation(messagesForApi);
        setConversationId(conversation.id);
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

  // Load existing conversation when user is authenticated
  useEffect(() => {
    const loadUserConversation = async () => {
      if (isAuthenticated && user && !hasBeenReset) {
        try {
          const conversation = await getUserConversation();
          if (conversation && conversation.messages.length > 1) {
            setConversationId(conversation.id);
            const messagesWithDates = conversation.messages.map((msg: any) => ({
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
  }, [isAuthenticated, user, hasBeenReset]);

  // Save messages when they change
  useEffect(() => {
    if (isAuthenticated && user && messages.length > 1 && !hasBeenReset) {
      const userStorageKey = `${STORAGE_KEY}_${user.id}`;
      localStorage.setItem(userStorageKey, JSON.stringify(messages));

      const warning = ConversationDomain.getMessageLimitWarning(messages.length);
      if (warning) {
        toast({
          title: "Nachrichtenlimit erreicht",
          description: warning,
          variant: "destructive"
        });
      }

      saveToDatabase();
    }
  }, [messages, isAuthenticated, user, conversationId, toast, hasBeenReset]);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    if (hasBeenReset) {
      setHasBeenReset(false);
    }
  };

  const resetConversation = async () => {
    console.log('Resetting conversation to initial state');
    
    setHasBeenReset(true);
    
    // Delete conversation from database if it exists
    if (conversationId) {
      try {
        await deleteConversation(conversationId);
        console.log('Deleted conversation from database:', conversationId);
      } catch (error) {
        console.error('Error deleting conversation from database:', error);
      }
    }
    
    // Reset local state
    setMessages([INITIAL_MESSAGE]);
    setConversationId(null);
    
    // Clear localStorage
    if (user) {
      const userStorageKey = `${STORAGE_KEY}_${user.id}`;
      localStorage.removeItem(userStorageKey);
    }
    localStorage.removeItem(STORAGE_KEY);
  };

  const canSendMessage = ConversationDomain.canSendMessage(messages.length);

  return {
    messages,
    addMessage,
    canSendMessage,
    conversationId,
    resetConversation
  };
};
