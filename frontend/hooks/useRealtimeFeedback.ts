/**
 * AI Leadership 4Dx - 실시간 피드백 커스텀 훅
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ValidationFeedback, ValidationResult } from '@/types/validation';

interface UseRealtimeFeedbackOptions {
  debounceMs?: number;
  showSuccessFor?: number; // 성공 메시지 표시 시간 (ms)
  persistErrors?: boolean; // 에러는 계속 표시
}

interface FieldFeedback {
  field: string;
  status: ValidationFeedback['status'];
  message?: string;
  timestamp: number;
}

export const useRealtimeFeedback = (options: UseRealtimeFeedbackOptions = {}) => {
  const {
    debounceMs = 300,
    showSuccessFor = 3000,
    persistErrors = true,
  } = options;

  const [feedbacks, setFeedbacks] = useState<Record<string, FieldFeedback>>({});
  const timeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});

  // 피드백 업데이트
  const updateFeedback = useCallback(
    (field: string, status: ValidationFeedback['status'], message?: string) => {
      // 이전 타임아웃 클리어
      if (timeoutRefs.current[field]) {
        clearTimeout(timeoutRefs.current[field]);
      }

      // 새 피드백 설정
      setFeedbacks(prev => ({
        ...prev,
        [field]: {
          field,
          status,
          message,
          timestamp: Date.now(),
        },
      }));

      // 성공 메시지는 일정 시간 후 제거
      if (status === 'success' && showSuccessFor > 0) {
        timeoutRefs.current[field] = setTimeout(() => {
          setFeedbacks(prev => {
            const updated = { ...prev };
            if (updated[field]?.status === 'success') {
              delete updated[field];
            }
            return updated;
          });
        }, showSuccessFor);
      }

      // 에러가 아닌 경우 idle 상태로 전환
      if (!persistErrors && status !== 'error' && status !== 'idle') {
        timeoutRefs.current[field] = setTimeout(() => {
          setFeedbacks(prev => ({
            ...prev,
            [field]: {
              ...prev[field],
              status: 'idle',
              message: undefined,
            },
          }));
        }, 5000);
      }
    },
    [showSuccessFor, persistErrors]
  );

  // 검증 중 상태 설정
  const setValidating = useCallback((field: string) => {
    updateFeedback(field, 'validating', '검증 중...');
  }, [updateFeedback]);

  // 검증 결과 처리
  const processValidationResult = useCallback(
    (field: string, result: ValidationResult) => {
      const fieldErrors = result.errors.filter(e => e.field === field);
      const fieldWarnings = result.warnings.filter(w => w.field === field);

      if (fieldErrors.length > 0) {
        updateFeedback(field, 'error', fieldErrors[0].message);
      } else if (fieldWarnings.length > 0) {
        updateFeedback(field, 'warning', fieldWarnings[0].message);
      } else if (result.is_valid) {
        updateFeedback(field, 'success', '유효함');
      } else {
        updateFeedback(field, 'idle');
      }
    },
    [updateFeedback]
  );

  // 특정 필드 피드백 가져오기
  const getFieldFeedback = useCallback(
    (field: string): FieldFeedback | null => {
      return feedbacks[field] || null;
    },
    [feedbacks]
  );

  // 전체 피드백 상태
  const overallStatus = useCallback((): ValidationFeedback['status'] => {
    const feedbackValues = Object.values(feedbacks);
    
    if (feedbackValues.some(f => f.status === 'error')) return 'error';
    if (feedbackValues.some(f => f.status === 'validating')) return 'validating';
    if (feedbackValues.some(f => f.status === 'warning')) return 'warning';
    if (feedbackValues.every(f => f.status === 'success')) return 'success';
    
    return 'idle';
  }, [feedbacks]);

  // 피드백 클리어
  const clearFeedback = useCallback((field?: string) => {
    if (field) {
      // 특정 필드 클리어
      if (timeoutRefs.current[field]) {
        clearTimeout(timeoutRefs.current[field]);
      }
      setFeedbacks(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    } else {
      // 모든 피드백 클리어
      Object.values(timeoutRefs.current).forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current = {};
      setFeedbacks({});
    }
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return {
    feedbacks,
    updateFeedback,
    setValidating,
    processValidationResult,
    getFieldFeedback,
    overallStatus: overallStatus(),
    clearFeedback,
    hasErrors: Object.values(feedbacks).some(f => f.status === 'error'),
    hasWarnings: Object.values(feedbacks).some(f => f.status === 'warning'),
    isValidating: Object.values(feedbacks).some(f => f.status === 'validating'),
  };
};

// React Hook Form과 통합을 위한 훅
export const useFieldValidationFeedback = (
  fieldName: string,
  realtimeFeedback: ReturnType<typeof useRealtimeFeedback>
) => {
  const feedback = realtimeFeedback.getFieldFeedback(fieldName);

  return {
    status: feedback?.status || 'idle',
    message: feedback?.message,
    showFeedback: !!feedback && feedback.status !== 'idle',
    setValidating: () => realtimeFeedback.setValidating(fieldName),
    clearFeedback: () => realtimeFeedback.clearFeedback(fieldName),
  };
};