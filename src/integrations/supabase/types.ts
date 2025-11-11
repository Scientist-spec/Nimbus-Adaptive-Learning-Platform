export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attempts: {
        Row: {
          correct: boolean
          created_at: string | null
          id: string
          item_id: string
          mode: Database["public"]["Enums"]["assessment_mode"]
          quiz_id: string | null
          response: Json | null
          score: number | null
          time_taken_ms: number | null
          used_hint: boolean | null
          user_id: string
        }
        Insert: {
          correct: boolean
          created_at?: string | null
          id?: string
          item_id: string
          mode: Database["public"]["Enums"]["assessment_mode"]
          quiz_id?: string | null
          response?: Json | null
          score?: number | null
          time_taken_ms?: number | null
          used_hint?: boolean | null
          user_id: string
        }
        Update: {
          correct?: boolean
          created_at?: string | null
          id?: string
          item_id?: string
          mode?: Database["public"]["Enums"]["assessment_mode"]
          quiz_id?: string | null
          response?: Json | null
          score?: number | null
          time_taken_ms?: number | null
          used_hint?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          answer: Json
          bloom_level: string | null
          created_at: string | null
          created_by: string | null
          difficulty: number | null
          explanation: string | null
          hints: string[] | null
          id: string
          options: Json | null
          prompt: string
          tags: string[] | null
          type: Database["public"]["Enums"]["item_type"]
          updated_at: string | null
        }
        Insert: {
          answer: Json
          bloom_level?: string | null
          created_at?: string | null
          created_by?: string | null
          difficulty?: number | null
          explanation?: string | null
          hints?: string[] | null
          id?: string
          options?: Json | null
          prompt: string
          tags?: string[] | null
          type: Database["public"]["Enums"]["item_type"]
          updated_at?: string | null
        }
        Update: {
          answer?: Json
          bloom_level?: string | null
          created_at?: string | null
          created_by?: string | null
          difficulty?: number | null
          explanation?: string | null
          hints?: string[] | null
          id?: string
          options?: Json | null
          prompt?: string
          tags?: string[] | null
          type?: Database["public"]["Enums"]["item_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      learner_profiles: {
        Row: {
          correct_attempts: number | null
          current_streak: number | null
          id: string
          longest_streak: number | null
          mastery_by_tag: Json | null
          total_attempts: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          correct_attempts?: number | null
          current_streak?: number | null
          id?: string
          longest_streak?: number | null
          mastery_by_tag?: Json | null
          total_attempts?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          correct_attempts?: number | null
          current_streak?: number | null
          id?: string
          longest_streak?: number | null
          mastery_by_tag?: Json | null
          total_attempts?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          item_ids: string[] | null
          mode: Database["public"]["Enums"]["assessment_mode"]
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          item_ids?: string[] | null
          mode: Database["public"]["Enums"]["assessment_mode"]
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          item_ids?: string[] | null
          mode?: Database["public"]["Enums"]["assessment_mode"]
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "instructor" | "student"
      assessment_mode: "diagnostic" | "formative" | "summative"
      item_type: "mcq" | "short_answer" | "code"
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
  public: {
    Enums: {
      app_role: ["admin", "instructor", "student"],
      assessment_mode: ["diagnostic", "formative", "summative"],
      item_type: ["mcq", "short_answer", "code"],
    },
  },
} as const
