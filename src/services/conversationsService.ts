
import { supabase } from '@/integrations/supabase/client';

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string | null;
  messages: any[];
  created_at: string;
  updated_at: string;
}

export const saveConversation = async (messages: any[], title?: string) => {
  const { data, error } = await supabase
    .from('chat_conversations')
    .insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      messages,
      title: title || 'Chat Conversation',
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateConversation = async (conversationId: string, messages: any[]) => {
  const { data, error } = await supabase
    .from('chat_conversations')
    .update({
      messages,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getConversations = async () => {
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

export const deleteConversation = async (conversationId: string) => {
  const { error } = await supabase
    .from('chat_conversations')
    .delete()
    .eq('id', conversationId);

  if (error) {
    throw error;
  }
};
