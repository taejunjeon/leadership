/**
 * AI Leadership 4Dx - 검증 관련 타입 정의
 */

export enum DimensionType {
  PEOPLE = 'people',
  PRODUCTION = 'production',
  CANDOR = 'candor',
  LMX = 'lmx'
}

export interface SurveyQuestionResponse {
  question_id: string;
  value: number; // 1-7
  dimension: DimensionType;
}

export interface SurveyResponseCreate {
  leader_email: string;
  leader_name: string;
  organization?: string;
  department?: string;
  role?: string;
  responses: SurveyQuestionResponse[];
  completion_time_seconds?: number;
  device_info?: Record<string, any>;
  survey_version?: string;
  completed_at?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  type?: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Outlier {
  dimension: string;
  score: number;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ValidationResult {
  id?: string;
  is_valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  outliers: Outlier[];
  completeness_score: number; // 0-1
  consistency_score: number; // 0-1
}

// 검증 보고서
export interface ValidationReport {
  user_id: string;
  total_responses: number;
  valid_responses: number;
  invalid_responses: number;
  completion_rate: number;
  average_scores: {
    people: number;
    production: number;
    candor: number;
    lmx: number;
  };
  last_updated: string;
}

export interface AnomalyDetectionResult {
  has_anomalies: boolean;
  anomaly_score: number;
  grade: string;
  leadership_style: string;
  anomalies: Outlier[];
  recommendations: string[];
}

export interface ValidationFeedback {
  field: string;
  status: 'idle' | 'validating' | 'success' | 'warning' | 'error';
  message?: string;
  details?: any;
}

export interface BatchValidationResult {
  report_id: string;
  total: number;
  valid: number;
  invalid: number;
  errors: number;
  success_rate: number;
  results: Array<{
    index: number;
    email: string;
    status: 'valid' | 'invalid' | 'error';
    validation?: ValidationResult;
    error?: string;
  }>;
}