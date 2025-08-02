/**
 * AI Leadership 4Dx - 숨겨진 분석 결과 컴포넌트
 * 마키아벨리즘, 나르시시즘, 사이코패시 분석 표시
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  EyeSlashIcon,
  ChartBarIcon,
  DocumentTextIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

interface HiddenAnalysisData {
  userId: string;
  userName: string;
  timestamp: string;
  overallRiskLevel: 'low' | 'medium' | 'high';
  dimensions: {
    machiavellianism: {
      score: number;
      level: 'low' | 'medium' | 'high';
      indicators: string[];
      recommendations: string[];
    };
    narcissism: {
      score: number;
      level: 'low' | 'medium' | 'high';
      indicators: string[];
      recommendations: string[];
    };
    psychopathy: {
      score: number;
      level: 'low' | 'medium' | 'high';
      indicators: string[];
      recommendations: string[];
    };
  };
  riskFactors: string[];
  strengthFactors: string[];
  managementRecommendations: string[];
}

interface HiddenAnalysisResultsProps {
  userId: string;
}

export const HiddenAnalysisResults: React.FC<HiddenAnalysisResultsProps> = ({
  userId
}) => {
  const [analysisData, setAnalysisData] = useState<HiddenAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'recommendations'>('overview');

  useEffect(() => {
    // 샘플 분석 데이터 로드
    const loadAnalysisData = async () => {
      setIsLoading(true);
      
      // 실제 환경에서는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500));

      const sampleData: HiddenAnalysisData = {
        userId,
        userName: userId === 'user_001' ? '김철수' : userId === 'user_002' ? '이영희' : '박민수',
        timestamp: new Date().toISOString(),
        overallRiskLevel: userId === 'user_003' ? 'high' : userId === 'user_002' ? 'medium' : 'low',
        dimensions: {
          machiavellianism: {
            score: userId === 'user_003' ? 4.2 : userId === 'user_002' ? 3.4 : 2.1,
            level: userId === 'user_003' ? 'high' : userId === 'user_002' ? 'medium' : 'low',
            indicators: userId === 'user_003' ? [
              '목표 달성을 위해 정보를 선택적으로 공유하는 경향',
              '상황에 따라 유연한 윤리 기준 적용',
              '결과 중심적 사고로 인한 과정 경시'
            ] : [
              '일반적인 수준의 전략적 사고',
              '상황에 맞는 적절한 정보 공유'
            ],
            recommendations: userId === 'user_003' ? [
              '투명한 의사결정 프로세스 도입 필요',
              '윤리 교육 및 가이드라인 제공',
              '정기적인 360도 피드백 실시'
            ] : [
              '현재 수준 유지',
              '리더십 역량 강화 교육 권장'
            ]
          },
          narcissism: {
            score: userId === 'user_003' ? 4.5 : userId === 'user_002' ? 3.8 : 1.8,
            level: userId === 'user_003' ? 'high' : userId === 'user_002' ? 'medium' : 'low',
            indicators: userId === 'user_003' ? [
              '개인 성과에 대한 과도한 강조',
              '타인의 공로 인정에 소극적',
              '비판에 대한 방어적 반응'
            ] : [
              '적절한 자신감 수준',
              '팀워크와 개인 성과의 균형'
            ],
            recommendations: userId === 'user_003' ? [
              '팀 기여도 인정 시스템 도입',
              '겸손 리더십 교육 프로그램',
              '멘토링을 통한 자기성찰 기회'
            ] : [
              '자신감과 겸손의 균형 유지',
              '팀 빌딩 활동 참여 권장'
            ]
          },
          psychopathy: {
            score: userId === 'user_003' ? 3.8 : userId === 'user_002' ? 2.1 : 1.5,
            level: userId === 'user_003' ? 'high' : userId === 'user_002' ? 'medium' : 'low',
            indicators: userId === 'user_003' ? [
              '타인의 감정 상태에 대한 낮은 민감도',
              '위험 상황에서의 과도한 담대함',
              '결과 중심적 의사결정으로 인한 공감 부족'
            ] : [
              '적절한 위험 감수 능력',
              '균형잡힌 감정적 반응'
            ],
            recommendations: userId === 'user_003' ? [
              '감정 인텔리전스 향상 교육',
              '위험 관리 프로세스 강화',
              '팀원과의 정기적 소통 세션'
            ] : [
              '현재의 균형잡힌 접근법 유지',
              '감정 인텔리전스 지속 개발'
            ]
          }
        },
        riskFactors: userId === 'user_003' ? [
          '높은 성과 압박으로 인한 윤리적 판단 흐림 가능성',
          '팀원과의 감정적 거리감 증가',
          '단기 성과에 치중한 의사결정 위험'
        ] : [
          '특별한 위험 요소 없음',
          '전반적으로 안정적인 리더십 패턴'
        ],
        strengthFactors: [
          '목표 지향적 리더십',
          '결단력 있는 의사결정',
          '성과 달성 능력'
        ],
        managementRecommendations: userId === 'user_003' ? [
          '정기적인 윤리 교육 및 가이드라인 제공',
          '다면 평가를 통한 객관적 피드백',
          '감정 인텔리전스 향상 프로그램 참여',
          '멘토링을 통한 자기성찰 기회 제공',
          '팀 빌딩 활동을 통한 관계 개선'
        ] : [
          '현재 수준 유지 및 지속적 관찰',
          '리더십 역량 강화 교육 기회 제공',
          '긍정적 리더십 모델로 활용 고려'
        ]
      };

      setAnalysisData(sampleData);
      setIsLoading(false);
    };

    loadAnalysisData();
  }, [userId]);

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getRiskText = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return '낮음';
      case 'medium': return '보통';
      case 'high': return '높음';
    }
  };

  const getDimensionTitle = (key: string) => {
    switch (key) {
      case 'machiavellianism': return '전략적 사고 패턴';
      case 'narcissism': return '자신감 수준';
      case 'psychopathy': return '위험 관리 능력';
      default: return key;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">심층 분석을 수행하는 중...</p>
        <p className="text-sm text-gray-500 mt-2">AI가 복합적 심리 패턴을 분석하고 있습니다</p>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">분석 데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 보안 헤더 */}
      <div className="bg-red-900 text-white rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <EyeSlashIcon className="w-6 h-6" />
          <h2 className="text-xl font-bold">기밀 심리 분석 결과</h2>
          <span className="bg-red-700 text-sm font-medium px-3 py-1 rounded-full">
            TOP SECRET
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>대상:</strong> {analysisData.userName}
          </div>
          <div>
            <strong>분석일시:</strong> {new Date(analysisData.timestamp).toLocaleString('ko-KR')}
          </div>
          <div>
            <strong>전체 위험도:</strong> 
            <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
              analysisData.overallRiskLevel === 'high' ? 'bg-red-200 text-red-800' :
              analysisData.overallRiskLevel === 'medium' ? 'bg-yellow-200 text-yellow-800' :
              'bg-green-200 text-green-800'
            }`}>
              {getRiskText(analysisData.overallRiskLevel)}
            </span>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <nav className="flex space-x-6">
          {[
            { id: 'overview', label: '종합 개요', icon: ChartBarIcon },
            { id: 'detailed', label: '상세 분석', icon: DocumentTextIcon },
            { id: 'recommendations', label: '관리 방안', icon: LightBulbIcon }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="grid gap-6">
            {/* 차원별 점수 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(analysisData.dimensions).map(([key, data]) => (
                <div key={key} className="bg-white rounded-lg shadow-sm p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getDimensionTitle(key)}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(data.level)}`}>
                      {getRiskText(data.level)}
                    </span>
                  </div>
                  
                  {/* 점수 표시 */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">점수</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {data.score.toFixed(1)}/5.0
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          data.level === 'high' ? 'bg-red-500' :
                          data.level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(data.score / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* 주요 지표 */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">주요 지표</h4>
                    <ul className="space-y-1">
                      {data.indicators.slice(0, 2).map((indicator, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* 위험 요소 및 강점 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  위험 요소
                </h3>
                <ul className="space-y-2">
                  {analysisData.riskFactors.map((factor, index) => (
                    <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5" />
                  강점 요소
                </h3>
                <ul className="space-y-2">
                  {analysisData.strengthFactors.map((factor, index) => (
                    <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'detailed' && (
          <div className="space-y-8">
            {Object.entries(analysisData.dimensions).map(([key, data]) => (
              <div key={key} className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  {getDimensionTitle(key)} 상세 분석
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">관찰된 지표</h4>
                    <ul className="space-y-2">
                      {data.indicators.map((indicator, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">권장 조치</h4>
                    <ul className="space-y-2">
                      {data.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              종합 관리 방안
            </h3>
            
            <div className="space-y-4">
              {analysisData.managementRecommendations.map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-gray-800">{recommendation}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-semibold text-amber-800 mb-2">중요 알림</h4>
              <p className="text-sm text-amber-700">
                본 분석 결과는 관리자 전용이며, 개인정보보호법에 따라 엄격히 관리되어야 합니다. 
                분석 대상자에게는 일반적인 리더십 개발 방안만 제공하시기 바랍니다.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};