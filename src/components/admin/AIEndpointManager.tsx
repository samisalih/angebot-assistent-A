
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIEndpoint {
  id: string;
  name: string;
  provider: string;
  endpoint_url: string;
  model: string;
  api_key_name: string;
  is_active: boolean;
  max_tokens: number;
  temperature: number;
  system_prompt: string;
}

export const AIEndpointManager = () => {
  const [endpoints, setEndpoints] = useState<AIEndpoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    provider: "openai",
    endpoint_url: "",
    model: "",
    api_key_name: "",
    is_active: true,
    max_tokens: 1000,
    temperature: 0.7,
    system_prompt: "",
  });

  const fetchEndpoints = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_endpoints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEndpoints(data || []);
    } catch (error) {
      console.error('Error fetching endpoints:', error);
      toast({
        title: "Fehler",
        description: "Endpunkte konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      provider: "openai",
      endpoint_url: "",
      model: "",
      api_key_name: "",
      is_active: true,
      max_tokens: 1000,
      temperature: 0.7,
      system_prompt: "",
    });
    setEditingId(null);
    setIsCreating(false);
  };

  const handleEdit = (endpoint: AIEndpoint) => {
    setFormData({
      name: endpoint.name,
      provider: endpoint.provider,
      endpoint_url: endpoint.endpoint_url,
      model: endpoint.model,
      api_key_name: endpoint.api_key_name,
      is_active: endpoint.is_active,
      max_tokens: endpoint.max_tokens,
      temperature: endpoint.temperature,
      system_prompt: endpoint.system_prompt || "",
    });
    setEditingId(endpoint.id);
    setIsCreating(false);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        // Update existing endpoint
        const { error } = await supabase
          .from('ai_endpoints')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
        toast({
          title: "Erfolgreich aktualisiert",
          description: "Der Endpunkt wurde erfolgreich aktualisiert.",
        });
      } else {
        // Create new endpoint
        const { error } = await supabase
          .from('ai_endpoints')
          .insert([formData]);

        if (error) throw error;
        toast({
          title: "Erfolgreich erstellt",
          description: "Der neue Endpunkt wurde erfolgreich erstellt.",
        });
      }

      resetForm();
      fetchEndpoints();
    } catch (error) {
      console.error('Error saving endpoint:', error);
      toast({
        title: "Fehler",
        description: "Der Endpunkt konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sind Sie sicher, dass Sie diesen Endpunkt löschen möchten?")) return;

    try {
      const { error } = await supabase
        .from('ai_endpoints')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Erfolgreich gelöscht",
        description: "Der Endpunkt wurde erfolgreich gelöscht.",
      });
      
      fetchEndpoints();
    } catch (error) {
      console.error('Error deleting endpoint:', error);
      toast({
        title: "Fehler",
        description: "Der Endpunkt konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="p-4">Lade Endpunkte...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI Endpunkt Manager</h2>
          <p className="text-muted-foreground">Verwalten Sie Ihre KI-Provider und deren Konfiguration</p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating || editingId}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Endpunkt
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Endpunkt bearbeiten' : 'Neuer Endpunkt'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="z.B. OpenAI GPT-4"
                />
              </div>
              <div>
                <Label htmlFor="provider">Provider</Label>
                <Select value={formData.provider} onValueChange={(value) => setFormData({...formData, provider: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="model">Modell</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  placeholder="gpt-4o-mini"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="api_key_name">API Key Name</Label>
                <Input
                  id="api_key_name"
                  value={formData.api_key_name}
                  onChange={(e) => setFormData({...formData, api_key_name: e.target.value})}
                  placeholder="OPENAI_API_KEY"
                />
              </div>
              <div>
                <Label htmlFor="max_tokens">Max Tokens</Label>
                <Input
                  id="max_tokens"
                  type="number"
                  value={formData.max_tokens}
                  onChange={(e) => setFormData({...formData, max_tokens: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={formData.temperature}
                  onChange={(e) => setFormData({...formData, temperature: parseFloat(e.target.value)})}
                />
              </div>
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

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label>Aktiv</Label>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </Button>
              <Button variant="outline" onClick={resetForm}>
                <X className="h-4 w-4 mr-2" />
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Endpoints List */}
      <div className="grid gap-4">
        {endpoints.map((endpoint) => (
          <Card key={endpoint.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{endpoint.name}</h3>
                    <Badge variant={endpoint.is_active ? "default" : "secondary"}>
                      {endpoint.is_active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                    <Badge variant="outline">{endpoint.provider}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Modell: {endpoint.model} | Max Tokens: {endpoint.max_tokens} | Temperature: {endpoint.temperature}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    API Key: {endpoint.api_key_name}
                  </p>
                  {endpoint.system_prompt && (
                    <p className="text-sm text-muted-foreground">
                      System: {endpoint.system_prompt.substring(0, 100)}...
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(endpoint)}
                    disabled={isCreating || editingId}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(endpoint.id)}
                    disabled={isCreating || editingId}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
