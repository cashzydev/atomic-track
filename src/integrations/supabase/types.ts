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
      badges: {
        Row: {
          category: string
          description: string
          hidden: boolean | null
          icon: string
          id: string
          name: string
          target: number
          tier: string | null
          xp_reward: number | null
        }
        Insert: {
          category: string
          description: string
          hidden?: boolean | null
          icon: string
          id: string
          name: string
          target: number
          tier?: string | null
          xp_reward?: number | null
        }
        Update: {
          category?: string
          description?: string
          hidden?: boolean | null
          icon?: string
          id?: string
          name?: string
          target?: number
          tier?: string | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      habit_completions: {
        Row: {
          completed_at: string
          date: string
          habit_id: number
          id: number
          percentage: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          date?: string
          habit_id: number
          id?: number
          percentage?: number
          user_id: string
        }
        Update: {
          completed_at?: string
          date?: string
          habit_id?: number
          id?: number
          percentage?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          accountability_partner: string | null
          created_at: string
          current_phase: number
          environment_prep: string | null
          goal_current: number
          goal_target: number
          goal_unit: string
          habit_stack: string | null
          icon: string
          id: number
          identity_goal: string | null
          immediate_reward: string | null
          last_completed: string | null
          longest_streak: number
          reward_milestone: Json | null
          social_reinforcement: string | null
          sound_enabled: boolean | null
          status: string
          streak: number
          temptation_bundle: string | null
          title: string
          total_completions: number
          tracking_preferences: Json | null
          trigger_activity: string | null
          two_minute_rule: Json | null
          two_minute_version: string | null
          updated_at: string
          user_id: string
          vibration_enabled: boolean | null
          when_time: string
          where_location: string
        }
        Insert: {
          accountability_partner?: string | null
          created_at?: string
          current_phase?: number
          environment_prep?: string | null
          goal_current?: number
          goal_target: number
          goal_unit?: string
          habit_stack?: string | null
          icon?: string
          id?: number
          identity_goal?: string | null
          immediate_reward?: string | null
          last_completed?: string | null
          longest_streak?: number
          reward_milestone?: Json | null
          social_reinforcement?: string | null
          sound_enabled?: boolean | null
          status?: string
          streak?: number
          temptation_bundle?: string | null
          title: string
          total_completions?: number
          tracking_preferences?: Json | null
          trigger_activity?: string | null
          two_minute_rule?: Json | null
          two_minute_version?: string | null
          updated_at?: string
          user_id: string
          vibration_enabled?: boolean | null
          when_time: string
          where_location: string
        }
        Update: {
          accountability_partner?: string | null
          created_at?: string
          current_phase?: number
          environment_prep?: string | null
          goal_current?: number
          goal_target?: number
          goal_unit?: string
          habit_stack?: string | null
          icon?: string
          id?: number
          identity_goal?: string | null
          immediate_reward?: string | null
          last_completed?: string | null
          longest_streak?: number
          reward_milestone?: Json | null
          social_reinforcement?: string | null
          sound_enabled?: boolean | null
          status?: string
          streak?: number
          temptation_bundle?: string | null
          title?: string
          total_completions?: number
          tracking_preferences?: Json | null
          trigger_activity?: string | null
          two_minute_rule?: Json | null
          two_minute_version?: string | null
          updated_at?: string
          user_id?: string
          vibration_enabled?: boolean | null
          when_time?: string
          where_location?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_color: string | null
          avatar_type: string | null
          created_at: string
          email: string
          id: string
          level: number | null
          name: string | null
          tier: string | null
          updated_at: string
          xp: number | null
        }
        Insert: {
          avatar_color?: string | null
          avatar_type?: string | null
          created_at?: string
          email: string
          id: string
          level?: number | null
          name?: string | null
          tier?: string | null
          updated_at?: string
          xp?: number | null
        }
        Update: {
          avatar_color?: string | null
          avatar_type?: string | null
          created_at?: string
          email?: string
          level?: number | null
          name?: string | null
          tier?: string | null
          updated_at?: string
          xp?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          started_at: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          started_at?: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          started_at?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          id: number
          progress: number
          unlocked: boolean
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          badge_id: string
          id?: number
          progress?: number
          unlocked?: boolean
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          badge_id?: string
          id?: number
          progress?: number
          unlocked?: boolean
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      add_user_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      award_xp: {
        Args: { p_user_id: string; p_xp_amount: number }
        Returns: undefined
      }
      calculate_habit_streak: {
        Args: { p_habit_id: number }
        Returns: {
          current_streak: number
          longest_streak: number
        }[]
      }
      check_and_reset_broken_streaks: { Args: never; Returns: undefined }
      get_admin_dashboard_stats: {
        Args: never
        Returns: {
          active_subscriptions: number
          active_users_30d: number
          monthly_revenue: number
          total_subscriptions: number
          total_users: number
        }[]
      }
      get_all_subscriptions: {
        Args: never
        Returns: {
          created_at: string
          expires_at: string
          started_at: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          subscription_id: string
          tier: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      get_all_users_stats: {
        Args: never
        Returns: {
          created_at: string
          email: string
          is_admin: boolean
          last_activity: string
          name: string
          subscription_expires_at: string
          subscription_status: string
          subscription_tier: string
          tier: string
          total_completions: number
          total_habits: number
          user_id: string
        }[]
      }
      get_habit_completion_xp: {
        Args: { p_date: string; p_habit_id: number; p_user_id: string }
        Returns: {
          reasons: string[]
          total_xp: number
        }[]
      }
      get_server_date: { Args: never; Returns: string }
      get_user_tier: { Args: { p_user_id: string }; Returns: string }
      get_user_todays_completions: {
        Args: { p_user_id: string }
        Returns: {
          completed_at: string
          date: string
          habit_id: number
          percentage: number
        }[]
      }
      get_user_xp_earned_today: { Args: { p_user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      initialize_user_badges: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      remove_user_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      update_user_subscription: {
        Args: {
          p_expires_at?: string
          p_status: string
          p_tier: string
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
