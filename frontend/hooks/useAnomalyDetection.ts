/**
 * AI Leadership 4Dx - 이상치 감지 커스텀 훅
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { validationAPI } from '@/lib/api/validation';
import { 
  AnomalyDetectionResult, 
  Outlier,
  SurveyResponseCreate 
} from '@/types/validation';

interface UseAnomalyDetectionOptions {
  autoDetect?: boolean; // 자동 감지 활성화
  threshold?: number; // 이상치 임계값
  dimensions?: string[]; // 특정 차원만 검사
  onAnomalyDetected?: (anomalies: Outlier[]) => void;
}

interface AnomalyState {
  hasAnomalies: boolean;
  highSeverityCount: number;
  mediumSeverityCount: number;
  lowSeverityCount: number;
  dismissedAnomalies: Set<string>;
}

export const useAnomalyDetection = (options: UseAnomalyDetectionOptions = {}) => {
  const { 
    autoDetect = true, 
    threshold = 2.0,
    dimensions,
    onAnomalyDetected 
  } = options;

  const [anomalyState, setAnomalyState] = useState<AnomalyState>({
    hasAnomalies: false,
    highSeverityCount: 0,
    mediumSeverityCount: 0,
    lowSeverityCount: 0,
    dismissedAnomalies: new Set(),
  });

  const [detectionResult, setDetectionResult] = useState<AnomalyDetectionResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const lastDetectionRef = useRef<string>('');

  // 이상치 감지 뮤테이션
  const detectMutation = useMutation({
    mutationFn: async (data: SurveyResponseCreate[]) => {
      const params = {
        threshold,
        dimensions: dimensions?.join(','),
      };
      return validationAPI.detectAnomalies(data, params);
    },
    onSuccess: (result) => {
      setDetectionResult(result);
      
      // 해제하지 않은 이상치만 필터링
      const activeAnomalies = result.anomalies.filter(
        anomaly => !anomalyState.dismissedAnomalies.has(getAnomalyId(anomaly))
      );

      if (activeAnomalies.length > 0) {
        updateAnomalyState(activeAnomalies);
        
        if (autoDetect && result.has_anomalies) {
          setIsModalOpen(true);
          onAnomalyDetected?.(activeAnomalies);
        }
      }
    },
  });

  // 이상치 ID 생성
  const getAnomalyId = (anomaly: Outlier): string => {
    return `${anomaly.dimension}-${anomaly.score}-${anomaly.reason}`;
  };

  // 이상치 상태 업데이트
  const updateAnomalyState = (anomalies: Outlier[]) => {
    const highSeverity = anomalies.filter(a => a.severity === 'high').length;
    const mediumSeverity = anomalies.filter(a => a.severity === 'medium').length;
    const lowSeverity = anomalies.filter(a => a.severity === 'low').length;

    setAnomalyState(prev => ({
      ...prev,
      hasAnomalies: anomalies.length > 0,
      highSeverityCount: highSeverity,
      mediumSeverityCount: mediumSeverity,
      lowSeverityCount: lowSeverity,
    }));
  };

  // 단일 응답 검사
  const checkSingleResponse = useCallback(
    async (response: SurveyResponseCreate) => {
      // 중복 검사 방지
      const responseKey = JSON.stringify(response);
      if (lastDetectionRef.current === responseKey) {
        return detectionResult;
      }
      lastDetectionRef.current = responseKey;

      return detectMutation.mutateAsync([response]);
    },
    [detectMutation, detectionResult]
  );

  // 배치 검사
  const checkBatch = useCallback(
    async (responses: SurveyResponseCreate[]) => {
      return detectMutation.mutateAsync(responses);
    },
    [detectMutation]
  );

  // 이상치 해제
  const dismissAnomaly = useCallback((anomaly: Outlier) => {
    const anomalyId = getAnomalyId(anomaly);
    
    setAnomalyState(prev => ({
      ...prev,
      dismissedAnomalies: new Set([...prev.dismissedAnomalies, anomalyId]),
    }));

    // 남은 활성 이상치 재계산
    if (detectionResult) {
      const remainingAnomalies = detectionResult.anomalies.filter(
        a => getAnomalyId(a) !== anomalyId && 
            !anomalyState.dismissedAnomalies.has(getAnomalyId(a))
      );
      updateAnomalyState(remainingAnomalies);
    }
  }, [detectionResult, anomalyState.dismissedAnomalies]);

  // 모든 이상치 해제
  const dismissAllAnomalies = useCallback(() => {
    if (!detectionResult) return;

    const allIds = detectionResult.anomalies.map(getAnomalyId);
    setAnomalyState(prev => ({
      ...prev,
      dismissedAnomalies: new Set([...prev.dismissedAnomalies, ...allIds]),
      hasAnomalies: false,
      highSeverityCount: 0,
      mediumSeverityCount: 0,
      lowSeverityCount: 0,
    }));
    setIsModalOpen(false);
  }, [detectionResult]);

  // 이상치 수정 처리
  const acceptAnomalies = useCallback(() => {
    setIsModalOpen(false);
    // 수정을 위한 콜백 실행 (상위 컴포넌트에서 처리)
  }, []);

  // 초기화
  const reset = useCallback(() => {
    setAnomalyState({
      hasAnomalies: false,
      highSeverityCount: 0,
      mediumSeverityCount: 0,
      lowSeverityCount: 0,
      dismissedAnomalies: new Set(),
    });
    setDetectionResult(null);
    setIsModalOpen(false);
    lastDetectionRef.current = '';
    detectMutation.reset();
  }, [detectMutation]);

  // 활성 이상치 가져오기
  const getActiveAnomalies = useCallback((): Outlier[] => {
    if (!detectionResult) return [];
    
    return detectionResult.anomalies.filter(
      anomaly => !anomalyState.dismissedAnomalies.has(getAnomalyId(anomaly))
    );
  }, [detectionResult, anomalyState.dismissedAnomalies]);

  return {
    // 상태
    ...anomalyState,
    isDetecting: detectMutation.isPending,
    detectionResult,
    activeAnomalies: getActiveAnomalies(),
    isModalOpen,
    
    // 메서드
    checkSingleResponse,
    checkBatch,
    dismissAnomaly,
    dismissAllAnomalies,
    acceptAnomalies,
    setModalOpen: setIsModalOpen,
    reset,
    
    // 통계
    totalAnomalies: detectionResult?.anomalies.length || 0,
    dismissedCount: anomalyState.dismissedAnomalies.size,
  };
};

// 실시간 이상치 모니터링 훅
export const useAnomalyMonitor = (
  responses: SurveyResponseCreate[],
  options: UseAnomalyDetectionOptions = {}
) => {
  const anomalyDetection = useAnomalyDetection(options);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!options.autoDetect || responses.length === 0) return;

    // 주기적으로 이상치 검사 (5초마다)
    const checkAnomalies = () => {
      anomalyDetection.checkBatch(responses);
    };

    checkAnomalies(); // 초기 검사
    checkIntervalRef.current = setInterval(checkAnomalies, 5000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [responses, options.autoDetect, anomalyDetection]);

  return anomalyDetection;
};