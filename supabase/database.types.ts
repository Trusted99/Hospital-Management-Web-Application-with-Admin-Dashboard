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
      blog_posts: {
        Row: {
          category: string
          content: string | null
          created_at: string
          external_url: string | null
          id: string
          is_published: boolean
          slug: string
          snippet: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string
          external_url?: string | null
          id?: string
          is_published?: boolean
          slug: string
          snippet: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          external_url?: string | null
          id?: string
          is_published?: boolean
          slug?: string
          snippet?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          ip_address: unknown
          is_read: boolean
          last_name: string
          message: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          ip_address?: unknown
          is_read?: boolean
          last_name: string
          message: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          ip_address?: unknown
          is_read?: boolean
          last_name?: string
          message?: string
          phone?: string | null
        }
        Relationships: []
      }
      credentials: {
        Row: {
          category: string
          created_at: string
          description: string
          display_order: number
          file_path: string
          id: string
          issuer: string
          name: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          display_order?: number
          file_path: string
          id?: string
          issuer: string
          name: string
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          display_order?: number
          file_path?: string
          id?: string
          issuer?: string
          name?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
          approval_status: Database["public"]["Enums"]["approval_status"]
          approved_at: string | null
          approved_by: string | null
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
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
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
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
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
      programmes: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          programme_name: string
          status: Database["public"]["Enums"]["programme_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          programme_name: string
          status?: Database["public"]["Enums"]["programme_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          programme_name?: string
          status?: Database["public"]["Enums"]["programme_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "programmes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      schema_migrations: {
        Row: {
          applied_at: string
          version: string
        }
        Insert: {
          applied_at?: string
          version: string
        }
        Update: {
          applied_at?: string
          version?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          deadline: string
          id: string
          is_completed: boolean
          proposed_duration: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deadline: string
          id?: string
          is_completed?: boolean
          proposed_duration: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deadline?: string
          id?: string
          is_completed?: boolean
          proposed_duration?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          last_login_at: string | null
          password_hash: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          password_hash: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          password_hash?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      webinars: {
        Row: {
          created_at: string
          description: string
          end_date: string
          event_url: string
          id: string
          is_active: boolean
          organizer: string
          start_date: string
          title: string
          track: Database["public"]["Enums"]["event_track"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          end_date: string
          event_url: string
          id?: string
          is_active?: boolean
          organizer: string
          start_date: string
          title: string
          track?: Database["public"]["Enums"]["event_track"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          end_date?: string
          event_url?: string
          id?: string
          is_active?: boolean
          organizer?: string
          start_date?: string
          title?: string
          track?: Database["public"]["Enums"]["event_track"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webinars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      approve_admin: { Args: { p_user_id: string }; Returns: Json }
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
      is_super_admin: { Args: never; Returns: boolean }
      reject_admin: {
        Args: { p_reason?: string; p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      appointment_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "no_show"
      approval_status: "pending" | "approved" | "rejected"
      event_track: "HEALTH" | "TECH"
      gender_type: "male" | "female" | "other" | "prefer_not_to_say"
      programme_status: "PENDING" | "ACCEPTED" | "REJECTED"
      urgency_level: "low" | "medium" | "high" | "emergency"
      user_role: "patient" | "doctor" | "admin" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience Model Type Exports
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Department = Database['public']['Tables']['departments']['Row']
export type Doctor = Database['public']['Tables']['doctors']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type LegacyUser = Database['public']['Tables']['users']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Programme = Database['public']['Tables']['programmes']['Row']
export type Credential = Database['public']['Tables']['credentials']['Row']
export type Webinar = Database['public']['Tables']['webinars']['Row']
export type BlogPost = Database['public']['Tables']['blog_posts']['Row']
export type ContactMessage = Database['public']['Tables']['contact_messages']['Row']

// Convenience Enum Type Exports
export type AppointmentStatus = Database['public']['Enums']['appointment_status']
export type ApprovalStatus = Database['public']['Enums']['approval_status']
export type UrgencyLevel = Database['public']['Enums']['urgency_level']
export type UserRole = Database['public']['Enums']['user_role']
export type GenderType = Database['public']['Enums']['gender_type']
