/**
 * AI Leadership 4Dx - 설문 완료 컴포넌트
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ArrowPathIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import { useRouter } from 'next/navigation';

interface SurveyCompleteProps {
  responses: Record<string, number>;
  surveyResultId?: string | null;
  userId?: string;
}

export const SurveyComplete: React.FC<SurveyCompleteProps> = ({
  responses,
  surveyResultId,
  userId
}) => {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const responseCount = Object.keys(responses).length;

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    // 2초 대기 후 분석 페이지로 이동
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (surveyResultId) {
      // 분석 결과 페이지로 이동
      router.push(`/analysis/${surveyResultId}`);
    } else {
      // surveyResultId가 없으면 대시보드로 이동
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-xl p-8 text-center"
        >
          {/* 완료 아이콘 */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center"
          >
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
          </motion.div>

          {/* 메시지 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              설문이 완료되었습니다!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              총 {responseCount}개 문항에 응답해 주셔서 감사합니다.
            </p>
          </motion.div>

          {/* 통계 정보 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-2 gap-4 mb-8"
          >
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{responseCount}</div>
              <div className="text-sm text-blue-700">완료된 문항</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-sm text-green-700">완성도</div>
            </div>
          </motion.div>

          {/* 다음 단계 안내 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              다음 단계
            </h2>
            
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <div className="font-medium text-gray-900">AI 분석 실행</div>
                  <div className="text-sm text-gray-600">
                    귀하의 리더십 스타일과 4차원 분석을 수행합니다
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <div className="font-medium text-gray-900">결과 확인</div>
                  <div className="text-sm text-gray-600">
                    상세한 분석 결과와 개선 방안을 확인하세요
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <div className="font-medium text-gray-900">3D 시각화</div>
                  <div className="text-sm text-gray-600">
                    4차원 리더십 모델을 3D로 시각화하여 확인
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 액션 버튼 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mt-8 space-y-4"
          >
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`
                w-full flex items-center justify-center gap-3 py-3 px-6 rounded-lg font-semibold transition-colors
                ${isAnalyzing
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
            >
              {isAnalyzing ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  AI 분석 중...
                </>
              ) : (
                <>
                  <DocumentTextIcon className="w-5 h-5" />
                  AI 분석 시작하기
                </>
              )}
            </button>

            <div className="flex gap-4">
              <Link
                href="/"
                className="flex-1 py-2 px-4 text-center border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                홈으로 돌아가기
              </Link>
              <Link
                href="/dashboard/validation"
                className="flex-1 py-2 px-4 text-center border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                검증 대시보드 보기
              </Link>
            </div>
          </motion.div>

          {/* 추가 정보 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200"
          >
            <p className="text-sm text-yellow-800">
              💡 <strong>팁:</strong> 분석 결과는 개인정보 보호 정책에 따라 안전하게 저장됩니다. 
              결과는 언제든지 다시 확인하실 수 있습니다.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};