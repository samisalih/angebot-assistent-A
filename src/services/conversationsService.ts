import { supabase } from '@/integrations/supabase/client';
import { chatService } from './chatService';

export interface ChatMessage {
  id?: string; // Optional, might not be present for new messages
  sender: 'user' | 'ai';
  content: string;
  timestamp?: string; // Optional, depending on if you store it
  // Add any other relevant fields for a message
}

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string | null;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export const getUserConversation = async (): Promise<ChatConversation | null> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('Error fetching user or no user for getUserConversation:', authError);
    return null;
  }

  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('user_id', user.id) // Ensure it's for the current user
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Database error when getting user conversation:', error);
    throw error;
  }

  return data && data.length > 0 ? data[0] as unknown as ChatConversation : null;
};

// Fetches all conversations for the authenticated user
export const getConversations = async (): Promise<ChatConversation[]> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('Error fetching user or no user for getConversations:', authError);
    return [];
  }

  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('user_id', user.id) // Filter by the logged-in user's ID
    .order('updated_at', { ascending: false }); // Order by most recently updated

  if (error) {
    console.error('Database error when getting conversations:', error);
    throw error;
  }

  return (data as unknown as ChatConversation[]) || [];
};

export const saveConversation = async (messages: ChatMessage[], title?: string) => {
  // Check if user already has a conversation
  const existingConversation = await getUserConversation();
  if (existingConversation) {
    // Update existing conversation instead of creating new one
    return await updateConversation(existingConversation.id, messages);
  }

  // Generate title if not provided and we have enough content
  let conversationTitle = title;
  if (!conversationTitle && messages.length > 1) {
    try {
      const userMessages = messages.filter(msg => msg.sender === "user");
      if (userMessages.length > 0) {
        conversationTitle = await chatService.generateConversationTitle(messages as any);
        console.log('Generated conversation title:', conversationTitle);
      }
    } catch (error) {
      console.error('Error generating title:', error);
      const userMessages = messages.filter(msg => msg.sender === "user");
      if (userMessages.length > 0) {
        const firstUserMessage = userMessages[0].content;
        conversationTitle = firstUserMessage.length > 50 
          ? firstUserMessage.substring(0, 47) + "..." 
          : firstUserMessage;
      } else {
        conversationTitle = 'Chat mit KI-Berater';
      }
    }
  }

  const { data, error } = await supabase
    .from('chat_conversations')
    .insert([{
      user_id: (await supabase.auth.getUser()).data.user?.id,
      messages: messages as any, // Cast to any or Json
      title: conversationTitle || 'Chat mit KI-Berater',
    }])
    .select();

  if (error) {
    console.error('Database error when saving conversation:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error('Failed to save conversation - no data returned');
  }

  return data[0];
};

export const updateConversation = async (conversationId: string, messages: ChatMessage[]) => {
  const { data, error } = await supabase
    .from('chat_conversations')
    .update({
      messages: messages as any, // Cast to any or Json
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId)
    .select();

  if (error) {
    console.error('Database error when updating conversation:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error('Failed to update conversation - no data returned');
  }

  return data[0];
};

export const deleteConversation = async (conversationId: string) => {
  const { error } = await supabase
    .from('chat_conversations')
    .delete()
    .eq('id', conversationId);

  if (error) {
    console.error('Database error when deleting conversation:', error);
    throw error;
  }
};
