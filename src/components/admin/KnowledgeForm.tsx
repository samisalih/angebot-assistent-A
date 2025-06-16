
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";
import { KnowledgeItem, KnowledgeFormData } from "@/hooks/useKnowledgeBase";

interface KnowledgeFormProps {
  initialData?: KnowledgeItem;
  onSave: (formData: KnowledgeFormData, editingId?: string) => Promise<boolean>;
  onCancel: () => void;
}

export const KnowledgeForm = ({ initialData, onSave, onCancel }: KnowledgeFormProps) => {
  const [formData, setFormData] = useState<KnowledgeFormData>({
    title: initialData?.title || "",
    content: initialData?.content || "",
    category: initialData?.category || "",
  });

  const handleSave = async () => {
    const success = await onSave(formData, initialData?.id);
    if (success) {
      setFormData({ title: "", content: "", category: "" });
      onCancel();
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">
          {initialData ? "Wissensbeitrag bearbeiten" : "Neuer Wissensbeitrag"}
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
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Abbrechen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
