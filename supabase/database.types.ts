// =====================================================================
// TrustedCares Hospital — Supabase Database TypeScript Types
// Auto-generated from project: xxpptevsvyfjtkfymxbl
// Project URL: https://xxpptevsvyfjtkfymxbl.supabase.co
// Last generated: 2026-11-16
// =====================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          additional_notes: string | null
          confirmed_date: string | null
          confirmed_time: string | null
          created_at: string
          department_id: string
          doctor_id: string | null
          email_sent: boolean
          id: string
          patient_dob: string | null
          patient_email: string
          patient_gender: Database["public"]["Enums"]["gender_type"] | null
          patient_id: string | null
          patient_name: string
          patient_phone: string
          preferred_date: string
          preferred_time: string | null
          reference_number: string
          reviewed_at: string | null
          reviewed_by: string | null
          sms_sent: boolean
          status: Database["public"]["Enums"]["appointment_status"]
          symptoms: string
          triage_note: string | null
          updated_at: string
          urgency: Database["public"]["Enums"]["urgency_level"]
        }
        Insert: {
          additional_notes?: string | null
          confirmed_date?: string | null
          confirmed_time?: string | null
          created_at?: string
          department_id: string
          doctor_id?: string | null
          email_sent?: boolean
          id?: string
          patient_dob?: string | null
          patient_email: string
          patient_gender?: Database["public"]["Enums"]["gender_type"] | null
          patient_id?: string | null
          patient_name: string
          patient_phone: string
          preferred_date: string
          preferred_time?: string | null
          reference_number?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          sms_sent?: boolean
          status?: Database["public"]["Enums"]["appointment_status"]
          symptoms: string
          triage_note?: string | null
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
        }
        Update: {
          additional_notes?: string | null
          confirmed_date?: string | null
          confirmed_time?: string | null
          created_at?: string
          department_id?: string
          doctor_id?: string | null
          email_sent?: boolean
          id?: string
          patient_dob?: string | null
          patient_email?: string
          patient_gender?: Database["public"]["Enums"]["gender_type"] | null
          patient_id?: string | null
          patient_name?: string
          patient_phone?: string
          preferred_date?: string
          preferred_time?: string | null
          reference_number?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          sms_sent?: boolean
          status?: Database["public"]["Enums"]["appointment_status"]
          symptoms?: string
          triage_note?: string | null
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
        }
        Relationships: [
          {
            foreignKeyName: "appointments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          changed_by: string | null
          created_at: string
          id: number
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          changed_by?: string | null
          created_at?: string
          id?: never
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          changed_by?: string | null
          created_at?: string
          id?: never
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          icon_url: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      doctors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          department_id: string
          display_order: number
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          languages: string[] | null
          phone_ext: string | null
          profile_id: string | null
          qualifications: string[] | null
          schedule: string | null
          short_bio: string | null
          specialty: string | null
          title: string | null
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          department_id: string
          display_order?: number
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          languages?: string[] | null
          phone_ext?: string | null
          profile_id?: string | null
          qualifications?: string[] | null
          schedule?: string | null
          short_bio?: string | null
          specialty?: string | null
          title?: string | null
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          department_id?: string
          display_order?: number
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          languages?: string[] | null
          phone_ext?: string | null
          profile_id?: string | null
          qualifications?: string[] | null
          schedule?: string | null
          short_bio?: string | null
          specialty?: string | null
          title?: string | null
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          credentials: string | null
          date_of_birth: string | null
          department_id: string | null
          display_name: string | null
          full_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          staff_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          credentials?: string | null
          date_of_birth?: string | null
          department_id?: string | null
          display_name?: string | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          staff_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          credentials?: string | null
          date_of_birth?: string | null
          department_id?: string | null
          display_name?: string | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          staff_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_pending_appointments: {
        Row: {
          created_at: string | null
          department_name: string | null
          department_slug: string | null
          doctor_name: string | null
          doctor_specialty: string | null
          id: string | null
          patient_dob: string | null
          patient_email: string | null
          patient_gender: Database["public"]["Enums"]["gender_type"] | null
          patient_name: string | null
          patient_phone: string | null
          preferred_date: string | null
          preferred_time: string | null
          reference_number: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
          symptoms: string | null
          triage_note: string | null
          urgency: Database["public"]["Enums"]["urgency_level"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      change_appointment_status: {
        Args: {
          p_appointment_id: string
          p_confirmed_date?: string
          p_confirmed_time?: string
          p_doctor_id?: string
          p_new_status: Database["public"]["Enums"]["appointment_status"]
          p_triage_note?: string
        }
        Returns: Json
      }
      get_admin_dashboard_summary: { Args: never; Returns: Json }
      get_daily_appointment_counts: {
        Args: { p_days_ahead?: number }
        Returns: {
          appointment_date: string
          cancelled: number
          completed: number
          confirmed: number
          pending: number
          total: number
        }[]
      }
      get_my_profile: {
        Args: never
        Returns: {
          avatar_url: string
          credentials: string
          department_id: string
          display_name: string
          full_name: string
          id: string
          is_active: boolean
          phone: string
          role: Database["public"]["Enums"]["user_role"]
          staff_id: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_doctor: { Args: never; Returns: boolean }
    }
    Enums: {
      appointment_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "no_show"
      gender_type: "male" | "female" | "other" | "prefer_not_to_say"
      urgency_level: "low" | "medium" | "high" | "emergency"
      user_role: "patient" | "doctor" | "admin" | "super_admin"
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

// =====================================================================
// Convenience Exports: Strongly-typed row helpers
// =====================================================================

export type Profile       = Tables<"profiles">
export type Department    = Tables<"departments">
export type Doctor        = Tables<"doctors">
export type Appointment   = Tables<"appointments">
export type AuditLog      = Tables<"audit_logs">
export type PendingAppointmentView = Tables<"v_pending_appointments">

export type AppointmentStatus = Enums<"appointment_status">
export type UrgencyLevel      = Enums<"urgency_level">
export type UserRole          = Enums<"user_role">
export type GenderType        = Enums<"gender_type">

export const Constants = {
  public: {
    Enums: {
      appointment_status: ["pending", "confirmed", "cancelled", "completed", "no_show"] as const,
      gender_type: ["male", "female", "other", "prefer_not_to_say"] as const,
      urgency_level: ["low", "medium", "high", "emergency"] as const,
      user_role: ["patient", "doctor", "admin", "super_admin"] as const,
    },
  },
} as const
