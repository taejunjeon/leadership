/**
 * AI Leadership 4Dx - 질문 카드 컴포넌트
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SurveyQuestion } from '@/data/surveyQuestions';

interface QuestionCardProps {
  question: SurveyQuestion;
  value?: number;
  onChange: (value: number) => void;
  scaleLabels: Record<number, string>;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  value,
  onChange,
  scaleLabels,
}) => {
  const { scale } = question;
  const scaleOptions = Array.from(
    { length: scale.max - scale.min + 1 },
    (_, i) => scale.min + i
  );

  // Influence Gauge 섹션 스타일링
  const isInfluenceGauge = question.category === 'influence_gauge';

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className={`
        bg-white rounded-lg shadow-lg p-8
        ${isInfluenceGauge ? 'border-l-4 border-purple-500' : 'border-l-4 border-blue-500'}
      `}
    >
      {/* 질문 텍스트 */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
          {question.text}
        </h3>
        {isInfluenceGauge && (
          <div className="mt-2 text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full inline-block">
            Influence Gauge
          </div>
        )}
      </div>

      {/* 척도 선택 */}
      <div className="space-y-4">
        {/* 척도 라벨 */}
        <div className="flex justify-between text-sm text-gray-600 px-2">
          <span>{scaleLabels[scale.min]}</span>
          {scaleLabels[Math.ceil((scale.min + scale.max) / 2)] && (
            <span className="hidden sm:block">
              {scaleLabels[Math.ceil((scale.min + scale.max) / 2)]}
            </span>
          )}
          <span>{scaleLabels[scale.max]}</span>
        </div>

        {/* 라디오 버튼 */}
        <div className="flex justify-between items-center">
          {scaleOptions.map((option) => (
            <label
              key={option}
              className="flex flex-col items-center cursor-pointer group"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  w-12 h-12 rounded-full border-2 flex items-center justify-center
                  transition-all duration-200
                  ${value === option
                    ? isInfluenceGauge
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-blue-600 border-blue-600 text-white'
                    : isInfluenceGauge
                    ? 'border-purple-300 group-hover:border-purple-400 group-hover:bg-purple-50'
                    : 'border-blue-300 group-hover:border-blue-400 group-hover:bg-blue-50'
                  }
                `}
              >
                <span className="font-semibold">{option}</span>
              </motion.div>
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              <span className="mt-2 text-xs text-gray-500">{option}</span>
            </label>
          ))}
        </div>

        {/* 선택된 값 표시 */}
        {value && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              text-center p-3 rounded-lg
              ${isInfluenceGauge
                ? 'bg-purple-50 text-purple-700'
                : 'bg-blue-50 text-blue-700'
              }
            `}
          >
            <span className="font-medium">
              선택하신 응답: {value}점 ({scaleLabels[value] || ''})
            </span>
          </motion.div>
        )}
      </div>

      {/* 진행 힌트 */}
      {!value && (
        <div className="mt-6 text-center text-sm text-gray-500">
          위 척도에서 가장 적합한 답변을 선택해 주세요
        </div>
      )}
    </motion.div>
  );
};