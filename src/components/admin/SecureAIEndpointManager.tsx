
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAIServiceConfig } from "@/hooks/useAIServiceConfig";
import { AIServiceForm } from "./AIServiceForm";
import { AIServiceTable } from "./AIServiceTable";
import { AIServiceConfig } from "@/types/aiServiceConfig";

export const SecureAIEndpointManager = () => {
  const { configs, isLoading, saveConfig, deleteConfig } = useAIServiceConfig();
  const [editingConfig, setEditingConfig] = useState<AIServiceConfig | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleEdit = (config: AIServiceConfig) => {
    setEditingConfig(config);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingConfig(null);
    setIsCreating(true);
  };

  const handleFormCancel = () => {
    setEditingConfig(null);
    setIsCreating(false);
  };

  const isFormOpen = editingConfig !== null || isCreating;

  if (isLoading) {
    return <div className="p-4">Lade Konfiguration...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI Service Konfiguration</h2>
          <p className="text-muted-foreground">
            Verwaltung Ihrer KI-Provider. API-Schlüssel werden sicher in Supabase Secrets verwaltet.
          </p>
        </div>
        <Button onClick={handleCreate} disabled={isFormOpen}>
          <Plus className="h-4 w-4 mr-2" />
          Neuen Service hinzufügen
        </Button>
      </div>

      {isFormOpen && (
        <AIServiceForm
          initialData={editingConfig || undefined}
          isEditing={!!editingConfig}
          onSave={saveConfig}
          onCancel={handleFormCancel}
        />
      )}

      <AIServiceTable
        configs={configs}
        onEdit={handleEdit}
        onDelete={deleteConfig}
        isFormOpen={isFormOpen}
      />
    </div>
  );
};
