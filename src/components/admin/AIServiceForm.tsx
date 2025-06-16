
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";
import { AIServiceConfig, AIServiceFormData } from "@/types/aiServiceConfig";

interface AIServiceFormProps {
  initialData?: AIServiceConfig;
  isEditing: boolean;
  onSave: (formData: AIServiceFormData, editingId?: string) => Promise<boolean>;
  onCancel: () => void;
}

export const AIServiceForm = ({ initialData, isEditing, onSave, onCancel }: AIServiceFormProps) => {
  const [formData, setFormData] = useState<AIServiceFormData>({
    service_name: initialData?.service_name || "",
    endpoint_url: initialData?.endpoint_url || "",
    api_key_name: initialData?.api_key_name || "",
    system_prompt: initialData?.system_prompt || "",
  });

  const handleSave = async () => {
    const success = await onSave(formData, initialData?.id);
    if (success) {
      onCancel();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Service bearbeiten' : 'Neuen Service erstellen'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="service_name">Service Name</Label>
          <Input
            id="service_name"
            value={formData.service_name}
            onChange={(e) => setFormData({...formData, service_name: e.target.value})}
            placeholder="z.B. OpenAI, Anthropic, Gemini"
          />
        </div>

        <div>
          <Label htmlFor="endpoint_url">Endpunkt URL</Label>
          <Input
            id="endpoint_url"
            value={formData.endpoint_url}
            onChange={(e) => setFormData({...formData, endpoint_url: e.target.value})}
            placeholder="https://api.openai.com/v1/chat/completions"
          />
        </div>

        <div>
          <Label htmlFor="api_key_name">Secret Name (in Supabase)</Label>
          <Input
            id="api_key_name"
            value={formData.api_key_name}
            onChange={(e) => setFormData({...formData, api_key_name: e.target.value})}
            placeholder="OPENAI_API_KEY"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Name des Supabase Secrets, der den API-Schlüssel enthält.
          </p>
        </div>

        <div>
          <Label htmlFor="system_prompt">System Prompt</Label>
          <Textarea
            id="system_prompt"
            value={formData.system_prompt}
            onChange={(e) => setFormData({...formData, system_prompt: e.target.value})}
            placeholder="Sie sind ein hilfsreicher KI-Assistent..."
            rows={3}
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
