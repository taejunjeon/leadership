/**
 * AI Leadership 4Dx - 설문 결과 목록 컴포넌트
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  CalendarIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface SurveyResult {
  id: string;
  name: string;
  email: string;
  organization?: string;
  department?: string;
  position?: string;
  completedAt: string;
  riskLevel: 'low' | 'medium' | 'high';
  completionRate: number;
  blakeMousetonScore: {
    people: number;
    production: number;
  };
  feedbackScore: {
    care: number;
    challenge: number;
  };
  lmxScore: number;
  hiddenScores: {
    machiavellianism: number;
    narcissism: number;
    psychopathy: number;
  };
}

interface SurveyResultsListProps {
  onSelectUser: (userId: string) => void;
  selectedUser: string | null;
}

export const SurveyResultsList: React.FC<SurveyResultsListProps> = ({
  onSelectUser,
  selectedUser
}) => {
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 샘플 데이터 로드
  useEffect(() => {
    const loadSampleData = () => {
      const sampleResults: SurveyResult[] = [
        {
          id: 'user_001',
          name: '김철수',
          email: 'kim@company.com',
          organization: 'ABC 기업',
          department: '개발팀',
          position: '팀장',
          completedAt: '2024-08-02T10:30:00Z',
          riskLevel: 'low',
          completionRate: 100,
          blakeMousetonScore: { people: 6.2, production: 7.1 },
          feedbackScore: { care: 5.8, challenge: 6.5 },
          lmxScore: 6.3,
          hiddenScores: {
            machiavellianism: 2.1,
            narcissism: 1.8,
            psychopathy: 1.5
          }
        },
        {
          id: 'user_002',
          name: '이영희',
          email: 'lee@company.com',
          organization: 'XYZ 기업',
          department: '마케팅팀',
          position: '부장',
          completedAt: '2024-08-02T09:15:00Z',
          riskLevel: 'medium',
          completionRate: 100,
          blakeMousetonScore: { people: 4.5, production: 8.2 },
          feedbackScore: { care: 4.2, challenge: 7.8 },
          lmxScore: 5.1,
          hiddenScores: {
            machiavellianism: 3.4,
            narcissism: 3.8,
            psychopathy: 2.1
          }
        },
        {
          id: 'user_003',
          name: '박민수',
          email: 'park@company.com',
          organization: 'DEF 기업',
          department: '영업팀',
          position: '과장',
          completedAt: '2024-08-01T16:45:00Z',
          riskLevel: 'high',
          completionRate: 100,
          blakeMousetonScore: { people: 3.1, production: 8.8 },
          feedbackScore: { care: 2.9, challenge: 8.5 },
          lmxScore: 4.2,
          hiddenScores: {
            machiavellianism: 4.2,
            narcissism: 4.5,
            psychopathy: 3.8
          }
        }
      ];

      setTimeout(() => {
        setResults(sampleResults);
        setIsLoading(false);
      }, 1000);
    };

    loadSampleData();
  }, []);

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
    }
  };

  const getRiskText = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return '낮음';
      case 'medium': return '보통';
      case 'high': return '높음';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">설문 결과를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 필터 및 정렬 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            설문 결과 목록 ({results.length}명)
          </h3>
          <div className="flex gap-2">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>모든 위험도</option>
              <option>높음</option>
              <option>보통</option>
              <option>낮음</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>최신순</option>
              <option>이름순</option>
              <option>위험도순</option>
            </select>
          </div>
        </div>
      </div>

      {/* 결과 목록 */}
      <div className="grid gap-4">
        {results.map((result) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              bg-white rounded-lg shadow-sm border-2 p-6 cursor-pointer transition-all
              ${selectedUser === result.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-transparent hover:border-gray-300'
              }
            `}
            onClick={() => onSelectUser(result.id)}
          >
            <div className="flex items-start justify-between">
              {/* 사용자 정보 */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {result.name}
                  </h4>
                  <p className="text-sm text-gray-600">{result.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>{result.organization}</span>
                    <span>•</span>
                    <span>{result.department}</span>
                    <span>•</span>
                    <span>{result.position}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {new Date(result.completedAt).toLocaleString('ko-KR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* 위험도 및 분석 버튼 */}
              <div className="flex items-center gap-3">
                {/* 위험도 배지 */}
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(result.riskLevel)}`}>
                  {result.riskLevel === 'high' && (
                    <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
                  )}
                  위험도: {getRiskText(result.riskLevel)}
                </div>

                {/* 분석 보기 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectUser(result.id);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <EyeIcon className="w-4 h-4" />
                  숨겨진 분석
                </button>
              </div>
            </div>

            {/* 점수 미리보기 */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <ChartBarIcon className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <div className="text-sm font-medium text-gray-900">리더십</div>
                <div className="text-xs text-gray-500">
                  P: {result.blakeMousetonScore.people.toFixed(1)} / 
                  T: {result.blakeMousetonScore.production.toFixed(1)}
                </div>
              </div>
              <div className="text-center">
                <ChartBarIcon className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <div className="text-sm font-medium text-gray-900">피드백</div>
                <div className="text-xs text-gray-500">
                  C: {result.feedbackScore.care.toFixed(1)} / 
                  Ch: {result.feedbackScore.challenge.toFixed(1)}
                </div>
              </div>
              <div className="text-center">
                <ChartBarIcon className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <div className="text-sm font-medium text-gray-900">LMX</div>
                <div className="text-xs text-gray-500">
                  {result.lmxScore.toFixed(1)}
                </div>
              </div>
              <div className="text-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mx-auto mb-1" />
                <div className="text-sm font-medium text-gray-900">위험 지표</div>
                <div className="text-xs text-gray-500">
                  {((result.hiddenScores.machiavellianism + 
                     result.hiddenScores.narcissism + 
                     result.hiddenScores.psychopathy) / 3).toFixed(1)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};