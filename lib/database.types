export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          address: string | null
          notes: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      deals: {
        Row: {
          id: string
          title: string
          customer_id: string | null
          value: number | null
          status: string
          expected_close_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          customer_id?: string | null
          value?: number | null
          status: string
          expected_close_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          customer_id?: string | null
          value?: number | null
          status?: string
          expected_close_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          due_date: string | null
          is_completed: boolean
          priority: string
          related_to_type: string | null
          related_to_id: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          due_date?: string | null
          is_completed?: boolean
          priority?: string
          related_to_type?: string | null
          related_to_id?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          is_completed?: boolean
          priority?: string
          related_to_type?: string | null
          related_to_id?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          company_name: string | null
          company_whatsapp: string | null
          theme: string
          notification_email: boolean
          notification_app: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name?: string | null
          company_whatsapp?: string | null
          theme?: string
          notification_email?: boolean
          notification_app?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string | null
          company_whatsapp?: string | null
          theme?: string
          notification_email?: boolean
          notification_app?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
