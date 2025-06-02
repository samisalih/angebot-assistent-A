
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AIServiceConfig {
  id: string;
  service_name: string;
  endpoint_url: string;
  api_key_name: string;
  api_key: string | null;
  is_active: boolean;
  model: string | null;
  max_tokens: number;
  temperature: number;
  system_prompt: string | null;
  created_at: string;
  updated_at: string;
}

export const AIEndpointManager = () => {
  const [configs, setConfigs] = useState<AIServiceConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    service_name: "",
    endpoint_url: "",
    api_key_name: "",
    api_key: "",
    is_active: false,
    model: "",
    max_tokens: 1000,
    temperature: 0.7,
    system_prompt: "",
  });

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
        description: "Konfigurationen konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleEdit = (config: AIServiceConfig) => {
    setFormData({
      service_name: config.service_name,
      endpoint_url: config.endpoint_url,
      api_key_name: config.api_key_name,
      api_key: config.api_key || "",
      is_active: config.is_active,
      model: config.model || "",
      max_tokens: config.max_tokens,
      temperature: config.temperature,
      system_prompt: config.system_prompt || "",
    });
    setEditingId(config.id);
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      const updateData = {
        service_name: formData.service_name,
        endpoint_url: formData.endpoint_url,
        api_key_name: formData.api_key_name,
        api_key: formData.api_key || null,
        is_active: formData.is_active,
        model: formData.model || null,
        max_tokens: formData.max_tokens,
        temperature: formData.temperature,
        system_prompt: formData.system_prompt || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('ai_service_config')
        .update(updateData)
        .eq('id', editingId);

      if (error) throw error;

      toast({
        title: "Erfolgreich aktualisiert",
        description: `${formData.service_name} Konfiguration wurde erfolgreich aktualisiert.`,
      });

      setEditingId(null);
      resetForm();
      fetchConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Fehler",
        description: "Die Konfiguration konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, serviceName: string) => {
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
    } catch (error) {
      console.error('Error deleting config:', error);
      toast({
        title: "Fehler",
        description: "Die Konfiguration konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      service_name: "",
      endpoint_url: "",
      api_key_name: "",
      api_key: "",
      is_active: false,
      model: "",
      max_tokens: 1000,
      temperature: 0.7,
      system_prompt: "",
    });
    setEditingId(null);
  };

  if (isLoading) {
    return <div className="p-4">Lade Konfiguration...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">AI Service Konfiguration</h2>
        <p className="text-muted-foreground">Verwalten Sie Ihre KI-Provider Konfiguration</p>
      </div>

      {/* Edit Form */}
      {editingId && (
        <Card>
          <CardHeader>
            <CardTitle>Service konfigurieren</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service_name">Service Name</Label>
                <Input
                  id="service_name"
                  value={formData.service_name}
                  onChange={(e) => setFormData({...formData, service_name: e.target.value})}
                  placeholder="z.B. OpenAI"
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

            <div>
              <Label htmlFor="endpoint_url">Endpunkt URL</Label>
              <Input
                id="endpoint_url"
                value={formData.endpoint_url}
                onChange={(e) => setFormData({...formData, endpoint_url: e.target.value})}
                placeholder="https://api.openai.com/v1/chat/completions"
              />
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
              <Label htmlFor="api_key">API Key (optional)</Label>
              <Input
                id="api_key"
                type="password"
                value={formData.api_key}
                onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                placeholder="Leer lassen für Umgebungsvariable"
              />
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

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Konfigurierte Services</CardTitle>
          <CardDescription>Übersicht aller AI Services</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Modell</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">
                    {config.service_name}
                  </TableCell>
                  <TableCell>{config.model || 'Nicht gesetzt'}</TableCell>
                  <TableCell>
                    <Badge variant={config.is_active ? "default" : "secondary"}>
                      {config.is_active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {config.api_key ? "Gesetzt" : config.api_key_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(config)}
                        disabled={editingId !== null}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(config.id, config.service_name)}
                        disabled={editingId !== null}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
