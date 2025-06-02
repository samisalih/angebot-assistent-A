
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit, Plus, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export const KnowledgeManager = () => {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadKnowledgeItems();
  }, []);

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

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Fehler",
        description: "Titel und Inhalt sind erforderlich.",
        variant: "destructive",
      });
      return;
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

      setFormData({ title: "", content: "", category: "" });
      setEditingId(null);
      setIsCreating(false);
      loadKnowledgeItems();
    } catch (error) {
      console.error('Error saving knowledge item:', error);
      toast({
        title: "Fehler",
        description: "Wissensbeitrag konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: KnowledgeItem) => {
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category,
    });
    setEditingId(item.id);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
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

  const handleCancel = () => {
    setFormData({ title: "", content: "", category: "" });
    setEditingId(null);
    setIsCreating(false);
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
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingId ? "Wissensbeitrag bearbeiten" : "Neuer Wissensbeitrag"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="z.B. Preispolitik, Unternehmensrichtlinien, AGBs..."
                  />
                </div>
                <div>
                  <Label htmlFor="category">Kategorie</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="z.B. Preise, Richtlinien, Verhalten, AGBs..."
                  />
                </div>
                <div>
                  <Label htmlFor="content">Inhalt (Markdown unterstützt)</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Geben Sie hier den Inhalt ein. Markdown wird unterstützt..."
                    className="min-h-[200px]"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Speichern
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Abbrechen
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {knowledgeItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Noch keine Wissensbeiträge vorhanden. Erstellen Sie den ersten Beitrag!
              </div>
            ) : (
              knowledgeItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        {item.category && (
                          <CardDescription className="mt-1">
                            Kategorie: {item.category}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      {item.content.substring(0, 200)}
                      {item.content.length > 200 && "..."}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Erstellt: {new Date(item.created_at).toLocaleDateString("de-DE")} | 
                      Aktualisiert: {new Date(item.updated_at).toLocaleDateString("de-DE")}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
