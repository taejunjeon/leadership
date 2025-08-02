/**
 * AI Leadership 4Dx - 설문 페이지
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { surveySections, TOTAL_QUESTIONS, scaleLabels, SurveyQuestion } from '@/data/surveyQuestions';
import { SurveyProgress } from '@/components/survey/SurveyProgress';
import { QuestionCard } from '@/components/survey/QuestionCard';
import { SurveyComplete } from '@/components/survey/SurveyComplete';
import { useAuth } from '@/components/auth/AuthProvider';

interface SurveyResponse {
  questionId: string;
  value: number;
}

interface SurveyFormData {
  name: string;
  email: string;
  organization?: string;
  department?: string;
  position?: string;
  responses: SurveyResponse[];
}

export default function SurveyPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [surveyResultId, setSurveyResultId] = useState<string | null>(null);
  const [startTime] = useState(Date.now());

  // 로그인 확인
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  // 현재 섹션과 질문
  const currentSection = surveySections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];
  
  // 전체 진행률 계산
  const totalAnswered = Object.keys(responses).length;
  const overallProgress = (totalAnswered / TOTAL_QUESTIONS) * 100;
  
  // 현재 섹션 진행률
  const sectionAnswered = currentSection?.questions.filter(q => 
    responses.hasOwnProperty(q.id)
  ).length || 0;
  const sectionProgress = (sectionAnswered / (currentSection?.questions.length || 1)) * 100;

  // 응답 저장
  const handleResponse = (questionId: string, value: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // 다음 질문으로 이동
  const goToNext = () => {
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentSectionIndex < surveySections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      // 모든 질문 완료
      handleComplete();
    }
  };

  // 이전 질문으로 이동
  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      setCurrentQuestionIndex(surveySections[currentSectionIndex - 1].questions.length - 1);
    }
  };

  // 설문 완료 처리
  const handleComplete = async () => {
    if (!user || !userProfile) {
      console.error('User not found:', { user, userProfile });
      return;
    }

    const completionTime = Date.now() - startTime;
    
    try {
      console.log('Starting survey save...', {
        userId: user.id,
        responseCount: Object.keys(responses).length,
        completionTime: Math.round(completionTime / 1000)
      });

      // Supabase에 설문 결과 저장
      const { supabase } = await import('@/lib/supabase/client');
      
      // 1. survey_results 테이블에 저장
      const insertData = {
        user_id: user.id,
        completion_time: Math.round(completionTime / 1000),
        completed: true
      };
      
      console.log('Inserting survey result:', insertData);
      
      const { data: surveyResult, error: surveyError } = await supabase
        .from('survey_results')
        .insert(insertData)
        .select()
        .single();

      if (surveyError) {
        console.error('Survey result save error detail:', {
          error: surveyError,
          message: surveyError.message,
          details: surveyError.details,
          hint: surveyError.hint,
          code: surveyError.code
        });
        throw surveyError;
      }

      // 2. survey_responses 테이블에 응답 저장
      const responsesToSave = Object.entries(responses).map(([questionId, value]) => ({
        survey_id: surveyResult.id,
        question_id: questionId,
        value: value
      }));

      const { error: responsesError } = await supabase
        .from('survey_responses')
        .insert(responsesToSave);

      if (responsesError) {
        console.error('Survey responses save error:', responsesError);
        throw responsesError;
      }

      console.log('설문 완료 및 저장:', {
        surveyId: surveyResult.id,
        userId: user.id,
        completionTimeSeconds: Math.round(completionTime / 1000),
        responseCount: responsesToSave.length
      });

      setSurveyResultId(surveyResult.id);
      setIsCompleted(true);
    } catch (error: any) {
      console.error('설문 저장 중 상세 오류:', {
        error,
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        status: error?.status
      });
      
      // 404 에러인 경우 테이블이 없음
      if (error?.message?.includes('404') || error?.status === 404) {
        console.error('survey_results 테이블이 존재하지 않습니다. Supabase에서 테이블을 생성하세요.');
        
        // 임시로 로컬 스토리지에 저장
        const tempSurveyId = `temp_${Date.now()}`;
        const surveyData = {
          id: tempSurveyId,
          userId: user.id,
          responses: Object.entries(responses).map(([questionId, value]) => ({
            questionId,
            value
          })),
          completedAt: new Date().toISOString(),
          completionTime: Math.round(completionTime / 1000)
        };
        
        // 로컬 스토리지에 저장
        localStorage.setItem(`survey_${tempSurveyId}`, JSON.stringify(surveyData));
        console.log('임시로 로컬 스토리지에 저장했습니다:', tempSurveyId);
        
        setSurveyResultId(tempSurveyId);
        setIsCompleted(true);
        return;
      }
      
      // RLS 정책 문제일 가능성이 높으므로 권한 확인
      if (error?.code === '42501' || error?.message?.includes('policy')) {
        console.error('RLS Policy Error - 테이블 권한을 확인하세요');
      }
      
      // 오류가 발생해도 완료 화면은 표시
      setIsCompleted(true);
    }
  };

  // 현재 질문에 대한 응답 여부
  const hasCurrentResponse = currentQuestion && responses.hasOwnProperty(currentQuestion.id);
  
  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentSectionIndex > 0 || currentQuestionIndex > 0) {
        goToPrevious();
      } else if (e.key === 'ArrowRight' && hasCurrentResponse) {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSectionIndex, currentQuestionIndex, hasCurrentResponse]);

  // 로딩 중이거나 로그인하지 않은 경우
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-medium text-gray-700">로그인 확인 중...</h1>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return <SurveyComplete 
      responses={responses} 
      surveyResultId={surveyResultId}
      userId={user?.id}
    />;
  }

  if (!currentSection || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">설문을 불러오는 중...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Leadership 4Dx 진단
          </h1>
          <p className="text-gray-600">
            총 {TOTAL_QUESTIONS}문항 • 예상 소요시간: 15-20분
          </p>
        </div>

        {/* 진행률 */}
        <SurveyProgress
          totalQuestions={TOTAL_QUESTIONS}
          answeredQuestions={totalAnswered}
          currentSection={currentSection.title}
          sectionProgress={sectionProgress}
          className="mb-8"
        />

        {/* 섹션 제목 */}
        <motion.div
          key={currentSection.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {currentSection.title}
          </h2>
          <p className="text-gray-600 text-sm">
            {currentSection.description}
          </p>
          <div className="mt-2 text-sm text-gray-500">
            섹션 {currentSectionIndex + 1}/{surveySections.length} • 
            문항 {currentQuestionIndex + 1}/{currentSection.questions.length}
          </div>
        </motion.div>

        {/* 질문 카드 */}
        <AnimatePresence mode="wait">
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            value={responses[currentQuestion.id]}
            onChange={(value) => handleResponse(currentQuestion.id, value)}
            scaleLabels={currentQuestion.scale.max === 7 ? scaleLabels.sevenPoint : scaleLabels.fivePoint}
          />
        </AnimatePresence>

        {/* 네비게이션 버튼 */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={goToPrevious}
            disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors
              ${currentSectionIndex === 0 && currentQuestionIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }
            `}
          >
            <ChevronLeftIcon className="w-4 h-4" />
            이전
          </button>

          <div className="text-sm text-gray-500">
            {totalAnswered}/{TOTAL_QUESTIONS} 완료
          </div>

          <button
            onClick={goToNext}
            disabled={!hasCurrentResponse}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors
              ${!hasCurrentResponse
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : currentSectionIndex === surveySections.length - 1 && 
                  currentQuestionIndex === currentSection.questions.length - 1
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            {currentSectionIndex === surveySections.length - 1 && 
             currentQuestionIndex === currentSection.questions.length - 1
              ? '완료'
              : '다음'
            }
            {!(currentSectionIndex === surveySections.length - 1 && 
               currentQuestionIndex === currentSection.questions.length - 1) && (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* 키보드 힌트 */}
        <div className="mt-6 text-center text-xs text-gray-400">
          키보드 탐색: ← 이전 문항 | → 다음 문항 (응답 후)
        </div>
      </div>
    </div>
  );
}