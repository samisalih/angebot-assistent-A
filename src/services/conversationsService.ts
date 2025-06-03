
import { supabase } from '@/integrations/supabase/client';
import { chatService } from './chatService';

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string | null;
  messages: any[];
  created_at: string;
  updated_at: string;
}

export const saveConversation = async (messages: any[], title?: string) => {
  // Generate title if not provided
  let conversationTitle = title;
  if (!conversationTitle && messages.length > 1) {
    try {
      conversationTitle = await chatService.generateConversationTitle(messages);
    } catch (error) {
      console.error('Error generating title:', error);
      conversationTitle = 'Chat Conversation';
    }
  }

  const { data, error } = await supabase
    .from('chat_conversations')
    .insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      messages,
      title: conversationTitle || 'Chat Conversation',
    })
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

export const updateConversation = async (conversationId: string, messages: any[]) => {
  const { data, error } = await supabase
    .from('chat_conversations')
    .update({
      messages,
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

export const getConversations = async () => {
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Database error when getting conversations:', error);
    throw error;
  }

  return data || [];
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
