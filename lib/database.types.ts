export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'user'
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role: 'admin' | 'user'
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'user'
          avatar_url?: string | null
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          content: string
          completed: boolean
          completed_at: string | null
          time: string | null
          created_at: string
          client_tag_id: string | null
          project_tag_id: string | null
          task_client_tags?: {
            id: string
            name: string
            emoji: string
            color: string
            tag: string
          } | null
          task_project_tags?: {
            id: string
            name: string
            client_name: string
            tag: string
          } | null
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          completed?: boolean
          completed_at?: string | null
          time?: string | null
          created_at?: string
          client_tag_id?: string | null
          project_tag_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          completed?: boolean
          completed_at?: string | null
          time?: string | null
          created_at?: string
          client_tag_id?: string | null
          project_tag_id?: string | null
        }
      }
      recurring_tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          time: string | null
          client_id: string | null
          project_id: string | null
          frequency: 'daily' | 'weekly' | 'monthly'
          week_day: number | null
          month_day: number | null
          created_at: string
          task_client_tags?: {
            id: string
            name: string
            emoji: string
            color: string
            tag: string
          } | null
          task_project_tags?: {
            id: string
            name: string
            client_name: string
            tag: string
          } | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          time?: string | null
          client_id?: string | null
          project_id?: string | null
          frequency: 'daily' | 'weekly' | 'monthly'
          week_day?: number | null
          month_day?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          time?: string | null
          client_id?: string | null
          project_id?: string | null
          frequency?: 'daily' | 'weekly' | 'monthly'
          week_day?: number | null
          month_day?: number | null
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          emoji: string
          color: string
          tags: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          emoji: string
          color: string
          tags?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          emoji?: string
          color?: string
          tags?: string[]
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          client_id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      task_client_tags: {
        task_id: string
        id: string
        name: string
        emoji: string
        color: string
        tag: string
      }
      task_project_tags: {
        task_id: string
        id: string
        name: string
        client_name: string
        tag: string
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}