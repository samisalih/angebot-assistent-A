
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useKnowledgeBase, KnowledgeItem } from "@/hooks/useKnowledgeBase";
import { KnowledgeForm } from "./KnowledgeForm";
import { KnowledgeList } from "./KnowledgeList";

export const KnowledgeManager = () => {
  const { knowledgeItems, isLoading, saveKnowledgeItem, deleteKnowledgeItem } = useKnowledgeBase();
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleEdit = (item: KnowledgeItem) => {
    setEditingItem(item);
    setIsCreating(true);
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsCreating(false);
  };

  const handleSave = async (formData: any, editingId?: string) => {
    const success = await saveKnowledgeItem(formData, editingId);
    if (success) {
      handleCancel();
    }
    return success;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Lädt Wissensbasis...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Wissensbasis-Verwaltung
            <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Beitrag
            </Button>
          </CardTitle>
          <CardDescription>
            Verwalten Sie Unternehmenswissen, Preispolitik, AGBs und Verhaltensrichtlinien für die KI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCreating && (
            <KnowledgeForm
              initialData={editingItem || undefined}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}

          <KnowledgeList
            items={knowledgeItems}
            onEdit={handleEdit}
            onDelete={deleteKnowledgeItem}
          />
        </CardContent>
      </Card>
    </div>
  );
};
