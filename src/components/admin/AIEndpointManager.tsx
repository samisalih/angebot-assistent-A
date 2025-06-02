
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIServiceConfig {
  id: string;
  openai_name: string | null;
  openai_endpoint_url: string | null;
  openai_model: string | null;
  openai_api_key_name: string | null;
  openai_is_active: boolean | null;
  openai_max_tokens: number | null;
  openai_temperature: number | null;
  openai_system_prompt: string | null;
  anthropic_name: string | null;
  anthropic_endpoint_url: string | null;
  anthropic_model: string | null;
  anthropic_api_key_name: string | null;
  anthropic_is_active: boolean | null;
  anthropic_max_tokens: number | null;
  anthropic_temperature: number | null;
  anthropic_system_prompt: string | null;
  gemini_name: string | null;
  gemini_endpoint_url: string | null;
  gemini_model: string | null;
  gemini_api_key_name: string | null;
  gemini_is_active: boolean | null;
  gemini_max_tokens: number | null;
  gemini_temperature: number | null;
  gemini_system_prompt: string | null;
}

export const AIEndpointManager = () => {
  const [config, setConfig] = useState<AIServiceConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    endpoint_url: "",
    model: "",
    api_key_name: "",
    is_active: false,
    max_tokens: 1000,
    temperature: 0.7,
    system_prompt: "",
  });

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_service_config')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      setConfig(data);
    } catch (error) {
      console.error('Error fetching config:', error);
      toast({
        title: "Fehler",
        description: "Konfiguration konnte nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleEdit = (provider: string) => {
    if (!config) return;
    
    const prefix = provider.toLowerCase();
    setFormData({
      name: config[`${prefix}_name` as keyof AIServiceConfig] as string || "",
      endpoint_url: config[`${prefix}_endpoint_url` as keyof AIServiceConfig] as string || "",
      model: config[`${prefix}_model` as keyof AIServiceConfig] as string || "",
      api_key_name: config[`${prefix}_api_key_name` as keyof AIServiceConfig] as string || "",
      is_active: config[`${prefix}_is_active` as keyof AIServiceConfig] as boolean || false,
      max_tokens: config[`${prefix}_max_tokens` as keyof AIServiceConfig] as number || 1000,
      temperature: config[`${prefix}_temperature` as keyof AIServiceConfig] as number || 0.7,
      system_prompt: config[`${prefix}_system_prompt` as keyof AIServiceConfig] as string || "",
    });
    setEditingProvider(provider);
  };

  const handleSave = async () => {
    if (!config || !editingProvider) return;

    try {
      const prefix = editingProvider.toLowerCase();
      const updateData = {
        [`${prefix}_name`]: formData.name,
        [`${prefix}_endpoint_url`]: formData.endpoint_url,
        [`${prefix}_model`]: formData.model,
        [`${prefix}_api_key_name`]: formData.api_key_name,
        [`${prefix}_is_active`]: formData.is_active,
        [`${prefix}_max_tokens`]: formData.max_tokens,
        [`${prefix}_temperature`]: formData.temperature,
        [`${prefix}_system_prompt`]: formData.system_prompt,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('ai_service_config')
        .update(updateData)
        .eq('id', config.id);

      if (error) throw error;

      toast({
        title: "Erfolgreich aktualisiert",
        description: `${editingProvider} Konfiguration wurde erfolgreich aktualisiert.`,
      });

      setEditingProvider(null);
      fetchConfig();
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Fehler",
        description: "Die Konfiguration konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      endpoint_url: "",
      model: "",
      api_key_name: "",
      is_active: false,
      max_tokens: 1000,
      temperature: 0.7,
      system_prompt: "",
    });
    setEditingProvider(null);
  };

  if (isLoading) {
    return <div className="p-4">Lade Konfiguration...</div>;
  }

  const providers = [
    { key: 'openai', name: 'OpenAI', icon: '🤖' },
    { key: 'anthropic', name: 'Anthropic', icon: '🎭' },
    { key: 'gemini', name: 'Google Gemini', icon: '💎' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">AI Service Konfiguration</h2>
        <p className="text-muted-foreground">Verwalten Sie Ihre KI-Provider Konfiguration</p>
      </div>

      {/* Edit Form */}
      {editingProvider && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProvider} konfigurieren</CardTitle>
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

      {/* Services Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {providers.map((provider) => {
          const prefix = provider.key;
          const isActive = config?.[`${prefix}_is_active` as keyof AIServiceConfig] as boolean;
          const name = config?.[`${prefix}_name` as keyof AIServiceConfig] as string;
          const model = config?.[`${prefix}_model` as keyof AIServiceConfig] as string;
          
          return (
            <Card key={provider.key} className="relative">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{provider.icon}</span>
                  {provider.name}
                </CardTitle>
                <Badge variant={isActive ? "default" : "secondary"} className="w-fit">
                  {isActive ? "Aktiv" : "Inaktiv"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {name && (
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm text-muted-foreground">{name}</p>
                  </div>
                )}
                {model && (
                  <div>
                    <Label className="text-sm font-medium">Modell</Label>
                    <p className="text-sm text-muted-foreground">{model}</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(provider.name)}
                  disabled={editingProvider !== null}
                  className="w-full"
                >
                  <Edit className="h-3 w-3 mr-2" />
                  Konfigurieren
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
