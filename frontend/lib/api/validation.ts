/**
 * AI Leadership 4Dx - 검증 API 클라이언트
 */

import { 
  SurveyResponseCreate, 
  ValidationResult, 
  AnomalyDetectionResult,
  BatchValidationResult,
  ValidationReport 
} from '@/types/validation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ValidationAPIClient {
  private baseURL: string;
  private headers: HeadersInit;

  constructor() {
    this.baseURL = `${API_BASE_URL}/api/v1/validation`;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  private async getAuthToken(): Promise<string | null> {
    // TODO: Supabase 인증 토큰 가져오기
    // const { data: { session } } = await supabase.auth.getSession();
    // return session?.access_token || null;
    return null;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    const headers = {
      ...this.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * 단일 설문 응답 검증
   */
  async validateSurvey(
    data: SurveyResponseCreate, 
    lang: 'ko' | 'en' = 'ko'
  ): Promise<ValidationResult> {
    return this.request<ValidationResult>('/survey', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Accept-Language': lang,
      },
    });
  }

  /**
   * 배치 검증 (최대 100개)
   */
  async validateBatch(
    responses: SurveyResponseCreate[],
    lang: 'ko' | 'en' = 'ko'
  ): Promise<BatchValidationResult> {
    return this.request<BatchValidationResult>('/batch', {
      method: 'POST',
      body: JSON.stringify(responses),
      headers: {
        'Accept-Language': lang,
      },
    });
  }

  /**
   * 검증 리포트 조회
   */
  async getValidationReport(userId?: string): Promise<ValidationReport> {
    const endpoint = userId ? `/report/${userId}` : '/report/current';
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  /**
   * 실시간 이상치 탐지
   */
  async detectAnomalies(
    responses: SurveyResponseCreate[],
    params?: {
      threshold?: number;
      dimensions?: string;
    }
  ): Promise<AnomalyDetectionResult> {
    const queryParams = new URLSearchParams();
    if (params?.threshold) queryParams.append('threshold', params.threshold.toString());
    if (params?.dimensions) queryParams.append('dimensions', params.dimensions);
    
    const url = queryParams.toString() ? `/anomalies?${queryParams}` : '/anomalies';

    return this.request<AnomalyDetectionResult>(url, {
      method: 'POST',
      body: JSON.stringify({ responses }),
    });
  }

  /**
   * 필드별 실시간 검증 (프론트엔드 전용)
   */
  async validateField(
    fieldName: string,
    value: any,
    context?: Record<string, any>
  ): Promise<{ valid: boolean; message?: string }> {
    // 프론트엔드 로컬 검증
    // 필요시 백엔드 API 호출
    
    if (fieldName === 'leader_email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const valid = emailRegex.test(value);
      return {
        valid,
        message: valid ? undefined : '올바른 이메일 형식이 아닙니다',
      };
    }

    if (fieldName === 'leader_name') {
      const valid = value && value.length >= 2 && value.length <= 100;
      return {
        valid,
        message: valid ? undefined : '이름은 2-100자 사이여야 합니다',
      };
    }

    if (fieldName.includes('score') || fieldName === 'value') {
      const numValue = Number(value);
      const valid = numValue >= 1 && numValue <= 7;
      return {
        valid,
        message: valid ? undefined : '점수는 1-7 사이여야 합니다',
      };
    }

    return { valid: true };
  }
}

// 싱글톤 인스턴스
export const validationAPI = new ValidationAPIClient();