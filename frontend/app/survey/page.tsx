/**
 * AI Leadership 4Dx - 설문 페이지
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { surveySections, TOTAL_QUESTIONS, scaleLabels, SurveyQuestion } from '@/data/surveyQuestions';
import { SurveyProgress } from '@/components/survey/SurveyProgress';
import { QuestionCard } from '@/components/survey/QuestionCard';
import { SurveyComplete } from '@/components/survey/SurveyComplete';

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
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState(Date.now());

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
    const completionTime = Date.now() - startTime;
    
    const surveyData: SurveyFormData = {
      name: '테스트 사용자', // TODO: 사용자 정보 입력 폼 추가
      email: 'test@example.com',
      organization: '테스트 조직',
      department: '개발팀',
      position: '팀장',
      responses: Object.entries(responses).map(([questionId, value]) => ({
        questionId,
        value
      }))
    };

    console.log('설문 완료:', {
      ...surveyData,
      completionTimeSeconds: Math.round(completionTime / 1000)
    });

    setIsCompleted(true);
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

  if (isCompleted) {
    return <SurveyComplete responses={responses} />;
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