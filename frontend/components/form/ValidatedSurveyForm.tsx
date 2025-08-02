/**
 * AI Leadership 4Dx - 검증 기능이 통합된 설문 폼 컴포넌트
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller, FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useValidation, 
  useValidationProgress 
} from '@/hooks/useValidation';
import { 
  useRealtimeFeedback, 
  useFieldValidationFeedback 
} from '@/hooks/useRealtimeFeedback';
import { useAnomalyDetection } from '@/hooks/useAnomalyDetection';
import { ValidationFeedback, InlineValidationIcon } from '@/components/validation/ValidationFeedback';
import { ErrorSummary } from '@/components/validation/ErrorSummary';
import { ValidationProgress, SimpleProgressBar } from '@/components/validation/ValidationProgress';
import { AnomalyAlert } from '@/components/validation/AnomalyAlert';
import { SurveyResponseCreate } from '@/types/validation';

// 설문 응답 스키마
const surveySchema = z.object({
  // People 차원
  people_care: z.number().min(1).max(10),
  people_support: z.number().min(1).max(10),
  people_development: z.number().min(1).max(10),
  
  // Production 차원  
  production_focus: z.number().min(1).max(10),
  production_results: z.number().min(1).max(10),
  production_efficiency: z.number().min(1).max(10),
  
  // Candor 차원
  candor_directness: z.number().min(1).max(10),
  candor_challenge: z.number().min(1).max(10),
  candor_feedback: z.number().min(1).max(10),
  
  // LMX 차원
  lmx_trust: z.number().min(1).max(10),
  lmx_respect: z.number().min(1).max(10),
  lmx_obligation: z.number().min(1).max(10),
  
  // 메타데이터
  respondent_name: z.string().min(1, '이름을 입력해주세요'),
  team: z.string().min(1, '팀을 선택해주세요'),
  position: z.string().min(1, '직급을 선택해주세요'),
});

type SurveyFormData = z.infer<typeof surveySchema>;

interface ValidatedSurveyFormProps {
  onSubmit: (data: SurveyFormData) => Promise<void>;
  initialData?: Partial<SurveyFormData>;
}

// 차원별 질문 정의
const dimensions = [
  {
    id: 'people',
    name: 'People (사람 중심)',
    color: 'blue',
    questions: [
      { field: 'people_care', label: '팀원들의 개인적 안녕과 복지에 관심을 가진다' },
      { field: 'people_support', label: '팀원들이 어려움을 겪을 때 적극적으로 지원한다' },
      { field: 'people_development', label: '팀원들의 성장과 발전을 위해 노력한다' },
    ],
  },
  {
    id: 'production',
    name: 'Production (성과 중심)',
    color: 'green',
    questions: [
      { field: 'production_focus', label: '명확한 목표 설정과 성과 달성에 집중한다' },
      { field: 'production_results', label: '업무 결과와 생산성을 중요시한다' },
      { field: 'production_efficiency', label: '효율적인 업무 처리를 추구한다' },
    ],
  },
  {
    id: 'candor',
    name: 'Candor (솔직함)',
    color: 'yellow',
    questions: [
      { field: 'candor_directness', label: '필요한 피드백을 직접적으로 전달한다' },
      { field: 'candor_challenge', label: '더 나은 성과를 위해 도전적인 목표를 제시한다' },
      { field: 'candor_feedback', label: '건설적인 비판과 칭찬을 균형있게 한다' },
    ],
  },
  {
    id: 'lmx',
    name: 'LMX (리더-구성원 관계)',
    color: 'purple',
    questions: [
      { field: 'lmx_trust', label: '상호 신뢰가 높은 관계를 유지한다' },
      { field: 'lmx_respect', label: '서로를 존중하고 인정한다' },
      { field: 'lmx_obligation', label: '서로에 대한 책임감과 의무감을 가진다' },
    ],
  },
];

export const ValidatedSurveyForm: React.FC<ValidatedSurveyFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const [currentDimension, setCurrentDimension] = useState(0);
  
  // React Hook Form
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    getValues,
    trigger,
  } = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: initialData,
    mode: 'onChange',
  });

  // 검증 훅들
  const validation = useValidation({
    debounceMs: 500,
    language: 'ko',
  });
  
  const realtimeFeedback = useRealtimeFeedback({
    showSuccessFor: 3000,
    persistErrors: true,
  });
  
  const anomalyDetection = useAnomalyDetection({
    autoDetect: true,
    threshold: 2.0,
  });
  
  const validationProgress = useValidationProgress();

  // 전체 폼 데이터 감시
  const formData = watch();

  // 차원별 진행률 계산
  useEffect(() => {
    const totalQuestions = dimensions.reduce(
      (sum, dim) => sum + dim.questions.length, 
      0
    ) + 3; // 메타데이터 필드 3개 추가
    
    validationProgress.initializeProgress(totalQuestions);
  }, []);

  // 필드 변경 시 검증
  useEffect(() => {
    const subscription = watch(async (value, { name }) => {
      if (!name) return;
      
      // 실시간 피드백 설정
      realtimeFeedback.setValidating(name);
      
      // 검증 실행
      try {
        const surveyData: SurveyResponseCreate = {
          ...value,
          survey_version: '1.0',
          completed_at: new Date().toISOString(),
        } as SurveyResponseCreate;
        
        const result = await validation.validateField(name, value[name], surveyData);
        
        if (result) {
          realtimeFeedback.processValidationResult(name, result);
          validationProgress.updateProgress(name, result);
          
          // 이상치 감지
          await anomalyDetection.checkSingleResponse(surveyData);
        }
      } catch (error) {
        console.error('Validation error:', error);
        realtimeFeedback.updateFeedback(name, 'error', '검증 중 오류가 발생했습니다');
      }
    });
    
    return () => subscription.unsubscribe();
  }, [watch, validation, realtimeFeedback, validationProgress, anomalyDetection]);

  // 차원 이동
  const goToDimension = (index: number) => {
    setCurrentDimension(index);
  };

  const goToNext = async () => {
    // 현재 차원의 필드들 검증
    const currentFields = dimensions[currentDimension].questions.map(q => q.field);
    const isValid = await trigger(currentFields as any);
    
    if (isValid && currentDimension < dimensions.length - 1) {
      setCurrentDimension(currentDimension + 1);
    }
  };

  const goToPrevious = () => {
    if (currentDimension > 0) {
      setCurrentDimension(currentDimension - 1);
    }
  };

  // 폼 제출
  const onFormSubmit = async (data: SurveyFormData) => {
    try {
      // 최종 검증 - 올바른 형식으로 변환
      const surveyData = {
        ...data,
        survey_version: '1.0',
        completed_at: new Date().toISOString(),
      };
      
      // TODO: validation API 연동 시 타입 맞춤 필요
      // const finalValidation = await validation.validateAsync(surveyData);
      // if (!finalValidation.is_valid) {
      //   return;
      // }
      
      await onSubmit(data);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="max-w-4xl mx-auto p-6">
      {/* 진행률 표시 */}
      <div className="mb-8">
        <SimpleProgressBar
          value={validationProgress.progressPercentage}
          label="전체 진행률"
          showPercentage
          color={validationProgress.hasErrors ? 'red' : 'blue'}
        />
      </div>

      {/* 차원 탭 */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {dimensions.map((dim, index) => (
          <button
            key={dim.id}
            type="button"
            onClick={() => goToDimension(index)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
              transition-all duration-200
              ${currentDimension === index
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }
            `}
          >
            {dim.name}
            {validationProgress.progress.errors > 0 && currentDimension === index && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs bg-red-500 text-white rounded-full">
                !
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 에러 요약 */}
      {(validation.validationError || realtimeFeedback.hasErrors) && (
        <ErrorSummary
          errors={validation.validationResult?.errors || []}
          warnings={validation.validationResult?.warnings || []}
          className="mb-6"
        />
      )}

      {/* 차원별 질문 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentDimension}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {dimensions[currentDimension].name}
          </h2>
          
          <div className="space-y-6">
            {dimensions[currentDimension].questions.map((question) => {
              const fieldFeedback = useFieldValidationFeedback(
                question.field,
                realtimeFeedback
              );
              
              return (
                <div key={question.field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {question.label}
                  </label>
                  
                  <div className="relative">
                    <Controller
                      name={question.field as any}
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            {...field}
                            className="flex-1"
                          />
                          <span className="text-lg font-semibold text-gray-700 w-8 text-center">
                            {field.value || 5}
                          </span>
                          <InlineValidationIcon
                            status={fieldFeedback.status}
                            className="ml-2"
                          />
                        </div>
                      )}
                    />
                  </div>
                  
                  <ValidationFeedback
                    fieldName={question.field}
                    status={fieldFeedback.status}
                    message={fieldFeedback.message}
                  />
                  
                  {errors[question.field as keyof SurveyFormData] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[question.field as keyof SurveyFormData]?.message}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 메타데이터 (마지막 단계) */}
      {currentDimension === dimensions.length - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">기본 정보</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <Controller
                name="respondent_name"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              />
              {errors.respondent_name && (
                <p className="mt-1 text-sm text-red-600">{errors.respondent_name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                팀
              </label>
              <Controller
                name="team"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">선택하세요</option>
                    <option value="개발팀">개발팀</option>
                    <option value="마케팅팀">마케팅팀</option>
                    <option value="영업팀">영업팀</option>
                    <option value="운영팀">운영팀</option>
                  </select>
                )}
              />
              {errors.team && (
                <p className="mt-1 text-sm text-red-600">{errors.team.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                직급
              </label>
              <Controller
                name="position"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">선택하세요</option>
                    <option value="사원">사원</option>
                    <option value="대리">대리</option>
                    <option value="과장">과장</option>
                    <option value="차장">차장</option>
                    <option value="부장">부장</option>
                  </select>
                )}
              />
              {errors.position && (
                <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 네비게이션 버튼 */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={goToPrevious}
          disabled={currentDimension === 0}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors
            ${currentDimension === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }
          `}
        >
          이전
        </button>
        
        {currentDimension < dimensions.length - 1 ? (
          <button
            type="button"
            onClick={goToNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            다음
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting || validation.isValidating}
            className={`
              px-6 py-2 rounded-lg font-medium transition-colors
              ${isSubmitting || validation.isValidating
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
              }
            `}
          >
            {isSubmitting ? '제출 중...' : '제출'}
          </button>
        )}
      </div>

      {/* 이상치 경고 모달 */}
      <AnomalyAlert
        isOpen={anomalyDetection.isModalOpen}
        onClose={() => anomalyDetection.setModalOpen(false)}
        anomalies={anomalyDetection.activeAnomalies}
        onAccept={anomalyDetection.acceptAnomalies}
        onDismiss={anomalyDetection.dismissAllAnomalies}
      />
    </form>
  );
};