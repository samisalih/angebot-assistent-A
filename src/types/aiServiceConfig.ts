
export interface AIServiceConfig {
  id: string;
  service_name: string;
  endpoint_url: string;
  api_key_name: string;
  system_prompt: string | null;
  uses_secret_key: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface AIServiceFormData {
  service_name: string;
  endpoint_url: string;
  api_key_name: string;
  system_prompt: string;
}
