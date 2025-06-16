
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AIServiceConfig, AIServiceFormData } from "@/types/aiServiceConfig";

export const useAIServiceConfig = () => {
  const [configs, setConfigs] = useState<AIServiceConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_service_config')
        .select('*')
        .order('service_name');

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error fetching configs:', error);
      toast({
        title: "Fehler",
        description: "Konfigurationen konnten nicht geladen werden. Überprüfen Sie Ihre Admin-Berechtigung.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async (formData: AIServiceFormData, editingId?: string) => {
    if (!formData.service_name || !formData.endpoint_url || !formData.api_key_name) {
      toast({
        title: "Fehler",
        description: "Service Name, Endpunkt URL und API Key Name sind erforderlich.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const updateData = {
        service_name: formData.service_name,
        endpoint_url: formData.endpoint_url,
        api_key_name: formData.api_key_name,
        system_prompt: formData.system_prompt || null,
        uses_secret_key: true,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error } = await supabase
          .from('ai_service_config')
          .update(updateData)
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Erfolgreich aktualisiert",
          description: `${formData.service_name} Konfiguration wurde erfolgreich aktualisiert.`,
        });
      } else {
        const { error } = await supabase
          .from('ai_service_config')
          .insert(updateData);

        if (error) throw error;

        toast({
          title: "Erfolgreich erstellt",
          description: `${formData.service_name} Konfiguration wurde erfolgreich erstellt.`,
        });
      }

      fetchConfigs();
      return true;
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Fehler",
        description: "Die Konfiguration konnte nicht gespeichert werden. Überprüfen Sie Ihre Berechtigung.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteConfig = async (id: string, serviceName: string) => {
    if (!confirm(`Sind Sie sicher, dass Sie ${serviceName} löschen möchten?`)) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('ai_service_config')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Erfolgreich gelöscht",
        description: `${serviceName} wurde erfolgreich gelöscht.`,
      });

      fetchConfigs();
      return true;
    } catch (error) {
      console.error('Error deleting config:', error);
      toast({
        title: "Fehler",
        description: "Die Konfiguration konnte nicht gelöscht werden.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  return {
    configs,
    isLoading,
    saveConfig,
    deleteConfig,
    refetch: fetchConfigs
  };
};
