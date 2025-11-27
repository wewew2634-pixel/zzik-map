export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      journey_patterns: {
        Row: {
          avg_time_between: unknown
          created_at: string | null
          from_location_id: string
          id: string
          journey_count: number | null
          to_location_id: string
          updated_at: string | null
          user_nationalities: Json | null
        }
        Insert: {
          avg_time_between?: unknown
          created_at?: string | null
          from_location_id: string
          id?: string
          journey_count?: number | null
          to_location_id: string
          updated_at?: string | null
          user_nationalities?: Json | null
        }
        Update: {
          avg_time_between?: unknown
          created_at?: string | null
          from_location_id?: string
          id?: string
          journey_count?: number | null
          to_location_id?: string
          updated_at?: string | null
          user_nationalities?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_patterns_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_patterns_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          address_ko: string | null
          avg_rating: number | null
          category: string
          created_at: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          name_en: string | null
          name_ja: string | null
          name_ko: string | null
          name_th: string | null
          name_zh_cn: string | null
          name_zh_tw: string | null
          photo_count: number | null
          subcategory: string | null
          updated_at: string | null
          vibe_embedding: string | null
          visit_count: number | null
        }
        Insert: {
          address?: string | null
          address_ko?: string | null
          avg_rating?: number | null
          category?: string
          created_at?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          name_en?: string | null
          name_ja?: string | null
          name_ko?: string | null
          name_th?: string | null
          name_zh_cn?: string | null
          name_zh_tw?: string | null
          photo_count?: number | null
          subcategory?: string | null
          updated_at?: string | null
          vibe_embedding?: string | null
          visit_count?: number | null
        }
        Update: {
          address?: string | null
          address_ko?: string | null
          avg_rating?: number | null
          category?: string
          created_at?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          name_en?: string | null
          name_ja?: string | null
          name_ko?: string | null
          name_th?: string | null
          name_zh_cn?: string | null
          name_zh_tw?: string | null
          photo_count?: number | null
          subcategory?: string | null
          updated_at?: string | null
          vibe_embedding?: string | null
          visit_count?: number | null
        }
        Relationships: []
      }
      photos: {
        Row: {
          camera_make: string | null
          camera_model: string | null
          created_at: string | null
          gemini_response: Json | null
          gps_confidence: number | null
          gps_source: string | null
          id: string
          latitude: number | null
          location_id: string | null
          longitude: number | null
          original_filename: string | null
          status: string | null
          storage_path: string
          taken_at: string | null
          thumbnail_path: string | null
          updated_at: string | null
          user_id: string | null
          vibe_analysis: Json | null
          vibe_embedding: string | null
        }
        Insert: {
          camera_make?: string | null
          camera_model?: string | null
          created_at?: string | null
          gemini_response?: Json | null
          gps_confidence?: number | null
          gps_source?: string | null
          id?: string
          latitude?: number | null
          location_id?: string | null
          longitude?: number | null
          original_filename?: string | null
          status?: string | null
          storage_path: string
          taken_at?: string | null
          thumbnail_path?: string | null
          updated_at?: string | null
          user_id?: string | null
          vibe_analysis?: Json | null
          vibe_embedding?: string | null
        }
        Update: {
          camera_make?: string | null
          camera_model?: string | null
          created_at?: string | null
          gemini_response?: Json | null
          gps_confidence?: number | null
          gps_source?: string | null
          id?: string
          latitude?: number | null
          location_id?: string | null
          longitude?: number | null
          original_filename?: string | null
          status?: string | null
          storage_path?: string
          taken_at?: string | null
          thumbnail_path?: string | null
          updated_at?: string | null
          user_id?: string | null
          vibe_analysis?: Json | null
          vibe_embedding?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_next_destinations: {
        Args: { from_loc_id: string; limit_count?: number }
        Returns: {
          category: string
          journey_count: number
          location_id: string
          name: string
          name_ko: string
          percentage: number
        }[]
      }
      find_similar_locations: {
        Args: { limit_count?: number; query_embedding: string }
        Returns: {
          category: string
          id: string
          latitude: number
          longitude: number
          name: string
          name_ko: string
          similarity: number
        }[]
      }
      // Phase 1.4: 원자적 여정 패턴 upsert 함수
      upsert_journey_pattern: {
        Args: { p_from_location_id: string; p_to_location_id: string }
        Returns: {
          id: string
          from_location_id: string
          to_location_id: string
          journey_count: number
          action: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

