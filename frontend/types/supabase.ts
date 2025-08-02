/**
 * AI Leadership 4Dx - Supabase 데이터베이스 타입 정의
 */

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
          name: string | null
          organization: string | null
          department: string | null
          position: string | null
          role: 'user' | 'admin' | 'manager'
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          organization?: string | null
          department?: string | null
          position?: string | null
          role?: 'user' | 'admin' | 'manager'
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          organization?: string | null
          department?: string | null
          position?: string | null
          role?: 'user' | 'admin' | 'manager'
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
      }
      survey_responses: {
        Row: {
          id: string
          user_id: string
          survey_version: string
          responses: Json
          completion_time_seconds: number | null
          device_info: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          survey_version: string
          responses: Json
          completion_time_seconds?: number | null
          device_info?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          survey_version?: string
          responses?: Json
          completion_time_seconds?: number | null
          device_info?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      leadership_analysis: {
        Row: {
          id: string
          user_id: string
          survey_response_id: string
          blake_mouton_people: number
          blake_mouton_production: number
          feedback_care: number
          feedback_challenge: number
          lmx_score: number
          influence_machiavellianism: number
          influence_narcissism: number
          influence_psychopathy: number
          overall_risk_level: 'low' | 'medium' | 'high'
          recommendations: Json
          ai_insights: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          survey_response_id: string
          blake_mouton_people: number
          blake_mouton_production: number
          feedback_care: number
          feedback_challenge: number
          lmx_score: number
          influence_machiavellianism: number
          influence_narcissism: number
          influence_psychopathy: number
          overall_risk_level: 'low' | 'medium' | 'high'
          recommendations: Json
          ai_insights?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          survey_response_id?: string
          blake_mouton_people?: number
          blake_mouton_production?: number
          feedback_care?: number
          feedback_challenge?: number
          lmx_score?: number
          influence_machiavellianism?: number
          influence_narcissism?: number
          influence_psychopathy?: number
          overall_risk_level?: 'low' | 'medium' | 'high'
          recommendations?: Json
          ai_insights?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      validation_reports: {
        Row: {
          id: string
          user_id: string
          survey_response_id: string
          is_valid: boolean
          errors: Json
          warnings: Json
          outliers: Json
          completeness_score: number
          consistency_score: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          survey_response_id: string
          is_valid: boolean
          errors: Json
          warnings: Json
          outliers: Json
          completeness_score: number
          consistency_score: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          survey_response_id?: string
          is_valid?: boolean
          errors?: Json
          warnings?: Json
          outliers?: Json
          completeness_score?: number
          consistency_score?: number
          created_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'user' | 'admin' | 'manager'
      risk_level: 'low' | 'medium' | 'high'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// 유틸리티 타입들
export type User = Database['public']['Tables']['users']['Row']
export type SurveyResponse = Database['public']['Tables']['survey_responses']['Row']
export type LeadershipAnalysis = Database['public']['Tables']['leadership_analysis']['Row']
export type ValidationReport = Database['public']['Tables']['validation_reports']['Row']
export type Organization = Database['public']['Tables']['organizations']['Row']

// Insert 타입들
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type SurveyResponseInsert = Database['public']['Tables']['survey_responses']['Insert']
export type LeadershipAnalysisInsert = Database['public']['Tables']['leadership_analysis']['Insert']
export type ValidationReportInsert = Database['public']['Tables']['validation_reports']['Insert']

// Update 타입들
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type SurveyResponseUpdate = Database['public']['Tables']['survey_responses']['Update']