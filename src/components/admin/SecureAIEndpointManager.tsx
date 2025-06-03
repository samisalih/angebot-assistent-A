
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, X, Plus, Trash2, Key, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AIServiceConfig {
  id: string;
  service_name: string;
  endpoint_url: string;
  api_key_name: string;
  system_prompt: string | null;
  uses_secret_key: boolean | null;
  created_at: string;
  updated_at: string;
}

export const SecureAIEndpointManager = () => {
  const [configs, setConfigs] = useState<AIServiceConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    service_name: "",
    endpoint_url: "",
    api_key_name: "",
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
        description: "Konfigurationen konnten nicht geladen werden. Überprüfen Sie Ihre Admin-Berechtigung.",
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
      system_prompt: config.system_prompt || "",
    });
    setEditingId(config.id);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setFormData({
      service_name: "",
      endpoint_url: "",
      api_key_name: "",
      system_prompt: "",
    });
    setEditingId(null);
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!formData.service_name || !formData.endpoint_url || !formData.api_key_name) {
      toast({
        title: "Fehler",
        description: "Service Name, Endpunkt URL und API Key Name sind erforderlich.",
        variant: "destructive",
      });
      return;
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
        // Update existing
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
        // Create new
        const { error } = await supabase
          .from('ai_service_config')
          .insert(updateData);

        if (error) throw error;

        toast({
          title: "Erfolgreich erstellt",
          description: `${formData.service_name} Konfiguration wurde erfolgreich erstellt.`,
        });
      }

      setEditingId(null);
      setIsCreating(false);
      resetForm();
      fetchConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Fehler",
        description: "Die Konfiguration konnte nicht gespeichert werden. Überprüfen Sie Ihre Berechtigung.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, serviceName: string) => {
    if (!confirm(`Sind Sie sicher, dass Sie ${serviceName} löschen möchten?`)) {
      return;
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
      system_prompt: "",
    });
    setEditingId(null);
    setIsCreating(false);
  };

  if (isLoading) {
    return <div className="p-4">Lade Konfiguration...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI Service Konfiguration</h2>
          <p className="text-muted-foreground">
            Sichere Verwaltung Ihrer KI-Provider. API-Schlüssel werden verschlüsselt in Supabase Secrets gespeichert.
          </p>
        </div>
        <Button onClick={handleCreate} disabled={editingId !== null || isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          Neuen Service hinzufügen
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Sicherheitshinweis</h3>
            <p className="text-sm text-blue-700 mt-1">
              API-Schlüssel werden nicht mehr in der Datenbank gespeichert. Verwenden Sie stattdessen Supabase Secrets 
              für sichere Speicherung. Der API Key Name verweist auf den entsprechenden Secret-Namen.
            </p>
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {(editingId || isCreating) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Service bearbeiten' : 'Neuen Service erstellen'}</CardTitle>
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
              <Label htmlFor="api_key_name">API Key Name (Supabase Secret)</Label>
              <Input
                id="api_key_name"
                value={formData.api_key_name}
                onChange={(e) => setFormData({...formData, api_key_name: e.target.value})}
                placeholder="OPENAI_API_KEY"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Name des Supabase Secrets, der den API-Schlüssel enthält
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
          <CardDescription>Übersicht aller AI Services mit sicherer Secret-Verwaltung</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Endpunkt</TableHead>
                <TableHead>Secret Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">
                    {config.service_name}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{config.endpoint_url}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Key className="h-3 w-3 text-muted-foreground" />
                      <span className="font-mono text-xs">{config.api_key_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={config.uses_secret_key ? "default" : "secondary"}>
                      {config.uses_secret_key ? "Verschlüsselt" : "Legacy"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(config)}
                        disabled={editingId !== null || isCreating}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(config.id, config.service_name)}
                        disabled={editingId !== null || isCreating}
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
