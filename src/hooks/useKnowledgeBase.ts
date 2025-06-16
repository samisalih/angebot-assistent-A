
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeFormData {
  title: string;
  content: string;
  category: string;
}

export const useKnowledgeBase = () => {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadKnowledgeItems = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKnowledgeItems(data || []);
    } catch (error) {
      console.error('Error loading knowledge items:', error);
      toast({
        title: "Fehler",
        description: "Wissensbasis konnte nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveKnowledgeItem = async (formData: KnowledgeFormData, editingId?: string) => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Fehler",
        description: "Titel und Inhalt sind erforderlich.",
        variant: "destructive",
      });
      return false;
    }

    try {
      if (editingId) {
        // Update existing item
        const { error } = await supabase
          .from('knowledge_base')
          .update({
            title: formData.title,
            content: formData.content,
            category: formData.category,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
        toast({
          title: "Erfolg",
          description: "Wissensbeitrag wurde aktualisiert.",
        });
      } else {
        // Create new item
        const { error } = await supabase
          .from('knowledge_base')
          .insert({
            title: formData.title,
            content: formData.content,
            category: formData.category,
          });

        if (error) throw error;
        toast({
          title: "Erfolg",
          description: "Wissensbeitrag wurde erstellt.",
        });
      }

      loadKnowledgeItems();
      return true;
    } catch (error) {
      console.error('Error saving knowledge item:', error);
      toast({
        title: "Fehler",
        description: "Wissensbeitrag konnte nicht gespeichert werden.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteKnowledgeItem = async (id: string) => {
    if (!confirm("Sind Sie sicher, dass Sie diesen Wissensbeitrag löschen möchten?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Erfolg",
        description: "Wissensbeitrag wurde gelöscht.",
      });
      loadKnowledgeItems();
    } catch (error) {
      console.error('Error deleting knowledge item:', error);
      toast({
        title: "Fehler",
        description: "Wissensbeitrag konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadKnowledgeItems();
  }, []);

  return {
    knowledgeItems,
    isLoading,
    saveKnowledgeItem,
    deleteKnowledgeItem,
    reloadItems: loadKnowledgeItems,
  };
};
