/**
 * AI Leadership 4Dx - 검증 커스텀 훅
 */

import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { validationAPI } from '@/lib/api/validation';
import { 
  ValidationResult, 
  SurveyResponseCreate,
  ValidationReport,
  AnomalyDetectionResult 
} from '@/types/validation';

interface UseValidationOptions {
  onSuccess?: (result: ValidationResult) => void;
  onError?: (error: Error) => void;
  debounceMs?: number;
  language?: 'ko' | 'en';
}

export const useValidation = (options: UseValidationOptions = {}) => {
  const queryClient = useQueryClient();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // 단일 응답 검증
  const validateMutation = useMutation({
    mutationFn: async (data: SurveyResponseCreate) => {
      return validationAPI.validateSurvey(data, options.language);
    },
    onSuccess: (data) => {
      options.onSuccess?.(data);
      // 캐시 업데이트
      queryClient.setQueryData(['validation', data.id], data);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });

  // 디바운스된 검증
  const validateDebounced = useCallback(
    (data: SurveyResponseCreate) => {
      setIsDebouncing(true);
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        validateMutation.mutate(data);
        setIsDebouncing(false);
      }, options.debounceMs || 500);
    },
    [validateMutation, options.debounceMs]
  );

  // 배치 검증 - TODO: API 구현 후 활성화
  // const batchValidateMutation = useMutation({
  //   mutationFn: validationAPI.batchValidate,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['validationReports'] });
  //   },
  // });

  // 필드별 검증 상태 추적
  const [fieldValidations, setFieldValidations] = useState<
    Record<string, ValidationResult | null>
  >({});

  const validateField = useCallback(
    async (fieldName: string, value: any, fullData: SurveyResponseCreate) => {
      // 필드별 검증 로직
      const fieldData = { ...fullData, [fieldName]: value };
      
      try {
        const result = await validationAPI.validateSurvey(fieldData, options.language);
        setFieldValidations(prev => ({
          ...prev,
          [fieldName]: result,
        }));
        return result;
      } catch (error) {
        console.error(`Field validation error for ${fieldName}:`, error);
        return null;
      }
    },
    [options.language]
  );

  // 정리 함수
  const cleanup = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setFieldValidations({});
  }, []);

  return {
    // 상태
    isValidating: validateMutation.isPending || isDebouncing,
    validationResult: validateMutation.data,
    validationError: validateMutation.error,
    fieldValidations,
    
    // 메서드
    validate: validateMutation.mutate,
    validateAsync: validateMutation.mutateAsync,
    validateDebounced,
    validateField,
    // batchValidate: batchValidateMutation.mutate, // TODO: API 구현 후 활성화
    
    // 유틸리티
    reset: validateMutation.reset,
    cleanup,
  };
};

// 검증 보고서 조회 훅
export const useValidationReport = (userId?: string) => {
  return useQuery({
    queryKey: ['validationReport', userId],
    queryFn: () => validationAPI.getValidationReport(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 이상치 감지 훅
export const useAnomalyDetection = () => {
  const [detectionResult, setDetectionResult] = useState<AnomalyDetectionResult | null>(null);
  
  const detectAnomaliesMutation = useMutation({
    mutationFn: validationAPI.detectAnomalies,
    onSuccess: (data) => {
      setDetectionResult(data);
    },
  });

  const dismissAnomaly = useCallback((anomalyId: string) => {
    if (!detectionResult) return;
    
    setDetectionResult({
      ...detectionResult,
      anomalies: detectionResult.anomalies.filter(a => 
        `${a.dimension}-${a.score}` !== anomalyId
      ),
    });
  }, [detectionResult]);

  return {
    detectionResult,
    isDetecting: detectAnomaliesMutation.isPending,
    detectAnomalies: detectAnomaliesMutation.mutate,
    dismissAnomaly,
    clearResults: () => setDetectionResult(null),
  };
};

// 검증 진행률 추적 훅
export const useValidationProgress = () => {
  const [progress, setProgress] = useState({
    totalFields: 0,
    validatedFields: 0,
    errors: 0,
    warnings: 0,
  });

  const updateProgress = useCallback((fieldName: string, result: ValidationResult | null) => {
    setProgress(prev => {
      const newProgress = { ...prev };
      
      if (result) {
        newProgress.validatedFields = Math.min(
          prev.validatedFields + 1, 
          prev.totalFields
        );
        newProgress.errors = result.errors.length;
        newProgress.warnings = result.warnings.length;
      }
      
      return newProgress;
    });
  }, []);

  const initializeProgress = useCallback((totalFields: number) => {
    setProgress({
      totalFields,
      validatedFields: 0,
      errors: 0,
      warnings: 0,
    });
  }, []);

  const progressPercentage = progress.totalFields > 0
    ? (progress.validatedFields / progress.totalFields) * 100
    : 0;

  return {
    progress,
    progressPercentage,
    updateProgress,
    initializeProgress,
    isComplete: progress.validatedFields === progress.totalFields,
    hasErrors: progress.errors > 0,
    hasWarnings: progress.warnings > 0,
  };
};