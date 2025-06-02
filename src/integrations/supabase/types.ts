export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_service_config: {
        Row: {
          anthropic_api_key_name: string | null
          anthropic_endpoint_url: string | null
          anthropic_is_active: boolean | null
          anthropic_max_tokens: number | null
          anthropic_model: string | null
          anthropic_name: string | null
          anthropic_system_prompt: string | null
          anthropic_temperature: number | null
          created_at: string
          gemini_api_key_name: string | null
          gemini_endpoint_url: string | null
          gemini_is_active: boolean | null
          gemini_max_tokens: number | null
          gemini_model: string | null
          gemini_name: string | null
          gemini_system_prompt: string | null
          gemini_temperature: number | null
          id: string
          openai_api_key_name: string | null
          openai_endpoint_url: string | null
          openai_is_active: boolean | null
          openai_max_tokens: number | null
          openai_model: string | null
          openai_name: string | null
          openai_system_prompt: string | null
          openai_temperature: number | null
          updated_at: string
        }
        Insert: {
          anthropic_api_key_name?: string | null
          anthropic_endpoint_url?: string | null
          anthropic_is_active?: boolean | null
          anthropic_max_tokens?: number | null
          anthropic_model?: string | null
          anthropic_name?: string | null
          anthropic_system_prompt?: string | null
          anthropic_temperature?: number | null
          created_at?: string
          gemini_api_key_name?: string | null
          gemini_endpoint_url?: string | null
          gemini_is_active?: boolean | null
          gemini_max_tokens?: number | null
          gemini_model?: string | null
          gemini_name?: string | null
          gemini_system_prompt?: string | null
          gemini_temperature?: number | null
          id?: string
          openai_api_key_name?: string | null
          openai_endpoint_url?: string | null
          openai_is_active?: boolean | null
          openai_max_tokens?: number | null
          openai_model?: string | null
          openai_name?: string | null
          openai_system_prompt?: string | null
          openai_temperature?: number | null
          updated_at?: string
        }
        Update: {
          anthropic_api_key_name?: string | null
          anthropic_endpoint_url?: string | null
          anthropic_is_active?: boolean | null
          anthropic_max_tokens?: number | null
          anthropic_model?: string | null
          anthropic_name?: string | null
          anthropic_system_prompt?: string | null
          anthropic_temperature?: number | null
          created_at?: string
          gemini_api_key_name?: string | null
          gemini_endpoint_url?: string | null
          gemini_is_active?: boolean | null
          gemini_max_tokens?: number | null
          gemini_model?: string | null
          gemini_name?: string | null
          gemini_system_prompt?: string | null
          gemini_temperature?: number | null
          id?: string
          openai_api_key_name?: string | null
          openai_endpoint_url?: string | null
          openai_is_active?: boolean | null
          openai_max_tokens?: number | null
          openai_model?: string | null
          openai_name?: string | null
          openai_system_prompt?: string | null
          openai_temperature?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
