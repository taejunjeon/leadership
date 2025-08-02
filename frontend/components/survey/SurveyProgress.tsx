/**
 * AI Leadership 4Dx - 설문 진행률 컴포넌트
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/solid';

interface SurveyProgressProps {
  totalQuestions: number;
  answeredQuestions: number;
  currentSection: string;
  sectionProgress: number;
  className?: string;
}

export const SurveyProgress: React.FC<SurveyProgressProps> = ({
  totalQuestions,
  answeredQuestions,
  currentSection,
  sectionProgress,
  className = '',
}) => {
  const overallProgress = (answeredQuestions / totalQuestions) * 100;

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {/* 전체 진행률 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">전체 진행률</span>
          <span className="text-sm text-gray-500">
            {answeredQuestions}/{totalQuestions} ({Math.round(overallProgress)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="bg-blue-600 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* 현재 섹션 진행률 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            현재 섹션: {currentSection}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(sectionProgress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-green-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${sectionProgress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* 진행률 마일스톤 */}
      <div className="mt-4 flex justify-between">
        {[25, 50, 75, 100].map((milestone) => {
          const isReached = overallProgress >= milestone;
          return (
            <div
              key={milestone}
              className={`flex flex-col items-center ${
                isReached ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isReached
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white border-gray-300'
                }`}
              >
                {isReached ? (
                  <CheckIcon className="w-4 h-4 text-white" />
                ) : (
                  <span className="text-xs font-semibold">{milestone}%</span>
                )}
              </div>
              <span className="text-xs mt-1">{milestone}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};