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
      challenge_submissions: {
        Row: {
          answers: Json
          challenge_id: string
          id: string
          score: number | null
          squad_id: string
          submitted_at: string | null
          time_taken: number | null
          user_id: string
        }
        Insert: {
          answers: Json
          challenge_id: string
          id?: string
          score?: number | null
          squad_id: string
          submitted_at?: string | null
          time_taken?: number | null
          user_id: string
        }
        Update: {
          answers?: Json
          challenge_id?: string
          id?: string
          score?: number | null
          squad_id?: string
          submitted_at?: string | null
          time_taken?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_submissions_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          challenge_type: string
          content: Json
          created_at: string | null
          description: string | null
          difficulty_level: number | null
          ends_at: string | null
          id: string
          max_squad_size: number | null
          skill_area_id: string
          starts_at: string | null
          status: string | null
          time_limit: number | null
          title: string
        }
        Insert: {
          challenge_type: string
          content: Json
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          ends_at?: string | null
          id?: string
          max_squad_size?: number | null
          skill_area_id: string
          starts_at?: string | null
          status?: string | null
          time_limit?: number | null
          title: string
        }
        Update: {
          challenge_type?: string
          content?: Json
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          ends_at?: string | null
          id?: string
          max_squad_size?: number | null
          skill_area_id?: string
          starts_at?: string | null
          status?: string | null
          time_limit?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_skill_area_id_fkey"
            columns: ["skill_area_id"]
            isOneToOne: false
            referencedRelation: "skill_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      class_progress: {
        Row: {
          class_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          current_slide: number | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          class_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_slide?: number | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          class_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_slide?: number | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_progress_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          content: Json
          created_at: string | null
          description: string | null
          difficulty_level: number | null
          estimated_duration: number | null
          id: string
          order_index: number | null
          skill_area_id: string
          title: string
        }
        Insert: {
          content: Json
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          estimated_duration?: number | null
          id?: string
          order_index?: number | null
          skill_area_id: string
          title: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          estimated_duration?: number | null
          id?: string
          order_index?: number | null
          skill_area_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_skill_area_id_fkey"
            columns: ["skill_area_id"]
            isOneToOne: false
            referencedRelation: "skill_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          current_level: number | null
          display_name: string | null
          id: string
          total_xp: number | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          current_level?: number | null
          display_name?: string | null
          id: string
          total_xp?: number | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          current_level?: number | null
          display_name?: string | null
          id?: string
          total_xp?: number | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json
          completed_at: string | null
          id: string
          max_score: number
          quiz_id: string
          score: number
          time_taken: number | null
          user_id: string
        }
        Insert: {
          answers: Json
          completed_at?: string | null
          id?: string
          max_score: number
          quiz_id: string
          score: number
          time_taken?: number | null
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          id?: string
          max_score?: number
          quiz_id?: string
          score?: number
          time_taken?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          class_id: string | null
          created_at: string | null
          difficulty_level: number | null
          id: string
          questions: Json
          skill_area_id: string
          time_limit: number | null
          title: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          difficulty_level?: number | null
          id?: string
          questions: Json
          skill_area_id: string
          time_limit?: number | null
          title: string
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          difficulty_level?: number | null
          id?: string
          questions?: Json
          skill_area_id?: string
          time_limit?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_skill_area_id_fkey"
            columns: ["skill_area_id"]
            isOneToOne: false
            referencedRelation: "skill_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_areas: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      squad_members: {
        Row: {
          id: string
          joined_at: string | null
          role: string | null
          squad_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role?: string | null
          squad_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: string | null
          squad_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "squad_members_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "squad_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      squads: {
        Row: {
          average_level: number | null
          challenge_id: string
          created_at: string | null
          id: string
          name: string
          status: string | null
          total_score: number | null
        }
        Insert: {
          average_level?: number | null
          challenge_id: string
          created_at?: string | null
          id?: string
          name: string
          status?: string | null
          total_score?: number | null
        }
        Update: {
          average_level?: number | null
          challenge_id?: string
          created_at?: string | null
          id?: string
          name?: string
          status?: string | null
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "squads_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_skill_levels: {
        Row: {
          assessment_completed: boolean | null
          created_at: string | null
          id: string
          level: number | null
          skill_area_id: string
          updated_at: string | null
          user_id: string
          xp: number | null
        }
        Insert: {
          assessment_completed?: boolean | null
          created_at?: string | null
          id?: string
          level?: number | null
          skill_area_id: string
          updated_at?: string | null
          user_id: string
          xp?: number | null
        }
        Update: {
          assessment_completed?: boolean | null
          created_at?: string | null
          id?: string
          level?: number | null
          skill_area_id?: string
          updated_at?: string | null
          user_id?: string
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_skill_levels_skill_area_id_fkey"
            columns: ["skill_area_id"]
            isOneToOne: false
            referencedRelation: "skill_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_skill_levels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
